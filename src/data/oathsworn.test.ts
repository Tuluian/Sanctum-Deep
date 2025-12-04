import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import { CLASSES, createStarterDeck } from './classes';
import { OATHSWORN_CARDS, OATHSWORN_VOWS } from './cards/oathsworn';
import {
  Card,
  CardType,
  CharacterClassId,
  CombatEventType,
  EffectType,
  EnemyDefinition,
  IntentType,
  PlayerState,
  VowBonusType,
  VowRestrictionType,
} from '@/types';

// Test fixtures
function createOathswornPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  const oathswornClass = CLASSES[CharacterClassId.OATHSWORN];
  return {
    maxHp: oathswornClass.maxHp,
    currentHp: oathswornClass.maxHp,
    block: 0,
    resolve: oathswornClass.maxResolve,
    maxResolve: oathswornClass.maxResolve,
    hand: [],
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    statusEffects: [],
    devotion: 0,
    fortify: 0,
    maxFortify: 15,
    empoweredAttack: 0,
    soulDebt: 0,
    activeVow: null,
    vowsActivatedThisCombat: 0,
    luck: 0,
    maxLuck: 10,
    guaranteedBest: false,
    radiance: 0,
    maxRadiance: 10,
    minions: [],
    favor: 0,
    activePrices: [],
    baseMaxResolve: oathswornClass.maxResolve,
    ...overrides,
  };
}

function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'test_card',
    instanceId: 'test_card_0',
    name: 'Test Card',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Test card',
    effects: [{ type: EffectType.DAMAGE, amount: 5 }],
    ...overrides,
  };
}

function createMockEnemyDefinition(overrides: Partial<EnemyDefinition> = {}): EnemyDefinition {
  return {
    id: 'test_enemy',
    name: 'Test Enemy',
    maxHp: 50,
    moves: [
      { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 5, weight: 1 },
    ],
    ...overrides,
  };
}

// =====================================================
// STORY 3.2: Oathsworn Class Tests
// =====================================================

