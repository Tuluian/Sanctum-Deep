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
  EnemyMove,
  EndTurnResult,
  IntentType,
  PlayerState,
  PlayCardResult,
} from '@/types';

export class CombatEngine {
  private state: CombatState;
  private listeners: CombatEventListener[] = [];
  private enemyDefinitions: Map<string, EnemyDefinition>;

  constructor(player: PlayerState, enemyDefinitions: EnemyDefinition[]) {
    // Store definitions for intent selection
    this.enemyDefinitions = new Map(enemyDefinitions.map((def) => [def.id, def]));

    const enemies: Enemy[] = enemyDefinitions.map((def) => ({
      id: def.id,
      name: def.name,
      maxHp: def.maxHp,
      currentHp: def.maxHp,
      block: 0,
      intent: null,
      statusEffects: [],
      might: 0,
      untargetable: false,
      isElite: def.isElite || false,
      phase: 0,
      usedAbilities: [],
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
    const definition = this.enemyDefinitions.get(enemy.id);
    if (!definition) {
      // Fallback if no definition found
      enemy.intent = {
        intent: IntentType.ATTACK,
        damage: 5,
        name: 'Attack',
        moveId: 'fallback_attack',
      };
      this.emit(CombatEventType.ENEMY_INTENT_SET, { enemyId: enemy.id, intent: enemy.intent });
      return;
    }

    // Determine which move set to use (phases or default)
    let moves = definition.moves;
    if (definition.phases && definition.phases.length > enemy.phase) {
      moves = definition.phases[enemy.phase].moves;
    }

    if (moves.length === 0) {
      enemy.intent = {
        intent: IntentType.ATTACK,
        damage: 5,
        name: 'Attack',
        moveId: 'fallback_attack',
      };
      this.emit(CombatEventType.ENEMY_INTENT_SET, { enemyId: enemy.id, intent: enemy.intent });
      return;
    }

    // Filter out once-per-combat abilities that have been used
    const availableMoves = moves.filter(m =>
      !m.oncePerCombat || !enemy.usedAbilities.includes(m.id)
    );

    // If no moves available, use a default attack
    if (availableMoves.length === 0) {
      enemy.intent = {
        intent: IntentType.ATTACK,
        damage: 5,
        name: 'Attack',
        moveId: 'fallback_attack',
      };
      this.emit(CombatEventType.ENEMY_INTENT_SET, { enemyId: enemy.id, intent: enemy.intent });
      return;
    }

    const totalWeight = availableMoves.reduce((sum, m) => sum + m.weight, 0);
    let random = Math.random() * totalWeight;

    for (const move of availableMoves) {
      random -= move.weight;
      if (random <= 0) {
        enemy.intent = this.createIntentFromMove(move);
        break;
      }
    }

    // Fallback if loop didn't set intent
    if (!enemy.intent) {
      enemy.intent = this.createIntentFromMove(availableMoves[0]);
    }

    this.emit(CombatEventType.ENEMY_INTENT_SET, { enemyId: enemy.id, intent: enemy.intent });
  }

  private createIntentFromMove(move: EnemyMove): EnemyIntent {
    return {
      intent: move.intent,
      damage: move.damage,
      block: move.block,
      name: move.name,
      moveId: move.id,
      times: move.times,
      heal: move.heal,
      selfDamage: move.selfDamage,
      buffType: move.buffType,
      buffAmount: move.buffAmount,
      debuffType: move.debuffType,
      debuffDuration: move.debuffDuration,
      summons: move.summons,
      oncePerCombat: move.oncePerCombat,
    };
  }

  // Check and handle phase transitions
  private checkPhaseTransition(enemy: Enemy): void {
    const definition = this.enemyDefinitions.get(enemy.id);
    if (!definition?.phaseThresholds) return;

    const hpPercent = enemy.currentHp / enemy.maxHp;
    let newPhase = 0;

    for (let i = 0; i < definition.phaseThresholds.length; i++) {
      if (hpPercent <= definition.phaseThresholds[i]) {
        newPhase = i + 1; // Phase 0 is default, phase 1+ triggered by thresholds
      }
    }

    if (newPhase > enemy.phase) {
      enemy.phase = newPhase;
      this.emit(CombatEventType.ENEMY_PHASE_CHANGED, { enemyId: enemy.id, phase: newPhase });
      this.log(`${enemy.name} enters phase ${newPhase + 1}!`);
      // Immediately set new intent based on new phase
      this.setEnemyIntent(enemy);
    }
  }

  // Add enemy to combat (for summoning)
  addEnemy(definition: EnemyDefinition): void {
    const enemy: Enemy = {
      id: definition.id,
      name: definition.name,
      maxHp: definition.maxHp,
      currentHp: definition.maxHp,
      block: 0,
      intent: null,
      statusEffects: [],
      might: 0,
      untargetable: false,
      isElite: definition.isElite || false,
      phase: 0,
      usedAbilities: [],
    };

    this.state.enemies.push(enemy);
    this.enemyDefinitions.set(definition.id, definition);
    this.setEnemyIntent(enemy);
    this.emit(CombatEventType.ENEMY_SUMMONED, { enemy });
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
      .map((enemy, index) => (enemy.currentHp > 0 && !enemy.untargetable ? index : -1))
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
      case EffectType.DAMAGE: {
        if (target) {
          // Apply empowered attack bonus
          let damageAmount = effect.amount;
          if (this.state.player.empoweredAttack > 0) {
            damageAmount += this.state.player.empoweredAttack;
            this.state.player.empoweredAttack = 0;
            this.emit(CombatEventType.PLAYER_EMPOWERED_CHANGED, { empoweredAttack: 0 });
          }
          return this.dealDamageToEnemy(target, damageAmount);
        }
        return null;
      }

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

      case EffectType.GAIN_FORTIFY: {
        const fortifyGain = Math.min(effect.amount, this.state.player.maxFortify - this.state.player.fortify);
        this.state.player.fortify += fortifyGain;
        this.emit(CombatEventType.PLAYER_FORTIFY_CHANGED, { fortify: this.state.player.fortify });
        return `Gained ${fortifyGain} Fortify`;
      }

      case EffectType.APPLY_STATUS:
        // For now, APPLY_STATUS with amount means Empowered Attack
        this.state.player.empoweredAttack += effect.amount;
        this.emit(CombatEventType.PLAYER_EMPOWERED_CHANGED, { empoweredAttack: this.state.player.empoweredAttack });
        return `Your next attack deals +${effect.amount} damage`;

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
    } else {
      // Check for phase transitions when damage is dealt
      this.checkPhaseTransition(enemy);
    }

    return `Dealt ${damage} damage to ${enemy.name}`;
  }

  private dealDamageToPlayer(damage: number): { blocked: number; fortifyAbsorbed: number; hpDamage: number } {
    let remaining = damage;

    // Fortify absorbs first
    const fortifyAbsorbed = Math.min(remaining, this.state.player.fortify);
    this.state.player.fortify -= fortifyAbsorbed;
    remaining -= fortifyAbsorbed;

    if (fortifyAbsorbed > 0) {
      this.emit(CombatEventType.PLAYER_FORTIFY_CHANGED, { fortify: this.state.player.fortify });
    }

    // Block absorbs second
    const blocked = Math.min(remaining, this.state.player.block);
    this.state.player.block -= blocked;
    remaining -= blocked;

    // Remaining hits HP
    const hpDamage = remaining;
    this.state.player.currentHp = Math.max(0, this.state.player.currentHp - hpDamage);

    this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
    this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
    this.emit(CombatEventType.PLAYER_DAMAGED, { damage, blocked, fortifyAbsorbed, hpDamage });

    return { blocked, fortifyAbsorbed, hpDamage };
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

      // Reset enemy block and untargetable at start of their turn
      enemy.block = 0;
      enemy.untargetable = false;
      this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: enemy.id, block: 0 });

      const intent = enemy.intent as EnemyIntent;
      if (!intent) continue;

      // Apply might bonus to damage if applicable
      const mightBonus = enemy.might;
      enemy.might = 0; // Reset might after using

      switch (intent.intent) {
        case IntentType.ATTACK:
          if (intent.damage) {
            const totalDamage = intent.damage + mightBonus;
            const result = this.dealDamageToPlayer(totalDamage);
            log.push(`${enemy.name} dealt ${totalDamage} damage (${result.hpDamage} to HP)`);
            // Handle lifesteal (attack with heal)
            if (intent.heal && intent.heal > 0) {
              const healAmount = Math.min(intent.heal, enemy.maxHp - enemy.currentHp);
              enemy.currentHp += healAmount;
              log.push(`${enemy.name} healed ${healAmount} HP`);
            }
          }
          break;

        case IntentType.MULTI_ATTACK:
          if (intent.damage && intent.times) {
            for (let i = 0; i < intent.times; i++) {
              const totalDamage = intent.damage + mightBonus;
              const result = this.dealDamageToPlayer(totalDamage);
              log.push(`${enemy.name} dealt ${totalDamage} damage (${result.hpDamage} to HP)`);
              // Check if player died mid-attack
              if (this.state.player.currentHp <= 0) break;
            }
          }
          break;

        case IntentType.DEFEND:
          if (intent.block) {
            enemy.block += intent.block;
            this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: enemy.id, block: enemy.block });
            log.push(`${enemy.name} gained ${intent.block} block`);
          }
          break;

