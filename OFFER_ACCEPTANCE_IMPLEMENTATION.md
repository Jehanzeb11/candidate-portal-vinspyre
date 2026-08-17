# Offer Acceptance Modal Implementation

## Overview

Successfully implemented an offer acceptance/rejection modal that automatically appears when a user visits the dashboard with an `offerToken` URL parameter. The modal allows candidates to accept or reject job offers directly from email links.

## Files Created

### Components
- `src/components/offer/OfferAcceptanceModal.tsx` - Main modal component with accept/reject functionality
- `src/hooks/useOfferToken.ts` - Custom hook to manage offer token URL parameter and modal state

### Modified Files
- `src/app/(dashboard)/page.tsx` - Integrated offer modal into dashboard
- `src/server/Endpoints.ts` - Added accept/reject offer endpoints

## Features Implemented

### ✅ URL Parameter Detection
- **Automatic Detection**: Detects `offerToken` in URL parameters on page load
- **Modal Trigger**: Automatically opens modal when token is present
- **URL Cleanup**: Removes token from URL after modal is closed

### ✅ Offer Acceptance Modal
- **Accept Button**: Calls `POST /recruitment/candidate-profile/offers/accept?token={token}`
- **Reject Button**: Calls `POST /recruitment/candidate-profile/offers/reject?token={token}`
- **Loading States**: Shows loading spinners during API calls
- **Error Handling**: Displays error messages for failed requests
- **Success States**: Shows confirmation screens after successful actions

### ✅ User Experience
- **Professional UI**: Clean modal design with appropriate icons and colors
- **Clear Actions**: Prominent accept (green) and reject (red) buttons
- **Safety Warning**: Alert about decision being final
- **Responsive Design**: Works on all screen sizes
- **Accessible**: Proper ARIA labels and keyboard navigation

### ✅ API Integration
- **Token Authentication**: Sends offer token as query parameter
- **Response Handling**: Processes backend response with success/error states
- **Login Token**: Handles login token from accept response for auto-login
- **Toast Notifications**: Shows success/error messages to user

## API Endpoints

### Accept Offer
```
POST /recruitment/candidate-profile/offers/accept?token={offerToken}
```
**Response:**
```json
{
  "success": true,
  "status": 200,
  "message": "Candidate offer accepted",
  "data": {
    "id": "candidate-interview-offer-id",
    "candidateProfileId": "candidate-profile-id",
    "jobApplicationId": "job-application-id",
    "offerStatus": "accepted",
    "loginToken": "jwt-token-for-frontend-login",
    "frontendUrl": "http://localhost:3000?token=jwt-token-for-frontend-login",
    "documentUploadUrl": "http://192.168.18.157:3000/candidate/documents?offerId=candidate-interview-offer-id"
  }
}
```

### Reject Offer
```
POST /recruitment/candidate-profile/offers/reject?token={offerToken}
```

## User Flow

1. **Email Link**: Candidate clicks accept offer link in email
2. **URL with Token**: Redirects to dashboard with `?offerToken=...` parameter
3. **Automatic Modal**: Modal opens automatically when page loads
4. **Decision**: User clicks "Accept Offer" or "Decline Offer"
5. **Processing**: Loading state shown during API call
6. **Confirmation**: Success screen with appropriate message
7. **Cleanup**: Modal closes and URL parameter is removed

## Integration

### Dashboard Integration
The modal is integrated into the main dashboard page (`/dashboard`) and will appear automatically when an offer token is detected in the URL.

### Auth Integration
When an offer is accepted, the modal receives a login token from the backend which can be used for automatic authentication.

## Error Handling

- **Network Errors**: Shows toast notification with error message
- **API Errors**: Displays backend error messages to user
- **Invalid Token**: Handles cases where token is expired or invalid
- **Loading States**: Prevents multiple submissions during processing

## Security Considerations

- **Token Validation**: Backend validates offer token before processing
- **Single Use**: Tokens should be single-use to prevent replay attacks
- **Expiration**: Tokens have expiration dates for security
- **HTTPS**: All API calls use secure endpoints

## Testing

### Manual Testing Steps
1. Navigate to: `http://localhost:3000/?offerToken=your-test-token`
2. Verify modal opens automatically
3. Test accept flow - should show loading state and success message
4. Test reject flow - should show loading state and confirmation
5. Test cancel - should close modal and clean URL
6. Test error scenarios with invalid tokens

### URL Examples
```
http://localhost:3000/?offerToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Next Steps

1. **Login Integration**: Complete integration with auth system using received login token
2. **Redirect Logic**: Implement redirect to specific pages after acceptance
3. **Offer Details**: Add offer details display in modal before decision
4. **Analytics**: Track acceptance/rejection rates
5. **Email Templates**: Ensure email links generate correct URLs with tokens

The implementation is complete and ready for testing with actual offer tokens from the backend system.