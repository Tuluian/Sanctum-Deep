import {
  Card,
  CardDefinition,
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
  Minion,
  MAX_MINIONS,
  MAX_FAVOR,
  DEBT_STACK_THRESHOLD,
  DEBT_STACK_DAMAGE,
  PlayerState,
  PlayCardResult,
  Price,
  PriceType,
  StatusType,
  Vow,
  VowBonusType,
  VowRestrictionType,
  WhimsyEffect,
} from '@/types';
import { getCardById, OATHSWORN_VOWS } from '@/data/cards';
import { getMinionById } from '@/data/minions';

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
      isBoss: def.isBoss || false,
      phase: 0,
      usedAbilities: [],
      summonCooldown: 0,
      justSummoned: false,
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

        // Handle on-draw effects (e.g., Pain curse)
        if (card.onDraw && card.onDraw.length > 0) {
          for (const effect of card.onDraw) {
            this.executeEffect(effect, undefined);
          }
          this.log(`${card.name} triggers on draw!`);
        }
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
    // Handle charging - if enemy is charging, show charging intent
    if (enemy.charging) {
      enemy.intent = {
        intent: IntentType.CHARGING,
        damage: enemy.charging.chargedMove.damage,
        name: `${enemy.charging.chargedMove.name} (${enemy.charging.turnsRemaining})`,
        moveId: enemy.charging.chargedMove.id,
      };
      this.emit(CombatEventType.ENEMY_INTENT_SET, { enemyId: enemy.id, intent: enemy.intent });
      return;
    }

    // Get base ID for definition lookup (strip instance suffix)
    const baseId = enemy.id.replace(/_\d+$/, '');
    const definition = this.enemyDefinitions.get(baseId) || this.enemyDefinitions.get(enemy.id);
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

    // Count current minions (non-boss, non-elite enemies that are alive)
    const currentMinionCount = this.state.enemies.filter(
      e => e.currentHp > 0 && !e.isBoss && !e.isElite && e.id !== enemy.id
    ).length;
    const maxMinions = 3;

    // Filter out unavailable moves
    const availableMoves = moves.filter(m => {
      // Filter once-per-combat abilities that have been used
      if (m.oncePerCombat && enemy.usedAbilities.includes(m.id)) {
        return false;
      }
      // Filter summon moves if on cooldown or at max minions
      if (m.intent === IntentType.SUMMON) {
        if (enemy.summonCooldown > 0) return false;
        if (currentMinionCount >= maxMinions) return false;
      }
      return true;
    });

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
      chargeTurns: move.chargeTurns,
      commandMinions: move.commandMinions,
      resurrectMinions: move.resurrectMinions,
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
  addEnemy(definition: EnemyDefinition, currentHp?: number): void {
    // Generate unique instance ID if enemy already exists
    let instanceId = definition.id;
    const existingCount = this.state.enemies.filter(e => e.id.startsWith(definition.id)).length;
    if (existingCount > 0) {
      instanceId = `${definition.id}_${existingCount}`;
    }

    const enemy: Enemy = {
      id: instanceId,
      name: definition.name,
      maxHp: definition.maxHp,
      currentHp: currentHp ?? definition.maxHp,
      block: 0,
      intent: null,
      statusEffects: [],
      might: 0,
      untargetable: false,
      isElite: definition.isElite || false,
      isBoss: definition.isBoss || false,
      phase: 0,
      usedAbilities: [],
      summonCooldown: 0,
      justSummoned: true, // Skip first turn
    };

    this.state.enemies.push(enemy);
    // Store definition with base ID for intent lookup
    if (!this.enemyDefinitions.has(definition.id)) {
      this.enemyDefinitions.set(definition.id, definition);
    }
    this.setEnemyIntent(enemy);
    this.emit(CombatEventType.ENEMY_SUMMONED, { enemy });
  }

  // Track dead minions for resurrection
  private deadMinions: { definition: EnemyDefinition; maxHp: number }[] = [];

  // Register a minion definition for potential summoning
  registerMinionDefinition(definition: EnemyDefinition): void {
    this.enemyDefinitions.set(definition.id, definition);
  }

  // Card playing
  canPlayCard(cardIndex: number): boolean {
    if (!this.canPlayerAct()) return false;
    const card = this.state.player.hand[cardIndex];
    if (!card) return false;
    // Cannot play unplayable cards (Curses)
    if (card.unplayable) return false;
    // Check Resolve cost
    if (card.cost > this.state.player.resolve) return false;
    // Check HP cost (cannot play if it would kill you)
    if (card.hpCost && card.hpCost >= this.state.player.currentHp) return false;
    // Check requiresVow (Oathsworn mechanic)
    if (card.requiresVow && !this.state.player.activeVow) return false;
    return true;
  }

  getPlayableCards(): number[] {
    return this.state.player.hand
      .map((_, index) => (this.canPlayCard(index) ? index : -1))
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

    // Check unplayable (Curses)
    if (card.unplayable) {
      return { success: false, message: 'This card cannot be played', log: [] };
    }

    if (card.cost > this.state.player.resolve) {
      return { success: false, message: 'Insufficient Resolve', log: [] };
    }

    // Check HP cost
    if (card.hpCost && card.hpCost >= this.state.player.currentHp) {
      return { success: false, message: 'Not enough HP to pay the cost', log: [] };
    }

    // Check requiresVow (Oathsworn mechanic)
    if (card.requiresVow && !this.state.player.activeVow) {
      return { success: false, message: 'Requires an active Vow', log: [] };
    }

    // Check Bound status - cannot play Attack cards
    const boundEffect = this.state.player.statusEffects.find(e => e.type === StatusType.BOUND);
    if (boundEffect && card.type === CardType.ATTACK) {
      return { success: false, message: 'You are Bound and cannot play Attack cards!', log: [] };
    }

    const target = this.state.enemies[targetIndex];
    if (this.requiresTarget(card) && (!target || target.currentHp <= 0)) {
      return { success: false, message: 'Invalid target', log: [] };
    }

    // Deduct Resolve cost
    this.state.player.resolve -= card.cost;
    this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, { resolve: this.state.player.resolve });

    // Pay HP cost if applicable
    if (card.hpCost) {
      this.state.player.currentHp -= card.hpCost;
      this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
      this.log(`Paid ${card.hpCost} HP to play ${card.name}`);
    }

    // Remove from hand
    this.state.player.hand.splice(cardIndex, 1);

    // Execute effects
    const log: string[] = [];

    // Handle Whimsy cards (Fey-Touched mechanic)
    if (card.whimsy && card.whimsy.length > 0) {
      const whimsyResult = this.resolveWhimsy(card.whimsy, target, card.type === CardType.ATTACK);
      log.push(...whimsyResult);
    } else {
      // Normal effect execution
      for (const effect of card.effects) {
        const result = this.executeEffect(effect, target, card.type === CardType.ATTACK);
        if (result) log.push(result);
      }
    }

    // Handle vow activation (Oathsworn mechanic)
    if (card.activatesVow) {
      const vowResult = this.activateVow(card.activatesVow);
      if (vowResult) log.push(vowResult);
    }

    // Handle Price application (Bargainer mechanic)
    if (card.price) {
      const priceResult = this.applyPrice(card.price, card.id);
      if (priceResult) log.push(priceResult);
    }

    // Move to discard (or exhaust for Power cards or cards with exhaust property)
    if (card.type === CardType.POWER || card.exhaust || card.exhaustOnDiscard) {
      // Powers, exhaust cards, and exhaustOnDiscard cards don't go to discard
      this.state.player.exhaustPile.push(card);
    } else {
      this.state.player.discardPile.push(card);
    }

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

  private executeEffect(effect: { type: EffectType; amount: number; cardId?: string; perStack?: number; minionId?: string; multiplier?: number }, target?: Enemy, isAttack: boolean = false): string | null {
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
          // Apply Vow damage bonus (Oathsworn)
          if (isAttack && this.state.player.activeVow?.bonus.type === VowBonusType.DAMAGE_BOOST) {
            damageAmount += this.state.player.activeVow.bonus.amount;
          }
          // Apply Divine Form bonus (Celestial)
          if (isAttack && this.hasDivineForm()) {
            damageAmount += 1;
          }
          const result = this.dealDamageToEnemy(target, damageAmount);
          // Consume a Vow charge if this is an attack
          if (isAttack) {
            this.consumeVowCharge();
          }
          return result;
        }
        return null;
      }

      case EffectType.DAMAGE_ALL: {
        const aliveEnemies = this.state.enemies.filter(e => e.currentHp > 0);
        let damageAmount = effect.amount;
        // Apply Vow damage bonus for AoE attacks too
        if (isAttack && this.state.player.activeVow?.bonus.type === VowBonusType.DAMAGE_BOOST) {
          damageAmount += this.state.player.activeVow.bonus.amount;
        }
        // Apply Divine Form bonus (Celestial)
        if (isAttack && this.hasDivineForm()) {
          damageAmount += 1;
        }
        for (const enemy of aliveEnemies) {
          this.dealDamageToEnemy(enemy, damageAmount);
        }
        // Consume a Vow charge if this is an attack
        if (isAttack) {
          this.consumeVowCharge();
        }
        return `Dealt ${damageAmount} damage to all enemies`;
      }

      case EffectType.BLOCK: {
        // Check if gaining block would break a Vow
        if (this.state.player.activeVow?.restriction.type === VowRestrictionType.NO_BLOCK) {
          this.breakVow('Gained block while under ' + this.state.player.activeVow.name);
        }
        this.state.player.block += effect.amount;
        this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
        return `Gained ${effect.amount} block`;
      }

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

      // Diabolist effects
      case EffectType.LOSE_HP: {
        this.state.player.currentHp = Math.max(0, this.state.player.currentHp - effect.amount);
        this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
        this.emit(CombatEventType.PLAYER_DAMAGED, { damage: effect.amount, blocked: 0, fortifyAbsorbed: 0, hpDamage: effect.amount });
        return `Lost ${effect.amount} HP`;
      }

      case EffectType.ADD_CARD_TO_DECK: {
        if (!effect.cardId) return null;
        const cardDef = getCardById(effect.cardId);
        if (!cardDef) return null;
        const newCard = this.createCardInstance(cardDef);
        // Shuffle into draw pile
        this.state.player.drawPile.push(newCard);
        this.state.player.drawPile = this.shuffle(this.state.player.drawPile);
        // Track Soul Debt for curses
        if (cardDef.type === CardType.CURSE) {
          this.state.player.soulDebt++;
          this.emit(CombatEventType.PLAYER_SOUL_DEBT_CHANGED, { soulDebt: this.state.player.soulDebt });
        }
        this.emit(CombatEventType.CARD_ADDED, { card: newCard, destination: 'deck' });
        return `Added ${cardDef.name} to deck`;
      }

      case EffectType.ADD_CARD_TO_DISCARD: {
        if (!effect.cardId) return null;
        const cardDef = getCardById(effect.cardId);
        if (!cardDef) return null;
        const newCard = this.createCardInstance(cardDef);
        this.state.player.discardPile.push(newCard);
        // Track Soul Debt for curses
        if (cardDef.type === CardType.CURSE) {
          this.state.player.soulDebt++;
          this.emit(CombatEventType.PLAYER_SOUL_DEBT_CHANGED, { soulDebt: this.state.player.soulDebt });
        }
        this.emit(CombatEventType.CARD_ADDED, { card: newCard, destination: 'discard' });
        return `Added ${cardDef.name} to discard pile`;
      }

      case EffectType.ADD_CARD_TO_HAND: {
        if (!effect.cardId) return null;
        const cardDef = getCardById(effect.cardId);
        if (!cardDef) return null;
        const newCard = this.createCardInstance(cardDef);
        this.state.player.hand.push(newCard);
        // Track Soul Debt for curses
        if (cardDef.type === CardType.CURSE) {
          this.state.player.soulDebt++;
          this.emit(CombatEventType.PLAYER_SOUL_DEBT_CHANGED, { soulDebt: this.state.player.soulDebt });
        }
        this.emit(CombatEventType.CARD_ADDED, { card: newCard, destination: 'hand' });
        return `Added ${cardDef.name} to hand`;
      }

      // Fey-Touched effects
      case EffectType.GAIN_LUCK: {
        const gainAmount = Math.min(effect.amount, this.state.player.maxLuck - this.state.player.luck);
        this.state.player.luck += gainAmount;
        this.emit(CombatEventType.LUCK_CHANGED, { luck: this.state.player.luck });
        return `Gained ${gainAmount} Luck`;
      }

      // Extended Diabolist effects (Card Pool)
      case EffectType.GAIN_RESOLVE: {
        this.state.player.resolve += effect.amount;
        this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, { resolve: this.state.player.resolve });
        return `Gained ${effect.amount} Resolve`;
      }

      case EffectType.DAMAGE_PER_CURSE: {
        const curseCount = this.countCursesInDeck();
        const damage = curseCount * effect.amount;
        if (target && damage > 0) {
          return this.dealDamageToEnemy(target, damage);
        }
        return `Dealt ${damage} damage (${curseCount} curses × ${effect.amount})`;
      }

      case EffectType.BLOCK_PER_CURSE: {
        const curseCount = this.countCursesInDeck();
        // Special case for Debt Collector: amount 0 means "6 if 5+ curses"
        if (effect.amount === 0 && curseCount >= 5) {
          this.state.player.block += 6;
          this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
          return `Gained 6 bonus block (5+ curses)`;
        }
        const blockGain = curseCount * effect.amount;
        this.state.player.block += blockGain;
        this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
        return `Gained ${blockGain} block (${curseCount} curses × ${effect.amount})`;
      }

      case EffectType.EXHAUST_CURSE_FROM_HAND: {
        const curseIndex = this.state.player.hand.findIndex(c => c.type === CardType.CURSE);
        if (curseIndex === -1) {
          return 'No curse to exhaust';
        }
        const curse = this.state.player.hand.splice(curseIndex, 1)[0];
        this.state.player.exhaustPile.push(curse);
        return `Exhausted ${curse.name}`;
      }

      case EffectType.DAMAGE_IF_LOW_HP: {
        if (!target) return null;
        const hpPercent = this.state.player.currentHp / this.state.player.maxHp;
        const damage = hpPercent < 0.5 ? effect.amount : 10;
        return this.dealDamageToEnemy(target, damage);
      }

      case EffectType.LOSE_MAX_HP: {
        this.state.player.maxHp = Math.max(1, this.state.player.maxHp - effect.amount);
        if (this.state.player.currentHp > this.state.player.maxHp) {
          this.state.player.currentHp = this.state.player.maxHp;
        }
        this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp, maxHp: this.state.player.maxHp });
        return `Lost ${effect.amount} max HP`;
      }

      case EffectType.HEAL_EQUAL_DAMAGE: {
        if (!target) return null;
        // Deal damage and heal for that amount
        const damageDealt = Math.min(effect.amount, target.currentHp + target.block);
        this.dealDamageToEnemy(target, effect.amount);
        const heal = Math.min(damageDealt, this.state.player.maxHp - this.state.player.currentHp);
        this.state.player.currentHp += heal;
        this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
        return `Dealt ${effect.amount} damage and healed ${heal} HP`;
      }

      case EffectType.CONDITIONAL_HEAL: {
        // Mark that heal should trigger if enemy dies this turn
        // This is tracked and processed later when enemy dies
        this.pendingConditionalHeal = effect.amount;
        return `Will heal ${effect.amount} HP if an enemy dies`;
      }

      case EffectType.DRAW_CARDS: {
        this.drawCards(effect.amount);
        return `Drew ${effect.amount} cards`;
      }

      // Oathsworn Card Pool effects
      case EffectType.DAMAGE_IF_VOW: {
        if (!this.state.player.activeVow) return null;
        if (target) {
          return this.dealDamageToEnemy(target, effect.amount);
        }
        return null;
      }

      case EffectType.BLOCK_PER_VOW_TURN: {
        if (!this.state.player.activeVow?.currentCharges) return null;
        // How many turns the Vow has been active = original charges - current charges
        const turnsActive = (this.state.player.activeVow.charges || 0) - this.state.player.activeVow.currentCharges;
        const blockGain = turnsActive * effect.amount;
        if (blockGain > 0) {
          this.state.player.block += blockGain;
          this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
          return `Gained ${blockGain} block (${turnsActive} turns × ${effect.amount})`;
        }
        return null;
      }

      case EffectType.EXTEND_VOW: {
        if (!this.state.player.activeVow) {
          return 'No active Vow to extend';
        }
        if (this.state.player.activeVow.currentCharges !== undefined) {
          this.state.player.activeVow.currentCharges += effect.amount;
          return `Extended Vow by ${effect.amount} charge(s)`;
        }
        return null;
      }

      case EffectType.END_VOW_SAFE: {
        if (!this.state.player.activeVow) {
          return 'No active Vow to end';
        }
        const vowName = this.state.player.activeVow.name;
        this.state.player.activeVow = null;
        this.emit(CombatEventType.VOW_EXPIRED, { safe: true });
        return `${vowName} ended safely`;
      }

      case EffectType.CONSUME_VOW_CHARGE: {
        if (!this.state.player.activeVow?.currentCharges) {
          return 'No Vow charges to consume';
        }
        this.consumeVowCharge();
        return `Consumed ${effect.amount} Vow charge(s)`;
      }

      case EffectType.DAMAGE_PER_VOW_ACTIVATED: {
        const vowsActivated = this.state.player.vowsActivatedThisCombat || 0;
        const damage = vowsActivated * effect.amount;
        if (target && damage > 0) {
          return this.dealDamageToEnemy(target, damage);
        }
        return `Dealt ${damage} damage (${vowsActivated} vows × ${effect.amount})`;
      }

      case EffectType.HEAL_PER_VOW_CHARGE: {
        const charges = this.state.player.activeVow?.currentCharges || 0;
        const healAmount = charges * effect.amount;
        // End the Vow
        if (this.state.player.activeVow) {
          this.emit(CombatEventType.VOW_EXPIRED, { safe: true });
          this.state.player.activeVow = null;
        }
        if (healAmount > 0) {
          const heal = Math.min(healAmount, this.state.player.maxHp - this.state.player.currentHp);
          this.state.player.currentHp += heal;
          this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
          return `Healed ${heal} HP (${charges} charges × ${effect.amount})`;
        }
        return 'Vow ended, no healing';
      }

      case EffectType.BLOCK_IF_NO_VOW: {
        if (this.state.player.activeVow) return null;
        this.state.player.block += effect.amount;
        this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
        return `Gained ${effect.amount} bonus block (no Vow active)`;
      }

      case EffectType.APPLY_BOUND: {
        if (target) {
          // Apply Bound status to enemy - prevents their attack card equivalent
          const existingBound = target.statusEffects.find(e => e.type === StatusType.BOUND);
          if (existingBound) {
            existingBound.duration = Math.max(existingBound.duration || 0, effect.amount);
          } else {
            target.statusEffects.push({
              type: StatusType.BOUND,
              amount: 1,
              duration: effect.amount,
            });
          }
          return `Applied Bound to ${target.name} for ${effect.amount} turn(s)`;
        }
        return null;
      }

      case EffectType.RESET_VOW_CHARGES: {
        // This is handled specially after damage - mark that we want to reset if kills
        this.pendingVowReset = true;
        return null;
      }

      // Fey-Touched Card Pool effects
      case EffectType.DAMAGE_RANDOM_ENEMY: {
        const aliveEnemies = this.state.enemies.filter(e => e.currentHp > 0);
        if (aliveEnemies.length === 0) return null;
        const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        return this.dealDamageToEnemy(randomEnemy, effect.amount);
      }

      case EffectType.BLOCK_IF_LUCK: {
        if (this.state.player.luck > 5) {
          this.state.player.block += effect.amount;
          this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
          return `Gained ${effect.amount} bonus block (Luck > 5)`;
        }
        return null;
      }

      case EffectType.SPEND_ALL_LUCK: {
        const luckSpent = this.state.player.luck;
        if (luckSpent === 0) return 'No Luck to spend';

        this.state.player.luck = 0;
        this.emit(CombatEventType.LUCK_CHANGED, { luck: 0 });

        // Deal damage and gain block per Luck spent
        const damageAmount = luckSpent * effect.amount;
        const blockAmount = luckSpent * effect.amount;

        this.state.player.block += blockAmount;
        this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });

        // Deal damage to selected target
        if (target) {
          this.dealDamageToEnemy(target, damageAmount);
        }

        return `Spent ${luckSpent} Luck for ${damageAmount} damage and ${blockAmount} block`;
      }

      case EffectType.SET_GUARANTEED_BEST: {
        this.state.player.guaranteedBest = true;
        return 'Next Whimsy is guaranteed best outcome';
      }

      // Celestial effects
      case EffectType.GAIN_RADIANCE: {
        const previousRadiance = this.state.player.radiance;
        this.state.player.radiance = Math.min(
          this.state.player.radiance + effect.amount,
          this.state.player.maxRadiance
        );
        this.emit(CombatEventType.RADIANCE_CHANGED, { radiance: this.state.player.radiance });

        // Check for Divine Form activation at max Radiance
        if (previousRadiance < this.state.player.maxRadiance && this.state.player.radiance >= this.state.player.maxRadiance) {
          this.activateDivineForm();
        }

        return `Gained ${effect.amount} Radiance (${this.state.player.radiance}/${this.state.player.maxRadiance})`;
      }

      case EffectType.CONSUME_RADIANCE_DAMAGE: {
        if (!target) return null;
        const radianceConsumed = this.state.player.radiance;
        const bonusDamage = radianceConsumed * (effect.perStack || 0);

        // Deactivate Divine Form if active (radiance dropping below max)
        if (radianceConsumed > 0 && this.state.player.radiance >= this.state.player.maxRadiance) {
          this.deactivateDivineForm();
        }

        this.state.player.radiance = 0;
        this.emit(CombatEventType.RADIANCE_CHANGED, { radiance: 0 });

        if (bonusDamage > 0) {
          this.dealDamageToEnemy(target, bonusDamage);
          return `Consumed ${radianceConsumed} Radiance for ${bonusDamage} bonus damage`;
        }
        return `Consumed ${radianceConsumed} Radiance (no bonus damage)`;
      }

      // Summoner effects
      case EffectType.SUMMON_MINION: {
        if (!effect.minionId) return null;
        if (this.state.player.minions.length >= MAX_MINIONS) {
          return 'Cannot summon - maximum minions reached (4)';
        }
        const minionDef = getMinionById(effect.minionId);
        if (!minionDef) return null;

        const minion = this.createMinionInstance(minionDef);
        this.state.player.minions.push(minion);
        this.emit(CombatEventType.MINION_SUMMONED, { minion });
        this.log(`Summoned ${minion.name}!`);
        return `Summoned ${minion.name} (${minion.currentHp} HP, ${minion.attackDamage} attack)`;
      }

      case EffectType.BLOCK_ALL_MINIONS: {
        if (this.state.player.minions.length === 0) {
          return 'No minions to shield';
        }
        for (const minion of this.state.player.minions) {
          minion.block += effect.amount;
          this.emit(CombatEventType.MINION_BLOCK_CHANGED, {
            minionId: minion.instanceId,
            block: minion.block,
          });
        }
        return `All minions gained ${effect.amount} block`;
      }

      case EffectType.MINIONS_ATTACK: {
        if (this.state.player.minions.length === 0) {
          return 'No minions to attack';
        }
        const logs: string[] = [];
        for (const minion of this.state.player.minions) {
          const attackLog = this.minionAttack(minion);
          logs.push(attackLog);
        }
        return logs.join(', ');
      }

      case EffectType.GAIN_BLOCK_FROM_MINION_HP: {
        const totalMinionHp = this.state.player.minions.reduce(
          (sum, m) => sum + m.currentHp,
          0
        );
        if (totalMinionHp === 0) {
          return 'No minions - no block gained';
        }
        this.state.player.block += totalMinionHp;
        this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
        return `Gained ${totalMinionHp} block from minion HP`;
      }

      // Bargainer effects
      case EffectType.GAIN_FAVOR: {
        const previousFavor = this.state.player.favor;
        this.state.player.favor = Math.min(
          this.state.player.favor + effect.amount,
          MAX_FAVOR
        );
        this.emit(CombatEventType.FAVOR_CHANGED, { favor: this.state.player.favor });
        return `Gained ${this.state.player.favor - previousFavor} Favor (${this.state.player.favor}/${MAX_FAVOR})`;
      }

      case EffectType.DAMAGE_PER_PRICE: {
        if (!target) return null;
        const priceCount = this.state.player.activePrices.length;
        const multiplier = effect.multiplier || 1;
        const damage = priceCount * multiplier;
        if (damage > 0) {
          return this.dealDamageToEnemy(target, damage);
        }
        return `Dealt ${damage} damage (${priceCount} prices × ${multiplier})`;
      }

      case EffectType.REMOVE_ALL_PRICES: {
        const priceCount = this.state.player.activePrices.length;
        if (priceCount === 0) {
          return 'No Prices to remove';
        }
        // Restore RESOLVE_TAX effects
        for (const price of this.state.player.activePrices) {
          if (price.type === PriceType.RESOLVE_TAX) {
            this.state.player.maxResolve = Math.min(
              this.state.player.maxResolve + price.amount,
              this.state.player.baseMaxResolve
            );
          }
        }
        this.state.player.activePrices = [];
        this.emit(CombatEventType.PRICE_REMOVED, { allPrices: true });
        this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, { resolve: this.state.player.resolve, maxResolve: this.state.player.maxResolve });
        return `Removed all ${priceCount} Prices`;
      }

      default:
        return null;
    }
  }

  // Track pending conditional heal (Grim Harvest)
  private pendingConditionalHeal: number = 0;
  // Track pending vow reset (Celestial Chain)
  private pendingVowReset: boolean = false;
  // Price ID counter (Bargainer)
  private priceIdCounter = 0;

  // Bargainer Price system methods
  private applyPrice(priceDef: { type: PriceType; amount: number }, sourceCardId: string): string {
    const price: Price = {
      id: `price_${this.priceIdCounter++}`,
      type: priceDef.type,
      amount: priceDef.amount,
      stacks: priceDef.type === PriceType.DEBT_STACK ? priceDef.amount : 0,
      sourceCardId,
    };

    switch (priceDef.type) {
      case PriceType.HP_DRAIN:
        // Add to active prices, will drain HP at start of each turn
        this.state.player.activePrices.push(price);
        this.emit(CombatEventType.PRICE_ADDED, { price });
        return `PRICE: Lose ${price.amount} HP per turn`;

      case PriceType.RESOLVE_TAX:
        // Immediately reduce max Resolve
        this.state.player.activePrices.push(price);
        this.state.player.maxResolve = Math.max(1, this.state.player.maxResolve - price.amount);
        if (this.state.player.resolve > this.state.player.maxResolve) {
          this.state.player.resolve = this.state.player.maxResolve;
        }
        this.emit(CombatEventType.PRICE_ADDED, { price });
        this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, {
          resolve: this.state.player.resolve,
          maxResolve: this.state.player.maxResolve
        });
        return `PRICE: -${price.amount} max Resolve`;

      case PriceType.CURSE_CARDS:
        // Add Demonic Debt curses immediately
        for (let i = 0; i < price.amount; i++) {
          const curseCardDef = getCardById('demonic_debt');
          if (curseCardDef) {
            const newCurse = this.createCardInstance(curseCardDef);
            this.state.player.drawPile.push(newCurse);
            this.emit(CombatEventType.CARD_ADDED, { card: newCurse, destination: 'deck' });
          }
        }
        this.state.player.drawPile = this.shuffle(this.state.player.drawPile);
        this.emit(CombatEventType.PRICE_ADDED, { price });
        return `PRICE: Added ${price.amount} Demonic Debt(s) to deck`;

      case PriceType.DEBT_STACK:
        // Add to existing debt stacks or create new
        const existingDebt = this.state.player.activePrices.find(
          p => p.type === PriceType.DEBT_STACK
        );
        if (existingDebt) {
          existingDebt.stacks += price.amount;
          this.emit(CombatEventType.PRICE_ADDED, { price: existingDebt });

          // Check threshold
          if (existingDebt.stacks >= DEBT_STACK_THRESHOLD) {
            const excess = existingDebt.stacks - DEBT_STACK_THRESHOLD;
            existingDebt.stacks = excess;
            this.state.player.currentHp = Math.max(0, this.state.player.currentHp - DEBT_STACK_DAMAGE);
            this.emit(CombatEventType.DEBT_THRESHOLD_TRIGGERED, { damage: DEBT_STACK_DAMAGE });
            this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
            this.log(`Debt threshold reached! Took ${DEBT_STACK_DAMAGE} damage!`);
            return `PRICE: Debt stacks at ${DEBT_STACK_THRESHOLD}! Took ${DEBT_STACK_DAMAGE} damage!`;
          }
          return `PRICE: Debt stacks now at ${existingDebt.stacks}/${DEBT_STACK_THRESHOLD}`;
        } else {
          this.state.player.activePrices.push(price);
          this.emit(CombatEventType.PRICE_ADDED, { price });
          return `PRICE: Debt stacks at ${price.stacks}/${DEBT_STACK_THRESHOLD}`;
        }
    }
  }

  private processPricesAtTurnStart(): string[] {
    const log: string[] = [];

    for (const price of this.state.player.activePrices) {
      if (price.type === PriceType.HP_DRAIN) {
        this.state.player.currentHp = Math.max(0, this.state.player.currentHp - price.amount);
        this.emit(CombatEventType.PRICE_TRIGGERED, { price });
        this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
        log.push(`Price: Lost ${price.amount} HP`);

        // Check for death
        if (this.state.player.currentHp <= 0) {
          break;
        }
      }
    }

    return log;
  }

  // Spend Favor to remove a Price
  spendFavorToRemovePrice(priceId: string): { success: boolean; message: string } {
    const priceIndex = this.state.player.activePrices.findIndex(p => p.id === priceId);
    if (priceIndex === -1) {
      return { success: false, message: 'Price not found' };
    }

    const price = this.state.player.activePrices[priceIndex];
    const favorCost = this.getFavorCostForPrice(price);

    if (this.state.player.favor < favorCost) {
      return { success: false, message: `Need ${favorCost} Favor, have ${this.state.player.favor}` };
    }

    // Spend Favor
    this.state.player.favor -= favorCost;
    this.emit(CombatEventType.FAVOR_CHANGED, { favor: this.state.player.favor });

    // Remove the Price
    this.state.player.activePrices.splice(priceIndex, 1);

    // Restore RESOLVE_TAX if applicable
    if (price.type === PriceType.RESOLVE_TAX) {
      this.state.player.maxResolve = Math.min(
        this.state.player.maxResolve + price.amount,
        this.state.player.baseMaxResolve
      );
      this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, {
        resolve: this.state.player.resolve,
        maxResolve: this.state.player.maxResolve
      });
    }

    this.emit(CombatEventType.PRICE_REMOVED, { price });
    this.log(`Spent ${favorCost} Favor to remove ${this.getPriceDescription(price)}`);

    return { success: true, message: `Removed ${this.getPriceDescription(price)}` };
  }

  private getFavorCostForPrice(price: Price): number {
    // Cost scales with Price intensity
    switch (price.type) {
      case PriceType.HP_DRAIN:
        return price.amount * 2; // 2 Favor per HP/turn
      case PriceType.RESOLVE_TAX:
        return price.amount * 3; // 3 Favor per Resolve
      case PriceType.DEBT_STACK:
        return Math.ceil(price.stacks / 2); // 1 Favor per 2 stacks
      default:
        return 2;
    }
  }

  private getPriceDescription(price: Price): string {
    switch (price.type) {
      case PriceType.HP_DRAIN:
        return `HP Drain (${price.amount}/turn)`;
      case PriceType.RESOLVE_TAX:
        return `Resolve Tax (-${price.amount})`;
      case PriceType.DEBT_STACK:
        return `Debt Stacks (${price.stacks})`;
      default:
        return 'Price';
    }
  }

  // Divine Form methods (Celestial)
  private activateDivineForm(): void {
    const existingDivineForm = this.state.player.statusEffects.find(
      e => e.type === StatusType.DIVINE_FORM
    );
    if (!existingDivineForm) {
      this.state.player.statusEffects.push({
        type: StatusType.DIVINE_FORM,
        amount: 1, // +1 damage to all attacks
      });
      this.emit(CombatEventType.DIVINE_FORM_ACTIVATED, { radiance: this.state.player.radiance });
      this.log('Divine Form activated! +1 damage to all attacks.');
    }
  }

  private deactivateDivineForm(): void {
    const index = this.state.player.statusEffects.findIndex(
      e => e.type === StatusType.DIVINE_FORM
    );
    if (index !== -1) {
      this.state.player.statusEffects.splice(index, 1);
      this.emit(CombatEventType.DIVINE_FORM_DEACTIVATED, {});
      this.log('Divine Form deactivated.');
    }
  }

  private hasDivineForm(): boolean {
    return this.state.player.statusEffects.some(e => e.type === StatusType.DIVINE_FORM);
  }

  // Minion system methods (Summoner)
  private minionInstanceCounter = 0;

  private createMinionInstance(minionDef: { id: string; name: string; maxHp: number; attackDamage: number }): Minion {
    return {
      id: minionDef.id,
      instanceId: `${minionDef.id}_${this.minionInstanceCounter++}`,
      name: minionDef.name,
      maxHp: minionDef.maxHp,
      currentHp: minionDef.maxHp,
      block: 0,
      attackDamage: minionDef.attackDamage,
      statusEffects: [],
    };
  }

  private minionAttack(minion: Minion): string {
    const aliveEnemies = this.state.enemies.filter(e => e.currentHp > 0);
    if (aliveEnemies.length === 0) {
      return `${minion.name} has no target`;
    }

    // Attack random enemy
    const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    this.emit(CombatEventType.MINION_ATTACKED, {
      minionId: minion.instanceId,
      targetId: target.id,
      damage: minion.attackDamage,
    });

    this.dealDamageToEnemy(target, minion.attackDamage);
    return `${minion.name} attacked ${target.name} for ${minion.attackDamage}`;
  }

  private minionAutoAttackPhase(): string[] {
    const log: string[] = [];
    for (const minion of this.state.player.minions) {
      const attackLog = this.minionAttack(minion);
      log.push(attackLog);
    }
    return log;
  }

  private dealDamageToMinion(minion: Minion, damage: number): { blocked: number; hpDamage: number } {
    let remaining = damage;

    // Block absorbs first
    const blocked = Math.min(remaining, minion.block);
    minion.block -= blocked;
    remaining -= blocked;

    // HP takes remainder
    const hpDamage = remaining;
    minion.currentHp = Math.max(0, minion.currentHp - hpDamage);

    this.emit(CombatEventType.MINION_DAMAGED, {
      minionId: minion.instanceId,
      damage,
      blocked,
      hpDamage,
      remainingHp: minion.currentHp,
    });

    if (minion.currentHp <= 0) {
      // Remove dead minion
      this.state.player.minions = this.state.player.minions.filter(
        m => m.instanceId !== minion.instanceId
      );
      this.emit(CombatEventType.MINION_DIED, { minion });
      this.log(`${minion.name} was destroyed!`);
    }

    return { blocked, hpDamage };
  }

  private dealDamageToPlayerOrMinion(damage: number): { targetName: string; blocked: number; hpDamage: number } {
    // If minions exist, target a random minion
    if (this.state.player.minions.length > 0) {
      const targetIndex = Math.floor(Math.random() * this.state.player.minions.length);
      const minion = this.state.player.minions[targetIndex];
      const result = this.dealDamageToMinion(minion, damage);
      return { targetName: minion.name, blocked: result.blocked, hpDamage: result.hpDamage };
    }

    // Otherwise target player
    const result = this.dealDamageToPlayer(damage);
    return { targetName: 'you', blocked: result.blocked, hpDamage: result.hpDamage };
  }

  // Count curses in the entire deck (hand + draw + discard)
  private countCursesInDeck(): number {
    const allCards = [
      ...this.state.player.hand,
      ...this.state.player.drawPile,
      ...this.state.player.discardPile,
    ];
    return allCards.filter(c => c.type === CardType.CURSE).length;
  }

  private instanceCounter = 0;

  private createCardInstance(cardDef: CardDefinition): Card {
    return {
      ...cardDef,
      instanceId: `${cardDef.id}_${this.instanceCounter++}`,
    };
  }

  // Vow system methods (Oathsworn)
  private activateVow(vowId: string): string | null {
    const vowDef = OATHSWORN_VOWS[vowId];
    if (!vowDef) return null;

    // Create a new vow instance with current charges
    const vow: Vow = {
      ...vowDef,
      currentCharges: vowDef.charges,
    };

    this.state.player.activeVow = vow;
    // Track vows activated this combat
    this.state.player.vowsActivatedThisCombat = (this.state.player.vowsActivatedThisCombat || 0) + 1;
    this.emit(CombatEventType.VOW_ACTIVATED, { vow });
    this.log(`${vow.name} activated: ${vow.restriction.description}`);
    return `Activated ${vow.name}`;
  }

  private breakVow(reason: string): void {
    const vow = this.state.player.activeVow;
    if (!vow) return;

    this.emit(CombatEventType.VOW_BROKEN, { vow, reason });
    this.log(`${vow.name} broken: ${reason}`);

    // Apply break penalty
    if (vow.breakPenalty) {
      for (const effect of vow.breakPenalty) {
        this.executeEffect(effect, undefined, false);
      }
    }

    this.state.player.activeVow = null;
  }

  private consumeVowCharge(): void {
    const vow = this.state.player.activeVow;
    if (!vow || vow.currentCharges === undefined) return;

    vow.currentCharges--;
    this.emit(CombatEventType.VOW_CHARGE_USED, {
      vow,
      remainingCharges: vow.currentCharges,
    });

    // Check if vow expires naturally (no penalty)
    if (vow.currentCharges <= 0) {
      this.emit(CombatEventType.VOW_EXPIRED, { vow });
      this.log(`${vow.name} expired naturally`);
      this.state.player.activeVow = null;
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
      // Track dead minions for potential resurrection (not bosses)
      if (!enemy.isBoss) {
        const baseId = enemy.id.replace(/_\d+$/, '');
        const definition = this.enemyDefinitions.get(baseId) || this.enemyDefinitions.get(enemy.id);
        if (definition) {
          this.deadMinions.push({ definition, maxHp: enemy.maxHp });
        }
      }
      // Handle conditional heal (Grim Harvest)
      if (this.pendingConditionalHeal > 0) {
        const heal = Math.min(this.pendingConditionalHeal, this.state.player.maxHp - this.state.player.currentHp);
        this.state.player.currentHp += heal;
        this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
        this.log(`Grim Harvest: Healed ${heal} HP`);
        this.pendingConditionalHeal = 0;
      }
      // Handle pending Vow reset (Celestial Chain)
      if (this.pendingVowReset && this.state.player.activeVow) {
        this.state.player.activeVow.currentCharges = this.state.player.activeVow.charges;
        this.log(`Vow charges reset to ${this.state.player.activeVow.charges}!`);
        this.pendingVowReset = false;
      }
    } else {
      // Check for phase transitions when damage is dealt
      this.checkPhaseTransition(enemy);
    }

    return `Dealt ${damage} damage to ${enemy.name}`;
  }

  // Whimsy system (Fey-Touched)
  private resolveWhimsy(whimsy: WhimsyEffect[], target: Enemy | undefined, isAttack: boolean): string[] {
    let selectedIndex = 0;

    // Check for guaranteed best outcome (Luck Surge)
    if (this.state.player.guaranteedBest) {
      // Find the "best" outcome - for now, take the one with highest total effect amount
      selectedIndex = this.getBestWhimsyIndex(whimsy);
      this.state.player.guaranteedBest = false;
      this.log('Luck Surge: Guaranteed best outcome!');
    } else {
      // Calculate total weight
      const totalWeight = whimsy.reduce((sum, w) => sum + w.weight, 0);

      // Select outcome based on weights
      let roll = Math.random() * totalWeight;
      for (let i = 0; i < whimsy.length; i++) {
        roll -= whimsy[i].weight;
        if (roll <= 0) {
          selectedIndex = i;
          break;
        }
      }
    }

    const selected = whimsy[selectedIndex];
    this.emit(CombatEventType.WHIMSY_RESOLVED, {
      selected,
      allOutcomes: whimsy,
      selectedIndex,
    });

    this.log(`Whimsy: ${selected.description}`);

    // Execute the selected effects
    const log: string[] = [];
    for (const effect of selected.effects) {
      const result = this.executeEffect(effect, target, isAttack);
      if (result) log.push(result);
    }

    return log;
  }

  // Find the best Whimsy outcome based on effect amounts
  private getBestWhimsyIndex(whimsy: WhimsyEffect[]): number {
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < whimsy.length; i++) {
      const outcome = whimsy[i];
      // Score is sum of positive amounts minus negative effects (like LOSE_HP)
      let score = 0;
      for (const effect of outcome.effects) {
        if (effect.type === EffectType.LOSE_HP) {
          score -= effect.amount;
        } else {
          score += effect.amount;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    return bestIndex;
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

    // Discard hand (separating exhaustOnDiscard cards)
    for (const card of this.state.player.hand) {
      if (card.exhaustOnDiscard) {
        this.state.player.exhaustPile.push(card);
      } else {
        this.state.player.discardPile.push(card);
      }
    }
    this.state.player.hand = [];

    // Minion auto-attack phase (Summoner mechanic)
    if (this.state.player.minions.length > 0) {
      const minionLogs = this.minionAutoAttackPhase();
      log.push(...minionLogs);

      // Check victory after minion attacks
      if (this.state.enemies.every((e) => e.currentHp <= 0)) {
        this.state.victory = true;
        this.state.gameOver = true;
        this.state.phase = CombatPhase.VICTORY;
        this.emit(CombatEventType.GAME_OVER, { victory: true });
        log.push('Victory!');
        return { log };
      }
    }

    // Reset minion block at end of turn
    for (const minion of this.state.player.minions) {
      minion.block = 0;
      this.emit(CombatEventType.MINION_BLOCK_CHANGED, { minionId: minion.instanceId, block: 0 });
    }

    // Enemy phase
    this.state.phase = CombatPhase.ENEMY_ACTION;
    this.emit(CombatEventType.PHASE_CHANGED, { phase: CombatPhase.ENEMY_ACTION });

    for (const enemy of this.state.enemies) {
      if (enemy.currentHp <= 0) continue;

      // Skip turn if just summoned (they act next turn)
      if (enemy.justSummoned) {
        enemy.justSummoned = false;
        log.push(`${enemy.name} is preparing...`);
        continue;
      }

      // Reset enemy block and untargetable at start of their turn
      enemy.block = 0;
      enemy.untargetable = false;
      this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: enemy.id, block: 0 });

      // Decrement summon cooldown
      if (enemy.summonCooldown > 0) {
        enemy.summonCooldown--;
      }

      const intent = enemy.intent as EnemyIntent;
      if (!intent) continue;

      // Apply might bonus to damage if applicable
      const mightBonus = enemy.might;
      enemy.might = 0; // Reset might after using

      switch (intent.intent) {
        case IntentType.ATTACK:
          if (intent.damage) {
            const totalDamage = intent.damage + mightBonus;
            const attackResult = this.dealDamageToPlayerOrMinion(totalDamage);
            log.push(`${enemy.name} dealt ${totalDamage} damage to ${attackResult.targetName} (${attackResult.hpDamage} to HP)`);
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
              const attackResult = this.dealDamageToPlayerOrMinion(totalDamage);
              log.push(`${enemy.name} dealt ${totalDamage} damage to ${attackResult.targetName} (${attackResult.hpDamage} to HP)`);
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

        case IntentType.SUMMON: {
          // Track this as a used ability if once-per-combat
          if (intent.oncePerCombat) {
            enemy.usedAbilities.push(intent.moveId);
          }

          // Count current minions
          const currentMinionCount = this.state.enemies.filter(
            e => e.currentHp > 0 && !e.isBoss && !e.isElite && e.id !== enemy.id
          ).length;
          const maxMinions = 3;
          const summonCooldownTurns = 5;

          // Handle resurrect minions
          if (intent.resurrectMinions && this.deadMinions.length > 0) {
            let summoned = 0;
            for (const deadMinion of this.deadMinions) {
              if (currentMinionCount + summoned >= maxMinions) {
                log.push(`${enemy.name} cannot summon more minions!`);
                break;
              }
              const resurrectedHp = Math.floor(deadMinion.maxHp * 0.5);
              this.addEnemy(deadMinion.definition, resurrectedHp);
              log.push(`${enemy.name} resurrected ${deadMinion.definition.name} at ${resurrectedHp} HP!`);
              summoned++;
            }
            this.deadMinions = [];
            if (summoned > 0) {
              enemy.summonCooldown = summonCooldownTurns;
            }
          }
          // Summon new enemies
          else if (intent.summons && intent.summons.length > 0) {
            let summoned = 0;
            for (const summonId of intent.summons) {
              if (currentMinionCount + summoned >= maxMinions) {
                log.push(`${enemy.name} cannot summon more minions!`);
                break;
              }
              const summonDef = this.enemyDefinitions.get(summonId);
              if (summonDef) {
                this.addEnemy(summonDef);
                log.push(`${enemy.name} summoned ${summonDef.name}!`);
                summoned++;
              }
            }
            if (summoned > 0) {
              enemy.summonCooldown = summonCooldownTurns;
            }
          }
          break;
        }

        case IntentType.CHARGING:
          // Start or continue charging
          if (!enemy.charging && intent.chargeTurns) {
            // Start charging - find the move definition
            const baseId = enemy.id.replace(/_\d+$/, '');
            const def = this.enemyDefinitions.get(baseId) || this.enemyDefinitions.get(enemy.id);
            if (def) {
              const moves = def.phases?.[enemy.phase]?.moves || def.moves;
              const chargeMove = moves.find(m => m.id === intent.moveId);
              if (chargeMove) {
                enemy.charging = {
                  turnsRemaining: intent.chargeTurns,
                  chargedMove: chargeMove,
                };
                log.push(`${enemy.name} is charging ${chargeMove.name}!`);
              }
            }
          } else if (enemy.charging) {
            enemy.charging.turnsRemaining--;
            if (enemy.charging.turnsRemaining <= 0) {
              // Execute the charged attack!
              const chargedDamage = enemy.charging.chargedMove.damage || 0;
              this.dealDamageToPlayer(chargedDamage + mightBonus);
              log.push(`${enemy.name} unleashes ${enemy.charging.chargedMove.name} for ${chargedDamage + mightBonus} damage!`);
              enemy.charging = undefined;
            } else {
              log.push(`${enemy.name} continues charging... (${enemy.charging.turnsRemaining} turn${enemy.charging.turnsRemaining > 1 ? 's' : ''} remaining)`);
            }
          }
          break;

        case IntentType.COMMAND:
          // Dark Command - all minions attack immediately
          if (intent.commandMinions) {
            const minions = this.state.enemies.filter(e => e.currentHp > 0 && e.id !== enemy.id && !e.isBoss);
            if (minions.length > 0) {
              log.push(`${enemy.name} commands all minions to attack!`);
              for (const minion of minions) {
                // Minions use a basic attack (6 damage default)
                const minionDamage = 6 + minion.might;
                minion.might = 0;
                const result = this.dealDamageToPlayer(minionDamage);
                log.push(`${minion.name} attacks for ${minionDamage} damage (${result.hpDamage} to HP)`);
                if (this.state.player.currentHp <= 0) break;
              }
            } else {
              log.push(`${enemy.name} commands... but has no minions!`);
            }
          }
          break;
      }

      // Handle attack with debuff (like Death Grip)
      if (intent.intent === IntentType.ATTACK && intent.debuffType && intent.debuffDuration) {
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
        log.push(`${enemy.name} applied ${intent.debuffType} for ${intent.debuffDuration} turn(s)`);
      }

      // Handle buff with block (like Unholy Vigor)
      if (intent.intent === IntentType.BUFF && intent.block) {
        enemy.block += intent.block;
        this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: enemy.id, block: enemy.block });
        log.push(`${enemy.name} gained ${intent.block} block`);
      }
      if (intent.intent === IntentType.BUFF && intent.buffType && intent.buffAmount) {
        enemy.might += intent.buffAmount;
        log.push(`${enemy.name} gained +${intent.buffAmount} Might!`);
      }

      // Set next intent
      this.setEnemyIntent(enemy);
    }

    // Reset player block AFTER all enemy attacks
    this.state.player.block = 0;
    this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: 0 });

    // Decrement status effect durations and remove expired ones
    this.state.player.statusEffects = this.state.player.statusEffects.filter(effect => {
      if (effect.duration !== undefined) {
        effect.duration--;
        if (effect.duration <= 0) {
          log.push(`${effect.type} wore off`);
          return false;
        }
      }
      return true;
    });

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

    log.push(`--- Turn ${this.state.turn} ---`);

    // Process Prices at start of player turn (Bargainer mechanic)
    if (this.state.player.activePrices.length > 0) {
      const priceLogs = this.processPricesAtTurnStart();
      log.push(...priceLogs);

      // Check defeat after Price processing
      if (this.state.player.currentHp <= 0) {
        this.state.gameOver = true;
        this.state.victory = false;
        this.state.phase = CombatPhase.DEFEAT;
        this.emit(CombatEventType.GAME_OVER, { victory: false });
        log.push('You have been defeated by your Prices!');
        return { log };
      }
    }

    // Draw phase
    this.state.phase = CombatPhase.DRAW;
    this.state.player.resolve = this.state.player.maxResolve;
    this.emit(CombatEventType.PLAYER_RESOLVE_CHANGED, { resolve: this.state.player.resolve });
    this.drawCards(5);

    // Player action phase
    this.state.phase = CombatPhase.PLAYER_ACTION;
    this.emit(CombatEventType.PHASE_CHANGED, { phase: CombatPhase.PLAYER_ACTION });

    return { log };
  }
}
