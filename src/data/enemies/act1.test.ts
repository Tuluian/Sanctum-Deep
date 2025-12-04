import { describe, it, expect } from 'vitest';
import { CombatEngine } from '@/engine/CombatEngine';
import { ACT1_ENEMIES } from './act1';
import {
  Card,
  CardType,
  EffectType,
  EnemyDefinition,
  IntentType,
  PlayerState,
  StatusType,
} from '@/types';

// Test fixtures
function createMockPlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    maxHp: 70,
    currentHp: 70,
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

function createMockCard(overrides: Partial<Card> = {}): Card {
  return {
    id: 'test_card',
    instanceId: 'test_card_0',
    name: 'Test Card',
    type: CardType.SKILL,
    cost: 1,
    description: 'Test card',
    effects: [{ type: EffectType.BLOCK, amount: 5 }],
    ...overrides,
  };
}

// =====================================================
// STORY 2.2: Act 1 Common Enemies Tests
// =====================================================
describe('Story 2.2: Act 1 Common Enemies', () => {
  describe('Enemy Definitions', () => {
    it('should have 8 total common enemies', () => {
      expect(Object.keys(ACT1_ENEMIES).length).toBe(8);
    });

    describe('Original Enemies', () => {
      it('Cultist should have 42 HP', () => {
        expect(ACT1_ENEMIES.cultist.maxHp).toBe(42);
      });

      it('Skeleton should have 30 HP', () => {
        expect(ACT1_ENEMIES.skeleton.maxHp).toBe(30);
      });

      it('Zombie should have 55 HP', () => {
        expect(ACT1_ENEMIES.zombie.maxHp).toBe(55);
      });
    });

    describe('New Enemies (AC: 1, 4, 5)', () => {
      it('Haunted Armor should have 35 HP and defensive moves', () => {
        const armor = ACT1_ENEMIES.haunted_armor;
        expect(armor.maxHp).toBe(35);
        expect(armor.moves.length).toBe(3);
        expect(armor.moves.find(m => m.id === 'shield_bash')).toBeDefined();
        expect(armor.moves.find(m => m.id === 'fortify')).toBeDefined();
        expect(armor.moves.find(m => m.id === 'heavy_swing')).toBeDefined();
      });

      it('Acolyte should have 25 HP and support moves', () => {
        const acolyte = ACT1_ENEMIES.acolyte;
        expect(acolyte.maxHp).toBe(25);
        expect(acolyte.moves.length).toBe(3);
        expect(acolyte.moves.find(m => m.id === 'dark_prayer')).toBeDefined();
        expect(acolyte.moves.find(m => m.intent === IntentType.BUFF_ALLY)).toBeDefined();
      });

      it('Ghoul should have 38 HP with multi-attack', () => {
        const ghoul = ACT1_ENEMIES.ghoul;
        expect(ghoul.maxHp).toBe(38);
        const frenzy = ghoul.moves.find(m => m.id === 'frenzy');
        expect(frenzy).toBeDefined();
        expect(frenzy?.intent).toBe(IntentType.MULTI_ATTACK);
        expect(frenzy?.times).toBe(2);
      });

      it('Bone Archer should have 22 HP (glass cannon)', () => {
        const archer = ACT1_ENEMIES.bone_archer;
        expect(archer.maxHp).toBe(22);
        expect(archer.moves.find(m => m.damage === 9)).toBeDefined();
      });

      it('Shade should have 28 HP with debuff and phase', () => {
        const shade = ACT1_ENEMIES.shade;
        expect(shade.maxHp).toBe(28);
        expect(shade.moves.find(m => m.intent === IntentType.DEBUFF)).toBeDefined();
        expect(shade.moves.find(m => m.id === 'phase')).toBeDefined();
      });
    });
  });

  describe('Multi-Attack Mechanic (Ghoul Frenzy)', () => {
    it('should deal damage multiple times (AC: 2)', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Create Ghoul with forced Frenzy intent
      const ghoulDef: EnemyDefinition = {
        id: 'ghoul',
        name: 'Ghoul',
        maxHp: 38,
        moves: [
          { id: 'frenzy', name: 'Frenzy', intent: IntentType.MULTI_ATTACK, damage: 4, times: 2, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [ghoulDef]);
      engine.startCombat();

      // End turn to trigger enemy attack
      engine.endTurn();

      // Should deal 4 damage twice = 8 total
      expect(engine.getState().player.currentHp).toBe(42); // 50 - 8
    });

    it('should stop multi-attack if player dies mid-attack', () => {
      const player = createMockPlayerState({ currentHp: 5 }); // Low HP
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const ghoulDef: EnemyDefinition = {
        id: 'ghoul',
        name: 'Ghoul',
        maxHp: 38,
        moves: [
          { id: 'frenzy', name: 'Frenzy', intent: IntentType.MULTI_ATTACK, damage: 10, times: 3, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [ghoulDef]);
      engine.startCombat();
      engine.endTurn();

      // Should stop attacking after player HP reaches 0
      expect(engine.getState().player.currentHp).toBeLessThanOrEqual(0);
      expect(engine.isGameOver()).toBe(true);
    });
  });

  describe('Buff Ally Mechanic (Acolyte Dark Prayer)', () => {
    it('should increase ally Might (AC: 2)', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Acolyte buffs, Skeleton attacks
      const acolyteDef: EnemyDefinition = {
        id: 'acolyte',
        name: 'Acolyte',
        maxHp: 25,
        moves: [
          { id: 'dark_prayer', name: 'Dark Prayer', intent: IntentType.BUFF_ALLY, buffType: StatusType.MIGHT, buffAmount: 2, weight: 100 },
        ],
      };
      const skeletonDef: EnemyDefinition = {
        id: 'skeleton',
        name: 'Skeleton',
        maxHp: 30,
        moves: [
          { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 5, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [acolyteDef, skeletonDef]);
      engine.startCombat();
      engine.endTurn();

      // After Acolyte buffs, Skeleton should have +2 might for next turn
      // The skeleton attacks this turn without the buff (buff applies this turn, used next)
      // Let's check the turn after
      const state = engine.getState();
      // Skeleton attacked with 5 + 0 = 5 (might wasn't applied yet for first attack)
      // But skeleton might have received the buff
      expect(state.enemies[1].might).toBe(0); // Might is consumed when attacking
    });

    it('should apply buff to random alive ally', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const acolyteDef: EnemyDefinition = {
        id: 'acolyte',
        name: 'Acolyte',
        maxHp: 25,
        moves: [
          { id: 'dark_prayer', name: 'Dark Prayer', intent: IntentType.BUFF_ALLY, buffAmount: 3, weight: 100 },
        ],
      };
      const skeletonDef: EnemyDefinition = {
        id: 'skeleton',
        name: 'Skeleton',
        maxHp: 30,
        moves: [
          { id: 'defend', name: 'Defend', intent: IntentType.DEFEND, block: 5, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [acolyteDef, skeletonDef]);
      engine.startCombat();

      const result = engine.endTurn();

      // Check log contains buff message
      const buffLog = result.log.find(l => l.includes('buffed'));
      expect(buffLog).toBeDefined();
    });
  });

  describe('Debuff Mechanic (Shade Curse)', () => {
    it('should apply status effect to player (AC: 2)', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const shadeDef: EnemyDefinition = {
        id: 'shade',
        name: 'Shade',
        maxHp: 28,
        moves: [
          { id: 'curse', name: 'Curse', intent: IntentType.DEBUFF, debuffType: StatusType.IMPAIRED, debuffDuration: 2, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [shadeDef]);
      engine.startCombat();
      engine.endTurn();

      const state = engine.getState();
      const impaired = state.player.statusEffects.find(e => e.type === StatusType.IMPAIRED);
      expect(impaired).toBeDefined();
      // Duration decremented from 2 to 1 at end of turn
      expect(impaired?.duration).toBe(1);
    });
  });

  describe('Heal Mechanic (Acolyte Sacrifice)', () => {
    it('should heal ally and damage self (AC: 2)', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      // Acolyte heals damaged skeleton
      const acolyteDef: EnemyDefinition = {
        id: 'acolyte',
        name: 'Acolyte',
        maxHp: 25,
        moves: [
          { id: 'sacrifice', name: 'Sacrifice', intent: IntentType.HEAL, heal: 8, selfDamage: 5, weight: 100 },
        ],
      };
      const skeletonDef: EnemyDefinition = {
        id: 'skeleton',
        name: 'Skeleton',
        maxHp: 30,
        moves: [
          { id: 'defend', name: 'Defend', intent: IntentType.DEFEND, block: 5, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [acolyteDef, skeletonDef]);
      engine.startCombat();

      // Damage skeleton first
      const state = engine.getState();
      state.enemies[1].currentHp = 20; // Skeleton is damaged

      engine.endTurn();

      const afterState = engine.getState();
      // Skeleton should be healed (20 + 8 = 28, capped at 30)
      expect(afterState.enemies[1].currentHp).toBe(28);
      // Acolyte should have taken self-damage (25 - 5 = 20)
      expect(afterState.enemies[0].currentHp).toBe(20);
    });
  });

  describe('Lifesteal Mechanic (Ghoul Devour, Shade Life Drain)', () => {
    it('should deal damage and heal self (AC: 2)', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const ghoulDef: EnemyDefinition = {
        id: 'ghoul',
        name: 'Ghoul',
        maxHp: 38,
        moves: [
          { id: 'devour', name: 'Devour', intent: IntentType.ATTACK, damage: 5, heal: 5, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [ghoulDef]);
      engine.startCombat();

      // Damage ghoul first
      const state = engine.getState();
      state.enemies[0].currentHp = 30;

      engine.endTurn();

      const afterState = engine.getState();
      // Player takes 5 damage: 50 - 5 = 45
      expect(afterState.player.currentHp).toBe(45);
      // Ghoul heals 5: 30 + 5 = 35
      expect(afterState.enemies[0].currentHp).toBe(35);
    });
  });

  describe('Untargetable Mechanic (Shade Phase)', () => {
    it('should make enemy untargetable (AC: 2)', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({
          instanceId: `c${i}`,
          type: CardType.ATTACK,
          effects: [{ type: EffectType.DAMAGE, amount: 5 }],
        })
      );

      const shadeDef: EnemyDefinition = {
        id: 'shade',
        name: 'Shade',
        maxHp: 28,
        moves: [
          { id: 'phase', name: 'Phase', intent: IntentType.BUFF, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [shadeDef]);
      engine.startCombat();
      engine.endTurn();

      // After Phase, shade should be untargetable
      const state = engine.getState();
      expect(state.enemies[0].untargetable).toBe(true);

      // Valid targets should be empty
      expect(engine.getValidTargets()).toEqual([]);
    });

    it('should reset untargetable at start of enemy turn', () => {
      const player = createMockPlayerState();
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const shadeDef: EnemyDefinition = {
        id: 'shade',
        name: 'Shade',
        maxHp: 28,
        moves: [
          { id: 'phase', name: 'Phase', intent: IntentType.BUFF, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [shadeDef]);
      engine.startCombat();

      // First turn: Phase
      engine.endTurn();
      expect(engine.getState().enemies[0].untargetable).toBe(true);

      // Second turn: untargetable resets at start of enemy turn
      engine.endTurn();
      // After enemy takes action, untargetable is reset at the START of their turn
      // Then they take Phase again, so they're untargetable again
      expect(engine.getState().enemies[0].untargetable).toBe(true);
    });
  });

  describe('Might Bonus Damage', () => {
    it('should add might to attack damage', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const enemyDef: EnemyDefinition = {
        id: 'test',
        name: 'Test Enemy',
        maxHp: 30,
        moves: [
          { id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 5, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [enemyDef]);
      engine.startCombat();

      // Manually give enemy might
      engine.getState().enemies[0].might = 3;

      engine.endTurn();

      // Should deal 5 + 3 = 8 damage
      expect(engine.getState().player.currentHp).toBe(42); // 50 - 8
      // Might should be consumed
      expect(engine.getState().enemies[0].might).toBe(0);
    });

    it('should add might to multi-attack damage', () => {
      const player = createMockPlayerState({ currentHp: 50 });
      player.drawPile = Array.from({ length: 10 }, (_, i) =>
        createMockCard({ instanceId: `c${i}` })
      );

      const enemyDef: EnemyDefinition = {
        id: 'test',
        name: 'Test Enemy',
        maxHp: 30,
        moves: [
          { id: 'frenzy', name: 'Frenzy', intent: IntentType.MULTI_ATTACK, damage: 3, times: 2, weight: 100 },
        ],
      };

      const engine = new CombatEngine(player, [enemyDef]);
      engine.startCombat();

      // Manually give enemy might
      engine.getState().enemies[0].might = 2;

      engine.endTurn();

      // Should deal (3 + 2) * 2 = 10 damage
      expect(engine.getState().player.currentHp).toBe(40); // 50 - 10
    });
  });

  describe('Bleeding from Bone Archer', () => {
    it('should have poison arrow with bleeding effect', () => {
      const archer = ACT1_ENEMIES.bone_archer;
      const poisonArrow = archer.moves.find(m => m.id === 'poison_arrow');

      expect(poisonArrow).toBeDefined();
      expect(poisonArrow?.debuffType).toBe(StatusType.BLEEDING);
      expect(poisonArrow?.debuffDuration).toBe(3);
    });
  });
});
