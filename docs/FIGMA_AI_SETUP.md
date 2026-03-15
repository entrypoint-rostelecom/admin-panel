# Figma AI Setup For This Template

This file describes how to configure Figma AI-driven code generation so output matches this project architecture.

## Goal

Generate UI code that can be inserted into this repository with minimal refactoring.

## Required output format from Figma AI

Ask Figma AI to return output in this strict format:

1. File list with exact paths.
2. Full file content for each file.
3. No placeholders like `TODO` or `...`.
4. A short integration note describing where generated component is mounted.

If generated output does not include exact paths, reject and regenerate.

## Project constraints for generated code

Use these rules in every Figma AI prompt:

1. Tech stack: React + TypeScript + Vite.
2. Styling: CSS Modules for page-level styles, `styled-components` for shared UI primitives.
3. Imports: always use alias `@/` for `src`.
4. Architecture:
   - Shared reusable components -> `src/shared/ui/*`
   - Domain logic and entities -> `src/entities/*`
   - Feature logic -> `src/features/*`
   - Pages/screens -> `src/pages/*`
   - App-level providers/router/theme -> `src/app/*`
5. Do not generate inline styles unless explicitly asked.
6. Use existing components before creating new ones: `Page`, `Loader`, `HStack`, `VStack`, `AppImage`.
7. State and requests:
   - Use RTK Query for API calls.
   - Use Redux slice only for app state, not for request caching.

## Recommended prompt template for Figma AI

Use this as a base prompt:

```text
Generate React + TypeScript code for this Figma frame.
Project architecture is Feature-Sliced:
- shared UI in src/shared/ui
- features in src/features
- pages in src/pages
Use CSS Modules for page styles.
Use import alias @/...
If data is needed, create RTK Query endpoint with injectEndpoints and a typed hook.
Keep components small and reusable.
Do not use Tailwind, MUI, Chakra, or styled-system.
Return files with exact target paths.
```

## Mapping from Figma blocks to folders

- Global layout and app shell -> `src/app/*` and `src/widgets/*`
- Reusable atomic/molecular controls -> `src/shared/ui/*`
- Business interaction (auth, filters, switchers) -> `src/features/*`
- Domain-specific data blocks (user card, profile info) -> `src/entities/*`
- Full screens -> `src/pages/*`

## Folder placement rules (strict)

- If component has backend request logic: create API hook in `api/` and DTO types in `model/types`.
- If component has only rendering and local UI state: keep it in `ui/`.
- If component is reused across 2+ features/pages: place in `src/shared/ui/*`.
- If component belongs to a concrete business entity (User/Profile/etc): place in `src/entities/<EntityName>/*`.

## API generation rules for Figma AI

When asking for data-driven screens, include these constraints in prompt:

- Use RTK Query `rtkApi.injectEndpoints`.
- Keep endpoint paths aligned with backend contract docs.
- Never call `fetch` directly inside components.
- Expose typed hooks (`useGetXQuery`, `useCreateXMutation`).
- Keep request/response types in `model/types`.

## Code quality checklist for generated output

- No deep relative imports like `../../../` when alias `@/` can be used.
- No duplicated components if an equivalent exists in `src/shared/ui`.
- Types exist for all request/response payloads.
- No `any` unless absolutely unavoidable.
- Strings intended for UI are ready for i18n extraction.

## Fast integration workflow

1. Generate UI from Figma AI into temp branch.
2. Place files into proper layer (`shared`, `features`, `pages`).
3. Replace temporary mock data with RTK Query hooks.
4. Wire i18n keys for user-visible strings.
5. Run `npm run build` and fix type issues.

## Acceptance checklist before merge

1. All imports use alias `@/`.
2. No business logic inside presentational shared components.
3. API calls are isolated in RTK Query endpoint files.
4. Components compile without `any` casts.
5. Page works on desktop and mobile widths.

## Optional: design token sync

If Figma AI can output tokens, keep naming aligned with theme files:

- `src/app/styles/themes/baseTheme.ts`
- `src/app/styles/themes/light.ts`
- `src/app/styles/themes/dark.ts`

Token naming convention example:

- `color.bg.primary`
- `color.text.primary`
- `space.4`, `space.8`, `space.16`
- `radius.sm`, `radius.md`, `radius.lg`

This makes generated UI consistent with the existing theme provider.
