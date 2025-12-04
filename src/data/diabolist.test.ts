import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import { CLASSES, createStarterDeck } from './classes';
import { DIABOLIST_CARDS, PAIN_CURSE } from './cards/diabolist';
import { getCardById } from './cards';
import {
  Card,
  CardType,
  CharacterClassId,
  CombatEventType,
  EffectType,
  EnemyDefinition,
  IntentType,
  PlayerState,
} from '@/types';

// Test fixtures
function createDiabolistPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  const diabolistClass = CLASSES[CharacterClassId.DIABOLIST];
  return {
    maxHp: diabolistClass.maxHp,
    currentHp: diabolistClass.maxHp,
    block: 0,
    resolve: diabolistClass.maxResolve,
    maxResolve: diabolistClass.maxResolve,
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
// STORY 3.1: Diabolist Class Tests
// =====================================================

describe('Story 3.1: Diabolist Class', () => {
  // AC 1: Diabolist starts with 70 max HP (glass cannon)
  describe('AC 1: Diabolist HP', () => {
    it('should have 70 max HP', () => {
      const diabolistClass = CLASSES[CharacterClassId.DIABOLIST];
      expect(diabolistClass.maxHp).toBe(70);
    });
  });

  // AC 2: Diabolist starts with 3 max Resolve per turn
  describe('AC 2: Diabolist Resolve', () => {
    it('should have 3 max Resolve', () => {
      const diabolistClass = CLASSES[CharacterClassId.DIABOLIST];
      expect(diabolistClass.maxResolve).toBe(3);
    });
  });

  // AC 3: Starter deck composition
  describe('AC 3: Starter Deck', () => {
    it('should have 10 cards in starter deck', () => {
      const deck = createStarterDeck(CharacterClassId.DIABOLIST);
      expect(deck.length).toBe(10);
    });

    it('should have 4x Soul Rend', () => {
      const deck = createStarterDeck(CharacterClassId.DIABOLIST);
      const soulRends = deck.filter(c => c.id === 'soul_rend');
      expect(soulRends.length).toBe(4);
    });

    it('should have 3x Dark Bargain', () => {
      const deck = createStarterDeck(CharacterClassId.DIABOLIST);
      const darkBargains = deck.filter(c => c.id === 'dark_bargain');
      expect(darkBargains.length).toBe(3);
    });

    it('should have 2x Blood Pact', () => {
      const deck = createStarterDeck(CharacterClassId.DIABOLIST);
      const bloodPacts = deck.filter(c => c.id === 'blood_pact');
      expect(bloodPacts.length).toBe(2);
    });

    it('should have 1x Hellfire', () => {
      const deck = createStarterDeck(CharacterClassId.DIABOLIST);
      const hellfires = deck.filter(c => c.id === 'hellfire');
      expect(hellfires.length).toBe(1);
    });
  });

  // AC 5: Pain curse card
  describe('AC 5: Pain Curse Card', () => {
    it('should be unplayable', () => {
      expect(PAIN_CURSE.unplayable).toBe(true);
    });

    it('should have cost 0', () => {
      expect(PAIN_CURSE.cost).toBe(0);
    });

    it('should have on-draw effect that loses 1 HP', () => {
      expect(PAIN_CURSE.onDraw).toBeDefined();
      expect(PAIN_CURSE.onDraw).toHaveLength(1);
      expect(PAIN_CURSE.onDraw![0].type).toBe(EffectType.LOSE_HP);
      expect(PAIN_CURSE.onDraw![0].amount).toBe(1);
    });

    it('should be a CURSE type', () => {
      expect(PAIN_CURSE.type).toBe(CardType.CURSE);
    });
  });

  // Test Soul Rend card
  describe('Soul Rend Card', () => {
    it('should deal 7 damage and cost 1 HP', () => {
      const soulRend = getCardById('soul_rend')!;
      expect(soulRend.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 7 });
      expect(soulRend.effects).toContainEqual({ type: EffectType.LOSE_HP, amount: 1 });
      expect(soulRend.cost).toBe(1);
    });

    it('should deal damage to enemy and HP loss to player when played', () => {
      const soulRend = createMockCard({
        ...DIABOLIST_CARDS.soul_rend,
        instanceId: 'soul_rend_0',
      });

      const player = createDiabolistPlayerState({
        hand: [soulRend],
        currentHp: 70,
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      const result = engine.playCard(0, 0);

      expect(result.success).toBe(true);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(43); // 50 - 7
      expect(state.player.currentHp).toBe(69); // 70 - 1
    });
  });

  // Test Dark Bargain card
  describe('Dark Bargain Card', () => {
    it('should gain 6 block and add Pain to discard', () => {
      const darkBargain = getCardById('dark_bargain')!;
      expect(darkBargain.effects).toContainEqual({ type: EffectType.BLOCK, amount: 6 });
      expect(darkBargain.effects).toContainEqual({
        type: EffectType.ADD_CARD_TO_DISCARD,
        amount: 1,
        cardId: 'pain',
      });
    });

    it('should add Pain to discard pile when played', () => {
      const darkBargain = createMockCard({
        ...DIABOLIST_CARDS.dark_bargain,
        instanceId: 'dark_bargain_0',
      });

      const player = createDiabolistPlayerState({
        hand: [darkBargain],
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      const result = engine.playCard(0, 0);

      expect(result.success).toBe(true);

      const state = engine.getState();
      expect(state.player.block).toBe(6);
      // Discard pile should have: dark_bargain + pain
      const painCards = state.player.discardPile.filter(c => c.id === 'pain');
      expect(painCards.length).toBe(1);
    });

    it('should increment Soul Debt when Pain is added', () => {
      const darkBargain = createMockCard({
        ...DIABOLIST_CARDS.dark_bargain,
        instanceId: 'dark_bargain_0',
      });

      const player = createDiabolistPlayerState({
        hand: [darkBargain],
        soulDebt: 0,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.soulDebt).toBe(1);
    });
  });

  // Test Blood Pact card
  describe('Blood Pact Card', () => {
    it('should deal 10 damage and add Pain to deck', () => {
      const bloodPact = getCardById('blood_pact')!;
      expect(bloodPact.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 10 });
      expect(bloodPact.effects).toContainEqual({
        type: EffectType.ADD_CARD_TO_DECK,
        amount: 1,
        cardId: 'pain',
      });
    });

    it('should add Pain to draw pile when played', () => {
      const bloodPact = createMockCard({
        ...DIABOLIST_CARDS.blood_pact,
        instanceId: 'blood_pact_0',
      });

      const player = createDiabolistPlayerState({
        hand: [bloodPact],
        drawPile: [],
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      const result = engine.playCard(0, 0);

      expect(result.success).toBe(true);

      const state = engine.getState();
      const painInDeck = state.player.drawPile.filter(c => c.id === 'pain');
      expect(painInDeck.length).toBe(1);
    });
  });

  // Test Hellfire card
  describe('Hellfire Card', () => {
    it('should deal 6 damage to all enemies and lose 2 HP', () => {
      const hellfire = getCardById('hellfire')!;
      expect(hellfire.effects).toContainEqual({ type: EffectType.DAMAGE_ALL, amount: 6 });
      expect(hellfire.effects).toContainEqual({ type: EffectType.LOSE_HP, amount: 2 });
      expect(hellfire.cost).toBe(2);
    });

    it('should damage all enemies when played', () => {
      const hellfire = createMockCard({
        ...DIABOLIST_CARDS.hellfire,
        instanceId: 'hellfire_0',
      });

      const player = createDiabolistPlayerState({
        hand: [hellfire],
        currentHp: 70,
        resolve: 3,
      });

      const enemy1 = createMockEnemyDefinition({ id: 'enemy1', maxHp: 30 });
      const enemy2 = createMockEnemyDefinition({ id: 'enemy2', maxHp: 30 });
      const engine = new CombatEngine(player, [enemy1, enemy2]);

      engine.startCombat();
      const result = engine.playCard(0, 0);

      expect(result.success).toBe(true);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(24); // 30 - 6
      expect(state.enemies[1].currentHp).toBe(24); // 30 - 6
      expect(state.player.currentHp).toBe(68); // 70 - 2
    });
  });

  // Test unplayable mechanic
  describe('Unplayable Cards', () => {
    it('should not be able to play Pain curse', () => {
      const pain = createMockCard({
        ...PAIN_CURSE,
        instanceId: 'pain_0',
      });

      const player = createDiabolistPlayerState({
        hand: [pain],
        resolve: 3,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();

      expect(engine.canPlayCard(0)).toBe(false);

      const result = engine.playCard(0, 0);
      expect(result.success).toBe(false);
      expect(result.message).toBe('This card cannot be played');
    });

    it('should not include unplayable cards in playable cards list', () => {
      const pain = createMockCard({
        ...PAIN_CURSE,
        instanceId: 'pain_0',
      });
      const soulRend = createMockCard({
        ...DIABOLIST_CARDS.soul_rend,
        instanceId: 'soul_rend_0',
      });

      const player = createDiabolistPlayerState({
        hand: [pain, soulRend],
        resolve: 3,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();

      const playable = engine.getPlayableCards();
      expect(playable).toContain(1); // soul_rend at index 1
      expect(playable).not.toContain(0); // pain at index 0
    });
  });

  // Test on-draw trigger
  describe('On-Draw Effects', () => {
    it('should trigger Pain damage when drawn', () => {
      const pain = createMockCard({
        ...PAIN_CURSE,
        instanceId: 'pain_0',
      });

      const player = createDiabolistPlayerState({
        drawPile: [pain],
        currentHp: 70,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      // Track HP changes
      let hpAfterDraw = 70;
      engine.subscribe((event) => {
        if (event.type === CombatEventType.PLAYER_HP_CHANGED) {
          hpAfterDraw = (event.data as { hp: number }).hp;
        }
      });

      engine.startCombat();

      // Pain should have triggered, dealing 1 damage
      expect(hpAfterDraw).toBe(69);
    });
  });

  // Test Soul Debt tracking
  describe('Soul Debt Tracking', () => {
    it('should start with 0 Soul Debt', () => {
      const player = createDiabolistPlayerState();
      expect(player.soulDebt).toBe(0);
    });

    it('should emit PLAYER_SOUL_DEBT_CHANGED event when curse added', () => {
      const darkBargain = createMockCard({
        ...DIABOLIST_CARDS.dark_bargain,
        instanceId: 'dark_bargain_0',
      });

      const player = createDiabolistPlayerState({
        hand: [darkBargain],
        soulDebt: 0,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      let soulDebtChanged = false;
      let newSoulDebt = 0;
      engine.subscribe((event) => {
        if (event.type === CombatEventType.PLAYER_SOUL_DEBT_CHANGED) {
          soulDebtChanged = true;
          newSoulDebt = (event.data as { soulDebt: number }).soulDebt;
        }
      });

      engine.startCombat();
      engine.playCard(0, 0);

      expect(soulDebtChanged).toBe(true);
      expect(newSoulDebt).toBe(1);
    });
  });
});
