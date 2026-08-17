# Employment Status Validation Fix

## Problem

The candidate application form was receiving a validation error:

```
"message": "Invalid option: expected one of \"employed_full_time\"|\"employed_part_time\"|\"freelancing_contract\"|\"unemployed\"|\"student_fresh_graduate\"|\"career_break\"|\"other\""
```

## Root Cause

The frontend form was sending `"on_career_break"` to the backend API, but the backend expected `"career_break"`.

## Files Modified

### `src/components/candidate-form/CandidateApplicationForm.tsx`

**Changed:**
```typescript
const EMPLOYMENT_STATUS_API: Record<string, string> = {
  "Employed full-time": "employed_full_time",
  "Employed part-time": "employed_part_time",
  "Freelancing / Contract work": "freelancing_contract",
  "Unemployed": "unemployed",
  "Student / Fresh Graduate": "student_fresh_graduate",
  "On a career break": "on_career_break",  // ❌ WRONG
  "Other": "other",
};
```

**To:**
```typescript
const EMPLOYMENT_STATUS_API: Record<string, string> = {
  "Employed full-time": "employed_full_time",
  "Employed part-time": "employed_part_time",
  "Freelancing / Contract work": "freelancing_contract",
  "Unemployed": "unemployed",
  "Student / Fresh Graduate": "student_fresh_graduate",
  "On a career break": "career_break",  // ✅ CORRECT
  "Other": "other",
};
```

## Validation

The mapping now correctly transforms the frontend display value `"On a career break"` to the backend API value `"career_break"` as expected.

## Current Status

- ✅ API mapping fixed to send correct value to backend
- ✅ Frontend display values remain user-friendly ("On a career break")
- ✅ Form validation logic remains consistent (hideNotice still checks for display value)
- ✅ No impact on other employment status options
- ✅ Dev server running successfully

## Backend API Compliance

The form now sends the correct employment status values that match the backend validation:

- `employed_full_time`
- `employed_part_time`
- `freelancing_contract`
- `unemployed`
- `student_fresh_graduate`
- `career_break` ← **Fixed**
- `other`

## Testing

To verify the fix:

1. Navigate to the candidate application form
2. Select "On a career break" as employment status
3. Submit the form
4. The backend should no longer return the validation error

The form should now successfully submit without employment status validation errors.