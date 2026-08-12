# Hydration Fix - AuthCheckLayout & ProtectedLayout

**Issue**: "The result of getServerSnapshot should be cached to avoid an infinite loop"  
**Date Fixed**: August 12, 2026  
**Status**: ✅ RESOLVED

---

## Problem Description

The `AuthCheckLayout` and `ProtectedLayout` components were causing a hydration mismatch error in Next.js 16 with Zustand stores. The error occurred because:

1. **Zustand store with persist middleware** initializes asynchronously
2. **Store not available during SSR** - returns `undefined` on server
3. **Store available during client hydration** - returns actual values
4. **Hydration mismatch**: Server HTML differs from client HTML
5. **Infinite loop**: React tries to reconcile the mismatch repeatedly

**Error Message**:
```
The result of getServerSnapshot should be cached to avoid an infinite loop
at AuthCheckLayout (...)
```

---

## Root Cause

In Next.js 16, using Zustand's `persist` middleware in layout-level client components causes hydration issues because:

1. Zustand with persist doesn't have the state available during SSR
2. The component subscribes to the store during render
3. The subscription result differs between server and client
4. This creates an impossible-to-resolve hydration mismatch

**Why the previous fix didn't work**:
- Adding `mounted` state only deferred the problem
- The store subscription still happened, causing the infinite loop
- The `useAuthStore` hook itself triggers the hydration error

---

## Solution: Read localStorage Directly

Instead of using the Zustand hook, read `localStorage` directly to check authentication:

### Before (Problematic)
```typescript
// ❌ This causes hydration mismatch
const { token, user } = useAuthStore((state) => ({
  token: state.token,
  user: state.user,
}))
```

### After (Fixed)
```typescript
// ✅ Read localStorage directly, no store subscription
useEffect(() => {
  try {
    const authStorage = localStorage.getItem("auth-storage")
    if (authStorage) {
      const parsed = JSON.parse(authStorage)
      if (parsed.state?.token && parsed.state?.user) {
        setIsAuthenticated(true)
      }
    }
  } catch (e) {
    // localStorage read failed, assume not authenticated
  }
  setMounted(true)
}, [])
```

**Why this works**:
1. **No store subscription**: Avoids Zustand hydration issues entirely
2. **localStorage is safe**: Available on client-side only (after hydration)
3. **Server renders nothing**: Returns `null` consistently
4. **No mismatch**: Client hydration matches server render
5. **Clean redirects**: After mounted, can safely redirect based on auth state

---

## Files Modified

### 1. `src/features/auth/components/auth-check-layout.tsx`
- Removed `useAuthStore` hook
- Added direct `localStorage` read
- Checks for both `token` and `user` in parsed localStorage
- Safely redirects to dashboard if authenticated

### 2. `src/features/auth/components/protected-layout.tsx`
- Removed `useAuthStore` hook
- Added direct `localStorage` read
- Checks for both `token` and `user` in parsed localStorage
- Safely redirects to login if not authenticated

---

## How It Works

### Timeline

**Server-side rendering**:
1. Component renders with `mounted = false`, `isAuthenticated = false`
2. No store subscription happens
3. Returns `null` (safe - no hydration issues)

**Client hydration**:
1. Component hydrates with same initial state
2. HTML matches: both server and client return `null`
3. `useEffect` runs, reads `localStorage` 
4. Sets `mounted = true` and `isAuthenticated` based on localStorage

**After hydration**:
1. Second `useEffect` runs (because `mounted` and `isAuthenticated` changed)
2. Auth check happens safely on client-side
3. Redirect executes if needed
4. **No hydration mismatch at any point**

---

## Key Improvements

✅ **Eliminates Zustand hydration issues**: No store subscription in layout  
✅ **Prevents infinite loops**: localStorage is client-only  
✅ **Maintains functionality**: All redirects work as intended  
✅ **Improves stability**: No console errors or warnings  
✅ **Better performance**: No store subscription overhead  
✅ **Simpler code**: Direct localStorage access is more explicit

---

## localStorage Format

The auth store persists to `localStorage` under the key `"auth-storage"`:

```json
{
  "state": {
    "user": { "id": "...", "email": "...", ... },
    "token": "eyJ0eXAi...",
    "profile": { "id": "...", ... },
    "isPasswordUpdated": true
  },
  "version": 0
}
```

The layout checks for `parsed.state?.token && parsed.state?.user` to ensure both fields exist.

---

## Error Handling

The fix includes try-catch to handle:
- Missing `localStorage` (some environments)
- Invalid JSON in stored data
- Corruption of localStorage
- Gracefully defaults to "not authenticated" if any error occurs

---

## Testing the Fix

The fix has been verified to:
- ✅ No console errors about getServerSnapshot
- ✅ No infinite loops
- ✅ Hydration completes successfully
- ✅ Dashboard redirects work (if authenticated)
- ✅ Login redirects work (if not authenticated)
- ✅ Logout clears localStorage and redirects to login
- ✅ Page refresh maintains authentication state

---

## Best Practices Applied

1. **Avoid Zustand in Layout Components**: Layouts that need auth should not subscribe to stores with persist middleware
2. **Client-Only Checks**: Auth checks should happen only after hydration
3. **localStorage Access**: Safe to read directly after hydration
4. **Consistent Server/Client Render**: Always render the same thing on server and client initially
5. **Error Boundaries**: Try-catch to handle edge cases

---

## Why Not Fix Zustand Configuration?

You might wonder why we don't fix the Zustand store configuration. Here's why this approach is better:

1. **Layout-level protection is specific**: Not all components need this
2. **localStorage is simpler**: More explicit about what we're checking
3. **No performance overhead**: No store subscription in layout
4. **Future-proof**: Doesn't depend on Zustand implementation details
5. **Works with any state manager**: This pattern works if you switch stores later

---

## Alternative Approaches Considered

### Approach 1: Use `useSyncExternalStore` (Rejected)
- Still causes hydration issues with Zustand persist
- More complex code
- Same problem, different wrapper

### Approach 2: Add `suppressHydrationWarning` (Rejected)
- Hides the error, doesn't fix it
- Not a recommended solution
- Can mask real issues

### Approach 3: Move Auth Check to Higher Level (Rejected)
- Would require changing entire app structure
- Current approach is more localized
- Works fine for layout-level protection

### Approach 4: Direct localStorage Read (✅ Chosen)
- Solves the root cause
- Simple and explicit
- No Zustand involvement
- Clean and maintainable

---

## References

- [Next.js Hydration Documentation](https://nextjs.org/docs/messages/react-hydration-error)
- [Zustand Persist Middleware](https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md)
- [localStorage Web API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## Status

✅ **Fixed**: Both components updated  
✅ **Verified**: No TypeScript errors  
✅ **Tested**: All functionality working  
✅ **Documentation**: Complete

---

**Resolution Date**: August 12, 2026  
**Components Fixed**: 2 (AuthCheckLayout, ProtectedLayout)  
**Root Cause**: Zustand persist hydration issues  
**Solution**: Direct localStorage access  
**Status**: RESOLVED - Ready for production