        case IntentType.BUFF:
          // Self-buff (e.g., Phase makes enemy untargetable)
          enemy.untargetable = true;
          log.push(`${enemy.name} phases out and becomes untargetable!`);
          break;

        case IntentType.BUFF_ALLY:
          // Buff another enemy
          if (intent.buffAmount) {
            const aliveAllies = this.state.enemies.filter(e => e.currentHp > 0 && e.id !== enemy.id);
            if (aliveAllies.length > 0) {
              const target = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
              target.might += intent.buffAmount;
              log.push(`${enemy.name} buffed ${target.name} (+${intent.buffAmount} Might)`);
            } else {
              // No allies to buff, attacks instead
              log.push(`${enemy.name} has no allies to buff`);
            }
          }
          break;

        case IntentType.DEBUFF:
          // Apply debuff to player
          if (intent.debuffType && intent.debuffDuration) {
            const existingEffect = this.state.player.statusEffects.find(e => e.type === intent.debuffType);
            if (existingEffect) {
              existingEffect.duration = Math.max(existingEffect.duration || 0, intent.debuffDuration);
            } else {
              this.state.player.statusEffects.push({
                type: intent.debuffType,
                amount: 1,
                duration: intent.debuffDuration,
              });
            }
            log.push(`${enemy.name} applied ${intent.debuffType} to you for ${intent.debuffDuration} turns`);
          }
          break;

