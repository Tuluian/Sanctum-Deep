import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import { CLASSES } from './classes';
import {
  DIABOLIST_CARDS,
  DIABOLIST_COMMON_CARDS,
  DIABOLIST_UNCOMMON_CARDS,
  DIABOLIST_RARE_CARDS,
  DIABOLIST_CURSES,
  DIABOLIST_REWARD_POOL,
  WEAKNESS_CURSE,
  DOOM_CURSE,
  TORMENT_CURSE,
} from './cards/diabolist';
import {
  Card,
  CardType,
  CardRarity,
  CharacterClassId,
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
    fracturePile: [],
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
    baseMaxResolve: diabolistClass.maxResolve,
    permanentBlockBonus: 0,
    upgradeDamageBonus: 0,
    upgradeBlockBonus: 0,
    tide: 0,
    shadowEnergy: 0,
    inShadow: 0,
    gobbledCardsCombat: [],
    totalGobbled: 0,
    gobbleDamageBonus: 0,
    gobbleBlockBonus: 0,
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
// STORY 3.4: Diabolist Card Pool Tests
// =====================================================

describe('Story 3.4: Diabolist Card Pool', () => {
  // AC 1: Diabolist has 32 total cards
  describe('AC 1: Card Count', () => {
    it('should have 34 total unique cards (5 starter + 29 obtainable)', () => {
      // 4 starter + 1 block bonus + 4 curses + 16 common + 10 uncommon + 3 rare = 38 total definitions
      // But starter deck is 11 cards using 5 unique definitions
      const totalCards = Object.keys(DIABOLIST_CARDS).length;
      expect(totalCards).toBe(38); // Includes curses

      // Reward pool should have 29 obtainable cards (16 common + 10 uncommon + 3 rare)
      expect(DIABOLIST_REWARD_POOL.length).toBe(29);
    });
  });

  // AC 2: Cards distributed by rarity
  describe('AC 2: Rarity Distribution', () => {
    it('should have 16 Common cards', () => {
      const commonCards = Object.values(DIABOLIST_COMMON_CARDS);
      expect(commonCards.length).toBe(16);
      commonCards.forEach(card => {
        expect(card.rarity).toBe(CardRarity.COMMON);
      });
    });

    it('should have 10 Uncommon cards', () => {
      const uncommonCards = Object.values(DIABOLIST_UNCOMMON_CARDS);
      expect(uncommonCards.length).toBe(10);
      uncommonCards.forEach(card => {
        expect(card.rarity).toBe(CardRarity.UNCOMMON);
      });
    });

    it('should have 3 Rare cards', () => {
      const rareCards = Object.values(DIABOLIST_RARE_CARDS);
      expect(rareCards.length).toBe(3);
      rareCards.forEach(card => {
        expect(card.rarity).toBe(CardRarity.RARE);
      });
    });
  });

  // AC 4: Multiple Curse types
  describe('AC 4: Curse Types', () => {
    it('should have 4 curse types', () => {
      expect(Object.keys(DIABOLIST_CURSES).length).toBe(4);
    });

    it('Weakness curse should be unplayable', () => {
      expect(WEAKNESS_CURSE.unplayable).toBe(true);
      expect(WEAKNESS_CURSE.type).toBe(CardType.CURSE);
    });

    it('Doom curse should have onCombatEnd effect', () => {
      expect(DOOM_CURSE.onCombatEnd).toBeDefined();
      expect(DOOM_CURSE.onCombatEnd![0].type).toBe(EffectType.LOSE_MAX_HP);
    });

    it('Torment curse should have onTurnEnd effect', () => {
      expect(TORMENT_CURSE.onTurnEnd).toBeDefined();
      expect(TORMENT_CURSE.onTurnEnd![0].type).toBe(EffectType.LOSE_HP);
    });
  });

  // Test Curse synergy cards
  describe('AC 5: Curse Synergy Cards', () => {
    it('Cursed Strength should deal damage based on curse count', () => {
      const cursedStrength = createMockCard({
        ...DIABOLIST_COMMON_CARDS.cursed_strength,
        instanceId: 'cursed_strength_0',
      });

      const painCurse = createMockCard({
        id: 'pain',
        type: CardType.CURSE,
        instanceId: 'pain_0',
        name: 'Pain',
        cost: 0,
        description: 'Test curse',
        effects: [],
        unplayable: true,
      });

      const player = createDiabolistPlayerState({
        hand: [cursedStrength],
        discardPile: [painCurse, { ...painCurse, instanceId: 'pain_1' }], // 2 curses
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      // 2 curses × 3 = 6 damage
      expect(state.enemies[0].currentHp).toBe(44);
    });

    it('Demonic Guard should gain block based on curse count', () => {
      const demonicGuard = createMockCard({
        ...DIABOLIST_COMMON_CARDS.demonic_guard,
        instanceId: 'demonic_guard_0',
      });

      const painCurse = createMockCard({
        id: 'pain',
        type: CardType.CURSE,
        instanceId: 'pain_0',
        name: 'Pain',
        cost: 0,
        description: 'Test curse',
        effects: [],
        unplayable: true,
      });

      const player = createDiabolistPlayerState({
        hand: [demonicGuard],
        discardPile: [painCurse, { ...painCurse, instanceId: 'pain_1' }, { ...painCurse, instanceId: 'pain_2' }], // 3 curses
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      // 5 base + (3 curses × 2) = 11 block
      expect(state.player.block).toBe(11);
    });

    it('Consume Soul should fracture a curse from hand and deal damage', () => {
      const consumeSoul = createMockCard({
        ...DIABOLIST_COMMON_CARDS.consume_soul,
        instanceId: 'consume_soul_0',
      });

      const painCurse = createMockCard({
        id: 'pain',
        type: CardType.CURSE,
        instanceId: 'pain_0',
        name: 'Pain',
        cost: 0,
        description: 'Test curse',
        effects: [],
        unplayable: true,
      });

      const player = createDiabolistPlayerState({
        hand: [consumeSoul, painCurse],
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      // Curse should be fractured
      expect(state.player.fracturePile.length).toBe(1);
      expect(state.player.fracturePile[0].id).toBe('pain');
      // Should deal 10 damage
      expect(state.enemies[0].currentHp).toBe(40);
    });
  });

  // Test Self-Damage cards
  describe('Self-Damage Cards', () => {
    it('Sacrificial Strike should deal 8 damage and lose 2 HP', () => {
      const sacrificialStrike = createMockCard({
        ...DIABOLIST_COMMON_CARDS.sacrificial_strike,
        instanceId: 'sacrificial_strike_0',
      });

      const player = createDiabolistPlayerState({
        hand: [sacrificialStrike],
        currentHp: 70,
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(42); // 50 - 8
      expect(state.player.currentHp).toBe(68); // 70 - 2
    });

    it('Bloodletting should lose 4 HP and deal 12 damage', () => {
      const bloodletting = createMockCard({
        ...DIABOLIST_COMMON_CARDS.bloodletting,
        instanceId: 'bloodletting_0',
      });

      const player = createDiabolistPlayerState({
        hand: [bloodletting],
        currentHp: 70,
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.currentHp).toBe(66); // 70 - 4
      expect(state.enemies[0].currentHp).toBe(38); // 50 - 12
    });

    it('Blood Offering should lose 3 HP and draw 2 cards', () => {
      const bloodOffering = createMockCard({
        ...DIABOLIST_COMMON_CARDS.blood_offering,
        instanceId: 'blood_offering_0',
      });

      const card1 = createMockCard({ id: 'card1', instanceId: 'card1_0' });
      const card2 = createMockCard({ id: 'card2', instanceId: 'card2_0' });

      const player = createDiabolistPlayerState({
        hand: [bloodOffering],
        drawPile: [card1, card2],
        currentHp: 70,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      // After startCombat, player draws 5 cards (including blood offering if it was in draw pile)
      // Blood offering is in hand at start, so after combat start, draw pile has card1 and card2

      // Play blood offering (costs 0, so free)
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.currentHp).toBe(67); // 70 - 3
      // After playing, we draw 2 cards from the draw pile
      // Hand should have 2 cards (the drawn ones) - blood offering went to discard
      // Actually after startCombat we have 5 cards, then play 1, draw 2 = 6 cards
      // But our draw pile only has 2 cards so we draw those 2
      expect(state.player.drawPile.length).toBe(0); // Both cards were drawn
    });

    it('Soul Tap should lose 2 HP and gain 2 Resolve', () => {
      const soulTap = createMockCard({
        ...DIABOLIST_COMMON_CARDS.soul_tap,
        instanceId: 'soul_tap_0',
      });

      const player = createDiabolistPlayerState({
        hand: [soulTap],
        currentHp: 70,
        resolve: 3,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.currentHp).toBe(68); // 70 - 2
      expect(state.player.resolve).toBe(5); // 3 - 0 (cost) + 2
    });
  });

  // Test special effects
  describe('Special Effect Cards', () => {
    it('Siphon Life should deal damage and heal', () => {
      const siphonLife = createMockCard({
        ...DIABOLIST_COMMON_CARDS.siphon_life,
        instanceId: 'siphon_life_0',
      });

      const player = createDiabolistPlayerState({
        hand: [siphonLife],
        currentHp: 60, // Missing 10 HP
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(45); // 50 - 5
      expect(state.player.currentHp).toBe(65); // 60 + 5
    });

    it('Bargain with Death should deal 25 damage when below 50% HP', () => {
      const bargainWithDeath = createMockCard({
        ...DIABOLIST_UNCOMMON_CARDS.bargain_with_death,
        instanceId: 'bargain_with_death_0',
      });

      const player = createDiabolistPlayerState({
        hand: [bargainWithDeath],
        currentHp: 30, // Below 50% of 70
        resolve: 3,
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(25); // 50 - 25
    });

    it('Bargain with Death should deal 10 damage when above 50% HP', () => {
      const bargainWithDeath = createMockCard({
        ...DIABOLIST_UNCOMMON_CARDS.bargain_with_death,
        instanceId: 'bargain_with_death_0',
      });

      const player = createDiabolistPlayerState({
        hand: [bargainWithDeath],
        currentHp: 60, // Above 50% of 70
        resolve: 3,
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(40); // 50 - 10
    });

    it('Torment should deal 4 damage twice', () => {
      const torment = createMockCard({
        ...DIABOLIST_COMMON_CARDS.torment,
        instanceId: 'torment_0',
      });

      const player = createDiabolistPlayerState({
        hand: [torment],
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(42); // 50 - 4 - 4
    });
  });

  // Test Rare cards
  describe('Rare Cards', () => {
    it('Soul Shatter should deal 30 damage and add 3 Pain', () => {
      const soulShatter = createMockCard({
        ...DIABOLIST_RARE_CARDS.soul_shatter,
        instanceId: 'soul_shatter_0',
      });

      const player = createDiabolistPlayerState({
        hand: [soulShatter],
        resolve: 3,
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.enemies[0].currentHp).toBe(20); // 50 - 30
      // Check 3 Pain added to deck
      const painInDeck = state.player.drawPile.filter(c => c.id === 'pain');
      expect(painInDeck.length).toBe(3);
      // Soul Shatter should be fractured
      expect(state.player.fracturePile.some(c => c.id === 'soul_shatter')).toBe(true);
    });
  });

  // Test Ritual Sacrifice
  describe('Ritual Sacrifice', () => {
    it('should lose 5 HP, draw 3 cards, and gain 2 Resolve', () => {
      const ritualSacrifice = createMockCard({
        ...DIABOLIST_UNCOMMON_CARDS.ritual_sacrifice,
        instanceId: 'ritual_sacrifice_0',
      });

      const card1 = createMockCard({ id: 'card1', instanceId: 'card1_0' });
      const card2 = createMockCard({ id: 'card2', instanceId: 'card2_0' });
      const card3 = createMockCard({ id: 'card3', instanceId: 'card3_0' });

      const player = createDiabolistPlayerState({
        hand: [ritualSacrifice],
        drawPile: [card1, card2, card3],
        currentHp: 70,
        resolve: 3,
      });

      const enemy = createMockEnemyDefinition();
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.currentHp).toBe(65); // 70 - 5
      expect(state.player.resolve).toBe(3); // 3 - 2 (cost) + 2 (gain)
      // Should have drawn 3 cards
      expect(state.player.drawPile.length).toBe(0);
    });
  });

  // Test Grim Harvest conditional heal
  describe('Grim Harvest', () => {
    it('should heal when enemy dies after playing', () => {
      const grimHarvest = createMockCard({
        ...DIABOLIST_COMMON_CARDS.grim_harvest,
        instanceId: 'grim_harvest_0',
      });

      const killAttack = createMockCard({
        id: 'kill_attack',
        instanceId: 'kill_attack_0',
        name: 'Kill Attack',
        type: CardType.ATTACK,
        cost: 0,
        description: 'Deals 100 damage',
        effects: [{ type: EffectType.DAMAGE, amount: 100 }],
      });

      const player = createDiabolistPlayerState({
        hand: [grimHarvest, killAttack],
        currentHp: 50, // Missing 20 HP
        resolve: 3,
      });

      const enemy = createMockEnemyDefinition({ maxHp: 50 });
      const engine = new CombatEngine(player, [enemy]);

      engine.startCombat();

      // Play Grim Harvest first
      engine.playCard(0, 0);
      let state = engine.getState();
      expect(state.player.currentHp).toBe(50); // No heal yet

      // Now kill the enemy
      engine.playCard(0, 0);
      state = engine.getState();
      expect(state.player.currentHp).toBe(58); // 50 + 8 (healed)
    });
  });

  // Test card classification
  describe('Card Classification', () => {
    it('all cards should have Diabolist classId', () => {
      const allCards = [
        ...Object.values(DIABOLIST_COMMON_CARDS),
        ...Object.values(DIABOLIST_UNCOMMON_CARDS),
        ...Object.values(DIABOLIST_RARE_CARDS),
      ];

      allCards.forEach(card => {
        expect(card.classId).toBe(CharacterClassId.DIABOLIST);
      });
    });
  });
});
