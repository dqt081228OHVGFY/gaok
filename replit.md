# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (not used for gaokao — data is served from JSON files)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Artifacts

### `artifacts/gaokao` — 高考志愿填报平台 (React + Vite, port 19853, path `/`)
A comprehensive Chinese college entrance exam volunteer/application filling website.

**Pages:**
- `/` — Home: hero with score query, stats, feature cards
- `/score-query` — Score query: enter score + province → see 冲刺/稳妥/保底 universities
- `/universities` — University list: 258 schools, searchable/filterable by province/type/tag/sort
- `/universities/:id` — University detail: info + historical admission score table
- `/majors` — Major library: 240 undergraduate majors by category
- `/control-scores` — Provincial control score lines 2020-2024

**Data (served from JSON files in `data/raw/`):**
- `universities_raw.json` — 258 universities (40×985, 112×211, 129×双一流)
- `control_scores_raw.json` — 264 provincial control score lines (2020-2024, 31 provinces)
- `school_scores_raw.json` — 1,862 school-level historical admission scores
- `majors_raw.json` — 240 undergraduate majors

### `artifacts/api-server` — Express API Server (port 8080, path `/api`)
REST API serving gaokao data from JSON files.

**Routes (`src/routes/gaokao.ts`):**
- `GET /api/universities` — list/search universities
- `GET /api/universities/:id` — get university details
- `GET /api/universities/:id/scores` — historical admission scores
- `GET /api/majors` — list/search majors
- `GET /api/control-scores` — provincial control score lines
- `GET /api/score-query` — query universities by score (冲刺/稳妥/保底)
- `GET /api/stats` — platform stats
- `GET /api/provinces` — list all provinces
- `GET /api/university-types` — list university types/tags/major categories

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec (then manually remove `export * from "./generated/types"` from `lib/api-zod/src/index.ts` if conflict appears)
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
