# Epic 9: Save/Load System

## Status: Not Started

## Epic Goal

Implement persistent storage so players can save runs and settings, enabling interrupted runs to be resumed and meta-progression tracking.

## Epic Description

### Existing System Context

- **Current functionality**: No persistence, runs lost on page refresh
- **Technology stack**: Browser LocalStorage API
- **Integration points**: Must serialize/deserialize RunState, integrate with game flow

### Enhancement Details

- **What's being built**: Auto-save on node completion, manual load on resume, settings persistence
- **Architecture approach**: SaveManager abstraction for future cloud migration
- **Success criteria**: Runs persist across browser sessions, settings remembered

## Stories

### Story 9.1: LocalStorage Save System
Implement run persistence using browser LocalStorage.

**Acceptance Criteria:**
1. Run state auto-saves after each node completion
2. Save includes: RunState, map, deck, HP, gold, relics, potions
3. Load game option on main menu if save exists
4. "Continue Run" resumes at last saved point
5. Save cleared on run completion
6. Save versioning for migrations

### Story 9.2: Settings Persistence
Implement settings storage separate from run saves.

**Acceptance Criteria:**
1. Settings saved separately from run saves
2. Settings include: volume, animation speed, accessibility
3. Settings load on game start
4. Settings screen allows modification
5. Settings persist across sessions

### Story 9.3: Meta Progression Tracking
Track overall player statistics across runs.

**Acceptance Criteria:**
1. Track: total runs, wins, losses, time played
2. Track per-class statistics
3. Statistics displayed on main menu
4. Stats persist in LocalStorage
5. Stats not cleared on run completion

## Technical Notes

### Save Data Structure

```typescript
interface SaveData {
  version: number;
  savedAt: string;      // ISO timestamp
  runState: RunState;
}

interface SettingsData {
  version: number;
  musicVolume: number;          // 0-100
  sfxVolume: number;            // 0-100
  animationSpeed: 'fast' | 'normal' | 'slow';
  highContrastMode: boolean;
  autoEndTurn: boolean;
}

interface MetaStats {
  version: number;
  totalRuns: number;
  totalWins: number;
  totalLosses: number;
  totalPlayTimeMs: number;
  classStats: Record<string, ClassStats>;
  firstPlayedAt: string;
  lastPlayedAt: string;
}

interface ClassStats {
  runs: number;
  wins: number;
  fastestWinMs: number | null;
  highestFloor: number;
}
```

### Storage Keys

```typescript
const STORAGE_KEYS = {
  RUN_SAVE: 'sanctum_run_save',
  SETTINGS: 'sanctum_settings',
  META_STATS: 'sanctum_meta_stats'
};
```

### SaveManager Implementation

```typescript
class SaveManager {
  private static CURRENT_VERSION = 1;

  static saveRun(runState: RunState): void {
    const saveData: SaveData = {
      version: this.CURRENT_VERSION,
      savedAt: new Date().toISOString(),
      runState
    };
    localStorage.setItem(STORAGE_KEYS.RUN_SAVE, JSON.stringify(saveData));
  }

  static loadRun(): RunState | null {
    const raw = localStorage.getItem(STORAGE_KEYS.RUN_SAVE);
    if (!raw) return null;

    try {
      const saveData: SaveData = JSON.parse(raw);
      // Migration if needed
      if (saveData.version < this.CURRENT_VERSION) {
        return this.migrate(saveData);
      }
      return saveData.runState;
    } catch {
      console.error('Failed to load save');
      return null;
    }
  }

  static hasSave(): boolean {
    return localStorage.getItem(STORAGE_KEYS.RUN_SAVE) !== null;
  }

  static clearSave(): void {
    localStorage.removeItem(STORAGE_KEYS.RUN_SAVE);
  }

  private static migrate(saveData: SaveData): RunState {
    // Handle version migrations
    // For now, just return as-is
    return saveData.runState;
  }
}
```

### Settings Manager

```typescript
class SettingsManager {
  private static defaults: SettingsData = {
    version: 1,
    musicVolume: 80,
    sfxVolume: 80,
    animationSpeed: 'normal',
    highContrastMode: false,
    autoEndTurn: false
  };

  static load(): SettingsData {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return this.defaults;

    try {
      return { ...this.defaults, ...JSON.parse(raw) };
    } catch {
      return this.defaults;
    }
  }

  static save(settings: SettingsData): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static update(partial: Partial<SettingsData>): SettingsData {
    const current = this.load();
    const updated = { ...current, ...partial };
    this.save(updated);
    return updated;
  }
}
```

### Meta Stats Manager

```typescript
class MetaManager {
  static recordRunStart(classId: string): void {
    const stats = this.load();
    stats.totalRuns++;
    stats.lastPlayedAt = new Date().toISOString();

    if (!stats.classStats[classId]) {
      stats.classStats[classId] = {
        runs: 0,
        wins: 0,
        fastestWinMs: null,
        highestFloor: 0
      };
    }
    stats.classStats[classId].runs++;

    this.save(stats);
  }

  static recordRunEnd(classId: string, won: boolean, durationMs: number, floor: number): void {
    const stats = this.load();
    const classStats = stats.classStats[classId];

    if (won) {
      stats.totalWins++;
      classStats.wins++;
      if (!classStats.fastestWinMs || durationMs < classStats.fastestWinMs) {
        classStats.fastestWinMs = durationMs;
      }
    } else {
      stats.totalLosses++;
    }

    if (floor > classStats.highestFloor) {
      classStats.highestFloor = floor;
    }

    stats.totalPlayTimeMs += durationMs;
    this.save(stats);
  }

  private static load(): MetaStats {
    const raw = localStorage.getItem(STORAGE_KEYS.META_STATS);
    if (!raw) {
      return {
        version: 1,
        totalRuns: 0,
        totalWins: 0,
        totalLosses: 0,
        totalPlayTimeMs: 0,
        classStats: {},
        firstPlayedAt: new Date().toISOString(),
        lastPlayedAt: new Date().toISOString()
      };
    }
    return JSON.parse(raw);
  }

  private static save(stats: MetaStats): void {
    localStorage.setItem(STORAGE_KEYS.META_STATS, JSON.stringify(stats));
  }
}
```

### Auto-Save Integration

```typescript
// In RunManager or GameController
function onNodeCompleted(result: EncounterResult): void {
  // Update run state
  this.runState = applyResult(this.runState, result);

  // Mark node as visited
  this.runState.visitedNodes.push(this.runState.currentNodeId);

  // Auto-save
  SaveManager.saveRun(this.runState);

  // Return to map
  this.showMap();
}
```

### File Structure

```
src/
  save/
    SaveManager.ts     - Run save/load
    SettingsManager.ts - Settings persistence
    MetaManager.ts     - Statistics tracking
    types.ts           - Save data interfaces
  ui/
    SettingsScreen.ts  - Settings UI
    StatsScreen.ts     - Statistics display
```

## Definition of Done

- [ ] All 3 stories completed with acceptance criteria met
- [ ] Runs persist and resume correctly
- [ ] Settings persist across sessions
- [ ] Statistics tracked accurately
- [ ] Save versioning in place for future migrations
- [ ] No data corruption on save/load

## Dependencies

- Epic 2 (Map & Progression) - For RunState to save
- Epic 10 (UI Polish) - For settings/stats screens

---

*Epic created by John (PM) | BMAD Framework*
