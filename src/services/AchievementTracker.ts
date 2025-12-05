/**
 * AchievementTracker - Hooks into CombatEngine events to track stats for achievements
 * This module connects the CombatEngine to the AchievementService
 */

import { CombatEngine } from '@/engine/CombatEngine';
import { CombatEventType, CharacterClassId, CardType } from '@/types';
import { AchievementService } from './AchievementService';

export class AchievementTracker {
  private unsubscribe: (() => void) | null = null;
  private combatEngine: CombatEngine | null = null;

  /**
   * Start tracking achievements for a combat instance
   */
  startTracking(engine: CombatEngine, cursesInDeck: number = 0): void {
    this.combatEngine = engine;
    AchievementService.startCombat(cursesInDeck);

    // Subscribe to combat events
    this.unsubscribe = engine.subscribe((event) => {
      switch (event.type) {
        case CombatEventType.PLAYER_DAMAGED: {
          const data = event.data as {
            damage: number;
            blocked: number;
            fortifyAbsorbed: number;
            hpDamage: number;
          };
          if (data.hpDamage > 0) {
            AchievementService.recordDamageTaken(data.hpDamage);
          }
          break;
        }

        case CombatEventType.ENEMY_DAMAGED: {
          const data = event.data as {
            enemyId: string;
            damage: number;
            blocked: number;
            hpDamage: number;
            remainingHp: number;
          };
          // Record single-attack damage for "Overkill" achievement
          AchievementService.recordDamageDealt(data.damage, true);
          break;
        }

        case CombatEventType.ENEMY_DIED: {
          AchievementService.recordEnemyDefeated();
          break;
        }

        case CombatEventType.CARD_PLAYED: {
          AchievementService.recordCardPlayed();
          break;
        }

        case CombatEventType.PLAYER_BLOCK_CHANGED: {
          // We track total block gained through a different mechanism
          // This event fires on any block change, not just gains
          break;
        }

        case CombatEventType.PLAYER_DEVOTION_CHANGED: {
          const data = event.data as { devotion: number };
          AchievementService.recordDevotionGained(data.devotion);
          break;
        }

        case CombatEventType.PLAYER_FORTIFY_CHANGED: {
          const data = event.data as { fortify: number };
          AchievementService.recordFortifyStatus(data.fortify);
          break;
        }

        case CombatEventType.VOW_BROKEN: {
          AchievementService.recordVowBroken();
          break;
        }

        case CombatEventType.WHIMSY_RESOLVED: {
          AchievementService.recordWhimsyTriggered();
          break;
        }

        case CombatEventType.PHASE_CHANGED: {
          const data = event.data as { phase: string };
          // Track turn end for multi-turn achievements
          if (data.phase === 'ENEMY_ACTION') {
            AchievementService.recordTurnEnd();
          }
          break;
        }

        case CombatEventType.GAME_OVER: {
          const data = event.data as { victory: boolean };
          if (data.victory && this.combatEngine) {
            const state = this.combatEngine.getState();
            // Check glass cannon (win with 1 HP)
            AchievementService.checkGlassCannonAtWin(state.player.currentHp);
            // Check empty draw pile win
            AchievementService.checkEmptyDrawPileWin(state.player.drawPile.length);
          }
          break;
        }
      }
    });
  }

  /**
   * Stop tracking and finalize combat achievements
   */
  stopTracking(victory: boolean): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    AchievementService.endCombat(victory);
    this.combatEngine = null;
  }

  /**
   * Record block gained (called from outside event system when block is applied)
   */
  recordBlockGained(amount: number): void {
    AchievementService.recordBlockGained(amount);
  }
}

// Singleton instance
export const achievementTracker = new AchievementTracker();

// ============================================
// Run-level tracking functions
// ============================================

/**
 * Start tracking a new run
 */
export function startRunTracking(classId: CharacterClassId): void {
  AchievementService.startRun(classId);
}

/**
 * End run tracking
 */
export function endRunTracking(victory: boolean): void {
  AchievementService.endRun(victory);
}

/**
 * Record act completion
 */
export function recordActComplete(act: number): void {
  AchievementService.recordActComplete(act);
}

/**
 * Record boss defeated
 */
export function recordBossDefeated(bossId: string): void {
  AchievementService.recordBossDefeated(bossId);
}

/**
 * Record elite defeated
 */
export function recordEliteDefeated(): void {
  AchievementService.recordEliteDefeated();
}

/**
 * Record shrine visited
 */
export function recordShrineVisited(shrineId: string): void {
  AchievementService.recordShrineVisited(shrineId);
}

/**
 * Record campfire rest
 */
export function recordCampfireRest(): void {
  AchievementService.recordCampfireRest();
}

/**
 * Record potion used
 */
export function recordPotionUsed(): void {
  AchievementService.recordPotionUsed();
}

/**
 * Record relic collected
 */
export function recordRelicCollected(): void {
  AchievementService.recordRelicCollected();
}

/**
 * Record card added to deck
 */
export function recordCardAdded(isStarterCard: boolean = false): void {
  AchievementService.recordCardAdded(isStarterCard);
}

/**
 * Record gold change
 */
export function recordGoldChange(newTotal: number): void {
  AchievementService.recordGoldChange(newTotal);
}

/**
 * Record Ankh Talisman used (revive)
 */
export function recordAnkhUsed(): void {
  AchievementService.recordAnkhUsed();
}

/**
 * Record Warden choice at game end
 */
export function recordWardenChoice(choice: 'warden' | 'leave'): void {
  AchievementService.recordWardenChoice(choice);
}

/**
 * Count curses in a deck
 */
export function countCursesInDeck(deck: { type: CardType }[]): number {
  return deck.filter((card) => card.type === CardType.CURSE).length;
}
