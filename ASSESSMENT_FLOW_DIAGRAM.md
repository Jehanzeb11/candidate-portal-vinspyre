# Assessment Flow - Complete Diagram

## User Journey

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                       ASSESSMENT USER FLOW                              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │   START      │
                              └──────┬───────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 │
        ┌─────────────────────────┐                 │
        │   Load Assessment       │                 │
        │   (API: GET_TEST)       │                 │
        └────────┬────────────────┘                 │
                 │                                 │
        ┌────────▼────────────┐                    │
        │  Normalize          │                    │
        │  Questions          │                    │
        │  (type/questionType)│                    │
        └────────┬────────────┘                    │
                 │                                 │
        ┌────────▼──────────────────────┐          │
        │   INSTRUCTIONS PAGE            │          │
        │  ├─ Assessment Title           │          │
        │  ├─ Skills Being Tested        │          │
        │  ├─ Assessment Details:        │          │
        │  │  • Total Questions: 9       │          │
        │  │  • Time Per Question: 2 min │          │
        │  │  • Total Time: 18 min       │          │
        │  │  • Passing Score: 70%       │          │
        │  ├─ Security Notice            │          │
        │  ├─ Prohibited Activities      │          │
        │  └─ [START (Fullscreen)]       │          │
        └────────┬───────────────────────┘          │
                 │ User clicks START                │
        ┌────────▼──────────────┐                  │
        │  Enter Fullscreen     │                  │
        └────────┬───────────────┘                 │
                 │                                 │
        ┌────────▼──────────────────────────────────────┐
        │                                              │
        │          ASSESSMENT TAKING MODE              │
        │                                              │
        │  ┌──────────────────────────────────────┐   │
        │  │  Header (Sticky)                    │   │
        │  │  ├─ Q 1 of 9 ─────────── Progress  │   │
        │  │  ├─ [████░░░░░░░░░░░░] 11%        │   │
        │  │  └─ Timer: 1:56 ⚠️ Not Fullscreen│   │
        │  └──────────────────────────────────────┘   │
        │                                              │
        │  ┌──────────────────────────────────────┐   │
        │  │  Question 1 (MCQ - Blue Theme)       │   │
        │  │  "What is Node.js commonly used for?"│   │
        │  │  [Node.js] [Easy]                    │   │
        │  │                                      │   │
        │  │  ◉ Backend APIs                      │   │
        │  │  ○ Image editing                     │   │
        │  │  ○ CSS styling                       │   │
        │  │  ○ Database indexing                 │   │
        │  └──────────────────────────────────────┘   │
        │                                              │
        │  ┌──────────────────────────────────────┐   │
        │  │  Questions Navigator                │   │
        │  │  ┌───────────────────────────────┐  │   │
        │  │  │ 🔴 ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ ⚪ │  │   │
        │  │  │ 1  2  3 4 5 6 7 8 9        │  │   │
        │  │  └───────────────────────────────┘  │   │
        │  └──────────────────────────────────────┘   │
        │                                              │
        │  ┌──────────────────────────────────────┐   │
        │  │              [NEXT]                 │   │
        │  └──────────────────────────────────────┘   │
        │                                              │
        └──────────────────────────────────────────────┘
                 │
                 │ User answers Q1
                 ├─ MCQ: Select option
                 │ User clicks NEXT
                 │
        ┌────────▼──────────────────────────────────────┐
        │                                              │
        │        QUESTION 2 (Fill Blank)               │
        │        Timer Reset: 2:00                     │
        │                                              │
        │  Question 2 (Purple Theme)                   │
        │  "The file stores npm packages is            │
        │   package-____.json"                         │
        │  [Node.js] [Medium]                          │
        │                                              │
        │  💡 Fill in the Blank                        │
        │  Complete the statement above...             │
        │                                              │
        │  ┌──────────────────────┐                   │
        │  │ Type the word...     │                   │
        │  │ [lock____________]   │                   │
        │  └──────────────────────┘                   │
        │  Be concise and accurate...                 │
        │                                              │
        │  [NEXT]                                      │
        │                                              │
        └──────────────────────────────────────────────┘
                 │
                 │ Continue through questions
                 │
        ┌────────▼──────────────────────────────────────┐
        │                                              │
        │        QUESTION 5 (Descriptive)              │
        │        Timer Reset: 2:00                     │
        │                                              │
        │  Question 5 (Indigo Theme)                   │
        │  "Explain how you would debug a slow         │
        │   backend API in production"                 │
        │  [Node.js] [Hard]                            │
        │                                              │
        │  📝 Descriptive Answer Required              │
        │  Provide a detailed, well-thought-out        │
        │  response to the question above.             │
        │                                              │
        │  ┌─────────────────────────────────┐        │
        │  │ I would use profiling tools...  │        │
        │  │ [User types detailed answer]    │        │
        │  │ [___________________________]   │        │
        │  └─────────────────────────────────┘        │
        │                                              │
        │  [NEXT]                                      │
        │                                              │
        └──────────────────────────────────────────────┘
                 │
                 │ Continue through remaining questions
                 │
        ┌────────▼──────────────────────────────────────┐
        │                                              │
        │        QUESTION 9 (Final Question)           │
        │        Timer: 0:45                           │
        │                                              │
        │  Question 9 (MCQ)                            │
        │  "Where should JWT signing secrets be..."    │
        │                                              │
        │  ◉ Environment variables or secret manager  │
        │  ○ Public frontend code                     │
        │  ○ Swagger examples                         │
        │  ○ Database table names                     │
        │                                              │
        │  ┌────────────────────────────────────────┐ │
        │  │    [SUBMIT ASSESSMENT]                 │ │
        │  │    (Button appears on final question)  │ │
        │  └────────────────────────────────────────┘ │
        │                                              │
        └──────────────────────────────────────────────┘
                 │
                 │ User clicks SUBMIT
                 │
        ┌────────▼──────────────────────────────────────┐
        │                                              │
        │        SUBMISSION IN PROGRESS                │
        │                                              │
        │  POST /recruitment/assessment/submit         │
        │  {                                           │
        │    jobApplicationId: "fde732f7-...",        │
        │    answers: {                               │
        │      "q1": "Backend APIs",                 │
        │      "q2": "lock",                         │
        │      "q5": "I would use profiling...",     │
        │      ...                                    │
        │    },                                       │
        │    violations: []                           │
        │  }                                          │
        │                                              │
        │  ⏳ Processing...                           │
        │                                              │
        └──────────────────────────────────────────────┘
                 │
                 │ Response received
                 │
        ┌────────▼──────────────────────────────────────┐
        │                                              │
        │        SUCCESS SCREEN                        │
        │        (New "submitting" state)              │
        │                                              │
        │              ✓                               │
        │        (Large Green Circle)                  │
        │                                              │
        │    Assessment Submitted!                     │
        │                                              │
        │  Your assessment has been submitted          │
        │  successfully. We will get back to you       │
        │  soon.                                       │
        │                                              │
        │  ┌──────────────────────────────────────┐   │
        │  │ ✓ Thank you for completing the      │   │
        │  │   assessment. Our team will review  │   │
        │  │   your responses and contact you    │   │
        │  │   with the results.                 │   │
        │  └──────────────────────────────────────┘   │
        │                                              │
        │  Redirecting to dashboard...                │
        │  (3 seconds)                                │
        │                                              │
        └──────────────────────────────────────────────┘
                 │
                 │ Auto-redirect (3s)
                 │
        ┌────────▼──────────────────────────────────────┐
        │                                              │
        │  Exit Fullscreen                            │
        │  Navigate to Dashboard (/)                  │
        │                                              │
        └──────────────────────────────────────────────┘
                 │
        ┌────────▼──────────────────────────────────────┐
        │                                              │
        │        DASHBOARD                            │
        │                                              │
        │  Assessment marked as: SUBMITTED             │
        │  User can view other applications            │
        │                                              │
        └──────────────────────────────────────────────┘
                 │
                 └──────────────► END
