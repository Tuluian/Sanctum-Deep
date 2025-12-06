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
  GobbledCard,
  IntentType,
  Minion,
  MAX_MINIONS,
  MAX_FAVOR,
  MAX_TIDE,
  MAX_SHADOW_ENERGY,
  DROWN_GOLD_REWARD,
  GOBLIN_MODE_HAND_THRESHOLD,
  GOBBLE_ATTACK_BONUS,
  GOBBLE_SKILL_BONUS,
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
import { isDemonEnemy } from '@/data/enemies/act3';
import { getPotion } from '@/data/potions';
import { SaveManager } from '@/services/SaveManager';
import { SHADOW_SELF, HOLLOW_GOD_DIALOGUE, CHOMP_TIMER_CONFIG } from '@/data/enemies/act3-boss';
import { BONELORD_DIALOGUE } from '@/data/enemies/bosses';
import { DROWNED_KING_DIALOGUE } from '@/data/enemies/act2-boss';

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
      intangible: 0,
      // Elite passives
      infernalPresence: def.id === 'greater_demon' ? 2 : 0,
      realityAnchor: def.id === 'sanctum_warden' ? 4 : 0,
      turnsSinceProjection: 0,
    }));

    this.state = {
      turn: 1,
      phase: CombatPhase.NOT_STARTED,
      player,
      enemies,
      gameOver: false,
      victory: false,
      // Hollow God boss state
      corruptedCardIds: new Set<string>(),
      lastPlayerCardPlayed: null,
      permanentlyFracturedCards: [],
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
    // Apply Reality Anchor (Sanctum Warden passive - limits draw)
    let drawCount = count;
    const warden = this.state.enemies.find(e => e.id === 'sanctum_warden' && e.currentHp > 0);
    if (warden && warden.realityAnchor > 0) {
      drawCount = Math.min(count, warden.realityAnchor);
      if (drawCount !== count) {
        this.log(`Reality Anchor limits draw to ${warden.realityAnchor} cards!`);
      }
    }

    // Apply Corruption Draw Penalty (5+ corrupted cards = -1 draw)
    if (this.state.corruptedCardIds && this.state.corruptedCardIds.size >= 5) {
      drawCount = Math.max(1, drawCount - 1);
      this.log(`Corruption clouds your mind! Draw reduced by 1.`);
    }

    for (let i = 0; i < drawCount; i++) {
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

  // Public method for drawing cards (e.g., from potions)
  drawCardsPublic(count: number): void {
    this.drawCards(count);
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

    // Emit initial boss dialogue for phase 1 (phase 0 in code)
    for (const enemy of this.state.enemies) {
      if (enemy.isBoss) {
        const dialogue = this.getBossDialogue(enemy.id, 0);
        if (dialogue) {
          this.emit(CombatEventType.BOSS_DIALOGUE, {
            message: dialogue,
            phase: 0,
            bossId: enemy.id,
            bossName: enemy.name
          });
          this.log(`"${dialogue}"`);
        }
      }
    }
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
      // Filter summon/spawn moves if on cooldown or at max minions
      if (m.intent === IntentType.SUMMON || m.intent === IntentType.SPAWN) {
        if (enemy.summonCooldown > 0) return false;
        if (currentMinionCount >= maxMinions) return false;
      }
      // Filter moves that require HP threshold (e.g., Warden's Duty only when below 30%)
      if (m.hpThreshold !== undefined) {
        const hpPercent = enemy.currentHp / enemy.maxHp;
        if (hpPercent > m.hpThreshold) return false;
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

    // Debug log intent selection (especially for summons)
    if (enemy.intent.intent === IntentType.SUMMON) {
      console.log('[INTENT DEBUG] Summon intent set:', {
        enemy: enemy.name,
        phase: enemy.phase,
        intentName: enemy.intent.name,
        summons: enemy.intent.summons,
      });
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
      spawnId: move.spawnId,
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

      // Greater Demon phase 2: Infernal Presence increases to 4
      if (enemy.id === 'greater_demon' && newPhase === 1) {
        enemy.infernalPresence = 4;
        this.log(`Infernal Presence intensifies! Player damage reduced by 4!`);
      }

      // Boss phase transitions - emit dialogue for all bosses
      if (enemy.isBoss) {
        const dialogue = this.getBossDialogue(enemy.id, newPhase);
        if (dialogue) {
          this.emit(CombatEventType.BOSS_DIALOGUE, {
            message: dialogue,
            phase: newPhase,
            bossId: enemy.id,
            bossName: enemy.name
          });
          this.log(`"${dialogue}"`);
        }
      }

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
      intangible: 0,
      infernalPresence: 0,
      realityAnchor: 0,
      turnsSinceProjection: 0,
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
    console.log('[REGISTER DEBUG] Registering minion:', definition.id);
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

    // Track last played card for Hollow Echo
    this.state.lastPlayerCardPlayed = card;

    // Execute effects
    const log: string[] = [];

    // Handle corrupted card penalty (Hollow God mechanic)
    if (this.state.corruptedCardIds.has(card.instanceId)) {
      this.applyCorruptionStacks(2);
      log.push(`Playing corrupted ${card.name} spreads corruption! (+2 Corruption)`);
    }

    // Corrupt status deals damage when playing any card, then decays by 1
    const corruptEffect = this.state.player.statusEffects.find(e => e.type === StatusType.CORRUPT);
    if (corruptEffect && corruptEffect.amount > 0) {
      const corruptDamage = corruptEffect.amount;
      this.state.player.currentHp = Math.max(0, this.state.player.currentHp - corruptDamage);
      this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });

      // Decay corruption by 1 after dealing damage
      corruptEffect.amount -= 1;
      if (corruptEffect.amount <= 0) {
        this.state.player.statusEffects = this.state.player.statusEffects.filter(
          e => e.type !== StatusType.CORRUPT
        );
        log.push(`Corruption deals ${corruptDamage} damage! Corruption fades.`);
      } else {
        log.push(`Corruption deals ${corruptDamage} damage! (${corruptEffect.amount} remaining)`);
      }

      // Check for player death from corruption
      if (this.state.player.currentHp <= 0) {
        this.state.gameOver = true;
        this.state.victory = false;
        this.emit(CombatEventType.GAME_OVER, { victory: false });
      }
    }

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

    // Handle conditional potion generation
    if (card.conditionalPotionGen) {
      const { requireFortify, potionId } = card.conditionalPotionGen;
      let shouldGenerate = true;
      if (requireFortify && this.state.player.fortify <= 0) {
        shouldGenerate = false;
      }
      if (shouldGenerate) {
        const potionResult = this.executeEffect(
          { type: EffectType.GENERATE_POTION, amount: 1, potionId },
          target,
          false
        );
        if (potionResult) log.push(potionResult);
      }
    }

    // Move to discard (or fracture for Power cards or cards with fracture property)
    if (card.type === CardType.POWER || card.fracture || card.fractureOnDiscard) {
      // Powers, fracture cards, and fractureOnDiscard cards don't go to discard
      this.state.player.fracturePile.push(card);
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

  private executeEffect(effect: { type: EffectType; amount: number; cardId?: string; perStack?: number; minionId?: string; multiplier?: number; potionId?: string }, target?: Enemy, isAttack: boolean = false): string | null {
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
        const blockAmount = effect.amount + this.state.player.permanentBlockBonus;
        this.state.player.block += blockAmount;
        this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
        if (this.state.player.permanentBlockBonus > 0) {
          return `Gained ${blockAmount} block (${effect.amount} + ${this.state.player.permanentBlockBonus} bonus)`;
        }
        return `Gained ${effect.amount} block`;
      }

      case EffectType.HEAL: {
        const heal = Math.min(effect.amount, this.state.player.maxHp - this.state.player.currentHp);
        this.state.player.currentHp += heal;
        this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
        if (heal > 0) {
          this.emit(CombatEventType.PLAYER_HEALED, { amount: heal });
        }

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

      // Knight effects - Block/Fortify scaling
      case EffectType.DAMAGE_EQUAL_BLOCK: {
        if (!target) return null;
        const damage = this.state.player.block;
        if (damage > 0) {
          this.dealDamageToEnemy(target, damage);
          return `Dealt ${damage} damage (equal to Block)`;
        }
        return 'No Block - no damage dealt';
      }

      case EffectType.DAMAGE_EQUAL_FORTIFY: {
        if (!target) return null;
        const damage = this.state.player.fortify;
        if (damage > 0) {
          this.dealDamageToEnemy(target, damage);
          return `Dealt ${damage} damage (equal to Fortify)`;
        }
        return 'No Fortify - no damage dealt';
      }

      case EffectType.BLOCK_EQUAL_FORTIFY: {
        const blockGain = this.state.player.fortify;
        this.state.player.block += blockGain;
        this.emit(CombatEventType.PLAYER_BLOCK_CHANGED, { block: this.state.player.block });
        return `Gained ${blockGain} Block (equal to Fortify)`;
      }

      case EffectType.DOUBLE_FORTIFY: {
        const currentFortify = this.state.player.fortify;
        const newFortify = Math.min(currentFortify * 2, this.state.player.maxFortify);
        const gained = newFortify - currentFortify;
        this.state.player.fortify = newFortify;
        this.emit(CombatEventType.PLAYER_FORTIFY_CHANGED, { fortify: this.state.player.fortify });
        return `Doubled Fortify (+${gained}, now ${newFortify})`;
      }

      case EffectType.APPLY_STATUS: {
        // Check for statusType in the effect
        const statusType = (effect as { type: EffectType; amount: number; target?: string; statusType?: StatusType }).statusType;
        const effectTarget = (effect as { type: EffectType; amount: number; target?: string }).target;

        if (statusType === StatusType.EVADE && effectTarget === 'self') {
          // Apply Evade to player (Shadow Stalker)
          const existingEvade = this.state.player.statusEffects.find(e => e.type === StatusType.EVADE);
          if (existingEvade) {
            existingEvade.amount += effect.amount;
          } else {
            this.state.player.statusEffects.push({
              type: StatusType.EVADE,
              amount: effect.amount,
            });
          }
          return `Gained ${effect.amount} Evade`;
        }

        if (statusType === StatusType.SOAKED && effectTarget === 'enemy' && target) {
          // Apply Soaked to enemy (Tidecaller)
          const existingSoaked = target.statusEffects.find(e => e.type === StatusType.SOAKED);
          if (existingSoaked) {
            existingSoaked.amount += effect.amount;
          } else {
            target.statusEffects.push({
              type: StatusType.SOAKED,
              amount: effect.amount,
            });
          }
          return `Applied ${effect.amount} Soaked to ${target.name}`;
        }

        // Apply Impaired to enemy (Fey-Touched Whimsy, etc.)
        // Uses statusType IMPAIRED with target: 'enemy' explicitly
        if (statusType === StatusType.IMPAIRED && effectTarget === 'enemy' && target) {
          const existingImpaired = target.statusEffects.find(e => e.type === StatusType.IMPAIRED);
          if (existingImpaired) {
            existingImpaired.duration = Math.max(existingImpaired.duration || 0, effect.amount);
          } else {
            target.statusEffects.push({
              type: StatusType.IMPAIRED,
              amount: 1,
              duration: effect.amount,
            });
          }
          return `Applied Impaired to ${target.name} for ${effect.amount} turn(s)`;
        }

        // Default: empowered attack (legacy behavior)
        this.state.player.empoweredAttack += effect.amount;
        this.emit(CombatEventType.PLAYER_EMPOWERED_CHANGED, { empoweredAttack: this.state.player.empoweredAttack });
        return `Your next attack deals +${effect.amount} damage`;
      }

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

      case EffectType.FRACTURE_CURSE_FROM_HAND: {
        const curseIndex = this.state.player.hand.findIndex(c => c.type === CardType.CURSE);
        if (curseIndex === -1) {
          return 'No curse to fracture';
        }
        const curse = this.state.player.hand.splice(curseIndex, 1)[0];
        this.state.player.fracturePile.push(curse);
        return `Fractured ${curse.name}`;
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
        if (heal > 0) {
          this.emit(CombatEventType.PLAYER_HEALED, { amount: heal });
        }
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
          if (heal > 0) {
            this.emit(CombatEventType.PLAYER_HEALED, { amount: heal });
          }
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

      case EffectType.PERMANENT_BLOCK_BONUS: {
        this.state.player.permanentBlockBonus += effect.amount;
        this.log(`All block from cards permanently increased by ${effect.amount}!`);
        return `Permanently +${effect.amount} block on all cards`;
      }

      // Potion generation effects
      case EffectType.GENERATE_POTION: {
        const potionId = effect.potionId || 'health_potion';
        const potion = getPotion(potionId);
        if (!potion) {
          this.log(`Unknown potion: ${potionId}`);
          return null;
        }
        // Check max potion slots (3 slots, each slot can stack same potion type)
        const MAX_POTION_SLOTS = 3;
        const currentPotions = SaveManager.getPotions();
        const totalSlots = currentPotions.length;
        const existingSlot = currentPotions.find(p => p.potionId === potionId);

        if (existingSlot) {
          // Stack on existing slot
          SaveManager.addPotion(potionId);
          this.emit(CombatEventType.POTION_GENERATED, { potionId, potionName: potion.name });
          this.log(`Generated ${potion.name}!`);
          return `Generated ${potion.name}`;
        } else if (totalSlots < MAX_POTION_SLOTS) {
          // Add to new slot
          SaveManager.addPotion(potionId);
          this.emit(CombatEventType.POTION_GENERATED, { potionId, potionName: potion.name });
          this.log(`Generated ${potion.name}!`);
          return `Generated ${potion.name}`;
        } else {
          // No room - convert to gold instead
          const goldReward = 10;
          this.log(`Potion slots full! Gained ${goldReward} gold instead.`);
          return `Potion slots full! +${goldReward} gold`;
        }
      }

      // Tidecaller effects
      case EffectType.GAIN_TIDE: {
        const previousTide = this.state.player.tide;
        this.state.player.tide = Math.min(
          this.state.player.tide + effect.amount,
          MAX_TIDE
        );
        this.emit(CombatEventType.TIDE_CHANGED, { tide: this.state.player.tide });
        return `Gained ${this.state.player.tide - previousTide} Tide (${this.state.player.tide}/${MAX_TIDE})`;
      }

      case EffectType.DROWN: {
        if (!target) return null;
        // Calculate threshold: base + 1% per Tide stack
        const threshold = effect.amount + this.state.player.tide;
        const targetHpPercent = (target.currentHp / target.maxHp) * 100;

        if (targetHpPercent <= threshold) {
          // Execute the enemy
          const killedName = target.name;
          target.currentHp = 0;
          this.emit(CombatEventType.ENEMY_DROWNED, { enemy: target, gold: DROWN_GOLD_REWARD });
          this.emit(CombatEventType.ENEMY_DIED, { enemy: target });
          this.log(`${killedName} was drowned! Gained ${DROWN_GOLD_REWARD} gold.`);
          // Note: Gold is tracked in game state, not combat engine
          return `Drowned ${killedName}! Gained ${DROWN_GOLD_REWARD} gold.`;
        }
        return `Drown failed - enemy HP ${targetHpPercent.toFixed(1)}% > ${threshold}% threshold`;
      }

      case EffectType.DAMAGE_IF_SOAKED: {
        if (!target) return null;
        // Check if target has SOAKED status
        const soakedStatus = target.statusEffects.find(s => s.type === StatusType.SOAKED);
        if (soakedStatus && soakedStatus.amount > 0) {
          return this.dealDamageToEnemy(target, effect.amount);
        }
        return 'Target not Soaked - no damage dealt';
      }

      // Shadow Stalker effects
      case EffectType.GAIN_SHADOW_ENERGY: {
        const previousEnergy = this.state.player.shadowEnergy;
        this.state.player.shadowEnergy = Math.min(
          this.state.player.shadowEnergy + effect.amount,
          MAX_SHADOW_ENERGY
        );
        this.emit(CombatEventType.SHADOW_ENERGY_CHANGED, { shadowEnergy: this.state.player.shadowEnergy });
        return `Gained ${this.state.player.shadowEnergy - previousEnergy} Shadow Energy (${this.state.player.shadowEnergy}/${MAX_SHADOW_ENERGY})`;
      }

      case EffectType.ENTER_SHADOW: {
        this.state.player.inShadow = effect.amount;
        this.emit(CombatEventType.ENTERED_SHADOW, { turns: effect.amount });
        this.log(`Entered the Shadow for ${effect.amount} turn(s)!`);
        return `Entered Shadow for ${effect.amount} turn(s)`;
      }

      case EffectType.DAMAGE_IN_SHADOW: {
        if (!target) return null;
        // effect.amount is base damage, shadowDamage is in extended effect properties
        const shadowDamage = (effect as { type: EffectType; amount: number; shadowDamage?: number }).shadowDamage || effect.amount;
        const damage = this.state.player.inShadow > 0 ? shadowDamage : effect.amount;
        return this.dealDamageToEnemy(target, damage);
      }

      case EffectType.CONSUME_SHADOW_ENERGY_DAMAGE: {
        if (!target) return null;
        const energyConsumed = this.state.player.shadowEnergy;
        const perStackDamage = effect.perStack || effect.amount;
        const totalDamage = energyConsumed * perStackDamage;

        this.state.player.shadowEnergy = 0;
        this.emit(CombatEventType.SHADOW_ENERGY_CHANGED, { shadowEnergy: 0 });

        if (totalDamage > 0) {
          this.dealDamageToEnemy(target, totalDamage);
          return `Consumed ${energyConsumed} Shadow Energy for ${totalDamage} damage`;
        }
        return 'No Shadow Energy to consume';
      }

      // Goblin effects
      case EffectType.GOBBLE_CARD: {
        // Find a card in hand (not the card being played)
        // For now, gobble the first non-gobble card in hand
        const gobbleableCards = this.state.player.hand.filter(c => c.id !== 'gobble' && c.id !== 'snack_time');
        if (gobbleableCards.length === 0) {
          return 'No cards to Gobble';
        }

        // Gobble a random card
        const cardToGobble = gobbleableCards[Math.floor(Math.random() * gobbleableCards.length)];
        const cardIndex = this.state.player.hand.findIndex(c => c.instanceId === cardToGobble.instanceId);
        if (cardIndex === -1) return 'No cards to Gobble';

        const gobbledCard = this.state.player.hand.splice(cardIndex, 1)[0];

        // Track the gobbled card
        const gobbledRecord: GobbledCard = {
          cardId: gobbledCard.id,
          cardType: gobbledCard.type,
        };
        this.state.player.gobbledCardsCombat.push(gobbledRecord);
        this.state.player.totalGobbled++;

        // Apply bonuses based on card type
        let bonusText = '';
        if (gobbledCard.type === CardType.ATTACK) {
          this.state.player.gobbleDamageBonus += GOBBLE_ATTACK_BONUS;
          bonusText = ` (+${GOBBLE_ATTACK_BONUS} damage bonus)`;
        } else if (gobbledCard.type === CardType.SKILL) {
          this.state.player.gobbleBlockBonus += GOBBLE_SKILL_BONUS;
          bonusText = ` (+${GOBBLE_SKILL_BONUS} block bonus)`;
        }

        this.emit(CombatEventType.CARD_GOBBLED, { card: gobbledCard, bonus: bonusText });
        this.log(`Gobbled ${gobbledCard.name}!${bonusText}`);
        return `Gobbled ${gobbledCard.name}${bonusText}`;
      }

      case EffectType.CHECK_GOBLIN_MODE: {
        const threshold = effect.amount || GOBLIN_MODE_HAND_THRESHOLD;
        if (this.state.player.hand.length > threshold) {
          // Apply Goblin Mode status
          const existingGoblinMode = this.state.player.statusEffects?.find(s => s.type === StatusType.GOBLIN_MODE);
          if (!existingGoblinMode) {
            if (!this.state.player.statusEffects) {
              this.state.player.statusEffects = [];
            }
            this.state.player.statusEffects.push({
              type: StatusType.GOBLIN_MODE,
              amount: 2, // +2 damage/block to all cards
              duration: 1, // Lasts 1 turn
            });
            this.emit(CombatEventType.GOBLIN_MODE_ACTIVATED, { bonus: 2 });
            this.log(`GOBLIN MODE activated! +2 damage and block this turn!`);
            return 'GOBLIN MODE activated! +2 damage/block this turn';
          }
        }
        return null;
      }

      case EffectType.REGURGITATE_CARD: {
        if (this.state.player.gobbledCardsCombat.length === 0) {
          return 'No Gobbled cards to regurgitate';
        }

        // Pick a random gobbled card
        const randomIndex = Math.floor(Math.random() * this.state.player.gobbledCardsCombat.length);
        const gobbledRecord = this.state.player.gobbledCardsCombat.splice(randomIndex, 1)[0];

        // Create a new card instance
        const cardDef = getCardById(gobbledRecord.cardId);
        if (!cardDef) {
          return 'Could not find gobbled card';
        }

        const newCard = this.createCardInstance(cardDef);
        this.state.player.hand.push(newCard);

        this.emit(CombatEventType.CARD_REGURGITATED, { card: newCard });
        this.log(`Regurgitated ${newCard.name}!`);
        return `Regurgitated ${newCard.name}`;
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

  private dealDamageToPlayerOrMinion(damage: number): { targetName: string; blocked: number; hpDamage: number; evaded?: boolean } {
    // Check for Evade status (Shadow Stalker) - negates one attack
    const evadeIndex = this.state.player.statusEffects.findIndex(e => e.type === StatusType.EVADE && e.amount > 0);
    if (evadeIndex !== -1) {
      // Consume one stack of Evade
      const evadeEffect = this.state.player.statusEffects[evadeIndex];
      evadeEffect.amount--;
      if (evadeEffect.amount <= 0) {
        this.state.player.statusEffects.splice(evadeIndex, 1);
      }
      this.emit(CombatEventType.EVADE_TRIGGERED, { damage });
      this.log(`Attack evaded!`);
      return { targetName: 'you', blocked: 0, hpDamage: 0, evaded: true };
    }

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
    // Apply Infernal Presence (Greater Demon passive - reduces player outgoing damage)
    let effectiveDamage = damage;
    const greaterDemon = this.state.enemies.find(e => e.id === 'greater_demon' && e.currentHp > 0);
    if (greaterDemon && greaterDemon.infernalPresence > 0) {
      effectiveDamage = Math.max(0, damage - greaterDemon.infernalPresence);
      if (effectiveDamage !== damage) {
        this.log(`Infernal Presence reduces damage by ${greaterDemon.infernalPresence}!`);
      }
    }

    // Apply Intangible damage reduction (50%)
    if (enemy.intangible > 0) {
      effectiveDamage = Math.floor(effectiveDamage / 2);
      this.log(`${enemy.name} is intangible! Damage halved.`);
    }

    const blockedDamage = Math.min(effectiveDamage, enemy.block);
    enemy.block = Math.max(0, enemy.block - effectiveDamage);

    const hpDamage = effectiveDamage - blockedDamage;
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
      // Handle Shadow Self death - player heals 10 HP (Hollow God)
      this.handleShadowSelfDeath(enemy);
      // Handle conditional heal (Grim Harvest)
      if (this.pendingConditionalHeal > 0) {
        const heal = Math.min(this.pendingConditionalHeal, this.state.player.maxHp - this.state.player.currentHp);
        this.state.player.currentHp += heal;
        this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
        if (heal > 0) {
          this.emit(CombatEventType.PLAYER_HEALED, { amount: heal });
        }
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

  // ===========================================
  // Hollow God Boss Mechanics
  // ===========================================

  // Chomp Timer state
  private chompTimerInterval: ReturnType<typeof setInterval> | null = null;
  private chompTimerActive = false;

  /**
   * Start the Chomp Timer when player turn begins (Hollow God fight only)
   */
  startChompTimer(): void {
    const hollowGod = this.state.enemies.find(e => e.id === 'hollow_god' && e.currentHp > 0);
    if (!hollowGod || !CHOMP_TIMER_CONFIG.enabled) return;

    this.chompTimerActive = true;
    this.chompTimerInterval = setInterval(() => {
      if (this.chompTimerActive && this.state.phase === CombatPhase.PLAYER_ACTION) {
        this.executeChomp();
      }
    }, CHOMP_TIMER_CONFIG.intervalMs);
  }

  /**
   * Stop the Chomp Timer when player turn ends
   */
  stopChompTimer(): void {
    this.chompTimerActive = false;
    if (this.chompTimerInterval) {
      clearInterval(this.chompTimerInterval);
      this.chompTimerInterval = null;
    }
  }

  /**
   * Execute a Chomp - discard a random card from player's hand
   */
  private executeChomp(): void {
    if (this.state.player.hand.length === 0) return;

    // Select random card to discard
    const randomIndex = Math.floor(Math.random() * this.state.player.hand.length);
    const discardedCard = this.state.player.hand.splice(randomIndex, 1)[0];
    this.state.player.discardPile.push(discardedCard);

    // Pick a random taunt
    const taunt = HOLLOW_GOD_DIALOGUE.chompTaunt[
      Math.floor(Math.random() * HOLLOW_GOD_DIALOGUE.chompTaunt.length)
    ];

    this.emit(CombatEventType.CHOMP_TRIGGERED, {
      card: discardedCard,
      taunt,
    });
    this.log(`The Void chomps! ${discardedCard.name} is lost... "${taunt}"`);
  }

  /**
   * Corrupt a card - makes it add Corruption stacks when played
   */
  corruptCard(card: Card): void {
    if (this.state.corruptedCardIds.has(card.instanceId)) return; // Already corrupted

    this.state.corruptedCardIds.add(card.instanceId);
    this.emit(CombatEventType.CARD_CORRUPTED, { card });
    this.log(`${card.name} becomes corrupted by the void!`);
  }

  /**
   * Corrupt a random uncorrupted card in hand
   */
  private corruptRandomCardInHand(): void {
    const uncorruptedInHand = this.state.player.hand.filter(
      c => !this.state.corruptedCardIds.has(c.instanceId)
    );

    if (uncorruptedInHand.length > 0) {
      const target = uncorruptedInHand[Math.floor(Math.random() * uncorruptedInHand.length)];
      this.corruptCard(target);
    }
  }

  /**
   * Corrupt multiple cards in hand
   */
  private corruptCardsInHand(count: number): void {
    for (let i = 0; i < count; i++) {
      this.corruptRandomCardInHand();
    }
  }

  /**
   * Corrupt ALL cards in hand
   */
  private corruptAllCardsInHand(): void {
    for (const card of this.state.player.hand) {
      this.corruptCard(card);
    }
  }

  /**
   * Apply corruption stacks to the player (damage over time)
   */
  private applyCorruptionStacks(amount: number): void {
    const existingCorrupt = this.state.player.statusEffects.find(
      e => e.type === StatusType.CORRUPT
    );
    if (existingCorrupt) {
      existingCorrupt.amount += amount;
    } else {
      this.state.player.statusEffects.push({
        type: StatusType.CORRUPT,
        amount,
      });
    }
  }

  /**
   * Permanently fracture a random non-basic card from the player's deck
   * This removes it from the entire run, not just this combat
   */
  private permanentlyFractureRandomCard(): Card | null {
    // Collect all cards from hand, draw pile, and discard pile
    const allCards = [
      ...this.state.player.hand,
      ...this.state.player.drawPile,
      ...this.state.player.discardPile,
    ];

    // Filter to non-basic cards (not Strike, Defend, or Curses)
    const nonBasicCards = allCards.filter(card =>
      !['strike', 'defend', 'basic_strike', 'basic_defend'].includes(card.id) &&
      card.type !== CardType.CURSE
    );

    if (nonBasicCards.length === 0) return null;

    // Select random card
    const targetCard = nonBasicCards[Math.floor(Math.random() * nonBasicCards.length)];

    // Remove from wherever it is
    this.state.player.hand = this.state.player.hand.filter(
      c => c.instanceId !== targetCard.instanceId
    );
    this.state.player.drawPile = this.state.player.drawPile.filter(
      c => c.instanceId !== targetCard.instanceId
    );
    this.state.player.discardPile = this.state.player.discardPile.filter(
      c => c.instanceId !== targetCard.instanceId
    );

    // Add to permanently fractured list
    this.state.permanentlyFracturedCards.push(targetCard);

    // Pick a random taunt
    const taunt = HOLLOW_GOD_DIALOGUE.forgetTaunt[
      Math.floor(Math.random() * HOLLOW_GOD_DIALOGUE.forgetTaunt.length)
    ];

    this.emit(CombatEventType.CARD_PERMANENTLY_FRACTURED, {
      card: targetCard,
      taunt,
    });
    this.log(`You forget how to ${targetCard.name}... "${taunt}"`);

    return targetCard;
  }

  /**
   * Execute Hollow Echo - copy the last card the player played against them
   */
  private executeHollowEcho(): string[] {
    const log: string[] = [];
    const lastCard = this.state.lastPlayerCardPlayed;

    if (!lastCard) {
      // Fallback to basic attack if no card played
      this.dealDamageToPlayer(8);
      log.push('The Hollow God echoes... nothing. Deals 8 damage.');
      return log;
    }

    this.emit(CombatEventType.HOLLOW_ECHO, { card: lastCard });
    log.push(`The Hollow God echoes your ${lastCard.name}!`);

    // Execute card effects against player
    for (const effect of lastCard.effects) {
      switch (effect.type) {
        case EffectType.DAMAGE:
        case EffectType.DAMAGE_ALL:
          this.dealDamageToPlayer(effect.amount);
          log.push(`Hollow Echo deals ${effect.amount} damage to you!`);
          break;
        case EffectType.BLOCK:
          // Give block to Hollow God
          const hollowGod = this.state.enemies.find(e => e.id === 'hollow_god' && e.currentHp > 0);
          if (hollowGod) {
            hollowGod.block += effect.amount;
            this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: hollowGod.id, block: hollowGod.block });
            log.push(`Hollow Echo gives The Hollow God ${effect.amount} block`);
          }
          break;
        case EffectType.HEAL:
          // Heal Hollow God
          const god = this.state.enemies.find(e => e.id === 'hollow_god' && e.currentHp > 0);
          if (god) {
            const healAmount = Math.min(effect.amount, god.maxHp - god.currentHp);
            god.currentHp += healAmount;
            log.push(`Hollow Echo heals The Hollow God for ${healAmount}`);
          }
          break;
        // Other effects could be added as needed
      }
    }

    return log;
  }

  /**
   * Handle Shadow Self death - player heals 10 HP
   */
  private handleShadowSelfDeath(enemy: Enemy): void {
    if (enemy.id.startsWith('shadow_self')) {
      const healAmount = Math.min(10, this.state.player.maxHp - this.state.player.currentHp);
      this.state.player.currentHp += healAmount;
      this.emit(CombatEventType.PLAYER_HP_CHANGED, { hp: this.state.player.currentHp });
      if (healAmount > 0) {
        this.emit(CombatEventType.PLAYER_HEALED, { amount: healAmount });
      }
      this.emit(CombatEventType.SHADOW_SELF_DIED, { healAmount });
      this.log(`${HOLLOW_GOD_DIALOGUE.onShadowSelfDeath} You reclaim a piece of yourself and heal ${healAmount} HP.`);
    }
  }

  /**
   * The Void Hungers - corrupt 1 random card at end of player turn (Hollow God passive)
   */
  private voidHungersPassive(): void {
    const hollowGod = this.state.enemies.find(e => e.id === 'hollow_god' && e.currentHp > 0);
    if (!hollowGod) return;

    this.corruptRandomCardInHand();
    this.log('The Void Hungers... a piece of your identity fades.');
  }

  /**
   * Check if the Hollow God is in combat
   */
  isHollowGodFight(): boolean {
    return this.state.enemies.some(e => e.id === 'hollow_god');
  }

  /**
   * Get dialogue for boss phase transitions
   */
  getBossDialogue(bossId: string, phase: number): string {
    // Get the dialogue object based on boss ID
    const dialogueMap: Record<string, { phase1Entry: string; phase2Entry: string; phase3Entry: string }> = {
      hollow_god: HOLLOW_GOD_DIALOGUE,
      bonelord: BONELORD_DIALOGUE,
      drowned_king: DROWNED_KING_DIALOGUE,
    };

    const dialogue = dialogueMap[bossId];
    if (!dialogue) return '';

    switch (phase) {
      case 0: return dialogue.phase1Entry;
      case 1: return dialogue.phase2Entry;
      case 2: return dialogue.phase3Entry;
      default: return '';
    }
  }

  // ===========================================
  // End Hollow God Boss Mechanics
  // ===========================================

  private dealDamageToPlayer(damage: number): { blocked: number; fortifyAbsorbed: number; hpDamage: number } {
    let remaining = damage;

    // Block absorbs first (temporary, resets each turn)
    const blocked = Math.min(remaining, this.state.player.block);
    this.state.player.block -= blocked;
    remaining -= blocked;

    // Fortify absorbs second (persistent, stays between turns)
    const fortifyAbsorbed = Math.min(remaining, this.state.player.fortify);
    this.state.player.fortify -= fortifyAbsorbed;
    remaining -= fortifyAbsorbed;

    if (fortifyAbsorbed > 0) {
      this.emit(CombatEventType.PLAYER_FORTIFY_CHANGED, { fortify: this.state.player.fortify });
    }

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

    // Stop Chomp Timer at end of player turn (Hollow God mechanic)
    this.stopChompTimer();

    // The Void Hungers passive - corrupt 1 card at end of turn (Hollow God)
    if (this.isHollowGodFight()) {
      this.voidHungersPassive();
    }

    // Discard hand (separating fractureOnDiscard cards)
    for (const card of this.state.player.hand) {
      if (card.fractureOnDiscard) {
        this.state.player.fracturePile.push(card);
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

      // Decrement intangible
      if (enemy.intangible > 0) {
        enemy.intangible--;
        if (enemy.intangible === 0) {
          log.push(`${enemy.name} is no longer intangible.`);
        }
      }

      // Decrement summon cooldown
      if (enemy.summonCooldown > 0) {
        enemy.summonCooldown--;
      }

      // Memory Projection (Sanctum Warden - summon a Memory every 3 turns)
      if (enemy.id === 'sanctum_warden') {
        enemy.turnsSinceProjection++;
        if (enemy.turnsSinceProjection >= 3) {
          enemy.turnsSinceProjection = 0;
          // Spawn a random Memory enemy
          const memoryTypes = ['memory_bonelord', 'memory_drowned_king'];
          const memoryId = memoryTypes[Math.floor(Math.random() * memoryTypes.length)];
          const memoryDef = this.enemyDefinitions.get(memoryId);
          if (memoryDef) {
            this.addEnemy(memoryDef);
            log.push(`${enemy.name} projects a Memory of the past!`);
          }
        }
      }

      const intent = enemy.intent as EnemyIntent;
      if (!intent) continue;

      // Apply might bonus to damage if applicable
      const mightBonus = enemy.might;
      enemy.might = 0; // Reset might after using

      switch (intent.intent) {
        case IntentType.ATTACK:
          if (intent.damage) {
            let totalDamage = intent.damage + mightBonus;
            // Handle Judgment (HP-scaling attack)
            if (intent.moveId === 'judgment') {
              totalDamage = Math.floor(this.state.player.currentHp / 5) + mightBonus;
              log.push(`${enemy.name} judges you! Damage scales with your HP.`);
            }
            // Handle Cataclysm (AoE including allies)
            if (intent.moveId === 'cataclysm') {
              // Damage player
              const attackResult = this.dealDamageToPlayerOrMinion(totalDamage);
              log.push(`${enemy.name} unleashes Cataclysm! ${totalDamage} damage to ${attackResult.targetName}`);
              // Damage all other enemies (friendly fire)
              for (const otherEnemy of this.state.enemies) {
                if (otherEnemy.id !== enemy.id && otherEnemy.currentHp > 0) {
                  const blocked = Math.min(totalDamage, otherEnemy.block);
                  otherEnemy.block = Math.max(0, otherEnemy.block - totalDamage);
                  const hpDamage = totalDamage - blocked;
                  otherEnemy.currentHp = Math.max(0, otherEnemy.currentHp - hpDamage);
                  log.push(`${otherEnemy.name} caught in Cataclysm for ${hpDamage} damage!`);
                  if (otherEnemy.currentHp <= 0) {
                    this.emit(CombatEventType.ENEMY_DIED, { enemyId: otherEnemy.id });
                  }
                }
              }
            }
            // Hollow God - Doubt (damage + corruption)
            else if (intent.moveId === 'doubt') {
              this.dealDamageToPlayerOrMinion(totalDamage);
              log.push(`${enemy.name} casts Doubt! ${totalDamage} damage!`);
              const corruptionAmount = 3; // Fixed amount for Doubt
              this.applyCorruptionStacks(corruptionAmount);
              log.push(`You gain ${corruptionAmount} Corruption stacks.`);
            }
            // Hollow God - Identity Fracture (damage + corrupt 2 cards)
            else if (intent.moveId === 'identity_fracture') {
              this.dealDamageToPlayerOrMinion(totalDamage);
              log.push(`${enemy.name} fractures your identity! ${totalDamage} damage!`);
              this.corruptCardsInHand(2);
              log.push('Two of your cards become corrupted!');
            }
            // Hollow God - Forget (damage + block + permanent fracture)
            else if (intent.moveId === 'forget') {
              this.dealDamageToPlayerOrMinion(totalDamage);
              log.push(`${enemy.name} makes you forget! ${totalDamage} damage!`);
              // Give block to Hollow God
              enemy.block += intent.block || 15;
              this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: enemy.id, block: enemy.block });
              log.push(`${enemy.name} gained ${intent.block || 15} block.`);
              // Permanently fracture a card
              const fracturedCard = this.permanentlyFractureRandomCard();
              if (fracturedCard) {
                log.push(`You permanently forget how to ${fracturedCard.name}!`);
              }
            }
            // Hollow God - Total Void (damage + corrupt all cards)
            else if (intent.moveId === 'total_void') {
              this.dealDamageToPlayerOrMinion(totalDamage);
              log.push(`${enemy.name} unleashes Total Void! ${totalDamage} damage!`);
              this.corruptAllCardsInHand();
              log.push('ALL your cards become corrupted by the void!');
            }
            // Hollow God - Void Watches (attack + block + intangible)
            else if (intent.moveId === 'void_watches') {
              this.dealDamageToPlayerOrMinion(totalDamage);
              log.push(`${enemy.name} watches from the void! ${totalDamage} damage!`);
              enemy.block += intent.block || 15;
              this.emit(CombatEventType.ENEMY_BLOCK_CHANGED, { enemyId: enemy.id, block: enemy.block });
              enemy.intangible = 1;
              log.push(`${enemy.name} becomes intangible.`);
            }
            else {
              const attackResult = this.dealDamageToPlayerOrMinion(totalDamage);
              log.push(`${enemy.name} dealt ${totalDamage} damage to ${attackResult.targetName} (${attackResult.hpDamage} to HP)`);
            }
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
          // Self-buff - check for special moves
          if (intent.moveId === 'phase_shift') {
            // Void Spawn Phase Shift - become intangible
            enemy.intangible = 1;
            log.push(`${enemy.name} becomes intangible! All damage reduced by 50%.`);
          } else {
            // Default buff (e.g., Phase makes enemy untargetable)
            enemy.untargetable = true;
            log.push(`${enemy.name} phases out and becomes untargetable!`);
          }
          break;

        case IntentType.BUFF_ALLY:
          // Check for special pack buff moves
          if (intent.moveId === 'giggle') {
            // Imp Giggle - all Imps gain Might
            const imps = this.state.enemies.filter(e => e.currentHp > 0 && e.id.startsWith('imp'));
            if (imps.length > 0) {
              for (const imp of imps) {
                imp.might += intent.buffAmount || 3;
              }
              this.emit(CombatEventType.DEMON_SYNERGY, { buffName: 'Giggle', enemyCount: imps.length });
              log.push(`${enemy.name} giggles! All Imps gain +${intent.buffAmount || 3} Might!`);
            } else {
              log.push(`${enemy.name} giggles to no one...`);
            }
          } else if (intent.moveId === 'howl') {
            // Infernal Hound Howl - all demons gain Might
            const demons = this.state.enemies.filter(e => e.currentHp > 0 && isDemonEnemy(e.id.replace(/_\d+$/, '')));
            if (demons.length > 0) {
              for (const demon of demons) {
                demon.might += intent.buffAmount || 2;
              }
              this.emit(CombatEventType.DEMON_SYNERGY, { buffName: 'Howl', enemyCount: demons.length });
              log.push(`${enemy.name} howls! All demons gain +${intent.buffAmount || 2} Might!`);
            } else {
              log.push(`${enemy.name} howls but there are no demons to rally!`);
            }
          } else if (intent.buffAmount) {
            // Default: Buff another enemy
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

        case IntentType.UNKNOWN:
          // Special intent for Hollow Echo (copies last player card)
          if (intent.moveId === 'hollow_echo') {
            const echoLogs = this.executeHollowEcho();
            log.push(...echoLogs);
          }
          break;

        case IntentType.DEBUFF:
          // Hollow God - Glimpse of Oblivion (discard 2 random cards)
          if (intent.moveId === 'glimpse_oblivion') {
            let discarded = 0;
            for (let i = 0; i < 2 && this.state.player.hand.length > 0; i++) {
              const randomIndex = Math.floor(Math.random() * this.state.player.hand.length);
              const discardedCard = this.state.player.hand.splice(randomIndex, 1)[0];
              this.state.player.discardPile.push(discardedCard);
              discarded++;
            }
            log.push(`${enemy.name} shows you a glimpse of oblivion... You discard ${discarded} card(s).`);
          }
          // Check for special Act 3 debuff moves
          else if (intent.moveId === 'consume_light') {
            // Void Spawn Consume Light - remove random card from hand
            if (this.state.player.hand.length > 0) {
              const randomIndex = Math.floor(Math.random() * this.state.player.hand.length);
              const removedCard = this.state.player.hand.splice(randomIndex, 1)[0];
              this.state.player.discardPile.push(removedCard);
              this.emit(CombatEventType.CARD_CONSUMED, { card: removedCard, enemyId: enemy.id });
              log.push(`${enemy.name} consumed ${removedCard.name} from your hand!`);
            } else {
              log.push(`${enemy.name} tried to consume a card but your hand is empty!`);
            }
          } else if (intent.moveId === 'purge') {
            // Sanctum Guardian Purge - remove all player buffs
            const buffTypes = [
              StatusType.BLESSED, StatusType.EMPOWERED, StatusType.WARDED,
              StatusType.MIGHT, StatusType.RESILIENCE, StatusType.REGENERATION,
              StatusType.DIVINE_FORM
            ];
            const removedBuffs = this.state.player.statusEffects.filter(e => buffTypes.includes(e.type));
            this.state.player.statusEffects = this.state.player.statusEffects.filter(e => !buffTypes.includes(e.type));
            if (removedBuffs.length > 0) {
              this.emit(CombatEventType.BUFFS_PURGED, { buffs: removedBuffs, enemyId: enemy.id });
              log.push(`${enemy.name} purged ${removedBuffs.length} buff(s) from you!`);
            } else {
              log.push(`${enemy.name} tried to purge but you had no buffs!`);
            }
          } else if (intent.moveId === 'time_fracture') {
            // Sanctum Warden Time Fracture - shuffle hand into deck, draw 3
            const handCards = [...this.state.player.hand];
            this.state.player.hand = [];
            this.state.player.drawPile.push(...handCards);
            // Shuffle draw pile
            for (let i = this.state.player.drawPile.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [this.state.player.drawPile[i], this.state.player.drawPile[j]] =
                [this.state.player.drawPile[j], this.state.player.drawPile[i]];
            }
            // Draw 3 new cards
            for (let i = 0; i < 3 && this.state.player.drawPile.length > 0; i++) {
              const card = this.state.player.drawPile.pop();
              if (card) {
                this.state.player.hand.push(card);
                this.emit(CombatEventType.CARD_DRAWN, { card });
              }
            }
            log.push(`${enemy.name} fractures time! Your hand is reshuffled and you draw 3 new cards!`);
          } else if (intent.debuffType && intent.debuffDuration) {
            // Apply debuff to player
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
          // Check for Fade (Soul Fragment's once-per-combat full heal)
          if (intent.moveId === 'fade' && intent.oncePerCombat) {
            // Track as used ability
            if (!enemy.usedAbilities.includes('fade')) {
              enemy.usedAbilities.push('fade');
              enemy.currentHp = enemy.maxHp;
              log.push(`${enemy.name} fades and reforms at full health!`);
            } else {
              log.push(`${enemy.name} tried to fade but has already used this ability!`);
            }
          } else if (intent.moveId === 'consume_minion') {
            // Greater Demon Consume Minion - destroy an Imp to heal
            const imps = this.state.enemies.filter(e => e.currentHp > 0 && e.id.startsWith('imp'));
            if (imps.length > 0) {
              // Consume a random Imp
              const victim = imps[Math.floor(Math.random() * imps.length)];
              victim.currentHp = 0;
              this.emit(CombatEventType.ENEMY_DIED, { enemyId: victim.id });
              // Heal the demon
              const healAmount = Math.min(intent.heal || 20, enemy.maxHp - enemy.currentHp);
              enemy.currentHp += healAmount;
              log.push(`${enemy.name} consumes ${victim.name} and heals for ${healAmount} HP!`);
            } else {
              // No Imps to consume, do a basic attack instead
              log.push(`${enemy.name} has no minions to consume!`);
            }
          } else if (intent.moveId === 'consume_tendril') {
            // Void Caller Consume Tendril - destroy a void tendril to heal
            const tendrils = this.state.enemies.filter(e => e.currentHp > 0 && e.id.startsWith('void_tendril'));
            if (tendrils.length > 0) {
              // Consume a random tendril
              const victim = tendrils[Math.floor(Math.random() * tendrils.length)];
              victim.currentHp = 0;
              this.emit(CombatEventType.ENEMY_DIED, { enemyId: victim.id });
              // Heal the void caller
              const healAmount = Math.min(intent.heal || 15, enemy.maxHp - enemy.currentHp);
              enemy.currentHp += healAmount;
              log.push(`${enemy.name} consumes ${victim.name} and heals for ${healAmount} HP!`);
            } else {
              // No tendrils to consume
              log.push(`${enemy.name} has no tendrils to consume!`);
            }
          } else if (intent.heal) {
            // Heal an ally (or self if no allies)
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

          // Debug logging for summon
          console.log('[SUMMON DEBUG]', {
            enemyName: enemy.name,
            intent: intent.name,
            summons: intent.summons,
            resurrectMinions: intent.resurrectMinions,
            currentMinionCount,
            availableDefinitions: Array.from(this.enemyDefinitions.keys()),
          });

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
              // Special handling for Shadow Self (Hollow God)
              if (summonId === 'shadow_self') {
                // Register the Shadow Self definition
                this.enemyDefinitions.set('shadow_self', SHADOW_SELF);
                this.addEnemy(SHADOW_SELF);
                this.emit(CombatEventType.SHADOW_SELF_SUMMONED, {});
                this.emit(CombatEventType.BOSS_DIALOGUE, {
                  message: HOLLOW_GOD_DIALOGUE.onShadowSelfSummoned,
                });
                log.push(`${enemy.name} manifests your fear! "${HOLLOW_GOD_DIALOGUE.onShadowSelfSummoned}"`);
                summoned++;
              } else {
                const summonDef = this.enemyDefinitions.get(summonId);
                console.log('[SUMMON DEBUG] Attempting to summon:', summonId, 'Found:', !!summonDef);
                if (summonDef) {
                  this.addEnemy(summonDef);
                  log.push(`${enemy.name} summoned ${summonDef.name}!`);
                  summoned++;
                } else {
                  console.error('[SUMMON ERROR] No definition found for:', summonId);
                  log.push(`${enemy.name} tried to summon ${summonId} but failed!`);
                }
              }
            }
            if (summoned > 0) {
              enemy.summonCooldown = summonCooldownTurns;
            }
          }
          break;
        }

        case IntentType.SPAWN: {
          // Spawn a single enemy (similar to SUMMON but uses spawnId)
          if (intent.spawnId) {
            const currentMinionCount = this.state.enemies.filter(
              e => e.currentHp > 0 && !e.isBoss && !e.isElite && e.id !== enemy.id
            ).length;
            const maxMinions = 3;
            const summonCooldownTurns = 5;

            if (currentMinionCount >= maxMinions) {
              log.push(`${enemy.name} cannot spawn more minions!`);
            } else {
              const spawnDef = this.enemyDefinitions.get(intent.spawnId);
              if (spawnDef) {
                this.addEnemy(spawnDef);
                log.push(`${enemy.name} spawned ${spawnDef.name}!`);
                enemy.summonCooldown = summonCooldownTurns;
              }
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

    // Decay Corruption by 1 at start of turn
    const corruptEffect = this.state.player.statusEffects.find(e => e.type === StatusType.CORRUPT);
    if (corruptEffect && corruptEffect.amount > 0) {
      corruptEffect.amount -= 1;
      if (corruptEffect.amount <= 0) {
        this.state.player.statusEffects = this.state.player.statusEffects.filter(
          e => e.type !== StatusType.CORRUPT
        );
        log.push('Corruption fades completely.');
      } else {
        log.push(`Corruption decays. (${corruptEffect.amount} remaining)`);
      }
    }

    // Decrement Shadow duration (Shadow Stalker)
    if (this.state.player.inShadow > 0) {
      this.state.player.inShadow--;
      if (this.state.player.inShadow <= 0) {
        this.emit(CombatEventType.EXITED_SHADOW, {});
        log.push('You emerge from the Shadow.');
      } else {
        log.push(`Shadow remains for ${this.state.player.inShadow} more turn(s).`);
      }
    }

    // Expire Goblin Mode at start of turn (Goblin)
    const goblinModeEffect = this.state.player.statusEffects.find(e => e.type === StatusType.GOBLIN_MODE);
    if (goblinModeEffect) {
      this.state.player.statusEffects = this.state.player.statusEffects.filter(
        e => e.type !== StatusType.GOBLIN_MODE
      );
      log.push('Goblin Mode fades.');
    }

    // Expire Evade status at start of turn (Shadow Stalker)
    const evadeEffect = this.state.player.statusEffects.find(e => e.type === StatusType.EVADE);
    if (evadeEffect && evadeEffect.duration !== undefined) {
      evadeEffect.duration--;
      if (evadeEffect.duration <= 0) {
        this.state.player.statusEffects = this.state.player.statusEffects.filter(
          e => e.type !== StatusType.EVADE
        );
      }
    }

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

    // Start Chomp Timer for Hollow God fight
    if (this.isHollowGodFight()) {
      this.startChompTimer();
    }

    return { log };
  }
}
