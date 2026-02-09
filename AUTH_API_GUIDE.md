# TWA E-Library - Authentication API Documentation

## 🚀 Quick Start

The authentication backend routes are now set up and ready to use! This guide explains how to use the login and registration API endpoints.

---

## 📋 Prerequisites

1. **Database**: Make sure your database is set up and migrations are run
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

2. **Environment Variables**: Update your `.env` file with:
   ```
   DATABASE_URL="your-database-url"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Dependencies**: All required packages are installed
   - axios
   - zustand
   - @tanstack/react-query
   - jsonwebtoken
   - zod
   - bcryptjs

---

## 🔐 API Endpoints

### 1. **Login** - `POST /api/auth/login`

Authenticates staff or student users.

**Request:**
```json
{
  "email": "staff@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "staff@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF",
      "status": "ACTIVE",
      // ... other user fields (password excluded)
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

**Error Responses:**
- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Account is inactive or suspended
- **400 Bad Request**: Validation errors
- **500 Internal Server Error**: Server error

---

### 2. **Register** - `POST /api/auth/register`

Allows students to complete registration after being pre-registered by staff.

**Request:**
```json
{
  "email": "student@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "studentId": "2024-00001",
  "activationCode": "ACTIVATION123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration completed successfully. You can now login with your credentials.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "STUDENT",
      "status": "ACTIVE",
      "studentId": "2024-00001"
      // ... other user fields
    }
  }
}
```

**Error Responses:**
- **404 Not Found**: Student not pre-registered
- **400 Bad Request**: Invalid activation code or validation errors
- **409 Conflict**: Account already activated
- **500 Internal Server Error**: Server error

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

### 3. **Get Current User** - `GET /api/auth/me`

Returns the authenticated user's profile.

**Headers Required:**
```
Authorization: Bearer <your-jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "STAFF",
      "status": "ACTIVE"
      // ... other user fields (password excluded)
    }
  }
}
```

**Error Responses:**
- **401 Unauthorized**: No token or invalid token
- **404 Not Found**: User not found
- **500 Internal Server Error**: Server error

---

### 4. **Logout** - `POST /api/auth/logout`

Invalidates the user's session (handled client-side with JWT).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 🧪 Testing the API

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@example.com",
    "password": "password123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using the React Hooks (in components)

```tsx
'use client'

import { useLogin, useRegister, useLogout, useAuth } from '@/hooks/useAuth'

function LoginComponent() {
  const login = useLogin()
  const { user, isAuthenticated, isStaff, isStudent } = useAuth()
  
  const handleLogin = () => {
    login.mutate({
      email: 'staff@example.com',
      password: 'password123'
    }, {
      onSuccess: (data) => {
        console.log('Login successful:', data)
      },
      onError: (error: any) => {
        console.error('Login failed:', error.response?.data)
      }
    })
  }
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.firstName}!</p>
      ) : (
        <button onClick={handleLogin} disabled={login.isPending}>
          {login.isPending ? 'Logging in...' : 'Login'}
        </button>
      )}
    </div>
  )
}
```

---

## 🏗️ Architecture

### File Structure

```
app/
  api/
    auth/
      login/route.ts       # Login endpoint
      register/route.ts    # Registration endpoint
      me/route.ts          # Get current user
      logout/route.ts      # Logout endpoint

lib/
  auth.ts                  # JWT utilities, password hashing
  validation.ts            # Zod schemas
  constants.ts             # Error codes, settings
  api.ts                   # Axios instance
  utils.ts                 # Helper functions

hooks/
  useAuth.ts               # Authentication hooks

store/
  authStore.ts             # Zustand auth state

components/
  providers/
    QueryProvider.tsx      # TanStack Query provider

middleware.ts              # Next.js route protection
```

### Authentication Flow

1. **User submits login credentials** → Frontend
2. **Validate with Zod schema** → lib/validation.ts
3. **Send POST request** → /api/auth/login
4. **Query database** → Prisma
5. **Verify password** → bcrypt
6. **Generate JWT token** → jsonwebtoken
7. **Return user + token** → Response
8. **Store in Zustand + localStorage** → Frontend
9. **Set axios Authorization header** → Interceptor
10. **Redirect based on role** → Staff/Student dashboard

---

## 🔑 Error Codes

All API responses include standardized error codes:

- `AUTH_REQUIRED` - No token provided
- `INVALID_CREDENTIALS` - Wrong email/password
- `FORBIDDEN` - Insufficient permissions
- `ACCOUNT_INACTIVE` - Account not activated
- `ACCOUNT_SUSPENDED` - Account suspended
- `VALIDATION_ERROR` - Input validation failed
- `USER_NOT_FOUND` - User doesn't exist
- `DUPLICATE_EMAIL` - Email already registered
- `STUDENT_NOT_PRE_REGISTERED` - No pre-registration found
- `INVALID_ACTIVATION_CODE` - Wrong activation code
- `EMAIL_ALREADY_REGISTERED` - Account already activated
- `INTERNAL_ERROR` - Server error

---

## 🛡️ Security Features

✅ **Password Hashing**: Uses bcrypt with salt rounds of 10  
✅ **JWT Tokens**: Expire after 7 days (configurable)  
✅ **Token Verification**: Every protected route validates token  
✅ **Role-Based Access**: Middleware enforces role permissions  
✅ **Input Validation**: Zod schemas validate all inputs  
✅ **SQL Injection Protection**: Prisma prevents SQL injection  
✅ **Password Requirements**: Enforced during registration  
✅ **Account Status Check**: Inactive/suspended accounts blocked  

---

## 📊 Database Seeding

The database should be seeded with initial data:

```bash
npm run prisma:seed
```

This creates:
- Sample staff accounts
- Sample student accounts (pre-registered)
- Sample books
- Sample categories

**Default Staff Login:**
- Email: `staff@example.com`
- Password: `password123`

**Default Student (if seeded):**
- Email: `student@example.com`
- Must complete registration first

---

## 🚦 Next Steps

Now that the backend authentication is complete, you can:

1. ✅ **Test the API endpoints** using cURL or Postman
2. ✅ **Create login/register UI components** using the hooks
3. ✅ **Implement book management API routes**
4. ✅ **Create student pre-registration flow**
5. ✅ **Build borrowing/return endpoints**
6. ✅ **Add dashboard statistics**

---

## 🐛 Troubleshooting

### "JWT_SECRET is not defined"
Make sure `.env` file has `JWT_SECRET` defined.

### "Database connection error"
Check `DATABASE_URL` in `.env` and ensure database is running.

### "Invalid token"
Token may have expired (7 days). Login again to get a new token.

### "User not found"
Ensure database is seeded with test users.

### CORS errors
If testing from different origin, configure CORS in Next.js config.

---

## 📝 Usage with Axios

The axios instance (`lib/api.ts`) automatically:
- Adds `Authorization: Bearer <token>` header to all requests
- Redirects to login on 401 errors
- Has a 30-second timeout
- Logs errors to console

```typescript
import axios from '@/lib/api'

// Token is automatically included
const response = await axios.get('/books')
```

---

## ✅ Checklist

- [x] Install dependencies (axios, zustand, tanstack-query, etc.)
- [x] Create authentication utilities (JWT, bcrypt)
- [x] Create validation schemas (Zod)
- [x] Create login API route
- [x] Create register API route
- [x] Create /auth/me API route
- [x] Create logout API route
- [x] Create Next.js middleware for route protection
- [x] Create Zustand auth store
- [x] Create useAuth hooks
- [x] Create axios instance with interceptors
- [x] Create utility functions
- [x] Update root layout with QueryProvider
- [ ] Seed database with test data
- [ ] Test login endpoint
- [ ] Test register endpoint
- [ ] Create login UI
- [ ] Create register UI

---

**Authentication backend is now complete and ready for UI integration!** 🎉
