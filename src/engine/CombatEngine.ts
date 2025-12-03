import {
  Card,
  CardType,
  CombatEvent,
  CombatEventListener,
  CombatEventType,
  CombatPhase,
  CombatState,
  EffectType,
  Enemy,
  EnemyDefinition,
  EnemyIntent,
  EndTurnResult,
  IntentType,
  PlayerState,
  PlayCardResult,
} from '@/types';

export class CombatEngine {
  private state: CombatState;
  private listeners: CombatEventListener[] = [];

  constructor(player: PlayerState, enemyDefinitions: EnemyDefinition[]) {
    const enemies: Enemy[] = enemyDefinitions.map((def) => ({
      id: def.id,
      name: def.name,
      maxHp: def.maxHp,
      currentHp: def.maxHp,
      block: 0,
      intent: null,
      statusEffects: [],
    }));

    this.state = {
      turn: 1,
      phase: CombatPhase.NOT_STARTED,
      player,
      enemies,
      gameOver: false,
      victory: false,
    };
  }

  // Event system
  subscribe(listener: CombatEventListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private emit(type: CombatEventType, data?: unknown): void {
    const event: CombatEvent = { type, data };
    this.listeners.forEach((listener) => listener(event));
  }

  private log(message: string): void {
    this.emit(CombatEventType.COMBAT_LOG, { message });
  }

  // State access
  getState(): CombatState {
    return { ...this.state };
  }

  getPhase(): CombatPhase {
    return this.state.phase;
  }

  canPlayerAct(): boolean {
    return this.state.phase === CombatPhase.PLAYER_ACTION && !this.state.gameOver;
  }

  isGameOver(): boolean {
    return this.state.gameOver;
  }

  // Deck utilities
  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private drawCards(count: number): void {
    for (let i = 0; i < count; i++) {
      if (this.state.player.drawPile.length === 0) {
        if (this.state.player.discardPile.length === 0) break;
        this.state.player.drawPile = this.shuffle([...this.state.player.discardPile]);
        this.state.player.discardPile = [];
      }
      const card = this.state.player.drawPile.shift();
      if (card) {
        this.state.player.hand.push(card);
        this.emit(CombatEventType.CARD_DRAWN, { card });
      }
    }
  }

  // Combat initialization
  startCombat(): void {
    this.state.player.drawPile = this.shuffle([...this.state.player.drawPile]);
    this.state.enemies.forEach((enemy) => this.setEnemyIntent(enemy));
    this.state.phase = CombatPhase.DRAW;
    this.emit(CombatEventType.PHASE_CHANGED, { phase: CombatPhase.DRAW });

    this.drawCards(5);
    this.state.player.resolve = this.state.player.maxResolve;
    this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, { resolve: this.state.player.resolve });

    this.state.phase = CombatPhase.PLAYER_ACTION;
    this.emit(CombatEventType.PHASE_CHANGED, { phase: CombatPhase.PLAYER_ACTION });

    this.log('Combat begins!');
  }

  // Enemy intent
  private setEnemyIntent(enemy: Enemy): void {
    // Find enemy definition to get moves
    // For now, use hardcoded moves (will be refactored with enemy data)
    const moves = [
      { intent: IntentType.ATTACK, damage: 6, weight: 40, name: 'Dark Bolt' },
      { intent: IntentType.DEFEND, block: 8, weight: 30, name: 'Defend' },
      { intent: IntentType.ATTACK, damage: 9, weight: 30, name: 'Shadow Strike' },
    ];

    const totalWeight = moves.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;

    for (const move of moves) {
      random -= move.weight;
      if (random <= 0) {
        enemy.intent = {
          intent: move.intent,
          damage: move.damage,
          block: move.block,
          name: move.name,
        };
        break;
      }
    }

    this.emit(CombatEventType.ENEMY_INTENT_SET, { enemyId: enemy.id, intent: enemy.intent });
  }

  // Card playing
  canPlayCard(cardIndex: number): boolean {
    if (!this.canPlayerAct()) return false;
    const card = this.state.player.hand[cardIndex];
    if (!card) return false;
    return card.cost <= this.state.player.resolve;
  }

  getPlayableCards(): number[] {
    return this.state.player.hand
      .map((card, index) => (card.cost <= this.state.player.resolve ? index : -1))
      .filter((index) => index !== -1);
  }

  requiresTarget(card: Card): boolean {
    return card.type === CardType.ATTACK;
  }

  getValidTargets(): number[] {
    return this.state.enemies
      .map((enemy, index) => (enemy.currentHp > 0 ? index : -1))
      .filter((index) => index !== -1);
  }

  playCard(cardIndex: number, targetIndex: number = 0): PlayCardResult {
    if (!this.canPlayerAct()) {
      return { success: false, message: 'Cannot act now', log: [] };
    }

    const card = this.state.player.hand[cardIndex];
    if (!card) {
      return { success: false, message: 'Invalid card', log: [] };
    }

    if (card.cost > this.state.player.resolve) {
      return { success: false, message: 'Insufficient Resolve', log: [] };
    }

    const target = this.state.enemies[targetIndex];
    if (this.requiresTarget(card) && (!target || target.currentHp <= 0)) {
      return { success: false, message: 'Invalid target', log: [] };
    }

    // Deduct cost
    this.state.player.resolve -= card.cost;
    this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, { resolve: this.state.player.resolve });

    // Remove from hand
    this.state.player.hand.splice(cardIndex, 1);

