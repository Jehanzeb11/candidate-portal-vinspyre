# Assessment Security Architecture

This document outlines the comprehensive security measures implemented for the assessment feature.

## Overview

The assessment system employs a multi-layered security approach to prevent cheating and maintain assessment integrity. All violations are recorded server-side for audit purposes.

## Security Features

### 1. **Fullscreen Mode** 🖥️
- **Enforcement**: Assessment automatically enters fullscreen when started
- **Violation Detection**: Tracks when user exits fullscreen
- **Recovery**: Warns user and records violation when fullscreen is exited
- **Impact**: Prevents distraction by other applications/windows

### 2. **Visibility & Focus Detection** 👁️
- **Tab Switching**: Detects when user switches to another browser tab
- **Window Blur**: Tracks when browser window loses focus
- **Visibility API**: Uses `visibilitychange` and `blur` events
- **Recording**: Each event is logged with timestamp
- **Feedback**: Real-time visual indicators show tab status

### 3. **Content Protection** 🔒
- **Copy/Paste/Cut**: All clipboard operations are blocked
- **Right-Click Menu**: Context menu disabled
- **Link Interception**: Links opening in new tabs are blocked
- **Recording**: Each attempt is recorded as a violation

### 4. **Browser Shortcut Blocking** ⌨️
- **Developer Tools**: F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C blocked
- **Command Palette**: Ctrl+Shift+P blocked
- **Mac Equivalents**: Cmd+Alt+I, Cmd+Alt+J supported
- **Screenshot Detection**: PrintScreen and Mac screenshot shortcuts detected (cannot prevent OS-level)
- **Impact**: Prevents access to browser devtools and console

### 5. **New Window/Tab Prevention** 🚫
- **window.open() Interception**: All new window attempts return null
- **target="_blank" Blocking**: Links trying to open in new tabs are prevented
- **Recording**: Tracks attempts with URL information

### 6. **Window Close Prevention** ⚠️
- **beforeunload Event**: Intercepts window close, page refresh, navigation away
- **Browser Confirmation**: Shows system confirmation dialog when user tries to leave
- **Recording**: Each close/leave attempt is recorded as violation
- **Prevents**: Accidental or intentional assessment abandonment

### 7. **Violation Tracking & Enforcement** 📊

#### Violation Types Tracked:
1. `tab_hidden` - User switched to another tab
2. `window_blur` - Browser window lost focus
3. `exited_fullscreen` - User exited fullscreen mode
4. `copy_attempted` - Copy operation attempt
5. `paste_attempted` - Paste operation attempt
6. `cut_attempted` - Cut operation attempt
7. `context_menu_attempted` - Right-click menu attempt
8. `devtools_shortcut_attempted` - Developer tools shortcut
9. `devtools_palette_attempted` - Command palette attempt
10. `screenshot_attempted` - Screenshot shortcut detected
11. `new_window_attempted` - New window open attempt
12. `new_tab_link_attempted` - Link target="_blank" attempt
13. `fullscreen_request_failed` - Fullscreen entry failure
14. `window_close_attempted` - User attempted to close window/leave page

#### Violation Thresholds:
- **At 3 violations**: User receives warning toast notification
- **At 5 violations**: Assessment automatically submits
  - All responses to that point are submitted
  - Violations are recorded server-side
  - User is notified of auto-submission

#### Data Collected per Violation:
```typescript
{
  type: string           // Type of violation
  timestamp: number      // When it occurred (milliseconds)
  details?: string       // Additional context (e.g., URL for new window)
}
```

### 7. **User Interface Feedback** 💬

#### Instructions Page:
- Clear list of prohibited activities
- Explanation of violation thresholds
- Expected behavior guidelines
- "Start Assessment (Fullscreen)" button

#### During Assessment:
- **Header shows**: Current question, timer, fullscreen status, tab status
- **Violation indicator**: Displays count of recorded violations
- **Timer color**: Changes to red when < 5 minutes remaining
- **Status badges**: Visual indicators for fullscreen/tab status

#### Results Page:
- **Score summary**: Percentage, correct count, passing threshold
- **Violations summary**: List of all recorded violations with timestamps
- **Answer review**: Detailed feedback on each answer

## Backend Integration

### API Endpoint
```
POST /recruitment/assessment/submit
```

### Payload Structure
```json
{
  "applicationId": "string",
  "assessmentId": "string",
  "answers": [
    {
      "questionId": "string",
      "selectedAnswerIndex": number
    }
  ],
  "score": number,
  "passed": boolean,
  "violations": [
    {
      "type": "string",
      "timestamp": number,
      "details": "string (optional)"
    }
  ]
}
```

