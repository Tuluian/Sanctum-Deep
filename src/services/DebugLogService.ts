/**
 * Debug Log Service
 * Records detailed combat events for debugging and analysis
 * Only active in development mode
 */

import { Card, Enemy, PlayerState, StatusType } from '@/types';

export enum DebugEventType {
  CARD_PLAYED = 'CARD_PLAYED',
  ENEMY_ACTION = 'ENEMY_ACTION',
  STATUS_APPLIED = 'STATUS_APPLIED',
  STATUS_REMOVED = 'STATUS_REMOVED',
  STATUS_TICK = 'STATUS_TICK',
  DAMAGE_DEALT = 'DAMAGE_DEALT',
  HEAL_APPLIED = 'HEAL_APPLIED',
  BLOCK_GAINED = 'BLOCK_GAINED',
  ENEMY_SPAWNED = 'ENEMY_SPAWNED',
  ENEMY_DIED = 'ENEMY_DIED',
  TURN_START = 'TURN_START',
  TURN_END = 'TURN_END',
  COMBAT_START = 'COMBAT_START',
  COMBAT_END = 'COMBAT_END',
  PHASE_TRANSITION = 'PHASE_TRANSITION',
}

export interface DebugLogEntry {
  timestamp: number;
  sequence: number;
  turn: number;
  type: DebugEventType;
  details: Record<string, unknown>;
}

export interface DamageModifier {
  name: string;
  value: number;
  description: string;
}

class DebugLogServiceClass {
  private logs: DebugLogEntry[] = [];
  private enabled: boolean;
  private currentTurn: number = 0;
  private maxLogs: number = 1000;

