# Assessment System Updates

## Overview
Implemented comprehensive improvements to the assessment system:
1. **Per-Question Timer**: 2 minutes per question with automatic progression
2. **Question Type UI Components**: Dedicated UI for three question types (MCQ, Fill in the Blanks, Descriptive)
3. **Enhanced User Experience**: Clear visual indicators for each question type

---

## Changes Made

### 1. Timer Implementation (Per-Question)

#### What Changed:
- **Before**: Single total timer (30 minutes for entire assessment)
- **After**: 2 minutes per question (120 seconds)
  - Timer resets when moving to next question
  - Auto-advances to next question when time expires
  - Auto-submits assessment on last question when time expires

#### Files Updated:
- `src/app/(dashboard)/assessment/[applicationId]/page.tsx`

#### Key Changes:
```typescript
// Old: DEFAULT_TIME_LIMIT = 30 // minutes (total)
// New: TIME_PER_QUESTION = 120 // 2 minutes per question in seconds

// Timer now resets on each question
useEffect(() => {
  if (state !== "taking" || !assessment) return
  
  const currentQ = assessment.questions[currentQuestionIndex]
  if (currentQ) {
    setTimeLeft(TIME_PER_QUESTION)
  }
}, [currentQuestionIndex, state, assessment])
```

#### User Experience:
- Instructions page shows: "Total Time: X minutes (2 min per question)"
- When time expires on a question, user is automatically moved to the next question
- Toast notification informs user of the automatic progression
- On the last question, auto-submit is triggered when time expires

---

### 2. Question Type Components

#### New File Created:
`src/components/assessment/QuestionTypes.tsx`

This file exports three dedicated UI components for each question type:

##### MCQQuestion Component
- **Type**: `"mcq"`
- **Features**:
  - Radio button selection for single answer
  - Visual highlight of skill tag (blue badge)
  - Difficulty indicator (easy/medium/hard)
  - Auto-scoring capability
- **Usage**:
```typescript
<MCQQuestion
  question={question}
  selectedAnswerIndex={answers[question.id]?.selectedAnswerIndex}
  onSelectAnswer={(index) => handleSelectAnswer(question.id, index)}
/>
```

##### FillBlankQuestion Component
- **Type**: `"fill_blank"`
- **Features**:
  - Large textarea for candidate to type answer
  - Visual indicator with 💡 emoji
  - Purple badge for skill tag to differentiate from MCQ
  - Helper text: "Be concise and accurate with your answer"
  - Automatically triggered from free-input questions
- **Usage**:
```typescript
<FillBlankQuestion
  question={question}
  answer={answers[question.id]?.freeTextAnswer}
  onAnswerChange={(text) => handleSetFreeTextAnswer(question.id, text)}
/>
```

##### DescriptiveQuestion Component
- **Type**: `"descriptive"`
- **Features**:
  - Larger textarea for detailed responses (48px height)
  - Visual indicator with 📝 emoji
  - Indigo badge for skill tag
  - Helper text: "This response will be reviewed by our assessment team"
  - Larger minimum height for detailed answers
- **Usage**:
```typescript
<DescriptiveQuestion
  question={question}
  answer={answers[question.id]?.freeTextAnswer}
  onAnswerChange={(text) => handleSetFreeTextAnswer(question.id, text)}
/>
```

#### Component Features:
- **Consistent Design**: All components follow the same design language
- **Type-Specific Styling**: 
  - MCQ: Blue badges
  - Fill Blank: Purple badges
  - Descriptive: Indigo badges
- **Accessibility**: Proper labels, help text, and semantic HTML
- **Dark Mode Support**: Full dark mode theming throughout
- **Visual Feedback**: 
  - Hover states on interactive elements
  - Clear placeholder text
  - Guidance text for each question type

---

### 3. Type System Updates

#### File Updated:
`src/types/candidate.types.ts`

