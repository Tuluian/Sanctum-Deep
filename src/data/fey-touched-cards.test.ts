import { describe, it, expect, beforeEach } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import {
  CardType,
  CardRarity,
  EffectType,
  PlayerState,
  EnemyDefinition,
  CharacterClassId,
  IntentType,
} from '@/types';
import {
  FEY_TOUCHED_STARTER_CARDS,
  FEY_TOUCHED_COMMON_CARDS,
  FEY_TOUCHED_UNCOMMON_CARDS,
  FEY_TOUCHED_RARE_CARDS,
  FEY_TOUCHED_REWARD_POOL,
} from '@/data/cards/fey_touched';

// Test enemy definition
const TEST_ENEMY: EnemyDefinition = {
  id: 'test_enemy',
  name: 'Test Enemy',
  maxHp: 100,
  moves: [
    { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 5, weight: 1 },
  ],
};

// Helper to create player state
function createPlayerState(overrides?: Partial<PlayerState>): PlayerState {
  return {
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

describe('Fey-Touched Card Pool', () => {
  describe('Starter Cards', () => {
    it('should have 4 starter cards', () => {
      expect(Object.keys(FEY_TOUCHED_STARTER_CARDS)).toHaveLength(4);
    });

    it('Fey Bolt should have whimsy with 4-8 damage range', () => {
      const card = FEY_TOUCHED_STARTER_CARDS.fey_bolt;
      expect(card.type).toBe(CardType.ATTACK);
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(5); // 4, 5, 6, 7, 8
      expect(card.whimsy![0].effects[0].amount).toBe(4);
      expect(card.whimsy![4].effects[0].amount).toBe(8);
    });

    it('Glamour should have whimsy with 4-8 block range', () => {
      const card = FEY_TOUCHED_STARTER_CARDS.glamour;
      expect(card.type).toBe(CardType.SKILL);
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(5);
    });

    it("Pixie's Gift should have 3 different outcomes", () => {
      const card = FEY_TOUCHED_STARTER_CARDS.pixies_gift;
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(3);
    });

    it("Trickster's Trade should gain Luck", () => {
      const card = FEY_TOUCHED_STARTER_CARDS.tricksters_trade;
      expect(card.effects).toContainEqual({ type: EffectType.GAIN_LUCK, amount: 1 });
    });
  });

  describe('Common Cards', () => {
    it('should have 15 common cards', () => {
      expect(Object.keys(FEY_TOUCHED_COMMON_CARDS)).toHaveLength(15);
    });

    it('all common cards should have COMMON rarity', () => {
      Object.values(FEY_TOUCHED_COMMON_CARDS).forEach(card => {
        expect(card.rarity).toBe(CardRarity.COMMON);
      });
    });

    it('Wild Strike should have 5-9 damage whimsy range', () => {
      const card = FEY_TOUCHED_COMMON_CARDS.wild_strike;
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(5);
      expect(card.whimsy![0].effects[0].amount).toBe(5);
      expect(card.whimsy![4].effects[0].amount).toBe(9);
    });

    it('Lucky Coin should cost 0 and gain 2 Luck', () => {
      const card = FEY_TOUCHED_COMMON_CARDS.lucky_coin;
      expect(card.cost).toBe(0);
      expect(card.effects).toContainEqual({ type: EffectType.GAIN_LUCK, amount: 2 });
    });

    it('Lucky Strike should deal damage and gain Luck', () => {
      const card = FEY_TOUCHED_COMMON_CARDS.lucky_strike;
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 5 });
      expect(card.effects).toContainEqual({ type: EffectType.GAIN_LUCK, amount: 1 });
    });

    it('Chaotic Bolt should deal damage to random enemy twice', () => {
      const card = FEY_TOUCHED_COMMON_CARDS.chaotic_bolt;
      expect(card.effects.filter(e => e.type === EffectType.DAMAGE_RANDOM_ENEMY)).toHaveLength(2);
    });

    it('Fortuitous Block should have luck-based bonus block', () => {
      const card = FEY_TOUCHED_COMMON_CARDS.fortuitous_block;
      expect(card.effects).toContainEqual({ type: EffectType.BLOCK, amount: 6 });
      expect(card.effects).toContainEqual({ type: EffectType.BLOCK_IF_LUCK, amount: 6 });
    });

    it('Fey Fire should have base damage plus whimsy bonus', () => {
      const card = FEY_TOUCHED_COMMON_CARDS.fey_fire;
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 6 });
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(3); // +4 dmg, heal 4, draw 1
    });

    it("Gambler's Strike should have 50/50 whimsy", () => {
      const card = FEY_TOUCHED_COMMON_CARDS.gamblers_strike;
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 3 });
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(2);
      expect(card.whimsy![0].weight).toBe(1);
      expect(card.whimsy![1].weight).toBe(1);
    });

    it('Illusory Armor should have weighted whimsy (75% full, 25% half)', () => {
      const card = FEY_TOUCHED_COMMON_CARDS.illusory_armor;
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy![0].weight).toBe(3); // 10 block (75%)
      expect(card.whimsy![1].weight).toBe(1); // 5 block (25%)
    });
  });

  describe('Uncommon Cards', () => {
    it('should have 8 uncommon cards', () => {
      expect(Object.keys(FEY_TOUCHED_UNCOMMON_CARDS)).toHaveLength(8);
    });

    it('all uncommon cards should have UNCOMMON rarity', () => {
      Object.values(FEY_TOUCHED_UNCOMMON_CARDS).forEach(card => {
        expect(card.rarity).toBe(CardRarity.UNCOMMON);
      });
    });

    it('Wild Magic should have 4 high-value whimsy outcomes', () => {
      const card = FEY_TOUCHED_UNCOMMON_CARDS.wild_magic;
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(4);
      // Check all have value of 15 or draw 4
      expect(card.whimsy![0].effects[0].amount).toBe(15); // 15 damage
      expect(card.whimsy![1].effects[0].amount).toBe(15); // 15 block
      expect(card.whimsy![2].effects[0].amount).toBe(4);  // draw 4
      expect(card.whimsy![3].effects[0].amount).toBe(15); // heal 15
    });

    it('Luck Surge should gain 5 Luck and set guaranteed best', () => {
      const card = FEY_TOUCHED_UNCOMMON_CARDS.luck_surge;
      expect(card.effects).toContainEqual({ type: EffectType.GAIN_LUCK, amount: 5 });
      expect(card.effects).toContainEqual({ type: EffectType.SET_GUARANTEED_BEST, amount: 1 });
    });

    it('Probability Storm should hit 3-5 times', () => {
      const card = FEY_TOUCHED_UNCOMMON_CARDS.probability_storm;
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(3);
      expect(card.whimsy![0].effects.length).toBe(3); // 3 hits
      expect(card.whimsy![1].effects.length).toBe(4); // 4 hits
      expect(card.whimsy![2].effects.length).toBe(5); // 5 hits
    });

    it("Fortune's Favor should spend all Luck", () => {
      const card = FEY_TOUCHED_UNCOMMON_CARDS.fortunes_favor;
      expect(card.effects).toContainEqual({ type: EffectType.SPEND_ALL_LUCK, amount: 2 });
    });

    it('Serendipity should be a Power card', () => {
      const card = FEY_TOUCHED_UNCOMMON_CARDS.serendipity;
      expect(card.type).toBe(CardType.POWER);
    });

    it('Chaos Theory should be a Power card with whimsy', () => {
      const card = FEY_TOUCHED_UNCOMMON_CARDS.chaos_theory;
      expect(card.type).toBe(CardType.POWER);
      expect(card.whimsy).toBeDefined();
    });
  });

  describe('Rare Cards', () => {
    it('should have 3 rare cards', () => {
      expect(Object.keys(FEY_TOUCHED_RARE_CARDS)).toHaveLength(3);
    });

    it('all rare cards should have RARE rarity', () => {
      Object.values(FEY_TOUCHED_RARE_CARDS).forEach(card => {
        expect(card.rarity).toBe(CardRarity.RARE);
      });
    });

    it('Master of Chaos should be a Power card', () => {
      const card = FEY_TOUCHED_RARE_CARDS.master_of_chaos;
      expect(card.type).toBe(CardType.POWER);
      expect(card.cost).toBe(3);
    });

    it('Wish should exhaust and have powerful whimsy options', () => {
      const card = FEY_TOUCHED_RARE_CARDS.wish;
      expect(card.exhaust).toBe(true);
      expect(card.cost).toBe(4);
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(4);
      // All options should have value of 20 or draw 5
      card.whimsy!.forEach(outcome => {
        const amount = outcome.effects[0].amount;
        expect([20, 5]).toContain(amount);
      });
    });

    it("Fey Lord's Gambit should have risk/reward whimsy", () => {
      const card = FEY_TOUCHED_RARE_CARDS.fey_lords_gambit;
      expect(card.whimsy).toBeDefined();
      expect(card.whimsy!.length).toBe(5);
      // Best outcome: 30 damage, no self damage
      const bestOutcome = card.whimsy![4];
      expect(bestOutcome.effects[0].amount).toBe(30);
      expect(bestOutcome.effects.length).toBe(1); // Only damage, no LOSE_HP
      // Worst outcome: 10 damage, 10 self damage
      const worstOutcome = card.whimsy![0];
      expect(worstOutcome.effects[0].amount).toBe(10);
      expect(worstOutcome.effects[1].type).toBe(EffectType.LOSE_HP);
      expect(worstOutcome.effects[1].amount).toBe(10);
    });
  });

  describe('Reward Pool', () => {
    it('should have 26 reward cards (15 common + 8 uncommon + 3 rare)', () => {
      expect(FEY_TOUCHED_REWARD_POOL).toHaveLength(26);
    });

    it('should not include starter cards', () => {
      const starterIds = Object.keys(FEY_TOUCHED_STARTER_CARDS);
      const rewardIds = FEY_TOUCHED_REWARD_POOL.map(c => c.id);
      starterIds.forEach(id => {
        expect(rewardIds).not.toContain(id);
      });
    });

    it('all cards should be Fey-Touched class', () => {
      FEY_TOUCHED_REWARD_POOL.forEach(card => {
        expect(card.classId).toBe(CharacterClassId.FEY_TOUCHED);
      });
    });
  });

  describe('Combat Integration - Luck Mechanics', () => {
    let engine: CombatEngine;
    let player: PlayerState;

    beforeEach(() => {
      player = createPlayerState({ resolve: 5 });
      engine = new CombatEngine(player, [TEST_ENEMY]);
      engine.startCombat();
    });

    it('should gain Luck from Lucky Coin', () => {
      const luckyCoin = { ...FEY_TOUCHED_COMMON_CARDS.lucky_coin, instanceId: 'coin1' };
      player.hand = [luckyCoin];
      player.drawPile = [];

      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.luck).toBe(2);
    });

    it('BLOCK_IF_LUCK should only grant bonus when luck > 5', () => {
      const fortuitousBlock = { ...FEY_TOUCHED_COMMON_CARDS.fortuitous_block, instanceId: 'fb1' };
      player.hand = [fortuitousBlock];
      player.drawPile = [];
      player.luck = 3; // Below threshold

      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.block).toBe(6); // Only base block, no bonus
    });

    it('BLOCK_IF_LUCK should grant bonus when luck > 5', () => {
      const fortuitousBlock = { ...FEY_TOUCHED_COMMON_CARDS.fortuitous_block, instanceId: 'fb1' };
      player.hand = [fortuitousBlock];
      player.drawPile = [];
      player.luck = 7; // Above threshold

      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.block).toBe(12); // 6 base + 6 bonus
    });

    it('SPEND_ALL_LUCK should convert luck to damage and block', () => {
      const fortunesFavor = { ...FEY_TOUCHED_UNCOMMON_CARDS.fortunes_favor, instanceId: 'ff1' };
      player.hand = [fortunesFavor];
      player.drawPile = [];
      player.luck = 5;

      const enemyHpBefore = engine.getState().enemies[0].currentHp;
      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.luck).toBe(0); // Spent all
      expect(state.player.block).toBe(10); // 5 luck × 2
      expect(enemyHpBefore - state.enemies[0].currentHp).toBe(10); // 5 luck × 2
    });

    it('SET_GUARANTEED_BEST should set the guaranteedBest flag', () => {
      const luckSurge = { ...FEY_TOUCHED_UNCOMMON_CARDS.luck_surge, instanceId: 'surge1' };
      player.hand = [luckSurge];
      player.drawPile = [];

      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.luck).toBe(5);
      expect(state.player.guaranteedBest).toBe(true);
    });

    it('DAMAGE_RANDOM_ENEMY should deal damage to an enemy', () => {
      const chaoticBolt = { ...FEY_TOUCHED_COMMON_CARDS.chaotic_bolt, instanceId: 'bolt1' };
      player.hand = [chaoticBolt];
      player.drawPile = [];

      const enemyHpBefore = engine.getState().enemies[0].currentHp;
      engine.playCard(0, 0);

      const state = engine.getState();
      // Should deal 4 damage twice = 8 total
      expect(enemyHpBefore - state.enemies[0].currentHp).toBe(8);
    });
  });

  describe('Whimsy Resolution', () => {
    let engine: CombatEngine;
    let player: PlayerState;

    beforeEach(() => {
      player = createPlayerState({ resolve: 5 });
      engine = new CombatEngine(player, [TEST_ENEMY]);
      engine.startCombat();
    });

    it('should resolve whimsy and deal damage within range', () => {
      const wildStrike = { ...FEY_TOUCHED_COMMON_CARDS.wild_strike, instanceId: 'ws1' };
      player.hand = [wildStrike];
      player.drawPile = [];

      const enemyHpBefore = engine.getState().enemies[0].currentHp;
      engine.playCard(0, 0);

      const state = engine.getState();
      const damageDone = enemyHpBefore - state.enemies[0].currentHp;
      // Should be between 5-9 damage
      expect(damageDone).toBeGreaterThanOrEqual(5);
      expect(damageDone).toBeLessThanOrEqual(9);
    });

    it('guaranteed best should select highest value outcome', () => {
      const feyLordsGambit = { ...FEY_TOUCHED_RARE_CARDS.fey_lords_gambit, instanceId: 'gambit1' };
      player.hand = [feyLordsGambit];
      player.drawPile = [];
      player.guaranteedBest = true;
      player.resolve = 5;

      const playerHpBefore = player.currentHp;
      const enemyHpBefore = engine.getState().enemies[0].currentHp;
      engine.playCard(0, 0);

      const state = engine.getState();
      // Best outcome is 30 damage, 0 self damage
      expect(enemyHpBefore - state.enemies[0].currentHp).toBe(30);
      expect(state.player.currentHp).toBe(playerHpBefore); // No self damage
      expect(state.player.guaranteedBest).toBe(false); // Should be consumed
    });
  });
});
