# Timing & Auto-Submit API Reference

## API Submission Payload - Updated Format

### Request Structure

```typescript
POST /recruitment/assessment/submit
Content-Type: application/json

{
  "jobApplicationId": string,
  "answers": {
    [questionId]: string | number  // Answer value
  },
  "violations": ViolationRecord[],
  "totalDurationSeconds": number,   // ← NEW: Total allowed time
  "timeSpentSeconds": number        // ← NEW: Actual time spent
}
```

### Complete Example

```json
{
  "jobApplicationId": "fde732f7-2fe6-4c46-87c1-f71683d0e6c2",
  "answers": {
    "7c0663cc-085d-43eb-89c4-afd65165cc31": "Backend APIs",
    "164d4ecd-84e8-48f4-bd3d-2f8a814a34cb": "lock",
    "9613a8df-1a6a-4c58-8b43-d786a1335c2b": "Event loop blocking",
    "0ae7e23b-a88c-4f40-95a6-f7243092d3ff": "event",
    "0da59d4a-873a-4ee9-97a0-29c3284d5f69": "I would use profiling tools...",
    "64a54b1c-4ffd-4bcc-9080-9415a91a10d7": "Authentication claims",
    "ef390791-6582-42ce-bf41-cb539e309605": "header, payload, signature",
    "a8dd9c62-5ed5-412e-b370-ea4e7a14b133": "Token",
    "8a1b5090-ef53-4e8e-81d5-3cc23aa19f92": "Environment variables or secret manager"
  },
  "violations": [],
  "totalDurationSeconds": 1080,
  "timeSpentSeconds": 945
}
```

## Field Descriptions

### totalDurationSeconds
- **Type**: `number`
- **Description**: Total allowed time for the entire assessment (in seconds)
- **Calculation**: `number_of_questions × 120` (2 minutes per question)
- **Example**: 9 questions × 120 = 1080 seconds
- **Formula**: `questions.length * 120`

### timeSpentSeconds
- **Type**: `number`
- **Description**: Actual time the candidate spent on the assessment (in seconds)
- **Calculation**: `(assessment_end_time - assessment_start_time) / 1000`
- **Range**: 0 to totalDurationSeconds (or slightly more if submission delayed)
- **Example**: 945 seconds (15 minutes 45 seconds)

## Timing Scenarios

### Scenario 1: Normal Completion (Before Timeout)

```json
{
  "totalDurationSeconds": 1080,
  "timeSpentSeconds": 900
}
```

**Interpretation**:
- Total allowed: 18 minutes
- Time spent: 15 minutes
- Time remaining: 3 minutes
- Status: Normal completion

### Scenario 2: Completion Near Timeout

```json
{
  "totalDurationSeconds": 1080,
  "timeSpentSeconds": 1050
}
```

**Interpretation**:
- Total allowed: 18 minutes
- Time spent: 17 minutes 30 seconds
- Time remaining: 30 seconds
- Status: Completed near end of time

### Scenario 3: Timeout Auto-Submit

```json
{
  "totalDurationSeconds": 1080,
  "timeSpentSeconds": 1080
}
```

**Interpretation**:
- Total allowed: 18 minutes
- Time spent: 18 minutes (exact)
- Time remaining: None
- Status: **Auto-submitted on timeout**

### Scenario 4: Very Fast Completion

```json
{
  "totalDurationSeconds": 1080,
  "timeSpentSeconds": 180
}
```

**Interpretation**:
- Total allowed: 18 minutes
- Time spent: 3 minutes
- Time remaining: 15 minutes
- Status: ⚠️ Suspicious (completed in 16% of allowed time)
- Action: Flag for review (possible cheating)

### Scenario 5: Very Slow Completion (Timeout)

```json
{
  "totalDurationSeconds": 1080,
  "timeSpentSeconds": 1170
}
```

**Interpretation**:
- Total allowed: 18 minutes
- Time spent: 19 minutes 30 seconds
- Time remaining: Exceeded
- Status: ⚠️ Timeout with delay
- Action: Auto-submitted, possible network latency

