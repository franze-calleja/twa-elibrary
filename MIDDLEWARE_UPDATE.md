# Middleware Update - Cookie-based Authentication

## What Changed

Updated the authentication system from header-based tokens to **httpOnly cookies** for better security and to fix the middleware error.

## Changes Made

### 1. **Middleware (`middleware.ts`)**
- ✅ Now reads token from **cookies** instead of Authorization headers
- ✅ Simplified matcher to only target protected routes
- ✅ Clears invalid cookies automatically
- ✅ Fixed the `undefined.replace()` error

### 2. **Login Route (`app/api/auth/login/route.ts`)**
- ✅ Sets **httpOnly cookie** with the JWT token
- ✅ Cookie config:
  - `httpOnly: true` - Not accessible via JavaScript (XSS protection)
  - `secure: true` in production (HTTPS only)
  - `sameSite: 'lax'` - CSRF protection
  - `maxAge: 7 days` - Auto expiration
- ✅ Still returns token in response for API/mobile clients

### 3. **Logout Route (`app/api/auth/logout/route.ts`)**
- ✅ Deletes the token cookie on logout

### 4. **Auth Utilities (`lib/auth.ts`)**
- ✅ `extractToken()` now checks cookies first, then falls back to headers
- ✅ Supports both web (cookie) and API (header) authentication

### 5. **Axios Instance (`lib/api.ts`)**
- ✅ Enabled `withCredentials: true` to send cookies automatically
- ✅ Still supports Authorization header for backward compatibility

## Why This Is Better

### Security Improvements
✅ **XSS Protection** - httpOnly cookies can't be accessed by JavaScript  
✅ **CSRF Protection** - sameSite policy prevents cross-site attacks  
✅ **Automatic Management** - Browser handles cookie storage/sending  
✅ **Secure in Production** - HTTPS-only cookies in production  

### Developer Experience
✅ **No localStorage** - Cookies sent automatically with every request  
✅ **Cleaner Code** - No manual token management in components  
✅ **SSR Compatible** - Works with server-side rendering  
✅ **Fixed Error** - Resolved the middleware undefined error  

## How It Works Now

### Login Flow
```
1. User logs in → POST /api/auth/login
2. Server validates credentials
3. Server generates JWT token
4. Server sets httpOnly cookie with token
5. Server returns user data + token (for storage/mobile)
6. Browser automatically stores cookie
7. All future requests include cookie automatically
```

### Protected Routes
```
1. User visits /staff/dashboard
2. Middleware checks for token cookie
3. If valid → Allow access
4. If invalid/missing → Redirect to /login
5. If wrong role → Redirect to correct dashboard
```

## Testing

The authentication still works the same way from the frontend perspective:

```typescript
'use client'

import { useLogin } from '@/hooks/useAuth'

export default function LoginPage() {
  const login = useLogin()
  
  const handleLogin = () => {
    login.mutate({
      email: 'staff@example.com',
      password: 'password123'
    })
    // Cookie is automatically set by server
    // No need to manually store token
  }
  
  return <button onClick={handleLogin}>Login</button>
}
```

## Backward Compatibility

The system still supports Authorization headers for:
- Mobile apps
- API clients
- Third-party integrations

Simply send: `Authorization: Bearer <token>` and it will work!

## Error Fixed

**Before:**
```
⨯ Error [TypeError]: Cannot read properties of undefined (reading 'replace')
```

**After:**
✅ No errors! Middleware works correctly with cookies.

---

**The authentication system is now more secure and follows Next.js best practices!** 🎉
