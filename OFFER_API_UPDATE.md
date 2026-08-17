# Offer API Update - POST with JSON Body

## Overview

Updated the offer accept/reject APIs from GET with query parameters to POST with JSON body format as requested. This provides better security and follows RESTful API conventions.

## API Changes

### Previous Format (Query Parameters):
```
POST /recruitment/candidate-profile/offers/accept?token=eyJhbGci...
POST /recruitment/candidate-profile/offers/reject?token=eyJhbGci...
```

### New Format (JSON Body):
```
POST /api/v1/recruitment/candidate-profile/offers/accept
Content-Type: application/json
{
  "token": "eyJhbGci..."
}

POST /api/v1/recruitment/candidate-profile/offers/reject  
Content-Type: application/json
{
  "token": "eyJhbGci..."
}
```

## Implementation Changes

### 1. Accept Offer API Call (`src/components/offer/OfferAcceptanceModal.tsx`)

**Before**:
```typescript
const response = await fetch(
  `${BASE_URL}/recruitment/candidate-profile/offers/accept?token=${encodeURIComponent(offerToken)}`,
  {
    method: "POST",
    headers: {
      "Accept": "application/json",
    },
  }
)
```

**After**:
```typescript
const response = await fetch(
  `${BASE_URL}/api/v1/recruitment/candidate-profile/offers/accept`,
  {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: offerToken
    }),
  }
)
```

### 2. Reject Offer API Call

**Before**:
```typescript
const response = await fetch(
  `${BASE_URL}/recruitment/candidate-profile/offers/reject?token=${encodeURIComponent(offerToken)}`,
  {
    method: "POST",
    headers: {
      "Accept": "application/json",
    },
  }
)
```

**After**:
```typescript
const response = await fetch(
  `${BASE_URL}/api/v1/recruitment/candidate-profile/offers/reject`,
  {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: offerToken
    }),
  }
)
```

### 3. Endpoints Update (`src/server/Endpoints.ts`)

Updated endpoint constants to reflect new API paths:
```typescript
const ENDPOINTS = {
  // ... other endpoints
  ACCEPT_OFFER: "/api/v1/recruitment/candidate-profile/offers/accept",
  REJECT_OFFER: "/api/v1/recruitment/candidate-profile/offers/reject",
}
```

## Request Format

### Accept Offer Request:
```http
POST /api/v1/recruitment/candidate-profile/offers/accept HTTP/1.1
Host: api.esclatech.net
Content-Type: application/json
Accept: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDk5YzA2OC05ZWJhLTQyNTItYWM5Yi1jYWE2YWRkMzNkMTciLCJjYW5kaWRhdGVQcm9maWxlSWQiOiI1MDk5YzA2OC05ZWJhLTQyNTItYWM5Yi1jYWE2YWRkMzNkMTciLCJjYW5kaWRhdGVJbnRlcnZpZXdJZCI6IjYxM2Q3NDFkLTI1ZGYtNDRiMy05MjM0LWU2YTllYzEzMWJiNCIsInR5cGUiOiJjYW5kaWRhdGUtb2ZmZXItYWNjZXB0IiwiaWF0IjoxNzg2ODI0NDU2LCJleHAiOjE3ODc0MjkyNTZ9.A7mvHgAWZ9Ea37TdYcEJHiczkLlsJXnHOvG-ZFK2JhE"
}
```

### Reject Offer Request:
```http
POST /api/v1/recruitment/candidate-profile/offers/reject HTTP/1.1
Host: api.esclatech.net
Content-Type: application/json
Accept: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1MDk5YzA2OC05ZWJhLTQyNTItYWM5Yi1jYWE2YWRkMzNkMTciLCJjYW5kaWRhdGVQcm9maWxlSWQiOiI1MDk5YzA2OC05ZWJhLTQyNTItYWM5Yi1jYWE2YWRkMzNkMTciLCJjYW5kaWRhdGVJbnRlcnZpZXdJZCI6IjYxM2Q3NDFkLTI1ZGYtNDRiMy05MjM0LWU2YTllYzEzMWJiNCIsInR5cGUiOiJjYW5kaWRhdGUtb2ZmZXItYWNjZXB0IiwiaWF0IjoxNzg2ODI0NDU2LCJleHAiOjE3ODc0MjkyNTZ9.A7mvHgAWZ9Ea37TdYcEJHiczkLlsJXnHOvG-ZFK2JhE"
}
```

## Expected Response Format

Both APIs should return the same response structure as before:

### Successful Response:
```json
{
  "success": true,
  "status": 200,
  "message": "Candidate offer accepted", // or "Candidate offer rejected"
  "data": {
    "id": "candidate-interview-offer-id",
    "candidateProfileId": "candidate-profile-id",
    "jobApplicationId": "job-application-id",
    "offerStatus": "accepted", // or "rejected"
    "loginToken": "jwt-token-for-frontend-login", // only for accept
    "frontendUrl": "http://localhost:3000?token=jwt-token-for-frontend-login",
    "documentUploadUrl": "http://192.168.18.157:3000/candidate/documents?offerId=candidate-interview-offer-id"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "status": 400, // or other error code
  "message": "Invalid token or offer not found"
}
```

## Benefits of New Format

### Security:
- ✅ Token not exposed in URL/logs
- ✅ Proper Content-Type validation
- ✅ Request body encryption in transit

### Standards Compliance:
- ✅ RESTful API design
- ✅ Proper HTTP method usage
- ✅ JSON content type headers

### Developer Experience:
- ✅ Consistent API patterns
- ✅ Better error handling
- ✅ Easier testing with tools like Postman

## Testing

### Manual Testing:
1. Navigate to dashboard with offer token:
   ```
   http://localhost:3002/?offerToken=your-test-token
   ```

2. Click "Accept Offer" and verify:
   - Network tab shows POST request to `/api/v1/recruitment/candidate-profile/offers/accept`
   - Request body contains `{"token": "your-test-token"}`
   - Content-Type header is `application/json`

3. Test error scenarios:
   - Invalid token should return 400 error
   - Expired token should return appropriate error
   - Network issues should show retry option

### cURL Testing:
```bash
# Accept offer
curl -X POST "https://api.esclatech.net/api/v1/recruitment/candidate-profile/offers/accept" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"token": "your-offer-token"}'

# Reject offer  
curl -X POST "https://api.esclatech.net/api/v1/recruitment/candidate-profile/offers/reject" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"token": "your-offer-token"}'
```

## Implementation Complete

The offer accept/reject APIs now use POST requests with JSON body format as requested. The frontend properly sends the token in the request body with appropriate Content-Type headers, providing better security and API consistency.

### Files Modified:
- `src/components/offer/OfferAcceptanceModal.tsx` - Updated API calls
- `src/server/Endpoints.ts` - Updated endpoint paths

The implementation maintains all existing functionality while improving the API format and security.