## Calculation Methods

### JavaScript/TypeScript
```typescript
// At assessment start
const assessmentStartTime = Date.now()  // milliseconds

// At assessment submission
const assessmentEndTime = Date.now()    // milliseconds

// Calculate durations
const totalDurationSeconds = questions.length * 120
const timeSpentSeconds = Math.floor((assessmentEndTime - assessmentStartTime) / 1000)

// Include in payload
const payload = {
  jobApplicationId,
  answers,
  violations,
  totalDurationSeconds,  // 1080 for 9 questions
  timeSpentSeconds       // e.g., 945
}
```

### Backend Validation
```typescript
// Validate timing
if (timeSpentSeconds > totalDurationSeconds + 60) {
  // Allowed 60 seconds buffer for network latency
  flagForReview("timeout_with_latency")
}

// Detect suspicious patterns
if (timeSpentSeconds < totalDurationSeconds * 0.2) {
  flagForReview("suspiciously_fast")
}

if (Math.abs(timeSpentSeconds - totalDurationSeconds) < 5) {
  flagForReview("exact_timeout")
}
```

## Analysis Queries

### Average Time Spent
```sql
SELECT 
  AVG(timeSpentSeconds) as avg_seconds,
  AVG(timeSpentSeconds) / 60.0 as avg_minutes,
  COUNT(*) as total_submissions
FROM assessments
```

### Timeout Rate
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN timeSpentSeconds >= totalDurationSeconds * 0.95 THEN 1 ELSE 0 END) as timeouts,
  ROUND(100.0 * SUM(CASE WHEN timeSpentSeconds >= totalDurationSeconds * 0.95 THEN 1 ELSE 0 END) / COUNT(*), 2) as timeout_percentage
FROM assessments
```

### Time Efficiency
```sql
SELECT 
  jobApplicationId,
  timeSpentSeconds,
  totalDurationSeconds,
  ROUND(100.0 * timeSpentSeconds / totalDurationSeconds, 2) as percentage_used,
  CASE 
    WHEN timeSpentSeconds < totalDurationSeconds * 0.2 THEN 'Very Fast'
    WHEN timeSpentSeconds < totalDurationSeconds * 0.5 THEN 'Fast'
    WHEN timeSpentSeconds < totalDurationSeconds * 0.8 THEN 'Normal'
    WHEN timeSpentSeconds < totalDurationSeconds * 0.95 THEN 'Close to Limit'
    ELSE 'Timeout'
  END as speed_category
FROM assessments
ORDER BY timeSpentSeconds DESC
```

## Fraud Detection Logic

### Red Flags

```typescript
const flagsRaised = []

// 1. Suspiciously Fast
if (timeSpentSeconds < totalDurationSeconds * 0.2) {
  flagsRaised.push("suspiciously_fast")
}

// 2. Exact Timeout
if (Math.abs(timeSpentSeconds - totalDurationSeconds) < 5) {
  flagsRaised.push("exact_timeout_match")
}

// 3. Multiple Violations + Fast
if (violations.length > 3 && timeSpentSeconds < totalDurationSeconds * 0.5) {
  flagsRaised.push("violations_and_fast")
}

// 4. Network Timeout
if (timeSpentSeconds > totalDurationSeconds + 120) {
  flagsRaised.push("possible_network_issue")
}