### Server-Side Actions
1. **Validation**: Verify applicationId and assessmentId are valid
2. **Audit Log**: Record all violations with candidate details
3. **Alert Flagging**: Flag applications with excessive violations
4. **Review Queue**: Escalate high-violation cases for manual review
5. **Ban Policy**: Consider temporary assessment restrictions for repeat offenders

## Security Limitations & Assumptions

### Browser-Level Limitations:
- **OS Screenshots**: Cannot prevent OS-level screenshots (system-level security)
- **Screen Recording**: Cannot prevent system screen recording
- **Physical Recording**: Cannot prevent external cameras/recording devices
- **Virtual Machines**: Can be detected but not prevented
- **Browser Extensions**: Malicious extensions could bypass security

### Recommendations:
- Server-side monitoring of suspicious answer patterns
- Time-based analysis (unusually fast/slow completion)
- Content analysis to detect AI-generated answers
- Progressive increasing of security for high-risk candidates
- Consider proctoring/webcam integration for critical assessments

## Configuration

### Adjustable Constants (in page.tsx):
```typescript
const VIOLATION_THRESHOLD = 3           // Warn at this many
const MAX_VIOLATIONS_BEFORE_AUTO_SUBMIT = 5  // Auto-submit at this many
```

## User Experience

### Intended Flow:
1. ✓ Candidate clicks "Start Assessment"
2. ✓ Page enters fullscreen automatically
3. ✓ Assessment begins with clear visual cues
4. ✓ Any violations are instantly recorded
5. ✓ User sees violation count in real-time
6. ✓ Warnings appear at threshold
7. ✓ Auto-submit occurs if exceeded
8. ✓ Results page shows violations for transparency

### Error Recovery:
- If fullscreen fails, user is warned but can continue
- If violation limits reached, assessment auto-submits with warning
- All data collected before violation limit is preserved

## Testing Recommendations

### Security Tests:
1. ✓ Attempt to copy text from assessment
2. ✓ Try to right-click on page
3. ✓ Open DevTools (F12) during assessment
4. ✓ Switch to different tab
5. ✓ Click browser window out of focus
6. ✓ Exit fullscreen
7. ✓ Try to open links in new window
8. ✓ Press PrintScreen
9. ✓ Try to close window (F4, Ctrl+W, or close button)
10. ✓ Try to refresh page
11. ✓ Try to navigate away
12. ✓ Verify violation recording
13. ✓ Verify auto-submit at threshold

### Functional Tests:
1. ✓ Complete assessment normally (no violations)
2. ✓ Verify timer countdown
3. ✓ Test answer review functionality
4. ✓ Verify scoring calculation
5. ✓ Test violation display on results

## Future Enhancements

1. **Biometric Verification**: Add face recognition during assessment
2. **Webcam Proctoring**: Optional live proctoring stream
3. **Behavioral Analysis**: Detect suspicious answer patterns
4. **Network Monitoring**: Detect suspicious network activity
5. **Device Fingerprinting**: Track device/browser combinations
6. **Browser Lock-Down**: Full browser lock-down mode for high-security assessments
7. **AI-Generated Content Detection**: Verify originality of answers
8. **Eye Tracking**: Monitor attention during assessment


---

## Mixed Question Types Support

The assessment now supports both **Multiple Choice (MCQ)** and **Free-Input (Essay)** questions:

### MCQ Questions
- Radio button selection interface
- Automatically scored (correct/incorrect)
- Feedback shown in results with explanations
- Counts toward final percentage score

### Free-Input Questions
- Textarea for candidate to type responses
- Manually reviewed by assessment team (server-side)
- Submitted as-is without instant scoring
- Displayed in results page for candidate review
- Does NOT count toward percentage score

### Scoring Logic
- **Only MCQ questions** contribute to the final percentage score
- Free-input responses are submitted alongside answers
- Passing score threshold only applies to MCQ questions
- All question types count as "answered" for submission requirements

### Submission Payload
```typescript
{
  answers: [
    { questionId, type: "mcq", selectedAnswerIndex },
    { questionId, type: "free_input", freeTextAnswer }
  ]
}
```

### UI Indicators
- **Question Navigator**: Shows all questions with completion status
- **Results Page**: MCQ answers show correct/incorrect with explanations; Free-input shows submitted text with note about manual review
