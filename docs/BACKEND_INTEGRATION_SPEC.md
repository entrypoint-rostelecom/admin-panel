# Backend Integration Spec (Frontend Contract)

This document is the single source of truth for backend developers integrating with this frontend template.

## 1. Host setup

Frontend uses compile-time constants from `vite.config.ts`:

- `__API__` -> backend host URL
- `__API_LOGGING__` -> API logging on/off

After changing constants, restart frontend dev server.

## 2. Authorization protocol

- Frontend stores access token in localStorage key: `user_local_storage`.
- Frontend sends header:
  - `Authorization: Bearer <accessToken>`
- If any API call returns `401`:
  - token is removed,
  - user state is cleared,
  - frontend redirects to `/login` automatically.

## 3. Required endpoints

### `POST /user/signIn`

Request body:

```json
{
  "email": "admin@example.com",
  "password": "secret"
}
```

Success `200` response:

```json
{
  "id": "1",
  "username": "admin",
  "roles": ["ADMIN"],
  "accessToken": "jwt-token"
}
```

Error `401` response example:

```json
{
  "message": "Invalid credentials"
}
```

### `POST /user/register`

Request body:

```json
{
  "email": "new@example.com",
  "password": "secret"
}
```

Success `200` response shape is same as sign in.

### `GET /user`

Uses `Authorization` token header.

Success `200` response:

```json
{
  "id": "1",
  "username": "admin",
  "roles": ["ADMIN"]
}
```

Error `401` response when token invalid.

### `POST /user/signOut`

Optional endpoint for server-side token invalidation.

Success `200` response can be:

```json
{
  "ok": true
}
```

### `GET /main`

Success `200` response:

```json
{
  "message": "Welcome from backend",
  "timestamp": "2026-03-15T12:00:00.000Z"
}
```

## 4. CORS requirements

Allow frontend origin for local development (example):

- `http://localhost:5173`

Allow headers:

- `Content-Type`
- `Authorization`

Allow methods:

- `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

## 5. Logging behavior in frontend

Request/response logs are printed in browser console for both:

- RTK Query calls
- Axios calls

Sensitive fields are masked in logs (`password`, `token`, `accessToken`, `authorization`).

## 6. Quick backend readiness checklist

1. Implement all endpoints with exact paths above.
2. Return JSON payloads matching response shapes.
3. Enable CORS and `Authorization` header.
4. Return `401` for invalid token.
5. Verify `/main` response shape.