```

## Question Type Rendering Logic

```
┌─────────────────────┐
│  Get Question Data  │
│  {                  │
│    questionType:    │
│      "mcq"          │
│  }                  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  getQuestionType(question)      │
│  ┌───────────────────────────┐  │
│  │ return type ||            │  │
│  │        questionType ||    │  │
│  │        "mcq"              │  │
│  └───────────────────────────┘  │
└────────┬────────────────────────┘
         │
         ▼
    ┌────────┴────────┬────────────┬──────────────┐
    │                 │            │              │
    ▼                 ▼            ▼              ▼
┌────────┐      ┌──────────┐  ┌────────────┐  ┌─────────┐
│  MCQ   │      │Fill Blank│  │Descriptive │  │ Other   │
│ (Blue) │      │(Purple)  │  │(Indigo)    │  │ (Error) │
└────┬───┘      └────┬─────┘  └────┬───────┘  └─────────┘
     │               │             │
     ▼               ▼             ▼
┌──────────┐    ┌──────────┐  ┌──────────┐
│RadioGroup│    │Textarea  │  │Textarea  │
│  Buttons │    │ min-h-32 │  │ min-h-48 │
│  (Blue)  │    │(Purple)  │  │(Indigo)  │
└──────────┘    └──────────┘  └──────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    STATE TRANSITIONS                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘

   loading
     │
     ▼
