# Casa Oliveira API Integration

This document describes how the frontend integrates with the Casa Oliveira Serverless API.

## Base URL

```
https://amsu9vb19d.execute-api.us-east-1.amazonaws.com/dev
```

You can override this by setting `VITE_API_BASE_URL` in your `.env` file.

## Authentication Flow

### 1. Login
- **Endpoint**: `POST /auth/login`
- **Body**: `{ email, password }`
- **Success Response**: `{ accessToken, idToken, refreshToken, expiresIn, tokenType }`
- **Challenge Response**: `{ challenge: "NEW_PASSWORD_REQUIRED", session }`

When a user receives `NEW_PASSWORD_REQUIRED` challenge, they are redirected to `/first-login`.

### 2. First Login
- **Endpoint**: `POST /auth/first-login`
- **Body**: `{ email, tempPassword, newPassword }`
- **Response**: `{ accessToken, idToken, refreshToken, expiresIn, tokenType }`

### 3. Forgot Password
- **Step 1 - Request Code**: `POST /auth/forgot-password` with `{ email }`
- **Step 2 - Confirm**: `POST /auth/forgot-password/confirm` with `{ email, confirmationCode, newPassword }`

### 4. Token Refresh
- **Endpoint**: `POST /auth/refresh`
- **Body**: `{ refreshToken }`
- **Response**: `{ accessToken, idToken, refreshToken, expiresIn, tokenType }`

The Axios interceptor automatically handles token refresh on 401 responses.

## Protected Endpoints

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <accessToken>
```

### User Management
- `GET /me` - Get current user profile
- `GET /users` - List all users (Admin/Collaborator only)
- `PUT /users/:id` - Update user

### Products
- `GET /products` - List products (public)
- `GET /products/:id` - Get product details (public)
- `POST /products` - Create product (Admin/Collaborator)
- `PUT /products/:id` - Update product (Admin/Collaborator)
- `DELETE /products/:id` - Delete product (Admin/Collaborator)

### Categories
- `GET /categories` - List categories (public)
- `GET /categories/:id` - Get category (public)
- `POST /categories` - Create category (Admin/Collaborator)
- `PUT /categories/:id` - Update category (Admin/Collaborator)
- `DELETE /categories/:id` - Delete category (Admin/Collaborator)

### Collaborators
- `POST /auth/admin/collaborators` - Create new collaborator (Admin only)
  - Returns: `{ user: {...}, temporaryPassword: "..." }`

### Store
- `GET /store` - Get store information (public)
- `POST /store` - Create store (Admin/Collaborator)
- `PUT /store` - Update store (Admin/Collaborator)
  - Fields: `email`, `phone`, `location`

### Images
- `POST /images` - Upload image (multipart/form-data, Admin/Collaborator)
  - Returns: `{ key: "img-xxx.jpg" }`
- `GET /images/:key` - Get image signed URL
  - Returns: `{ url: "https://..." }`

## API Response Structure

### List Endpoints
```json
{
  "items": [...],
  "count": 10,
  "nextToken": "base64-encoded-token",
  "lastKey": { ... }
}
```

### Error Responses
```json
{
  "message": "error description"
}
```

Common status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Testing

Import the `casa-oliveira.postman_collection.json` file into Postman to test all endpoints.

Set the following variables:
- `baseUrl`: `https://amsu9vb19d.execute-api.us-east-1.amazonaws.com/dev`
- `accessToken`: Your JWT access token (obtained from login)
