# Architecture Review (Hackathon Template)

## Summary

Current structure is generally good for a hackathon-to-production path:

- Clear layers: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- RTK Query is centralized via shared API.
- State slices are separated by responsibility.

## What was improved

- Removed fake auth stubs and switched to real request configuration.
- Added centralized `401` handling and auto-redirect to `/login`.
- Added main page API request example (`GET /main`).
- Fixed Stack UI-kit issue (`VStack` export bug).
- Added a `shared/ui` barrel export file for cleaner imports.
- Added centralized token helper (`src/entities/User/lib/authToken.ts`) to remove localStorage duplication.
- Added centralized API logging utility (`src/shared/lib/logger/apiLogger.ts`).

## Remaining recommendations

1. Add at least one protected route with `authOnly: true` in route config when private screens appear.
2. Add `refresh token` flow if backend supports it.
3. Add request/error toasts in a shared notification layer.
4. Add unit tests for `userSlice` and integration tests for auth redirect.
5. Keep deployment-specific backend hosts documented in CI/CD runbook if constants are changed per environment.
6. Add route-level code ownership notes for faster hackathon onboarding.

## Naming note

- `entities` naming is valid and common in Feature-Sliced Design.
- `shared` can be renamed to `core`, but only if team agrees on semantics and imports are updated globally.
