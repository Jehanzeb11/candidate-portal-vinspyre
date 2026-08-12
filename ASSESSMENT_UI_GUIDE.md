# Assessment UI Guide - Question Types

## Visual Reference

### 1. MCQ (Multiple Choice Question)

**Visual Style:**
```
┌─────────────────────────────────────────────────────┐
│ What is Node.js commonly used for?    [Node.js Easy] │
├─────────────────────────────────────────────────────┤
│ ◯ Backend APIs                                       │
│ ◯ Image editing                                      │
│ ◯ CSS styling                                        │
│ ◯ Database indexing                                  │
└─────────────────────────────────────────────────────┘
```

**Color Scheme:**
- Skill Tag: Blue (`bg-blue-100 text-blue-700`)
- Difficulty Badge: Green (Easy), Amber (Medium), Red (Hard)
- Selection: Radio button with brand primary color

**Component Properties:**
- Clean radio button interface
- Hover effect on options (bg-muted)
- Crisp typography
- No helper text needed (auto-scoring)

**User Flow:**
1. Read question with skill/difficulty tags
2. Click on option to select
3. Selection is immediately saved
4. Move to next question

---

### 2. Fill in the Blank

**Visual Style:**
```
┌───────────────────────────────────────────────────────┐
│ The file that stores installed npm package           │
│ versions is package-____.json.    [Node.js Medium]    │
├───────────────────────────────────────────────────────┤
│ 💡 Fill in the Blank                                  │
│ Complete the statement above by filling in the blank  │
│ space.                                                │
│                                                       │
│ Your Answer                                           │
│ ┌─────────────────────────────────────┐               │
│ │ Type the word or phrase that        │               │
│ │ completes the statement...          │               │
│ │                                     │               │
│ │ [User types: lock]                  │               │
│ └─────────────────────────────────────┘               │
│ Be concise and accurate with your answer.            │
└───────────────────────────────────────────────────────┘
```

**Color Scheme:**
- Skill Tag: Purple (`bg-purple-100 text-purple-700`)
- Info Box: Amber (`bg-amber-50 border-amber-200`)
- Textarea: Standard input style
- Emoji: 💡 (light bulb) for visual distinction

**Component Properties:**
- Textarea height: `min-h-32` (8 lines approx)
- Info box with amber theme for quick visual recognition
- Clear guidance text
- No resize handle (frozen height)

**User Flow:**
1. Read question with skill/difficulty tags
2. See info box explaining what to do
3. Type answer in textarea
4. Answer auto-saves as typing
5. Move to next question

---

### 3. Descriptive (Essay/Long Answer)

**Visual Style:**
```
┌───────────────────────────────────────────────────────┐
│ Explain how you would debug a slow backend API        │
│ in production.              [Node.js Hard]            │
├───────────────────────────────────────────────────────┤
│ 📝 Descriptive Answer Required                         │
│ Provide a detailed, well-thought-out response to the  │
│ question above.                                       │
│                                                       │
│ Your Answer                                           │
│ ┌─────────────────────────────────────────┐           │
│ │ Provide a detailed explanation or       │           │
│ │ answer here. Take your time to explain  │           │
│ │ your thoughts clearly...                │           │
│ │                                         │           │
│ │ [User types detailed answer - multiple  │           │
│ │  paragraphs with examples]              │           │
│ │                                         │           │
│ │                                         │           │
│ │                                         │           │
│ │                                         │           │
│ └─────────────────────────────────────────┘           │
│ This response will be reviewed by our assessment      │
│ team. Be clear, concise, and thorough.               │
└───────────────────────────────────────────────────────┘
```

**Color Scheme:**
- Skill Tag: Indigo (`bg-indigo-100 text-indigo-700`)
- Info Box: Indigo (`bg-indigo-50 border-indigo-200`)
- Textarea: Standard input style
- Emoji: 📝 (notepad) for visual distinction

**Component Properties:**
- Textarea height: `min-h-48` (12 lines approx)
- Info box with indigo theme for different visual treatment
- Mentions manual review in helper text
- No resize handle (frozen height)

**User Flow:**
1. Read question with skill/difficulty tags
2. See info box explaining manual review
3. Type detailed answer in larger textarea
4. Answer auto-saves as typing
5. Move to next question

---

## Design Patterns

### Badge System

```
Question Type    Color    Dark Mode
────────────────────────────────────────
MCQ              Blue     Blue-900/50
Fill Blank       Purple   Purple-900/50
Descriptive      Indigo   Indigo-900/50
Difficulty (E)   Green    Emerald-900/50
Difficulty (M)   Amber    Amber-900/50
Difficulty (H)   Red      Red-900/50
```

### Textarea Configuration

```
Question Type      Height    Placeholder                    Review
──────────────────────────────────────────────────────────────────
MCQ                N/A       (Radio buttons)               Auto-scored
Fill Blank         min-h-32  "Type word/phrase..."          Manual
Descriptive        min-h-48  "Detailed explanation..."      Manual
```

### Helper Text

```
Question Type      Text
──────────────────────────────────────────────────────────
MCQ                (None)
Fill Blank         "Be concise and accurate with your answer."
Descriptive        "This response will be reviewed by our 
                    assessment team. Be clear, concise, 
                    and thorough."
```

---

## Responsive Behavior

### Desktop (> 768px)
- Full width textareas
- Badges float to the right
- Proper spacing maintained