  constructor() {
    // Enable in dev mode or when DEBUG_LOG env var is set
    this.enabled = import.meta.env.DEV || import.meta.env.VITE_DEBUG_LOG === 'true';
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setTurn(turn: number): void {
    this.currentTurn = turn;
  }

  private log(type: DebugEventType, details: Record<string, unknown>): void {
    if (!this.enabled) return;

    const entry: DebugLogEntry = {
      timestamp: Date.now(),
      sequence: this.logs.length,
      turn: this.currentTurn,
      type,
      details,
    };

    this.logs.push(entry);

    // Trim old logs if buffer is full
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console in dev mode for real-time debugging
    if (import.meta.env.DEV) {
      console.log(`[${type}] Turn ${this.currentTurn}:`, details);
    }
  }

  logCombatStart(player: PlayerState, enemies: Enemy[]): void {
    this.log(DebugEventType.COMBAT_START, {
      player: {
        classId: player.classId,
        hp: `${player.currentHp}/${player.maxHp}`,
        resolve: `${player.resolve}/${player.maxResolve}`,
        deckSize: player.drawPile.length,
        discardSize: player.discardPile.length,
      },
      enemies: enemies.map(e => ({
        id: e.id,
        name: e.name,
        hp: `${e.currentHp}/${e.maxHp}`,
        isBoss: e.isBoss,
        isElite: e.isElite,
      })),
    });
    this.currentTurn = 0;
  }

  logCombatEnd(victory: boolean, reason?: string): void {
    this.log(DebugEventType.COMBAT_END, {
      victory,
      reason,
      totalTurns: this.currentTurn,
    });
  }

  logTurnStart(isPlayerTurn: boolean, turn: number): void {
    this.currentTurn = turn;
    this.log(DebugEventType.TURN_START, {
      isPlayerTurn,
      turn,
    });
  }

  logTurnEnd(isPlayerTurn: boolean): void {
    this.log(DebugEventType.TURN_END, {
      isPlayerTurn,
      turn: this.currentTurn,
    });
  }

  logCardPlayed(
    card: Card,
    player: PlayerState,
    target?: Enemy,
    effects?: string[]
  ): void {
    this.log(DebugEventType.CARD_PLAYED, {
      card: {
        id: card.id,
        instanceId: card.instanceId,
        name: card.name,
        type: card.type,
        cost: card.cost,
      },
      player: {
        hp: `${player.currentHp}/${player.maxHp}`,
        resolve: `${player.resolve}/${player.maxResolve}`,
        block: player.block,
      },
      target: target ? {
        id: target.id,
        name: target.name,
        hp: `${target.currentHp}/${target.maxHp}`,
        block: target.block,
      } : null,
      effectsApplied: effects || [],
    });
  }

  logEnemyAction(
    enemy: Enemy,
    moveId: string,
    moveName: string,
    result: string[]
  ): void {
    this.log(DebugEventType.ENEMY_ACTION, {
      enemy: {
        id: enemy.id,
        name: enemy.name,
        hp: `${enemy.currentHp}/${enemy.maxHp}`,
        phase: enemy.phase,
      },
      move: {
        id: moveId,
        name: moveName,
        intent: enemy.intent?.intent,
      },
      results: result,
    });
  }

  logDamageDealt(
    source: string,
    target: string,
    baseDamage: number,
    modifiers: DamageModifier[],
    finalDamage: number,
    blocked: number,
    hpDamage: number
  ): void {
    this.log(DebugEventType.DAMAGE_DEALT, {
      source,
      target,
      calculation: {
        base: baseDamage,
        modifiers: modifiers.map(m => `${m.name}: ${m.value > 0 ? '+' : ''}${m.value} (${m.description})`),
        final: finalDamage,
      },
      result: {
        blocked,
        hpDamage,
      },
    });
  }

  logHealApplied(target: string, amount: number, source: string): void {
    this.log(DebugEventType.HEAL_APPLIED, {
      target,
      amount,
      source,
    });
  }

  logBlockGained(target: string, amount: number, source: string): void {
    this.log(DebugEventType.BLOCK_GAINED, {
      target,
      amount,
      source,
    });
  }

  logStatusApplied(
    target: string,
    status: StatusType,
    amount: number,
    duration?: number,
    source?: string
  ): void {
    this.log(DebugEventType.STATUS_APPLIED, {
      target,
      status,
      amount,
      duration,
      source,
    });
  }

  logStatusRemoved(target: string, status: StatusType, reason: string): void {
    this.log(DebugEventType.STATUS_REMOVED, {
      target,
      status,
      reason,
    });
  }

  logStatusTick(target: string, status: StatusType, effect: string): void {
    this.log(DebugEventType.STATUS_TICK, {
      target,
      status,
      effect,
    });
  }

  logEnemySpawned(enemy: Enemy, source: string): void {
    this.log(DebugEventType.ENEMY_SPAWNED, {
      enemy: {
        id: enemy.id,
        name: enemy.name,
        hp: `${enemy.currentHp}/${enemy.maxHp}`,
      },
      source,
    });
  }

  logEnemyDied(enemy: Enemy, killer: string): void {
    this.log(DebugEventType.ENEMY_DIED, {
      enemy: {
        id: enemy.id,
        name: enemy.name,
        maxHp: enemy.maxHp,
      },
      killer,
    });
  }

  logPhaseTransition(enemy: Enemy, oldPhase: number, newPhase: number): void {
    this.log(DebugEventType.PHASE_TRANSITION, {
      enemy: {
        id: enemy.id,
        name: enemy.name,
        hp: `${enemy.currentHp}/${enemy.maxHp}`,
      },
      oldPhase,
      newPhase,
    });
  }

  getLogs(): DebugLogEntry[] {
    return [...this.logs];
  }

  getLogsFiltered(type?: DebugEventType): DebugLogEntry[] {
    if (!type) return this.getLogs();
    return this.logs.filter(l => l.type === type);
  }

  exportJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  exportText(): string {
    return this.logs.map(entry => {
      const time = new Date(entry.timestamp).toISOString().split('T')[1].slice(0, -1);
      return `[${entry.type}] Turn ${entry.turn}, ${time}\n${JSON.stringify(entry.details, null, 2)}`;
    }).join('\n\n');
  }

  clear(): void {
    this.logs = [];
    this.currentTurn = 0;
  }
}

// Singleton instance
export const DebugLogService = new DebugLogServiceClass();