describe('Story 3.2: Oathsworn Class', () => {
  // AC 1: Oathsworn starts with 75 max HP
  describe('AC 1: Oathsworn HP', () => {
    it('should have 75 max HP', () => {
      const oathswornClass = CLASSES[CharacterClassId.OATHSWORN];
      expect(oathswornClass.maxHp).toBe(75);
    });
  });

  // AC 2: Oathsworn starts with 3 max Resolve per turn
  describe('AC 2: Oathsworn Resolve', () => {
    it('should have 3 max Resolve', () => {
      const oathswornClass = CLASSES[CharacterClassId.OATHSWORN];
      expect(oathswornClass.maxResolve).toBe(3);
    });
  });

  // AC 3: Starter deck composition
  describe('AC 3: Starter Deck', () => {
    it('should have 10 cards in starter deck', () => {
      const deck = createStarterDeck(CharacterClassId.OATHSWORN);
      expect(deck.length).toBe(10);
    });

    it('should have 4x Righteous Strike', () => {
      const deck = createStarterDeck(CharacterClassId.OATHSWORN);
      const cards = deck.filter(c => c.id === 'righteous_strike');
      expect(cards.length).toBe(4);
    });

    it('should have 3x Sacred Shield', () => {
      const deck = createStarterDeck(CharacterClassId.OATHSWORN);
      const cards = deck.filter(c => c.id === 'sacred_shield');
      expect(cards.length).toBe(3);
    });

    it('should have 2x Oath of Valor', () => {
      const deck = createStarterDeck(CharacterClassId.OATHSWORN);
      const cards = deck.filter(c => c.id === 'oath_of_valor');
      expect(cards.length).toBe(2);
    });

    it('should have 1x Judgment', () => {
      const deck = createStarterDeck(CharacterClassId.OATHSWORN);
      const cards = deck.filter(c => c.id === 'judgment');
      expect(cards.length).toBe(1);
    });
  });

  // AC 4, 5: Vow mechanic - powerful sustained effects
  describe('AC 4, 5: Vow Activation', () => {
    it('Oath of Valor should activate when card is played', () => {
      const oathOfValor = createMockCard({
        ...OATHSWORN_CARDS.oath_of_valor,
        instanceId: 'oath_of_valor_0',
      });

      const player = createOathswornPlayerState({
        hand: [oathOfValor],
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      const result = engine.playCard(0, 0);

      expect(result.success).toBe(true);

      const state = engine.getState();
      expect(state.player.activeVow).not.toBeNull();
      expect(state.player.activeVow?.id).toBe('oath_of_valor');
      expect(state.player.activeVow?.currentCharges).toBe(3);
    });

    it('Vow should provide damage bonus to attacks', () => {
      const righteousStrike = createMockCard({
        ...OATHSWORN_CARDS.righteous_strike,
        instanceId: 'righteous_strike_0',
      });

      const player = createOathswornPlayerState({
        hand: [righteousStrike],
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 3,
        },
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      // 6 base + 4 from Vow = 10 damage
      expect(state.enemies[0].currentHp).toBe(40);
    });
  });

  // AC 6: Only one Vow can be active at a time
  describe('AC 6: Single Vow', () => {
    it('should replace existing Vow when new one is activated', () => {
      const oathOfValor1 = createMockCard({
        ...OATHSWORN_CARDS.oath_of_valor,
        instanceId: 'oath_of_valor_0',
      });
      const strike = createMockCard({
        ...OATHSWORN_CARDS.righteous_strike,
        instanceId: 'righteous_strike_0',
      });
      const oathOfValor2 = createMockCard({
        ...OATHSWORN_CARDS.oath_of_valor,
        instanceId: 'oath_of_valor_1',
      });

      const player = createOathswornPlayerState({
        hand: [oathOfValor1, strike, oathOfValor2],
        resolve: 6, // Need enough for all cards
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();

      // Activate first Vow
      engine.playCard(0, 0);
      let state = engine.getState();
      expect(state.player.activeVow?.currentCharges).toBe(3);

      // Attack to use a charge
      engine.playCard(0, 0);
      state = engine.getState();
      expect(state.player.activeVow?.currentCharges).toBe(2);

      // Activate second Vow (should reset to fresh vow with 3 charges)
      engine.playCard(0, 0);
      state = engine.getState();
      expect(state.player.activeVow?.currentCharges).toBe(3);
    });
  });

  // AC 7: Vows last until broken or combat ends
  describe('AC 7: Vow Duration', () => {
    it('should expire naturally after charges are used', () => {
      const player = createOathswornPlayerState({
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 1, // Last charge
        },
      });

      const strike = createMockCard({
        ...OATHSWORN_CARDS.righteous_strike,
        instanceId: 'righteous_strike_0',
      });
      player.hand.push(strike);

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.activeVow).toBeNull();
    });

    it('should emit VOW_EXPIRED when charges depleted', () => {
      const player = createOathswornPlayerState({
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 1,
        },
      });

      const strike = createMockCard({
        ...OATHSWORN_CARDS.righteous_strike,
        instanceId: 'righteous_strike_0',
      });
      player.hand.push(strike);

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      let vowExpired = false;
      engine.subscribe((event) => {
        if (event.type === CombatEventType.VOW_EXPIRED) {
          vowExpired = true;
        }
      });

      engine.startCombat();
      engine.playCard(0, 0);

      expect(vowExpired).toBe(true);
    });
  });

  // AC 8: Some cards require active Vow
  describe('AC 8: Requires Vow', () => {
    it('Judgment should not be playable without active Vow', () => {
      const judgment = createMockCard({
        ...OATHSWORN_CARDS.judgment,
        instanceId: 'judgment_0',
      });

      const player = createOathswornPlayerState({
        hand: [judgment],
        resolve: 3,
        activeVow: null,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();

      expect(engine.canPlayCard(0)).toBe(false);
      const result = engine.playCard(0, 0);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Requires an active Vow');
    });

    it('Judgment should be playable with active Vow', () => {
      const judgment = createMockCard({
        ...OATHSWORN_CARDS.judgment,
        instanceId: 'judgment_0',
      });

      const player = createOathswornPlayerState({
        hand: [judgment],
        resolve: 3,
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 3,
        },
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();

      expect(engine.canPlayCard(0)).toBe(true);
      const result = engine.playCard(0, 0);
      expect(result.success).toBe(true);
    });

    it('Judgment should deal 12 + 4 (Vow bonus) = 16 damage', () => {
      const judgment = createMockCard({
        ...OATHSWORN_CARDS.judgment,
        instanceId: 'judgment_0',
      });

      const player = createOathswornPlayerState({
        hand: [judgment],
        resolve: 3,
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 3,
        },
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(34); // 50 - 16
    });
  });

  // AC 9: Breaking a Vow has consequences
  describe('AC 9: Vow Breaking', () => {
    it('should break Vow when gaining block under Oath of Valor', () => {
      const sacredShield = createMockCard({
        ...OATHSWORN_CARDS.sacred_shield,
        instanceId: 'sacred_shield_0',
      });

      const player = createOathswornPlayerState({
        hand: [sacredShield],
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 3,
        },
        currentHp: 75,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      // Vow should be broken
      expect(state.player.activeVow).toBeNull();
      // Break penalty: 5 HP damage
      expect(state.player.currentHp).toBe(70);
      // Block should still be gained
      expect(state.player.block).toBe(6);
    });

    it('should emit VOW_BROKEN event when Vow is broken', () => {
      const sacredShield = createMockCard({
        ...OATHSWORN_CARDS.sacred_shield,
        instanceId: 'sacred_shield_0',
      });

      const player = createOathswornPlayerState({
        hand: [sacredShield],
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 3,
        },
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      let vowBroken = false;
      let brokenVowId = '';
      engine.subscribe((event) => {
        if (event.type === CombatEventType.VOW_BROKEN) {
          vowBroken = true;
          brokenVowId = (event.data as { vow: { id: string } }).vow.id;
        }
      });

      engine.startCombat();
      engine.playCard(0, 0);

      expect(vowBroken).toBe(true);
      expect(brokenVowId).toBe('oath_of_valor');
    });
  });

  // Test Vow charges decrement
  describe('Vow Charges', () => {
    it('should decrement charges on each attack', () => {
      const strike1 = createMockCard({
        ...OATHSWORN_CARDS.righteous_strike,
        instanceId: 'righteous_strike_0',
      });
      const strike2 = createMockCard({
        ...OATHSWORN_CARDS.righteous_strike,
        instanceId: 'righteous_strike_1',
      });

      const player = createOathswornPlayerState({
        hand: [strike1, strike2],
        resolve: 3,
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 3,
        },
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();

      engine.playCard(0, 0);
      let state = engine.getState();
      expect(state.player.activeVow?.currentCharges).toBe(2);

      engine.playCard(0, 0);
      state = engine.getState();
      expect(state.player.activeVow?.currentCharges).toBe(1);
    });

    it('should emit VOW_CHARGE_USED event on attack', () => {
      const strike = createMockCard({
        ...OATHSWORN_CARDS.righteous_strike,
        instanceId: 'righteous_strike_0',
      });

      const player = createOathswornPlayerState({
        hand: [strike],
        activeVow: {
          ...OATHSWORN_VOWS.oath_of_valor,
          currentCharges: 3,
        },
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      let chargeUsed = false;
      let remainingCharges = 0;
      engine.subscribe((event) => {
        if (event.type === CombatEventType.VOW_CHARGE_USED) {
          chargeUsed = true;
          remainingCharges = (event.data as { remainingCharges: number }).remainingCharges;
        }
      });

      engine.startCombat();
      engine.playCard(0, 0);

      expect(chargeUsed).toBe(true);
      expect(remainingCharges).toBe(2);
    });
  });

  // Test Vow definition
  describe('Oath of Valor Definition', () => {
    it('should have correct properties', () => {
      const vow = OATHSWORN_VOWS.oath_of_valor;
      expect(vow.id).toBe('oath_of_valor');
      expect(vow.name).toBe('Oath of Valor');
      expect(vow.bonus.type).toBe(VowBonusType.DAMAGE_BOOST);
      expect(vow.bonus.amount).toBe(4);
      expect(vow.restriction.type).toBe(VowRestrictionType.NO_BLOCK);
      expect(vow.charges).toBe(3);
      expect(vow.breakPenalty).toBeDefined();
      expect(vow.breakPenalty![0].type).toBe(EffectType.LOSE_HP);
      expect(vow.breakPenalty![0].amount).toBe(5);
    });
  });
});
