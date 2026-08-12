# Developer Quick Start Guide - Assessment System

## Quick Navigation

### Core Files to Know
```
src/app/(dashboard)/assessment/[applicationId]/page.tsx
  └─ Main assessment logic (1303 lines)
  └─ Timer, violations, scoring, submission

src/components/assessment/QuestionTypes.tsx
  └─ MCQQuestion, FillBlankQuestion, DescriptiveQuestion
  └─ Question rendering with type-specific UI

src/features/auth/components/
  ├─ protected-layout.tsx (dashboard protection)
  ├─ auth-check-layout.tsx (login protection)
  └─ logout-button.tsx (session clearing)

src/types/candidate.types.ts
  └─ Assessment, AssessmentQuestion, AssessmentAnswer types
  └─ AssessmentQuestionType: "mcq" | "free_input" | "fill_blank" | "descriptive"

src/server/Endpoints.ts
  ├─ GET_TEST: "/recruitment/candidate-profile/test"
  ├─ SUBMIT_TEST: "/recruitment/candidate-profile/test/submit"
  └─ VIOLATION: "/recruitment/candidate-profile/test/violations"
```

---

## Key Constants

```typescript
TIME_PER_QUESTION = 120  // 2 minutes per question in seconds
VIOLATION_THRESHOLD = 3  // Number of violations before disabling
MAX_VIOLATIONS_BEFORE_AUTO_SUBMIT = 5  // Hard limit
```

---

## Assessment State Machine

```
LOADING → INSTRUCTIONS → TAKING ─┬─ VIOLATION_DISABLED (if 3 violations)
                                 └─ SUBMITTING ─→ RESULTS
```

---

## Timer Behavior

**Per Question**:
- Starts at 2:00 (120 seconds)
- Counts down every second
- When 0:00 is reached:
  - If not last question: Auto-advances to next question
  - If last question: Auto-submits entire assessment

**Visual Indicators**:
- Normal: Black text with clock icon
- Almost up (<5 min): Red text
- Paused: Grayed out

---

## Violation Detection (Real-time)

Violations are tracked during assessment taking:

```typescript
// Recorded violations
recordViolation("tab_hidden")              // User switched tabs
recordViolation("exited_fullscreen")       // Exited fullscreen
recordViolation("copy_attempted")          // Tried copying
recordViolation("paste_attempted")         // Tried pasting
recordViolation("context_menu_attempted")  // Right-clicked
recordViolation("devtools_shortcut")       // Dev tools shortcut
recordViolation("screenshot_attempted")    // Screenshot key pressed
recordViolation("window_blur")             // Window lost focus
recordViolation("new_window_attempted")    // Tried opening new window
```

**Escalation**:
1. 1st violation: Recorded silently
2. 2nd violation: Toast warning shown
3. 3rd violation: API called, assessment disabled, auto-logout

---

## API Integration

### Submit Assessment
```typescript
await apiFetch(ENDPOINTS.SUBMIT_TEST, {
  method: "POST",
  body: JSON.stringify({
    jobApplicationId: string,
    answers: Record<string, string | number>,
    violations: ViolationRecord[],
    totalDurationSeconds: number,
    timeSpentSeconds: number
  })
})
```

### Report Violations
```typescript
await apiFetch(ENDPOINTS.VIOLATION, {
  method: "POST",
  body: JSON.stringify({
    testId: string,
    candidateProfileId: string,
    violations: Array<{
      type: string,
      message: string,
      detectedAt: ISO_STRING
    }>
  })
})
```

---

## Question Type Rendering

```typescript
// MCQ - Multiple Choice
if (getQuestionType(question) === "mcq") {
  <MCQQuestion
    question={question}
    selectedAnswerIndex={answers[question.id]?.selectedAnswerIndex}
    onSelectAnswer={(index) => handleSelectAnswer(question.id, index)}
  />
}

// Fill Blank - Text input
if (getQuestionType(question) === "fill_blank") {
  <FillBlankQuestion
    question={question}
    answer={answers[question.id]?.freeTextAnswer}
    onAnswerChange={(text) => handleSetFreeTextAnswer(question.id, text)}
  />
}

// Descriptive - Long text
if (getQuestionType(question) === "descriptive") {
  <DescriptiveQuestion
    question={question}
    answer={answers[question.id]?.freeTextAnswer}
    onAnswerChange={(text) => handleSetFreeTextAnswer(question.id, text)}
  />
}
```