#### Changes:
```typescript
// Before
export type AssessmentQuestionType = "mcq" | "free_input" | "fill_blank"

// After
export type AssessmentQuestionType = "mcq" | "free_input" | "fill_blank" | "descriptive"
```

**Note**: `"free_input"` is kept for backward compatibility with existing APIs that may use this term. Both `"fill_blank"` and `"descriptive"` use `freeTextAnswer` in the response structure.

---

### 4. Assessment Page Refactoring

#### Files Updated:
- `src/app/(dashboard)/assessment/[applicationId]/page.tsx`

#### Changes:
- Removed inline question rendering code
- Imported new question type components
- Updated question rendering logic to use component-based approach
- Enhanced timer logic with per-question reset
- Updated instructions page to show new timer structure

#### Before:
```typescript
{currentQuestion.type === "mcq" ? (
  <RadioGroup>
    {/* inline rendering */}
  </RadioGroup>
) : (
  <Textarea>
    {/* generic textarea */}
  </Textarea>
)}
```

#### After:
```typescript
{currentQuestion.type === "mcq" && (
  <MCQQuestion
    question={currentQuestion}
    selectedAnswerIndex={answers[currentQuestion.id]?.selectedAnswerIndex}
    onSelectAnswer={(index) => handleSelectAnswer(currentQuestion.id, index)}
  />
)}

{currentQuestion.type === "fill_blank" && (
  <FillBlankQuestion
    question={currentQuestion}
    answer={answers[currentQuestion.id]?.freeTextAnswer}
    onAnswerChange={(text) => handleSetFreeTextAnswer(currentQuestion.id, text)}
  />
)}

{currentQuestion.type === "descriptive" && (
  <DescriptiveQuestion
    question={currentQuestion}
    answer={answers[currentQuestion.id]?.freeTextAnswer}
    onAnswerChange={(text) => handleSetFreeTextAnswer(currentQuestion.id, text)}
  />
)}
```

---

## API Response Structure

The existing API response structure is compatible with the new system:

```json
{
  "success": true,
  "status": 200,
  "message": "Candidate test fetched",
  "data": {
    "id": "assessment-id",
    "questions": [
      {
        "id": "q1",
        "type": "mcq",
        "question": "What is Node.js?",
        "skillTag": "Node.js",
        "difficulty": "easy",
        "options": ["Backend APIs", "Image editing", "CSS styling"],
        "correctAnswer": 0
      },
      {
        "id": "q2",
        "type": "fill_blank",
        "question": "The file stores npm packages as package-____.json",
        "skillTag": "Node.js",
        "difficulty": "medium",
        "options": []
      },
      {
        "id": "q3",
        "type": "descriptive",
        "question": "Explain how to debug a slow backend API",
        "skillTag": "Node.js",
        "difficulty": "hard",
        "options": []
      }
    ]
  }
}
```

---

## Submission Structure

Assessment submissions now include all three question types:

```typescript
{
  jobApplicationId: "app-id",
  answers: {
    "q1": "Backend APIs",              // MCQ answer (option text)
    "q2": "lock",                       // Fill blank answer
    "q3": "Use profiling tools..."      // Descriptive answer
  },
  violations: [/* violation records */]
}
```

---

## Scoring Logic

### MCQ Questions Only
- **Scoring**: Correct/incorrect based on `correctAnswer` index
- **Percentage**: (Correct Count / MCQ Count) * 100
- **Passing**: Based on `passingScore` threshold (default 70%)

### Fill Blank & Descriptive Questions
- **Scoring**: Manual review required (server-side)
- **Display**: Shown in results for candidate review
- **Status**: Marked as "submitted for manual review"
- **Impact**: Do NOT count toward percentage score

---

## UI Flow

### Instructions Page
1. Assessment title and description
2. **New**: Matched skills badges
3. Assessment details showing:
   - Total Questions: X
   - **Time Per Question: 2 minutes**
   - **Total Time: X minutes**
   - Passing Score: Y%
