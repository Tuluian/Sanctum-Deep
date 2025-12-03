# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sanctum Ruins is a browser-based roguelike deck-builder game written in TypeScript. It targets Slay the Spire fans with 15-30 minute gameplay sessions. The game features 5 character classes (2 free, 3 premium DLC).

## Commands

```bash
npm run dev       # Start dev server (port 3000, auto-opens browser)
npm run build     # Type check + production build
npm run test      # Run tests in watch mode
npm run test:run  # Run tests once
npm run lint      # ESLint on src/**/*.ts
```

## Architecture

**Core Game Loop**: Event-driven state machine in `src/engine/CombatEngine.ts`
- Combat phases: PLAYER_TURN → ENEMY_TURN → cycle until victory/defeat
- Observer pattern for UI updates via event subscriptions

**Directory Structure**:
- `src/main.ts` - Entry point, Game class, DOM event setup
- `src/types/index.ts` - All TypeScript interfaces (CardDefinition, CombatState, Enemy, etc.)
- `src/engine/CombatEngine.ts` - Turn-based combat system with card/enemy/status processing
- `src/data/cards/` - Card definitions by class (damage, block, heal, status effects)
- `src/data/enemies/` - Enemy definitions with intent-based AI
- `src/data/classes.ts` - Character class configs and starter decks
- `src/ui/renderer.ts` - DOM manipulation for game UI

**Type System**: Strict TypeScript with comprehensive interfaces. All game entities (cards, enemies, status effects, combat state) have explicit types in `src/types/index.ts`.

**UI Layer**: Vanilla DOM manipulation with inline handlers exposed on window (window.selectEnemy, window.playCard).

## BMAD Framework

This project uses the BMAD Method for AI-assisted development. Agent commands are in `.claude/commands/BMad/`:
- `/bmad:analyst` - Research and requirements
- `/bmad:architect` - Technical design
- `/bmad:dev` - Implementation
- `/bmad:pm` - Project management

See `BMAD_method.txt` for methodology details.

## Key Documentation

- `docs/brief.md` - Product requirements and MVP scope
- `docs/architecture.md` - Planned fullstack architecture (monorepo with npm workspaces)
- `docs/epic-1-combat-prototype.md` - Current epic requirements