// Flag for review if any red flags
if (flagsRaised.length > 0) {
  Assessment.flagForReview(applicationId, flagsRaised)
}
```

## Usage Examples

### In Assessment Submission

```typescript
// When user clicks submit or time expires
const handleSubmit = async () => {
  const assessmentEndTime = Date.now()
  const totalDurationSeconds = assessment.questions.length * 120
  const timeSpentSeconds = Math.floor(
    (assessmentEndTime - assessmentStartTime) / 1000
  )

  const payload = {
    jobApplicationId,
    answers: submissionAnswers,
    violations: violationRef.current,
    totalDurationSeconds,    // Required
    timeSpentSeconds,        // Required
  }

  const response = await apiFetch(ENDPOINTS.SUBMIT_TEST, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
```

### Backend Processing

```typescript
// Route handler
app.post('/recruitment/assessment/submit', async (req, res) => {
  const {
    jobApplicationId,
    answers,
    violations,
    totalDurationSeconds,
    timeSpentSeconds,
  } = req.body

  // Validate timing
  if (!totalDurationSeconds || !timeSpentSeconds) {
    return res.status(400).json({ error: 'Timing data required' })
  }

  // Process submission
  const assessment = await Assessment.create({
    jobApplicationId,
    answers,
    violations,
    totalDurationSeconds,
    timeSpentSeconds,
    submittedAt: new Date(),
  })

  // Check for fraud
  if (timeSpentSeconds < totalDurationSeconds * 0.2) {
    await Assessment.flagForReview(assessment.id, 'suspiciously_fast')
  }

  res.json({ success: true, data: assessment })
})
```

## Dashboard Display

### Candidate's Perspective
```
Assessment Submitted!

Time Used: 15:45 / 18:00
Efficiency: 87.5%

Your assessment has been submitted successfully.
We will get back to you soon.
```

### Admin Dashboard
```
Assessment #1234
├─ Status: Submitted
├─ Time Used: 15:45 / 18:00
├─ Efficiency: 87.5%
├─ Score: 85%
├─ Violations: 0
└─ Flags: None
```

### Reports
```
Assessment Statistics (Last 30 Days)
├─ Submissions: 42
├─ Avg Time: 14:23 / 18:00
├─ Timeout Rate: 2.4%
├─ Avg Score: 78.5%
└─ Flagged: 3 (7%)
```

## Data Types

### TypeScript Types
```typescript
interface AssessmentSubmission {
  jobApplicationId: string
  answers: Record<string, string | number>
  violations: ViolationRecord[]
  totalDurationSeconds: number  // e.g., 1080
  timeSpentSeconds: number      // e.g., 945
}

interface AssessmentRecord {
  id: string
  jobApplicationId: string
  answers: Record<string, string | number>
  violations: ViolationRecord[]
  totalDurationSeconds: number
  timeSpentSeconds: number
  score: number
  passed: boolean
  submittedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

### Database Schema
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY,
  jobApplicationId UUID NOT NULL,
  answers JSONB NOT NULL,
  violations JSONB NOT NULL,
  totalDurationSeconds INTEGER NOT NULL,
  timeSpentSeconds INTEGER NOT NULL,
  score DECIMAL(5,2),
  passed BOOLEAN,
  submittedAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
)

CREATE INDEX idx_assessments_jobApplicationId 
  ON assessments(jobApplicationId)

CREATE INDEX idx_assessments_submittedAt 
  ON assessments(submittedAt)
```

## Version History

- **v1.0**: Initial release (no timing)
- **v1.1**: Added timing fields (current)
  - `totalDurationSeconds`: Total allowed time
  - `timeSpentSeconds`: Actual time spent

## Backward Compatibility

⚠️ **Breaking Change**: These fields are now required
- Existing API clients must be updated to provide these fields
- Old submissions without timing data should be migrated

### Migration Script
```sql
UPDATE assessments 
SET 
  totalDurationSeconds = COALESCE(totalDurationSeconds, 1080),
  timeSpentSeconds = COALESCE(timeSpentSeconds, EXTRACT(EPOCH FROM (updatedAt - createdAt))::INTEGER)
WHERE totalDurationSeconds IS NULL OR timeSpentSeconds IS NULL
```

---

## Support

For questions about timing implementation, see:
- [AUTO_SUBMIT_AND_TIMING.md](AUTO_SUBMIT_AND_TIMING.md) - Implementation details
- [ASSESSMENT_CHANGES.md](ASSESSMENT_CHANGES.md) - Technical documentation
- Database schema documentation

**Status**: ✅ Production Ready
