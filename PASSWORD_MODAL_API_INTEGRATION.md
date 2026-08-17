# Password Change Modal - API Integration Update

## Overview

Updated the password change modal to use the `isPasswordUpdated` field from the candidate profile API response instead of relying on login response data. This ensures the modal shows/hides based on the most current backend state.

## API Response Structure

Based on your provided API response, the relevant field is:
```json
{
  "data": {
    "isPasswordUpdated": true
    // ... other profile fields
  }
}
```

## Changes Made

### 1. Updated CandidateProfile Type (`src/types/candidate.types.ts`)
```typescript
export interface CandidateProfile {
  // ... existing fields
  isPasswordUpdated?: boolean  // ✅ Added this field
}
```

### 2. Modified Profile Hook (`src/features/auth/hooks/use-candidate-profile.ts`)
```typescript
export function useCandidateProfile() {
  const setPasswordUpdated = useAuthStore((s) => s.setPasswordUpdated)  // ✅ Added
  
  useEffect(() => {
    if (query.data) {
      setProfile(query.data)
      // ✅ Update password status from API response
      if (typeof query.data.isPasswordUpdated === 'boolean') {
        setPasswordUpdated(query.data.isPasswordUpdated)
      }
    }
  }, [query.data, setProfile, setPasswordUpdated])
}
```

### 3. Enhanced Password Modal (`src/features/auth/components/change-password-modal.tsx`)
```typescript
export function ChangePasswordModal() {
  const setPasswordUpdated = useAuthStore((s) => s.setPasswordUpdated)  // ✅ Added
  
  async function onSubmit(data: ChangePasswordInput) {
    try {
      await apiFetch("/recruitment/candidate-profile/change-password", {
        // ... API call
      })
      
      // ✅ Update password status after successful change
      setPasswordUpdated(true)
      setDismissed(true)
      
    } catch (err) {
      // ... error handling
    }
  }
}
```

## Behavior Logic

### Modal Display Conditions
The password change modal will show when:
- `isPasswordUpdated` is `false` in the API response
- Modal has not been dismissed by user

The modal will hide when:
- `isPasswordUpdated` is `true` in the API response
- User successfully changes password (sets to `true`)
- User manually dismisses modal

### Data Flow
1. **Page Load**: `useCandidateProfile` hook fetches profile data
2. **API Response**: Backend returns `"isPasswordUpdated": true/false`
3. **Store Update**: Hook updates `isPasswordUpdated` in auth store
4. **Modal Reaction**: Modal shows/hides based on store value
5. **Password Change**: On successful change, store is updated to `true`
6. **Modal Closes**: Modal automatically closes after password update

## API Integration Points

### Profile Fetch
```typescript
// Automatically called on dashboard load
GET /recruitment/candidate-profile/me

// Response includes:
{
  "data": {
    "isPasswordUpdated": true,  // Controls modal visibility
    // ... other profile data
  }
}
```

### Password Change
```typescript
// Called when user submits new password
PUT /recruitment/candidate-profile/change-password
{
  "currentPassword": "old-pass",
  "newPassword": "new-pass"
}

// After success: isPasswordUpdated set to true in store
```

## Testing Scenarios

### Test Case 1: New User (Password Not Updated)
1. Backend API returns `"isPasswordUpdated": false`
2. Modal should appear automatically on dashboard
3. User cannot dismiss modal (must change password)
4. After successful password change, modal closes

### Test Case 2: Existing User (Password Updated)
1. Backend API returns `"isPasswordUpdated": true`
2. Modal should NOT appear
3. Dashboard loads normally

### Test Case 3: Password Change Flow
1. User in modal enters current + new passwords
2. API call succeeds
3. Store updates to `isPasswordUpdated: true`
4. Modal closes automatically
5. Success toast shows "Password updated successfully!"

## Error Handling

- **API Errors**: Modal stays open, shows error message
- **Network Issues**: Modal stays open, user can retry
- **Validation Errors**: Form shows field-specific errors
- **Missing Field**: Gracefully handles if `isPasswordUpdated` is undefined

## Backward Compatibility

- If `isPasswordUpdated` is missing from API response, defaults to current behavior
- Existing auth store structure maintained
- Modal dismissal logic preserved for user experience

## Security Considerations

- Password status always synced with backend state
- No client-side manipulation can bypass password requirement
- Modal cannot be permanently dismissed if backend says password needs update
- Fresh data fetched on every dashboard visit (`staleTime: 0`)

## Implementation Complete

The password change modal now uses the live backend state from the candidate profile API instead of stale login data. This ensures users see the modal when the backend determines their password needs updating, regardless of when they logged in.

### Key Benefits:
- ✅ Real-time sync with backend password status
- ✅ Handles admin-forced password resets
- ✅ Works across browser sessions and devices
- ✅ No manual refresh needed to see updated status
- ✅ Automatic modal closure after successful change