### Tablet (640px - 768px)
- Full width textareas
- Badges wrap below question if needed
- Reduced padding

### Mobile (< 640px)
- Full width layout
- Textareas adjusted for mobile
- Single column badges

---

## Accessibility Features

### All Question Types
✓ Proper label associations
✓ Semantic HTML structure
✓ Keyboard navigation support
✓ Color-independent design (badges have text labels)
✓ Sufficient contrast ratios (WCAG AA)
✓ Clear focus states

### MCQ Specific
✓ Radio group semantics
✓ Keyboard arrow navigation
✓ Proper hit targets (44px minimum)

### Text Input (Fill Blank & Descriptive)
✓ Proper label elements
✓ Placeholder text as hint only
✓ Helper text for guidance
✓ Resize disabled (fixed height)
✓ Clear focus state on textarea

---

## State Management

### Question Answer States

```
┌─────────────────────────────────┐
│   MCQ Question                  │
├─────────────────────────────────┤
│ selectedAnswerIndex: undefined  │ → Not answered
│ selectedAnswerIndex: 0 | 1 | 2  │ → Answered
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   Fill Blank / Descriptive      │
├─────────────────────────────────┤
│ freeTextAnswer: undefined       │ → Not answered
│ freeTextAnswer: ""              │ → Not answered
│ freeTextAnswer: "user text"     │ → Answered
└─────────────────────────────────┘
```

### Navigator Status

```
Question      Answered    Current     Status
─────────────────────────────────────────────
Q1            false       false       ❌ Disabled (answer first)
Q1            true        true        🔵 Current (can navigate)
Q1            true        false       ✅ Answered (can navigate)
Q2            false       false       ❌ Disabled (Q1 not answered)
```

---

## Animations & Transitions

### Hover Effects
```css
/* MCQ Options */
.option:hover {
  background: var(--muted);
  transition: background-color 0.2s ease;
}

/* Textarea Focus */
.textarea:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Transitions
- Label transitions: 150ms ease
- Hover states: 200ms ease
- Focus states: Immediate

---

## Color Values

### Light Mode
```
MCQ Skill Tag        bg-blue-100      text-blue-700
Fill Blank Skill Tag bg-purple-100    text-purple-700
Descriptive Skill    bg-indigo-100    text-indigo-700
Fill Blank Info Box  bg-amber-50      border-amber-200
Descriptive Info Box bg-indigo-50     border-indigo-200
```

### Dark Mode
```
MCQ Skill Tag        bg-blue-900/50      text-blue-300
Fill Blank Skill Tag bg-purple-900/50    text-purple-300
Descriptive Skill    bg-indigo-900/50    text-indigo-300
Fill Blank Info Box  bg-amber-950/30     border-amber-800/40
Descriptive Info Box bg-indigo-950/30    border-indigo-800/40
```

---

## Example Questions

### MCQ Example
```
Type: "mcq"
Question: "What is Node.js commonly used for?"
Options: ["Backend APIs", "Image editing", "CSS styling", "Database indexing"]
CorrectAnswer: 0
```

### Fill Blank Example
```
Type: "fill_blank"
Question: "The file that stores installed npm package versions is package-____.json."
Options: []
(User answers: "lock")
```

### Descriptive Example
```
Type: "descriptive"
Question: "Explain how you would debug a slow backend API in production."
Options: []
(User answers: "I would use profiling tools...")
```

---

## Implementation Notes

### Files Involved
- `src/components/assessment/QuestionTypes.tsx` - Component definitions
- `src/app/(dashboard)/assessment/[applicationId]/page.tsx` - Integration
- `src/types/candidate.types.ts` - Type definitions

### Component Exports
```typescript
export function MCQQuestion(props: MCQQuestionProps)
export function FillBlankQuestion(props: FillBlankQuestionProps)
export function DescriptiveQuestion(props: DescriptiveQuestionProps)
```

### Props Pattern
All components follow same pattern:
```typescript
{
  question: AssessmentQuestion,
  answer?: string | number,                    // Current value
  selectedAnswerIndex?: number,                // MCQ only
  onAnswerChange: (text: string) => void,     // Text input
  onSelectAnswer: (index: number) => void     // MCQ only
}
```

---

## Testing Scenarios

### MCQ Testing
- [ ] Question text and options render
- [ ] Skill tag displays correctly (blue)
- [ ] Difficulty badge shows correct color
- [ ] Clicking option selects it
- [ ] Selected state is visible
- [ ] Cannot select multiple options
- [ ] Answer persists when navigating away/back

### Fill Blank Testing
- [ ] Question text renders
- [ ] Skill tag displays correctly (purple)
- [ ] Info box shows amber theme
- [ ] Textarea is visible and focusable
- [ ] Text input works
- [ ] Placeholder text visible
- [ ] Helper text visible
- [ ] Answer persists when navigating away/back

### Descriptive Testing
- [ ] Question text renders
- [ ] Skill tag displays correctly (indigo)
- [ ] Info box shows indigo theme
- [ ] Textarea is larger than fill_blank
- [ ] Text input works (multiple lines)
- [ ] Placeholder text visible
- [ ] Helper text mentions manual review
- [ ] Answer persists when navigating away/back

### Dark Mode Testing
- [ ] All colors visible and readable in dark mode
- [ ] Contrast ratios maintained
- [ ] Badges distinguishable
- [ ] Info boxes readable
