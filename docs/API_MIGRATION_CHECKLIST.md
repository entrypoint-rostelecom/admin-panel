# API Migration Checklist

## What was changed

- Replaced stub logic in `src/entities/User/api/userApi.ts` with real HTTP requests.
- Added global 401 handling in `src/shared/api/rtkApi.ts`.
- Added main page request endpoint in `src/pages/MainPage/api/mainPageApi.ts`.
- Fixed auth redirect path in `src/app/providers/router/ui/RequireAuth.tsx`.
- Added centralized request/response logging for RTK Query and Axios.

## Backend contract expected by frontend

Base URL is configured by `__API__` in `vite.config.ts`.

Required endpoints:

- `GET /user`
  - Returns current user by token.
  - `200` example:
    ```json
    {
      "id": "1",
      "username": "admin",
      "roles": ["ADMIN"]
    }
    ```
  - `401` when token is invalid/expired.

- `POST /user/signIn`
  - Request:
    ```json
    {
      "email": "admin@example.com",
      "password": "secret"
    }
    ```
  - `200` example:
    ```json
    {
      "id": "1",
      "username": "admin",
      "roles": ["ADMIN"],
      "accessToken": "jwt-token"
    }
    ```

- `POST /user/register`
  - Request is same as sign in.
  - Response is same shape as sign in.

- `POST /user/signOut`
  - Optional body.
  - `200` success response.

- `GET /main`
  - `200` example:
    ```json
    {
      "message": "Welcome from backend",
      "timestamp": "2026-03-15T12:00:00.000Z"
    }
    ```

## Auth flow

- Login/Register stores `accessToken` in localStorage key `user_local_storage`.
- Every request sends `Authorization: Bearer <token>`.
- If backend returns `401`:
  - token is removed from localStorage,
  - user state is cleared in Redux,
  - app redirects to `/login` automatically.

## API logging

- Every request and response is logged to browser console.
- Logging includes method, URL, request payload, response payload, status, and duration.
- Sensitive fields are masked in logs (`password`, `token`, `accessToken`, `authorization`).

## Switch backend host

1. Open `vite.config.ts`.
2. Change constants in `define` block:
  - `__API__` -> your backend host, for example `https://your-backend-host.com`
  - `__API_LOGGING__` -> `true` or `false`
3. Restart dev server.

## Manual verification

1. Start backend on URL from `__API__`.
2. Start frontend.
3. Sign in and check that requests contain `Authorization` header.
4. Invalidate token on backend (or force `401` on `/user`).
5. Confirm frontend redirects to `/login`.
6. Open main page and confirm `/main` request is fired.

## Notes

- If backend expects raw token (without `Bearer`), adjust header formatting in `src/shared/api/rtkApi.ts`.
- If endpoint paths differ, update only `query` URLs in API files.