4. Security notice and prohibited activities list
5. Instructions and guidelines
6. "Start Assessment (Fullscreen)" button

### During Assessment
1. Sticky header with:
   - Current question indicator and progress bar
   - **Per-question timer** (2:00 → 1:59 → ... → 0:00)
   - Tab visibility status
   - Fullscreen status
   - Violation count
2. **Question-specific UI**:
   - MCQ: Radio buttons with clear options
   - Fill Blank: Purple-themed textarea with concise guidance
   - Descriptive: Indigo-themed larger textarea with detailed guidance
3. Navigation buttons:
   - "Next" button (disabled until current question answered)
   - "Submit Assessment" button on final question
4. Question Navigator grid showing answered/pending status

### Results Page
- Same as before
- MCQ answers shown with correct/incorrect indicators
- Fill Blank & Descriptive shown with "submitted for manual review" note
- Score calculated from MCQ questions only

---

## Migration Guide

### For Backend Teams
1. Ensure API includes question `type` field with values: "mcq", "fill_blank", or "descriptive"
2. Assessment questions maintain same structure
3. Submission accepts answers as shown above
4. Manual review required for fill_blank and descriptive answers

### For Frontend Teams
1. Question type components are now in `src/components/assessment/QuestionTypes.tsx`
2. Import and use components instead of inline rendering
3. Updated type definition includes "descriptive" type

### For Product/QA Teams
1. Timer is now 2 minutes per question (not total)
2. Auto-progression enabled when time expires
3. Three distinct question types with unique UX:
   - MCQ: Traditional radio buttons
   - Fill Blank: Concise text input
   - Descriptive: Detailed text input with larger area
4. Results show manual review status for free-text questions

---

## Testing Checklist

- [ ] MCQ questions render correctly with all options
- [ ] Fill Blank questions show purple theme and correct placeholder
- [ ] Descriptive questions show indigo theme with larger textarea
- [ ] Timer starts at 2:00 for each question
- [ ] Timer counts down correctly
- [ ] Auto-advance to next question when time expires
- [ ] Toast notification shows when auto-advancing
- [ ] Last question auto-submits when time expires
- [ ] Answers are preserved when navigating between questions
- [ ] Questions cannot be skipped (disabled until answered)
- [ ] Question navigator shows correct answered/pending status
- [ ] Results page shows correct scoring (MCQ only)
- [ ] Free-text answers marked as "submitted for manual review"
- [ ] Total time calculation correct in instructions
- [ ] Security features still work during assessment
- [ ] Fullscreen enforcement active
- [ ] Violations recorded correctly

---

## Future Enhancements

1. **Question-Level Analytics**: Track time spent per question type
2. **Partial Credit**: Allow partial scoring for fill_blank questions
3. **Auto-Suggestions**: AI-powered suggestions for descriptive answers (for review)
4. **Time Adjustments**: Allow different time limits per difficulty level
5. **Extended Answers**: Support for image/code snippets in descriptive questions
6. **Live Proctoring**: Integration with proctoring services
7. **Question Randomization**: Random question order per assessment
8. **Keyboard Navigation**: Tab through options without mouse

---

## Known Limitations

1. **Cannot Modify Past Assessments**: Already-submitted assessments show as read-only
2. **No Partial Scoring**: Fill blank uses binary match (future: fuzzy matching)
3. **No Code Execution**: Code-based questions displayed as text only
4. **Manual Review Required**: Free-text responses need team review

---

## Rollback Instructions

If needed to revert changes:

1. Remove `src/components/assessment/QuestionTypes.tsx`
2. Restore assessment page to use inline rendering (check git history)
3. Revert type changes in `candidate.types.ts`
4. Test thoroughly before deploying

---

## Support

For questions or issues:
- Check `ASSESSMENT_SECURITY.md` for security-related questions
- Review component code for implementation details
- Check git history for detailed change tracking
