# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vue Vben Admin 5.0 - a Vue 3 + Vite + TypeScript monorepo for mid-stage backend admin systems. Uses Turborepo for build orchestration, pnpm workspaces, and Element Plus as the UI framework.

## Common Commands

```bash
# Development
pnpm dev                    # Start web-ele dev server (default port 5777)
pnpm dev:play                # Start playground dev server

# Build
pnpm build                   # Build all packages/apps
pnpm build:ele               # Build only web-ele app
pnpm build:analyze           # Build with bundle analysis

# Testing
pnpm test:unit                # Run unit tests (Vitest + happy-dom)
pnpm test:unit --watch        # Watch mode
pnpm test:e2e                 # Run Playwright E2E tests

# Code Quality
pnpm lint                    # ESLint check
pnpm format                  # Auto-format with Prettier
pnpm check:type              # TypeScript type checking
pnpm check                   # Full check (circular deps, dependencies, types, spelling)

# Git
pnpm commit                  # Interactive commit (czg)
pnpm changeset               # Manage version changes
```

## Architecture

### Monorepo Structure

```
apps/               # Deployable applications
  web-ele/          # Main admin app (Element Plus)
packages/            # Shared libraries (published as workspace:*)
  @core/
    base/           # Design system, icons, shared utilities
    composables/    # Vue composables
    preferences/    # App preferences/settings
    ui-kit/         # Form, layout, menu, popup, shadcn components
  constants/        # Shared constants
  effects/          # Effects libraries
  icons/            # Icon library
  locales/          # i18n translations
  stores/           # Pinia stores
  styles/           # Global styles
  types/            # TypeScript types
  utils/            # Utility functions
internal/            # Build tooling (not published)
  lint-configs/     # ESLint, Prettier, Stylelint configs
  node-utils/       # Build utilities
  tailwind-config/  # Tailwind CSS configuration
  tsconfig/         # TypeScript base configs
  vite-config/      # Vite plugin configurations
```

### Key Conventions

**API Organization**: APIs live in `apps/web-ele/src/api/` organized by domain (e.g., `core/`, `fi/`). Use the `request.ts` wrapper for HTTP calls.

**Views Pattern**: Page components in `views/` with `data.ts` for page state and `modules/` subdirectory for child components.

**Shared Imports**: Apps import from `@vben/*` workspace packages. Internal imports use `#/*` path alias pointing to `apps/web-ele/src/*`.

**Routing**: Route modules in `router/routes/modules/` - each file exports an array of route definitions.

**State Management**: Pinia stores in `store/` - auth store handles token/user state.

**国际化**: Language files in `locales/langs/` by locale (zh-CN/, en-US/). Use `useLocale()` composable with `t()` method.

## Environment Variables

Key variables in `apps/web-ele/.env.development`:
- `VITE_PORT` - Dev server port (default 5777)
- `VITE_GLOB_API_URL` - Backend API address
- `VITE_APP_TITLE` - Application title
- `VITE_DEVTOOLS` - Enable Vue DevTools

## Technical Notes

- Node.js >= 20.12.0 required
- Uses pnpm catalog for centralized dependency versioning
- Build outputs to `apps/web-ele/dist/`
- `pnpm postinstall` runs stub scripts to create missing package entry points