---

## Scoring Logic

Only MCQ questions are scored:
```typescript
let correctCount = 0
let mcqCount = 0

assessment.questions.forEach((question) => {
  if (getQuestionType(question) === "mcq") {
    mcqCount++
    const answer = answers[question.id]
    if (answer?.selectedAnswerIndex === question.correctAnswer) {
      correctCount++
    }
  }
})

const scorePercentage = mcqCount > 0 
  ? Math.round((correctCount / mcqCount) * 100) 
  : 0

const isPassed = scorePercentage >= (assessment?.passingScore || 70)
```

---

## Route Protection

**Protected Routes** (require authentication):
- `/` (dashboard)
- `/assessment/[applicationId]`
- All `/profile/*` routes
- All `/settings/*` routes

**Auth Routes** (reject if authenticated):
- `/login`
- `/auth/*`

**Public Routes** (no auth required):
- `/candidate/apply/[id]`

**Protection Mechanism**:
- `ProtectedLayout`: Checks `token && user`, redirects to login if missing
- `AuthCheckLayout`: Checks `token && user`, redirects to dashboard if present

---

## Session Clearing

```typescript
// Logout process
clearUser()                              // Clear auth store
localStorage.removeItem("auth-storage")  // Remove auth localStorage
localStorage.clear()                     // Clear all localStorage
router.push("/login")                   // Redirect to login
router.refresh()                        // Clear server cache
```

**Result**: User is completely logged out, all data cleared

---

## Testing Checklist

- [ ] Assessment loads with correct questions
- [ ] Timer counts down and advances questions
- [ ] MCQ options are selectable
- [ ] Free text answers are saved
- [ ] Violations are detected and recorded
- [ ] Auto-submit works on time expiry
- [ ] Success screen displays
- [ ] Results show correct scoring
- [ ] Logout clears session
- [ ] Login page rejects logged-in users
- [ ] Dashboard requires authentication

---

## Common Issues & Solutions

**Issue**: Questions not displaying
- **Check**: API response has `questionType` field
- **Fix**: Helper function `getQuestionType()` handles both `type` and `questionType`

**Issue**: Timer not advancing questions
- **Check**: Question is marked as answered
- **Fix**: Current question must be answered before advancing

**Issue**: Violations not being reported
- **Check**: Reached exactly 3 violations
- **Fix**: API endpoint defined in Endpoints.ts

**Issue**: Session not clearing on logout
- **Check**: All localStorage is cleared
- **Fix**: `localStorage.clear()` removes all data

---

## Performance Notes

- Assessment page: ~1300 lines (server-side component with client features)
- Question components: ~300 lines total
- Timer: Uses `useEffect` with ref to avoid memory leaks
- Violations: Tracked in ref to survive re-renders
- State: Managed with hooks for proper React flow

---

## Browser Requirements

- Modern browser with Fullscreen API
- localStorage support
- ES6+ JavaScript support
- No browser extensions that modify DOM

---

## Debugging Tips

**Enable violation logging**:
```typescript
// Add console.log in recordViolation()
const recordViolation = useCallback((type: string) => {
  console.log("🚨 Violation:", type)
  // ... rest of function
})
```

**Monitor timer state**:
```typescript
useEffect(() => {
  console.log("⏱️ Time left:", timeLeft)
}, [timeLeft])
```

**Check auth state**:
```typescript
const { token, user } = useAuthStore((state) => ({
  token: state.token,
  user: state.user,
}))
console.log("Auth:", { token, user })
```

---

## References

- Main implementation: `src/app/(dashboard)/assessment/[applicationId]/page.tsx`
- Component library: `src/components/assessment/QuestionTypes.tsx`
- Type definitions: `src/types/candidate.types.ts`
- API documentation: `VIOLATION_API_INTEGRATION.md`
- Route protection: `AUTH_PROTECTION_GUIDE.md`
- Timing details: `AUTO_SUBMIT_AND_TIMING.md`

---

**Last Updated**: August 12, 2026  
**Status**: All features implemented and verified ✅
