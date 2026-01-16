# Security Fix: Token in URL Vulnerability

## Overview
Fixed critical vulnerability where JWT tokens were passed in URL query parameters, making them visible in browser history and referrer headers.

## What Was Fixed

### ❌ Old (Vulnerable) Flow:
```
1. Google OAuth callback → Backend generates JWT
2. Backend redirects: http://localhost:5173?token=eyJhbGc...
3. Token visible in browser history, referrer headers, network logs
4. Frontend extracts from URL and saves to localStorage
5. Frontend sends token in Authorization header
```

### ✅ New (Secure) Flow:
```
1. Google OAuth callback → Backend generates JWT
2. Backend sets httpOnly cookie with token
3. Backend redirects: http://localhost:5173 (no token in URL)
4. Frontend receives httpOnly cookie (automatic, secure)
5. Browser automatically includes cookie in requests (withCredentials)
```

## Changes Made

### Backend Changes

**1. `backend/server.js`**
- Added `import cookieParser from 'cookie-parser'`
- Added `app.use(cookieParser())` middleware

**2. `backend/routes/auth.js`**
- **`/api/auth/google/callback`** - Changed from URL redirect to httpOnly cookie:
  ```javascript
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.redirect(`${process.env.FRONTEND_URL}`); // No token in URL
  ```

- **`/api/auth/me`** - Updated to read from cookie first:
  ```javascript
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  ```

- **`/api/auth/logout`** - Added new endpoint to clear cookie:
  ```javascript
  router.post('/logout', (req, res) => {
    res.clearCookie('token', {...});
    res.json({ success: true, message: 'Logged out' });
  });
  ```

**3. `backend/middleware/auth.js`**
- Updated to read token from cookies first:
  ```javascript
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
  ```

**4. `backend/package.json`**
- Added `"cookie-parser": "^1.4.6"` dependency

### Frontend Changes

**1. `frontend/src/context/AuthContext.jsx`**
- Removed URL token extraction logic
- Removed localStorage token storage
- Added `axios.defaults.withCredentials = true` to send cookies automatically
- Updated `fetchUser()` to not require token parameter (uses cookie)
- Updated `logout()` to call backend logout endpoint instead of just clearing localStorage

**2. `frontend/src/components/Timer.jsx`**
- Updated file fetch to use `credentials: 'include'` instead of Authorization header:
  ```javascript
  fetch('http://localhost:5000/api/files', {
    credentials: 'include'
  });
  ```

**3. `frontend/src/components/FileManager.jsx`**
- Updated all axios calls to use `withCredentials: true` instead of Authorization headers
- Removed `localStorage.getItem('token')` calls from:
  - `fetchFiles()`
  - `handleFileUpload()`
  - `handleDelete()`

**4. `frontend/src/components/FileViewer.jsx`**
- Updated `fetchFile()` to use `withCredentials: true` instead of Authorization header

## Security Benefits

### ✅ Token No Longer Visible In:
- Browser history
- URL bar
- Referrer headers sent to external sites
- Network tab query parameters
- Server logs

### ✅ Additional Security:
- **httpOnly flag**: Token cannot be accessed via JavaScript (XSS protection)
- **Secure flag**: Token only sent over HTTPS in production
- **SameSite=Strict**: Prevents CSRF attacks
- **Clear logout**: Explicit cookie clearing on backend

## Testing Requirements

```bash
# 1. Install new dependency
cd backend
npm install

# 2. Test login flow
- Click "Continue with Google"
- Verify no ?token= in URL after redirect
- Verify user info loads correctly

# 3. Test logout
- Click logout
- Verify token cleared from cookies
- Verify user can't access authenticated endpoints

# 4. Test file operations
- Upload file
- Download file
- Delete file
- All should work without Authorization header

# 5. Browser DevTools verification
- Open DevTools → Application → Cookies
- Verify 'token' cookie exists with httpOnly flag
- Verify token NOT visible in localStorage
- Verify token NOT in Network requests (sent automatically)
```

## Environment Setup

Add to `.env`:
```
# No changes needed - cookie handling is automatic
# Just ensure NODE_ENV is set for production
NODE_ENV=development  # or 'production'
```

## Remaining Security Issues

This fix addresses token exposure. Other critical issues still remain:

1. JWT expiration not enforced on frontend
2. No CSRF protection (though SameSite=Strict helps)
3. No rate limiting on auth endpoints
4. 7-day token lifetime with no refresh mechanism
5. No server-side token revocation/blacklist

See `AUDIT_REPORT.md` for full security audit.
