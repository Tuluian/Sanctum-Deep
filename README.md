# Sanctum Ruins

A browser-based roguelike deck-builder with 15-30 minute play sessions. Inspired by Slay the Spire.

## Quick Start

```bash
npm install
npm run dev    # then go to http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests (watch mode) |
| `npm run test:run` | Run tests once |
| `npm run lint` | Lint TypeScript files |

## Game Overview

- **5 character classes**: 2 free (Cleric, Dungeon Knight), 3 premium DLC
- **3-act dungeon**: 45 total encounters with branching paths
- **Turn-based card combat**: Energy system, block, damage, status effects
- **Node types**: Combat, Elite, Campfire, Merchant, Shrine, Boss

## Tech Stack

- TypeScript (strict mode)
- Vite (build + dev server)
- Vitest (testing)
- Vanilla DOM (no UI framework)

## Project Structure

```
src/
├── main.ts           # Entry point, Game class
├── types/            # TypeScript interfaces
├── engine/           # Combat system
├── data/             # Cards, enemies, classes
├── ui/               # DOM renderer
└── styles/           # CSS
docs/                 # Design documents
```

## Documentation

- [Project Brief](docs/brief.md) - Full product requirements
- [Architecture](docs/architecture.md) - Technical design
- [CLAUDE.md](CLAUDE.md) - AI assistant guidance
