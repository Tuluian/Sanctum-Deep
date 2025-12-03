# Tech Stack

## Runtime & Build

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >=18.0.0 | Runtime |
| TypeScript | ^5.3.3 | Language |
| Vite | ^5.4.11 | Dev server & bundler |
| Vitest | ^2.1.6 | Testing |
| ESLint | - | Linting |

## TypeScript Configuration

- **Target**: ES2020
- **Strict mode**: Enabled (all strict checks)
- **Module**: ESNext with bundler resolution
- **Path alias**: `@/*` → `src/*`

Key compiler flags:
- `noUnusedLocals`: true
- `noUnusedParameters`: true
- `noFallthroughCasesInSwitch`: true

## Vite Configuration

- Dev server: port 3000, auto-opens browser
- Build output: `dist/` with sourcemaps
- Path alias: `@` → `src/`

## Browser Targets

Modern browsers with ES6+ support:
- Chrome, Firefox, Safari, Edge (latest versions)
- ES2020 features required

## Dependencies

**Runtime**: Express (for production server)

**Dev only**: TypeScript, Vite, Vitest (no runtime framework dependencies)
