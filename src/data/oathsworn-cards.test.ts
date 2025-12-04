import { describe, it, expect, beforeEach } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import {
  CardType,
  CardRarity,
  EffectType,
  PlayerState,
  EnemyDefinition,
  VowBonusType,
  VowRestrictionType,
  CharacterClassId,
  IntentType,
} from '@/types';
import {
  OATHSWORN_STARTER_CARDS,
  OATHSWORN_COMMON_CARDS,
  OATHSWORN_UNCOMMON_CARDS,
  OATHSWORN_RARE_CARDS,
  OATHSWORN_REWARD_POOL,
  OATHSWORN_VOWS,
} from '@/data/cards/oathsworn';

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
    radiance: 0,
    maxRadiance: 10,
    minions: [],
    favor: 0,
    activePrices: [],
    baseMaxResolve: 3,
    ...overrides,
  };
}

describe('Oathsworn Card Pool', () => {
  describe('Vow Definitions', () => {
    it('should have all 6 vow types defined', () => {
      expect(Object.keys(OATHSWORN_VOWS)).toHaveLength(6);
      expect(OATHSWORN_VOWS.oath_of_valor).toBeDefined();
      expect(OATHSWORN_VOWS.oath_of_protection).toBeDefined();
      expect(OATHSWORN_VOWS.oath_of_retribution).toBeDefined();
      expect(OATHSWORN_VOWS.sacred_vow).toBeDefined();
      expect(OATHSWORN_VOWS.vow_of_silence).toBeDefined();
      expect(OATHSWORN_VOWS.martyrs_oath).toBeDefined();
    });

    it('Oath of Valor should boost damage and restrict block', () => {
      const vow = OATHSWORN_VOWS.oath_of_valor;
      expect(vow.bonus.type).toBe(VowBonusType.DAMAGE_BOOST);
      expect(vow.bonus.amount).toBe(4);
      expect(vow.restriction.type).toBe(VowRestrictionType.NO_BLOCK);
      expect(vow.charges).toBe(3);
    });

    it('Oath of Protection should give block and restrict attacks', () => {
      const vow = OATHSWORN_VOWS.oath_of_protection;
      expect(vow.bonus.type).toBe(VowBonusType.BLOCK_PER_TURN);
      expect(vow.restriction.type).toBe(VowRestrictionType.NO_ATTACK);
      expect(vow.charges).toBe(5);
    });

    it('Oath of Retribution should give thorns and require attacking', () => {
      const vow = OATHSWORN_VOWS.oath_of_retribution;
      expect(vow.bonus.type).toBe(VowBonusType.THORNS);
      expect(vow.bonus.amount).toBe(5);
      expect(vow.restriction.type).toBe(VowRestrictionType.MUST_ATTACK);
      expect(vow.charges).toBe(4);
    });

    it("Martyr's Oath should heal on damage and restrict normal healing", () => {
      const vow = OATHSWORN_VOWS.martyrs_oath;
      expect(vow.bonus.type).toBe(VowBonusType.HEAL_ON_DAMAGE);
      expect(vow.bonus.amount).toBe(3);
      expect(vow.restriction.type).toBe(VowRestrictionType.NO_HEAL);
      expect(vow.charges).toBe(5);
    });
  });

  describe('Starter Cards', () => {
    it('should have 4 starter cards', () => {
      expect(Object.keys(OATHSWORN_STARTER_CARDS)).toHaveLength(4);
    });

    it('Righteous Strike should deal 6 damage', () => {
      const card = OATHSWORN_STARTER_CARDS.righteous_strike;
      expect(card.type).toBe(CardType.ATTACK);
      expect(card.cost).toBe(1);
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 6 });
    });

    it('Oath of Valor card should activate the vow', () => {
      const card = OATHSWORN_STARTER_CARDS.oath_of_valor;
      expect(card.type).toBe(CardType.POWER);
      expect(card.activatesVow).toBe('oath_of_valor');
    });

    it('Judgment should require a Vow', () => {
      const card = OATHSWORN_STARTER_CARDS.judgment;
      expect(card.requiresVow).toBe(true);
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 12 });
    });
  });

  describe('Common Cards', () => {
    it('should have 15 common cards', () => {
      expect(Object.keys(OATHSWORN_COMMON_CARDS)).toHaveLength(15);
    });

    it('all common cards should have COMMON rarity', () => {
      Object.values(OATHSWORN_COMMON_CARDS).forEach(card => {
        expect(card.rarity).toBe(CardRarity.COMMON);
      });
    });

    it('Zealous Strike should have conditional Vow damage', () => {
      const card = OATHSWORN_COMMON_CARDS.zealous_strike;
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 5 });
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE_IF_VOW, amount: 3 });
    });

    it('Vow Keeper should extend Vow by 1 charge', () => {
      const card = OATHSWORN_COMMON_CARDS.vow_keeper;
      expect(card.cost).toBe(0);
      expect(card.effects).toContainEqual({ type: EffectType.EXTEND_VOW, amount: 1 });
    });

    it('Faithful Guard should gain bonus block without Vow', () => {
      const card = OATHSWORN_COMMON_CARDS.faithful_guard;
      expect(card.effects).toContainEqual({ type: EffectType.BLOCK, amount: 8 });
      expect(card.effects).toContainEqual({ type: EffectType.BLOCK_IF_NO_VOW, amount: 4 });
    });

    it("Oath's End should safely end Vow and grant block", () => {
      const card = OATHSWORN_COMMON_CARDS.oaths_end;
      expect(card.effects).toContainEqual({ type: EffectType.END_VOW_SAFE, amount: 1 });
      expect(card.effects).toContainEqual({ type: EffectType.BLOCK, amount: 10 });
    });

    it('Binding Light should apply Bound status', () => {
      const card = OATHSWORN_COMMON_CARDS.binding_light;
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 5 });
      expect(card.effects).toContainEqual({ type: EffectType.APPLY_BOUND, amount: 1 });
    });
  });

  describe('Uncommon Cards', () => {
    it('should have 8 uncommon cards', () => {
      expect(Object.keys(OATHSWORN_UNCOMMON_CARDS)).toHaveLength(8);
    });

    it('all uncommon cards should have UNCOMMON rarity', () => {
      Object.values(OATHSWORN_UNCOMMON_CARDS).forEach(card => {
        expect(card.rarity).toBe(CardRarity.UNCOMMON);
      });
    });

    it('Divine Judgment should require Vow and exhaust', () => {
      const card = OATHSWORN_UNCOMMON_CARDS.divine_judgment;
      expect(card.requiresVow).toBe(true);
      expect(card.exhaust).toBe(true);
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 15 });
    });

    it('Absolution should heal based on Vow charges', () => {
      const card = OATHSWORN_UNCOMMON_CARDS.absolution;
      expect(card.effects).toContainEqual({ type: EffectType.HEAL_PER_VOW_CHARGE, amount: 5 });
    });

    it('Righteous Fury should deal damage per Vow activated', () => {
      const card = OATHSWORN_UNCOMMON_CARDS.righteous_fury;
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE_PER_VOW_ACTIVATED, amount: 6 });
    });

    it('Celestial Chain should reset Vow charges on kill', () => {
      const card = OATHSWORN_UNCOMMON_CARDS.celestial_chain;
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 8 });
      expect(card.effects).toContainEqual({ type: EffectType.RESET_VOW_CHARGES, amount: 1 });
    });
  });

  describe('Rare Cards', () => {
    it('should have 3 rare cards', () => {
      expect(Object.keys(OATHSWORN_RARE_CARDS)).toHaveLength(3);
    });

    it('all rare cards should have RARE rarity', () => {
      Object.values(OATHSWORN_RARE_CARDS).forEach(card => {
        expect(card.rarity).toBe(CardRarity.RARE);
      });
    });

    it('Final Judgment should require Vow, deal 50 damage, and exhaust', () => {
      const card = OATHSWORN_RARE_CARDS.final_judgment;
      expect(card.requiresVow).toBe(true);
      expect(card.exhaust).toBe(true);
      expect(card.cost).toBe(4);
      expect(card.effects).toContainEqual({ type: EffectType.DAMAGE, amount: 50 });
    });
  });

  describe('Reward Pool', () => {
    it('should have 26 reward cards (15 common + 8 uncommon + 3 rare)', () => {
      expect(OATHSWORN_REWARD_POOL).toHaveLength(26);
    });

    it('should not include starter cards', () => {
      const starterIds = Object.keys(OATHSWORN_STARTER_CARDS);
      const rewardIds = OATHSWORN_REWARD_POOL.map(c => c.id);
      starterIds.forEach(id => {
        expect(rewardIds).not.toContain(id);
      });
    });

    it('all cards should be Oathsworn class', () => {
      OATHSWORN_REWARD_POOL.forEach(card => {
        expect(card.classId).toBe(CharacterClassId.OATHSWORN);
      });
    });
  });

  describe('Combat Integration - Vow Mechanics', () => {
    let engine: CombatEngine;
    let player: PlayerState;

    beforeEach(() => {
      player = createPlayerState({ resolve: 5 });
      engine = new CombatEngine(player, [TEST_ENEMY]);
      engine.startCombat();
    });

    it('should track vowsActivatedThisCombat when activating vows', () => {
      const oathCard = { ...OATHSWORN_STARTER_CARDS.oath_of_valor, instanceId: 'oath1' };
      player.hand = [oathCard];
      player.drawPile = [];

      const stateBefore = engine.getState();
      expect(stateBefore.player.vowsActivatedThisCombat).toBe(0);

      engine.playCard(0, 0);

      const stateAfter = engine.getState();
      expect(stateAfter.player.vowsActivatedThisCombat).toBe(1);
      expect(stateAfter.player.activeVow).not.toBeNull();
      expect(stateAfter.player.activeVow?.name).toBe('Oath of Valor');
    });

    it('should not allow playing requiresVow cards without active vow', () => {
      const judgmentCard = { ...OATHSWORN_STARTER_CARDS.judgment, instanceId: 'judgment1' };
      player.hand = [judgmentCard];
      player.drawPile = [];
      player.activeVow = null;

      const result = engine.playCard(0, 0);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Requires an active Vow');
    });

    it('should allow playing requiresVow cards with active vow', () => {
      const judgmentCard = { ...OATHSWORN_STARTER_CARDS.judgment, instanceId: 'judgment1' };
      player.hand = [judgmentCard];
      player.drawPile = [];
      player.activeVow = { ...OATHSWORN_VOWS.oath_of_valor, currentCharges: 3 };

      const result = engine.playCard(0, 0);
      expect(result.success).toBe(true);
    });

    it('Oath of Valor should add +4 damage to attacks', () => {
      const strikeCard = { ...OATHSWORN_STARTER_CARDS.righteous_strike, instanceId: 'strike1' };
      player.hand = [strikeCard];
      player.drawPile = [];
      player.activeVow = { ...OATHSWORN_VOWS.oath_of_valor, currentCharges: 3 };

      const enemyHpBefore = engine.getState().enemies[0].currentHp;
      engine.playCard(0, 0);
      const enemyHpAfter = engine.getState().enemies[0].currentHp;

      // 6 base damage + 4 from Vow = 10 damage
      expect(enemyHpBefore - enemyHpAfter).toBe(10);
    });

    it('should break vow when gaining block with NO_BLOCK restriction', () => {
      const blockCard = { ...OATHSWORN_STARTER_CARDS.sacred_shield, instanceId: 'shield1' };
      player.hand = [blockCard];
      player.drawPile = [];
      player.activeVow = { ...OATHSWORN_VOWS.oath_of_valor, currentCharges: 3 };

      engine.playCard(0, 0);

      const state = engine.getState();
      // Vow should be broken
      expect(state.player.activeVow).toBeNull();
      // Penalty applied: lose 5 HP
      expect(state.player.currentHp).toBe(75);
    });

    it('DAMAGE_IF_VOW should only add damage when vow is active', () => {
      const zealousCard = { ...OATHSWORN_COMMON_CARDS.zealous_strike, instanceId: 'zealous1' };
      player.hand = [zealousCard];
      player.drawPile = [];

      // Without vow
      const enemyHpBefore = engine.getState().enemies[0].currentHp;
      engine.playCard(0, 0);
      const enemyHpAfter = engine.getState().enemies[0].currentHp;

      // Only 5 base damage (no +3 bonus)
      expect(enemyHpBefore - enemyHpAfter).toBe(5);
    });

    it('EXTEND_VOW should add charges to active vow', () => {
      const vowKeeper = { ...OATHSWORN_COMMON_CARDS.vow_keeper, instanceId: 'keeper1' };
      player.hand = [vowKeeper];
      player.drawPile = [];
      player.activeVow = { ...OATHSWORN_VOWS.oath_of_valor, currentCharges: 2 };

      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.activeVow?.currentCharges).toBe(3);
    });

    it('END_VOW_SAFE should end vow without penalty', () => {
      const oathsEnd = { ...OATHSWORN_COMMON_CARDS.oaths_end, instanceId: 'end1' };
      player.hand = [oathsEnd];
      player.drawPile = [];
      player.activeVow = { ...OATHSWORN_VOWS.oath_of_valor, currentCharges: 2 };
      const hpBefore = player.currentHp;

      engine.playCard(0, 0);

      const state = engine.getState();
      expect(state.player.activeVow).toBeNull();
      expect(state.player.block).toBe(10); // From the card
      expect(state.player.currentHp).toBe(hpBefore); // No penalty
    });

    it('BLOCK_IF_NO_VOW should give bonus block only without vow', () => {
      const faithfulGuard = { ...OATHSWORN_COMMON_CARDS.faithful_guard, instanceId: 'guard1' };
      player.hand = [faithfulGuard];
      player.drawPile = [];
      player.activeVow = null;

      engine.playCard(0, 0);

      const state = engine.getState();
      // 8 base + 4 bonus = 12 block
      expect(state.player.block).toBe(12);
    });

    it('HEAL_PER_VOW_CHARGE should heal and end vow', () => {
      const absolution = { ...OATHSWORN_UNCOMMON_CARDS.absolution, instanceId: 'abs1' };
      player.hand = [absolution];
      player.drawPile = [];
      player.currentHp = 50;
      player.activeVow = { ...OATHSWORN_VOWS.oath_of_valor, currentCharges: 3, charges: 3 };

      engine.playCard(0, 0);

      const state = engine.getState();
      // Healed 3 charges × 5 = 15 HP
      expect(state.player.currentHp).toBe(65);
      expect(state.player.activeVow).toBeNull();
    });

    it('DAMAGE_PER_VOW_ACTIVATED should scale with vows used', () => {
      const fury = { ...OATHSWORN_UNCOMMON_CARDS.righteous_fury, instanceId: 'fury1' };
      player.hand = [fury];
      player.drawPile = [];
      player.vowsActivatedThisCombat = 3;
      player.resolve = 5;

      const enemyHpBefore = engine.getState().enemies[0].currentHp;
      engine.playCard(0, 0);
      const enemyHpAfter = engine.getState().enemies[0].currentHp;

      // 3 vows × 6 damage = 18 damage
      expect(enemyHpBefore - enemyHpAfter).toBe(18);
    });
  });
});
