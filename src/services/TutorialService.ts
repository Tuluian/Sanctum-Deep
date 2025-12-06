/**
 * TutorialService - Manages tutorial state and progression
 */

const STORAGE_KEY = 'sanctum_tutorial';

export interface TutorialState {
  hasCompletedTutorial: boolean;
  hasSeenEntrance: boolean;
  hasSeenWardenGreeting: boolean;
  // Post-tutorial message tracking
  hasSeenFirstElite: boolean;
  hasSeenFirstBoss: boolean;
  hasSeenFirstShrine: boolean;
  hasSeenFirstMerchant: boolean;
}

const DEFAULT_STATE: TutorialState = {
  hasCompletedTutorial: false,
  hasSeenEntrance: false,
  hasSeenWardenGreeting: false,
  hasSeenFirstElite: false,
  hasSeenFirstBoss: false,
  hasSeenFirstShrine: false,
  hasSeenFirstMerchant: false,
};

class TutorialServiceClass {
  private state: TutorialState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): TutorialState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_STATE, ...JSON.parse(saved) };
      }

      // No tutorial state saved - check if this is truly a new player
      // by looking for any existing game data
      const hasExistingData = this.checkForExistingGameData();
      if (hasExistingData) {
        // Existing player without tutorial state - mark tutorial as complete
        const state: TutorialState = {
          ...DEFAULT_STATE,
          hasCompletedTutorial: true,
          hasSeenEntrance: true,
          hasSeenWardenGreeting: true,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        return state;
      }
    } catch (e) {
      console.error('Failed to load tutorial state:', e);
    }
    return { ...DEFAULT_STATE };
  }

  /**
   * Check if player has any existing game data (saves, upgrades, etc.)
   */
  private checkForExistingGameData(): boolean {
    try {
      // Check for any existing Sanctum save data
      const hasRun = localStorage.getItem('sanctum_active_run') !== null;
      const hasUpgrades = localStorage.getItem('sanctum_upgrades') !== null;
      const hasSoulEchoes = localStorage.getItem('sanctum_soul_echoes') !== null;
      const hasSettings = localStorage.getItem('sanctum_settings') !== null;
      const hasAchievements = localStorage.getItem('sanctum_achievements') !== null;

      return hasRun || hasUpgrades || hasSoulEchoes || hasSettings || hasAchievements;
    } catch {
      return false;
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save tutorial state:', e);
    }
  }

  // Check if this is a new player
  isNewPlayer(): boolean {
    return !this.state.hasCompletedTutorial;
  }

  // Check if entrance has been seen
  hasSeenEntrance(): boolean {
    return this.state.hasSeenEntrance;
  }

  // Mark entrance as seen
  markEntranceSeen(): void {
    this.state.hasSeenEntrance = true;
    this.saveState();
  }

  // Check if Warden greeting has been shown
  hasSeenWardenGreeting(): boolean {
    return this.state.hasSeenWardenGreeting;
  }

  // Mark Warden greeting as shown
  markWardenGreetingSeen(): void {
    this.state.hasSeenWardenGreeting = true;
    this.saveState();
  }

  // Mark tutorial as complete
  completeTutorial(): void {
    this.state.hasCompletedTutorial = true;
    this.saveState();
  }

  // Skip tutorial (returning player)
  skipTutorial(): void {
    this.state.hasCompletedTutorial = true;
    this.state.hasSeenEntrance = true;
    this.state.hasSeenWardenGreeting = true;
    this.saveState();
  }

  // Post-tutorial message checks
  shouldShowFirstEliteMessage(): boolean {
    return this.state.hasCompletedTutorial && !this.state.hasSeenFirstElite;
  }

  markFirstEliteSeen(): void {
    this.state.hasSeenFirstElite = true;
    this.saveState();
  }

  shouldShowFirstBossMessage(): boolean {
    return this.state.hasCompletedTutorial && !this.state.hasSeenFirstBoss;
  }

  markFirstBossSeen(): void {
    this.state.hasSeenFirstBoss = true;
    this.saveState();
  }

  shouldShowFirstShrineMessage(): boolean {
    return this.state.hasCompletedTutorial && !this.state.hasSeenFirstShrine;
  }

  markFirstShrineSeen(): void {
    this.state.hasSeenFirstShrine = true;
    this.saveState();
  }

  shouldShowFirstMerchantMessage(): boolean {
    return this.state.hasCompletedTutorial && !this.state.hasSeenFirstMerchant;
  }

  markFirstMerchantSeen(): void {
    this.state.hasSeenFirstMerchant = true;
    this.saveState();
  }

  // Reset for testing
  reset(): void {
    this.state = { ...DEFAULT_STATE };
    this.saveState();
  }

  // Get full state (for debugging)
  getState(): TutorialState {
    return { ...this.state };
  }
}

export const TutorialService = new TutorialServiceClass();

// Expose to window for debug access
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).tutorialService = TutorialService;
}