    // Execute effects
    const log: string[] = [];
    for (const effect of card.effects) {
      const result = this.executeEffect(effect, target);
      if (result) log.push(result);
    }

    // Move to discard
    this.state.player.discardPile.push(card);

    this.emit(CombatEventType.CARD_PLAYED, { card, targetIndex });

    // Check victory
    if (this.state.enemies.every((e) => e.currentHp <= 0)) {
      this.state.victory = true;
      this.state.gameOver = true;
      this.state.phase = CombatPhase.VICTORY;
      this.emit(CombatEventType.GAME_OVER, { victory: true });
      log.push('Victory!');
    }

    return { success: true, log };
  }

  private executeEffect(effect: { type: EffectType; amount: number }, target?: Enemy): string | null {
    switch (effect.type) {
      case EffectType.DAMAGE:
        if (target) {
          return this.dealDamageToEnemy(target, effect.amount);
        }
        return null;

      case EffectType.BLOCK:
        this.state.player.block += effect.amount;
        this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
        return `Gained ${effect.amount} block`;

      case EffectType.HEAL: {
        const heal = Math.min(effect.amount, this.state.player.maxHp - this.state.player.currentHp);
        this.state.player.currentHp += heal;
        this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });

        // Devotion triggers on heal effect, even if no HP restored
        this.state.player.devotion++;
        this.emit(CombatEventType.PLAYER_DEVOTION_CHANGED, { devotion: this.state.player.devotion });

        return `Healed ${heal} HP (gained 1 Devotion)`;
      }

      case EffectType.GAIN_DEVOTION:
        this.state.player.devotion++;
        this.emit(CombatEventType.PLAYER_DEVOTION_CHANGED, { devotion: this.state.player.devotion });
        return 'Gained 1 Devotion';

      default:
        return null;
    }
  }

  private dealDamageToEnemy(enemy: Enemy, damage: number): string {
    const blockedDamage = Math.min(damage, enemy.block);
    enemy.block = Math.max(0, enemy.block - damage);

    const hpDamage = damage - blockedDamage;
    enemy.currentHp = Math.max(0, enemy.currentHp - hpDamage);

    this.emit(CombatEventType.ENEMY_DAMAGED, {
      enemyId: enemy.id,
      damage,
      blocked: blockedDamage,
      hpDamage,
      remainingHp: enemy.currentHp,
    });

    if (enemy.currentHp <= 0) {
      this.emit(CombatEventType.ENEMY_DIED, { enemyId: enemy.id });
    }

    return `Dealt ${damage} damage to ${enemy.name}`;
  }

  private dealDamageToPlayer(damage: number): { blocked: number; hpDamage: number } {
    const blocked = Math.min(damage, this.state.player.block);
    this.state.player.block = Math.max(0, this.state.player.block - damage);

    const hpDamage = damage - blocked;
    this.state.player.currentHp = Math.max(0, this.state.player.currentHp - hpDamage);

    this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
    this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
    this.emit(CombatEventType.PLAYER_DAMAGED, { damage, blocked, hpDamage });

    return { blocked, hpDamage };
  }

  // End turn
  endTurn(): EndTurnResult {
    if (!this.canPlayerAct()) {
      return { log: [] };
    }

    const log: string[] = [];

    // Discard hand
    this.state.player.discardPile.push(...this.state.player.hand);
    this.state.player.hand = [];

    // Enemy phase
    this.state.phase = CombatPhase.ENEMY_ACTION;
    this.emit(CombatEventType.PHASE_CHANGED, { phase: CombatPhase.ENEMY_ACTION });

    for (const enemy of this.state.enemies) {
      if (enemy.currentHp <= 0) continue;

      // Reset enemy block at start of their turn
      enemy.block = 0;
      this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: enemy.id, block: 0 });

      const intent = enemy.intent as EnemyIntent;
      if (!intent) continue;

      if (intent.intent === IntentType.ATTACK && intent.damage) {
        const result = this.dealDamageToPlayer(intent.damage);
        log.push(`${enemy.name} dealt ${intent.damage} damage (${result.hpDamage} to HP)`);
      } else if (intent.intent === IntentType.DEFEND && intent.block) {
        enemy.block += intent.block;
        this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: enemy.id, block: enemy.block });
        log.push(`${enemy.name} gained ${intent.block} block`);
      }

      // Set next intent
      this.setEnemyIntent(enemy);
    }

    // Reset player block AFTER all enemy attacks
    this.state.player.block = 0;
    this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: 0 });

    // Check defeat
    if (this.state.player.currentHp <= 0) {
      this.state.gameOver = true;
      this.state.victory = false;
      this.state.phase = CombatPhase.DEFEAT;
      this.emit(CombatEventType.GAME_OVER, { victory: false });
      log.push('You have been defeated!');
      return { log };
    }

    // Start new turn
    this.state.phase = CombatPhase.CLEANUP;
    this.state.turn++;

    // Draw phase
    this.state.phase = CombatPhase.DRAW;
    this.state.player.resolve = this.state.player.maxResolve;
    this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, { resolve: this.state.player.resolve });
    this.drawCards(5);

    // Player action phase
    this.state.phase = CombatPhase.PLAYER_ACTION;
    this.emit(CombatEventType.PHASE_CHANGED, { phase: CombatPhase.PLAYER_ACTION });

    log.push(`--- Turn ${this.state.turn} ---`);

    return { log };
  }
}
