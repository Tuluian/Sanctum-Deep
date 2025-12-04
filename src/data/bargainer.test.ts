import { describe, it, expect } from 'vitest';
import { CLASSES, createStarterDeck, getClassById } from './classes';
import { BARGAINER_STARTER_CARDS, DEMONIC_DEBT } from './cards/bargainer';
import {
  CharacterClassId,
  CardType,
  EffectType,
  PlayerState,
  IntentType,
  PriceType,
  MAX_FAVOR,
} from '@/types';
import { CombatEngine } from '@/engine/CombatEngine';

// Helper to create a test player state
function createTestPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    classId: CharacterClassId.BARGAINER,
    maxHp: 80,
    currentHp: 80,
    block: 0,
    resolve: 3,
    maxResolve: 3,
    hand: [],
    drawPile: [],
    discardPile: [],
    exhaustPile: [],
    statusEffects: [],
    devotion: 0,
    fortify: 0,
    maxFortify: 5,
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
    baseMaxResolve: 3,
    ...overrides,
  };
}

// =====================================================
// STORY 6.3: Bargainer Class & Favor/Price System Tests
// =====================================================
describe('Story 6.3: Bargainer Class & Favor/Price System', () => {
  describe('Bargainer Class Configuration', () => {
    it('should have Bargainer with 80 max HP (AC: 2)', () => {
      const bargainer = CLASSES[CharacterClassId.BARGAINER];
      expect(bargainer.maxHp).toBe(80);
    });

    it('should have Bargainer with 3 max Resolve (AC: 3)', () => {
      const bargainer = CLASSES[CharacterClassId.BARGAINER];
      expect(bargainer.maxResolve).toBe(3);
    });

    it('should have correct Bargainer name', () => {
      const bargainer = CLASSES[CharacterClassId.BARGAINER];
      expect(bargainer.name).toBe('Bargainer');
    });

    it('should retrieve Bargainer by ID', () => {
      const bargainer = getClassById(CharacterClassId.BARGAINER);
      expect(bargainer).toBeDefined();
      expect(bargainer?.id).toBe(CharacterClassId.BARGAINER);
    });
  });

  describe('Bargainer Starter Deck Creation (AC: 1)', () => {
    it('should create exactly 10 cards total', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      expect(deck.length).toBe(10);
    });

    it('should have 3 Dark Pact cards', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const darkPacts = deck.filter((card) => card.id === 'dark_pact');
      expect(darkPacts.length).toBe(3);
    });

    it('should have 3 Infernal Shield cards', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const infernalShields = deck.filter((card) => card.id === 'infernal_shield');
      expect(infernalShields.length).toBe(3);
    });

    it('should have 2 Collect Favor cards', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const collectFavors = deck.filter((card) => card.id === 'collect_favor');
      expect(collectFavors.length).toBe(2);
    });

    it('should have 1 Debt Collector card', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const debtCollectors = deck.filter((card) => card.id === 'debt_collector');
      expect(debtCollectors.length).toBe(1);
    });

    it('should have 1 Blood Payment card', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const bloodPayments = deck.filter((card) => card.id === 'blood_payment');
      expect(bloodPayments.length).toBe(1);
    });

    it('should assign unique instance IDs to each card', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const instanceIds = deck.map((card) => card.instanceId);
      const uniqueIds = new Set(instanceIds);
      expect(uniqueIds.size).toBe(deck.length);
    });
  });

  describe('Bargainer Card Definitions', () => {
    describe('Dark Pact Card', () => {
      it('should be an Attack card', () => {
        const darkPact = BARGAINER_STARTER_CARDS.dark_pact;
        expect(darkPact.type).toBe(CardType.ATTACK);
      });

      it('should cost 1 Resolve', () => {
        const darkPact = BARGAINER_STARTER_CARDS.dark_pact;
        expect(darkPact.cost).toBe(1);
      });

      it('should deal 8 damage', () => {
        const darkPact = BARGAINER_STARTER_CARDS.dark_pact;
        expect(darkPact.effects.length).toBe(1);
        expect(darkPact.effects[0].type).toBe(EffectType.DAMAGE);
        expect(darkPact.effects[0].amount).toBe(8);
      });

      it('should have HP_DRAIN price', () => {
        const darkPact = BARGAINER_STARTER_CARDS.dark_pact;
        expect(darkPact.price).toBeDefined();
        expect(darkPact.price?.type).toBe(PriceType.HP_DRAIN);
        expect(darkPact.price?.amount).toBe(1);
      });
    });

    describe('Infernal Shield Card', () => {
      it('should be a Skill card', () => {
        const infernalShield = BARGAINER_STARTER_CARDS.infernal_shield;
        expect(infernalShield.type).toBe(CardType.SKILL);
      });

      it('should cost 1 Resolve', () => {
        const infernalShield = BARGAINER_STARTER_CARDS.infernal_shield;
        expect(infernalShield.cost).toBe(1);
      });

      it('should grant 10 block', () => {
        const infernalShield = BARGAINER_STARTER_CARDS.infernal_shield;
        expect(infernalShield.effects[0].type).toBe(EffectType.BLOCK);
        expect(infernalShield.effects[0].amount).toBe(10);
      });

      it('should have RESOLVE_TAX price', () => {
        const infernalShield = BARGAINER_STARTER_CARDS.infernal_shield;
        expect(infernalShield.price?.type).toBe(PriceType.RESOLVE_TAX);
        expect(infernalShield.price?.amount).toBe(1);
      });
    });

    describe('Collect Favor Card', () => {
      it('should be a Skill card', () => {
        const collectFavor = BARGAINER_STARTER_CARDS.collect_favor;
        expect(collectFavor.type).toBe(CardType.SKILL);
      });

      it('should cost 1 Resolve', () => {
        const collectFavor = BARGAINER_STARTER_CARDS.collect_favor;
        expect(collectFavor.cost).toBe(1);
      });

      it('should gain 2 Favor', () => {
        const collectFavor = BARGAINER_STARTER_CARDS.collect_favor;
        expect(collectFavor.effects[0].type).toBe(EffectType.GAIN_FAVOR);
        expect(collectFavor.effects[0].amount).toBe(2);
      });

      it('should not have a price', () => {
        const collectFavor = BARGAINER_STARTER_CARDS.collect_favor;
        expect(collectFavor.price).toBeUndefined();
      });
    });

    describe('Debt Collector Card', () => {
      it('should be an Attack card', () => {
        const debtCollector = BARGAINER_STARTER_CARDS.debt_collector;
        expect(debtCollector.type).toBe(CardType.ATTACK);
      });

      it('should cost 2 Resolve', () => {
        const debtCollector = BARGAINER_STARTER_CARDS.debt_collector;
        expect(debtCollector.cost).toBe(2);
      });

      it('should have DAMAGE_PER_PRICE effect with 3x multiplier', () => {
        const debtCollector = BARGAINER_STARTER_CARDS.debt_collector;
        expect(debtCollector.effects[0].type).toBe(EffectType.DAMAGE_PER_PRICE);
        expect(debtCollector.effects[0].multiplier).toBe(3);
      });
    });

    describe('Blood Payment Card', () => {
      it('should be a Skill card', () => {
        const bloodPayment = BARGAINER_STARTER_CARDS.blood_payment;
        expect(bloodPayment.type).toBe(CardType.SKILL);
      });

      it('should cost 0 Resolve', () => {
        const bloodPayment = BARGAINER_STARTER_CARDS.blood_payment;
        expect(bloodPayment.cost).toBe(0);
      });

      it('should lose 5 HP and remove all Prices', () => {
        const bloodPayment = BARGAINER_STARTER_CARDS.blood_payment;
        expect(bloodPayment.effects.length).toBe(2);
        expect(bloodPayment.effects[0].type).toBe(EffectType.LOSE_HP);
        expect(bloodPayment.effects[0].amount).toBe(5);
        expect(bloodPayment.effects[1].type).toBe(EffectType.REMOVE_ALL_PRICES);
      });
    });

    describe('Demonic Debt Curse', () => {
      it('should be a Curse card', () => {
        expect(DEMONIC_DEBT.type).toBe(CardType.CURSE);
      });

      it('should be unplayable (cost -1)', () => {
        expect(DEMONIC_DEBT.cost).toBe(-1);
        expect(DEMONIC_DEBT.unplayable).toBe(true);
      });

      it('should have onTurnEnd effect to lose 2 HP', () => {
        expect(DEMONIC_DEBT.onTurnEnd).toBeDefined();
        expect(DEMONIC_DEBT.onTurnEnd?.length).toBe(1);
        expect(DEMONIC_DEBT.onTurnEnd?.[0].type).toBe(EffectType.LOSE_HP);
        expect(DEMONIC_DEBT.onTurnEnd?.[0].amount).toBe(2);
      });
    });
  });

  describe('Favor System (AC: 4)', () => {
    it('should gain Favor from GAIN_FAVOR effect', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const collectFavor = deck.find((c) => c.id === 'collect_favor')!;

      const player = createTestPlayerState({
        hand: [collectFavor],
        drawPile: deck.filter((c) => c.id !== 'collect_favor'),
        favor: 0,
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      const result = engine.playCard(0, 0);

      expect(result.success).toBe(true);
      expect(engine.getState().player.favor).toBe(2);
    });

    it('should cap Favor at MAX_FAVOR (10)', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const collectFavor = deck.find((c) => c.id === 'collect_favor')!;

      const player = createTestPlayerState({
        hand: [collectFavor],
        drawPile: deck.filter((c) => c.id !== 'collect_favor'),
        favor: 9, // Already at 9
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0);

      // Should cap at 10, not go to 11
      expect(engine.getState().player.favor).toBe(MAX_FAVOR);
    });
  });

  describe('Price System - HP_DRAIN (AC: 5)', () => {
    it('should add HP_DRAIN price when playing Dark Pact', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const darkPact = deck.find((c) => c.id === 'dark_pact')!;

      const player = createTestPlayerState({
        hand: [darkPact],
        drawPile: deck.filter((c) => c.id !== 'dark_pact'),
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.activePrices.length).toBe(1);
      expect(state.player.activePrices[0].type).toBe(PriceType.HP_DRAIN);
      expect(state.player.activePrices[0].amount).toBe(1);
    });

    it('should drain HP at start of player turn from HP_DRAIN price', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const darkPact = deck.find((c) => c.id === 'dark_pact')!;

      const player = createTestPlayerState({
        hand: [darkPact],
        drawPile: deck.filter((c) => c.id !== 'dark_pact'),
        currentHp: 80,
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0); // Play Dark Pact, deals 8 damage, adds HP_DRAIN price

      // End turn - enemy acts, then new turn starts
      const endResult = engine.endTurn();

      // HP should have drained by 1 at start of turn 2
      expect(engine.getState().player.currentHp).toBe(79);
      expect(endResult.log.some(l => l.includes('Price: Lost 1 HP'))).toBe(true);
    });

    it('should kill player if HP_DRAIN drains to 0', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const darkPact = deck.find((c) => c.id === 'dark_pact')!;

      const player = createTestPlayerState({
        hand: [darkPact],
        drawPile: deck.filter((c) => c.id !== 'dark_pact'),
        currentHp: 1, // Only 1 HP left
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0);
      engine.endTurn();

      expect(engine.getState().player.currentHp).toBe(0);
      expect(engine.isGameOver()).toBe(true);
      expect(engine.getState().victory).toBe(false);
    });
  });

  describe('Price System - RESOLVE_TAX (AC: 6)', () => {
    it('should reduce max Resolve when playing card with RESOLVE_TAX price', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const infernalShield = deck.find((c) => c.id === 'infernal_shield')!;

      const player = createTestPlayerState({
        hand: [infernalShield],
        drawPile: deck.filter((c) => c.id !== 'infernal_shield'),
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      const initialMaxResolve = engine.getState().player.maxResolve;

      engine.playCard(0, 0); // Play Infernal Shield

      expect(engine.getState().player.maxResolve).toBe(initialMaxResolve - 1);
      expect(engine.getState().player.activePrices.length).toBe(1);
      expect(engine.getState().player.activePrices[0].type).toBe(PriceType.RESOLVE_TAX);
    });

    it('should not reduce max Resolve below 1', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const infernalShield = deck.find((c) => c.id === 'infernal_shield')!;

      const player = createTestPlayerState({
        hand: [infernalShield],
        drawPile: deck.filter((c) => c.id !== 'infernal_shield'),
        maxResolve: 1,
        baseMaxResolve: 3,
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0);

      expect(engine.getState().player.maxResolve).toBe(1);
    });
  });

  describe('Damage Per Price Effect (AC: 7)', () => {
    it('should deal damage based on number of active Prices', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const debtCollector = deck.find((c) => c.id === 'debt_collector')!;

      const player = createTestPlayerState({
        hand: [debtCollector],
        drawPile: deck.filter((c) => c.id !== 'debt_collector'),
        activePrices: [
          { id: 'p1', type: PriceType.HP_DRAIN, amount: 1, stacks: 0, sourceCardId: 'dark_pact' },
          { id: 'p2', type: PriceType.RESOLVE_TAX, amount: 1, stacks: 0, sourceCardId: 'infernal_shield' },
        ],
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0); // Debt Collector: 2 prices × 3 = 6 damage

      expect(engine.getState().enemies[0].currentHp).toBe(94); // 100 - 6
    });

    it('should deal 0 damage when no Prices are active', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const debtCollector = deck.find((c) => c.id === 'debt_collector')!;

      const player = createTestPlayerState({
        hand: [debtCollector],
        drawPile: deck.filter((c) => c.id !== 'debt_collector'),
        activePrices: [], // No prices
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0);

      expect(engine.getState().enemies[0].currentHp).toBe(100); // No damage
    });
  });

  describe('Remove All Prices Effect (AC: 8)', () => {
    it('should remove all Prices with Blood Payment', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const bloodPayment = deck.find((c) => c.id === 'blood_payment')!;

      const player = createTestPlayerState({
        hand: [bloodPayment],
        drawPile: deck.filter((c) => c.id !== 'blood_payment'),
        activePrices: [
          { id: 'p1', type: PriceType.HP_DRAIN, amount: 1, stacks: 0, sourceCardId: 'dark_pact' },
          { id: 'p2', type: PriceType.HP_DRAIN, amount: 1, stacks: 0, sourceCardId: 'dark_pact' },
        ],
        maxResolve: 2, // Assume we've taken some RESOLVE_TAX
        baseMaxResolve: 3,
        currentHp: 80,
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.activePrices.length).toBe(0);
      expect(state.player.currentHp).toBe(75); // 80 - 5 from Blood Payment
    });

    it('should restore max Resolve when removing RESOLVE_TAX prices', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const bloodPayment = deck.find((c) => c.id === 'blood_payment')!;

      const player = createTestPlayerState({
        hand: [bloodPayment],
        drawPile: deck.filter((c) => c.id !== 'blood_payment'),
        activePrices: [
          { id: 'p1', type: PriceType.RESOLVE_TAX, amount: 1, stacks: 0, sourceCardId: 'infernal_shield' },
        ],
        maxResolve: 2,
        baseMaxResolve: 3,
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0);

      expect(engine.getState().player.maxResolve).toBe(3); // Restored
    });
  });

  describe('Spend Favor to Remove Price (AC: 9)', () => {
    it('should allow spending Favor to remove a Price', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);

      const player = createTestPlayerState({
        hand: [],
        drawPile: deck,
        favor: 5,
        activePrices: [
          { id: 'p1', type: PriceType.HP_DRAIN, amount: 1, stacks: 0, sourceCardId: 'dark_pact' },
        ],
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();

      // Spend Favor to remove the HP_DRAIN price (costs 2 Favor)
      const result = engine.spendFavorToRemovePrice('p1');

      expect(result.success).toBe(true);
      expect(engine.getState().player.favor).toBe(3); // 5 - 2
      expect(engine.getState().player.activePrices.length).toBe(0);
    });

    it('should fail if not enough Favor', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);

      const player = createTestPlayerState({
        hand: [],
        drawPile: deck,
        favor: 1, // Not enough
        activePrices: [
          { id: 'p1', type: PriceType.HP_DRAIN, amount: 1, stacks: 0, sourceCardId: 'dark_pact' },
        ],
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();

      const result = engine.spendFavorToRemovePrice('p1');

      expect(result.success).toBe(false);
      expect(engine.getState().player.favor).toBe(1); // Unchanged
      expect(engine.getState().player.activePrices.length).toBe(1); // Still there
    });

    it('should fail if Price ID not found', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);

      const player = createTestPlayerState({
        hand: [],
        drawPile: deck,
        favor: 5,
        activePrices: [],
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();

      const result = engine.spendFavorToRemovePrice('nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Price not found');
    });

    it('should restore max Resolve when spending Favor to remove RESOLVE_TAX', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);

      const player = createTestPlayerState({
        hand: [],
        drawPile: deck,
        favor: 5,
        maxResolve: 2,
        baseMaxResolve: 3,
        activePrices: [
          { id: 'p1', type: PriceType.RESOLVE_TAX, amount: 1, stacks: 0, sourceCardId: 'infernal_shield' },
        ],
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();

      const result = engine.spendFavorToRemovePrice('p1');

      expect(result.success).toBe(true);
      expect(engine.getState().player.maxResolve).toBe(3);
    });
  });

  describe('Multiple Prices Accumulation', () => {
    it('should accumulate multiple HP_DRAIN prices', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);
      const darkPacts = deck.filter((c) => c.id === 'dark_pact');

      const player = createTestPlayerState({
        hand: [darkPacts[0], darkPacts[1]],
        drawPile: deck.filter((c) => c.id !== 'dark_pact'),
        resolve: 3,
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.playCard(0, 0); // First Dark Pact
      engine.playCard(0, 0); // Second Dark Pact (now at index 0)

      expect(engine.getState().player.activePrices.length).toBe(2);
    });

    it('should drain HP from multiple HP_DRAIN prices at turn start', () => {
      const deck = createStarterDeck(CharacterClassId.BARGAINER);

      const player = createTestPlayerState({
        hand: [],
        drawPile: deck,
        currentHp: 80,
        activePrices: [
          { id: 'p1', type: PriceType.HP_DRAIN, amount: 1, stacks: 0, sourceCardId: 'dark_pact' },
          { id: 'p2', type: PriceType.HP_DRAIN, amount: 2, stacks: 0, sourceCardId: 'dark_pact' },
        ],
      });

      const engine = new CombatEngine(player, [
        { id: 'dummy', name: 'Dummy', maxHp: 100, moves: [{ id: 'wait', name: 'Wait', intent: IntentType.DEFEND, weight: 1 }] },
      ]);

      engine.startCombat();
      engine.endTurn();

      // Should lose 1 + 2 = 3 HP from both HP_DRAIN prices
      expect(engine.getState().player.currentHp).toBe(77);
    });
  });
});