instructions ──(error)──┐
     │                 │
     │                 ▼
     │            blocked (Error state)
     │
   (start)
     │
     ▼
   taking ◄──────────┐
     │              │
     ├─ Auto-advance question
     │  └─ Reset timer
     │  └─ Stay in "taking"
     │
     ├─ Final question
     │  └─ Auto-submit
     │  └─ Go to "submitting"
     │
     └─ User click submit
        └─ Go to "submitting"
           │
           ▼
       submitting
           │
           ├─ Show success UI
           ├─ Wait 3 seconds
           │
           ├─ Exit fullscreen
           └─ Redirect to "/"

┌─ Already submitted?
│  └─ Go directly to "results"
│
▼
Dashboard or Results
```

## Timer Logic

```
┌──────────────────────────────────────────────────────────────┐
│                   TIMER PER QUESTION                         │
└──────────────────────────────────────────────────────────────┘

Question 1         Question 2         Question 3
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│2:00 ─────────│───│2:00 ─────────│───│2:00 ─────────│
│2:00          │   │2:00          │   │2:00          │
│1:59          │   │1:59          │   │1:59          │
│1:58          │   │1:58          │   │1:58          │
│...           │   │...           │   │...           │
│0:01          │   │0:01          │   │0:01          │
│0:00 ◄────┐   │   │0:00 ◄────┐   │   │0:00 ◄────┐   │
│ (auto-   │   │   │ (auto-   │   │   │ (auto-   │   │
│  advance)│   │   │  advance)│   │   │  submit) │   │
└──────────┼───┘   └──────────┼───┘   └──────────┼───┘
           │                  │                  │
           └──────────────────┴──────────────────┘
        Toast notification on each advance
```

## Data Flow

```
┌──────────────────────────────────────┐
│     API Response (questionType)       │
│  {                                   │
│    questions: [                      │
│      { questionType: "mcq" },       │
│      { questionType: "fill_blank" } │
│    ]                                 │
│  }                                   │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   Normalize on Fetch                 │
│   type: q.type || q.questionType     │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   Store in State (assessment)        │
│  {                                   │
│    questions: [                      │
│      { type: "mcq" },               │
│      { type: "fill_blank" }         │
│    ]                                 │
│  }                                   │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   Use getQuestionType() Helper       │
│   const type = getQuestionType(q)   │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   Render Correct Component           │
│  if (type === "mcq") <MCQ />        │
│  if (type === "fill_blank")         │
│    <FillBlank />                    │
│  if (type === "descriptive")        │
│    <Descriptive />                  │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   User Interaction                   │
│  - Select answer                    │
│  - Save to state                    │
│  - Advance to next                  │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   Submit Answers                     │
│  POST /recruitment/assessment/submit│
│  {                                   │
│    answers: { q1, q2, q3, ... },   │
│    violations: []                   │
│  }                                   │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│   Success Response                   │
│  Show success screen                │
│  Auto-redirect to dashboard         │
└──────────────────────────────────────┘
```

---

**Status**: ✅ Complete and Production Ready