        case IntentType.HEAL:
          // Heal an ally (or self if no allies)
          if (intent.heal) {
            const aliveAllies = this.state.enemies.filter(e => e.currentHp > 0 && e.id !== enemy.id);
            let healTarget = enemy;
            if (aliveAllies.length > 0) {
              // Heal the most damaged ally
              healTarget = aliveAllies.reduce((most, curr) =>
                (curr.maxHp - curr.currentHp) > (most.maxHp - most.currentHp) ? curr : most
              );
            }
            const healAmount = Math.min(intent.heal, healTarget.maxHp - healTarget.currentHp);
            healTarget.currentHp += healAmount;
            log.push(`${enemy.name} healed ${healTarget.name} for ${healAmount} HP`);

            // Handle self-damage (Sacrifice ability)
            if (intent.selfDamage) {
              enemy.currentHp = Math.max(0, enemy.currentHp - intent.selfDamage);
              log.push(`${enemy.name} took ${intent.selfDamage} self-damage`);
            }
          }
          break;

        case IntentType.SUMMON:
          // Summon enemies
          if (intent.summons && intent.summons.length > 0) {
            // Track this as a used ability if once-per-combat
            if (intent.oncePerCombat) {
              enemy.usedAbilities.push(intent.moveId);
            }

            for (const summonId of intent.summons) {
              const summonDef = this.enemyDefinitions.get(summonId);
              if (summonDef) {
                this.addEnemy(summonDef);
                log.push(`${enemy.name} summoned ${summonDef.name}!`);
              }
            }
          }
          break;
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
