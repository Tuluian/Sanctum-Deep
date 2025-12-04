import { describe, it, expect } from 'vitest';
import { CLASSES, createStarterDeck, getClassById } from './classes';
import { SUMMONER_CARDS } from './cards/summoner';
import { CharacterClassId, CardType, EffectType, PlayerState, IntentType } from '@/types';
import { CombatEngine } from '@/engine/CombatEngine';

// =====================================================
// STORY 6.2: Summoner Class & Minion System Tests
// =====================================================
describe('Story 6.2: Summoner Class & Minion System', () => {
  describe('Summoner Class Configuration', () => {
    it('should have Summoner with 65 max HP (AC: 2)', () => {
      const summoner = CLASSES[CharacterClassId.SUMMONER];
      expect(summoner.maxHp).toBe(65);
    });

    it('should have Summoner with 3 max Resolve (AC: 3)', () => {
      const summoner = CLASSES[CharacterClassId.SUMMONER];
      expect(summoner.maxResolve).toBe(3);
    });

    it('should have correct Summoner name', () => {
      const summoner = CLASSES[CharacterClassId.SUMMONER];
      expect(summoner.name).toBe('Summoner');
    });

    it('should retrieve Summoner by ID', () => {
      const summoner = getClassById(CharacterClassId.SUMMONER);
      expect(summoner).toBeDefined();
      expect(summoner?.id).toBe(CharacterClassId.SUMMONER);
    });
  });

  describe('Summoner Starter Deck Creation (AC: 1)', () => {
    it('should create exactly 11 cards total', () => {
      const deck = createStarterDeck(CharacterClassId.SUMMONER);
      expect(deck.length).toBe(11);
    });

    it('should have 3 Spirit Bolt cards', () => {
      const deck = createStarterDeck(CharacterClassId.SUMMONER);
      const spiritBolts = deck.filter((card) => card.id === 'spirit_bolt');
      expect(spiritBolts.length).toBe(3);
    });

    it('should have 3 Summon Wisp cards', () => {
      const deck = createStarterDeck(CharacterClassId.SUMMONER);
      const summonWisps = deck.filter((card) => card.id === 'summon_wisp');
      expect(summonWisps.length).toBe(3);
    });

    it('should have 2 Shield Minions cards', () => {
      const deck = createStarterDeck(CharacterClassId.SUMMONER);
      const shields = deck.filter((card) => card.id === 'shield_minions');
      expect(shields.length).toBe(2);
    });

    it('should have 1 Rally card', () => {
      const deck = createStarterDeck(CharacterClassId.SUMMONER);
      const rallies = deck.filter((card) => card.id === 'rally');
      expect(rallies.length).toBe(1);
    });

    it('should have 1 Soul Link card', () => {
      const deck = createStarterDeck(CharacterClassId.SUMMONER);
      const soulLinks = deck.filter((card) => card.id === 'soul_link');
      expect(soulLinks.length).toBe(1);
    });

    it('should assign unique instance IDs to each card', () => {
      const deck = createStarterDeck(CharacterClassId.SUMMONER);
      const instanceIds = deck.map((card) => card.instanceId);
      const uniqueIds = new Set(instanceIds);
      expect(uniqueIds.size).toBe(deck.length);
    });
  });

  describe('Summoner Card Definitions', () => {
    describe('Spirit Bolt Card', () => {
      it('should be an Attack card', () => {
        const spiritBolt = SUMMONER_CARDS.spirit_bolt;
        expect(spiritBolt.type).toBe(CardType.ATTACK);
      });

      it('should cost 1 Resolve', () => {
        const spiritBolt = SUMMONER_CARDS.spirit_bolt;
        expect(spiritBolt.cost).toBe(1);
      });

      it('should deal 4 damage', () => {
        const spiritBolt = SUMMONER_CARDS.spirit_bolt;
        expect(spiritBolt.effects.length).toBe(1);
        expect(spiritBolt.effects[0].type).toBe(EffectType.DAMAGE);
        expect(spiritBolt.effects[0].amount).toBe(4);
      });
    });

    describe('Summon Wisp Card', () => {
      it('should be a Skill card', () => {
        const summonWisp = SUMMONER_CARDS.summon_wisp;
        expect(summonWisp.type).toBe(CardType.SKILL);
      });

      it('should cost 1 Resolve', () => {
        const summonWisp = SUMMONER_CARDS.summon_wisp;
        expect(summonWisp.cost).toBe(1);
      });

      it('should have SUMMON_MINION effect with wisp minionId', () => {
        const summonWisp = SUMMONER_CARDS.summon_wisp;
        expect(summonWisp.effects.length).toBe(1);
        expect(summonWisp.effects[0].type).toBe(EffectType.SUMMON_MINION);
        expect(summonWisp.effects[0].minionId).toBe('wisp');
      });
    });

    describe('Shield Minions Card', () => {
      it('should be a Skill card', () => {
        const shieldMinions = SUMMONER_CARDS.shield_minions;
        expect(shieldMinions.type).toBe(CardType.SKILL);
      });

      it('should cost 1 Resolve', () => {
        const shieldMinions = SUMMONER_CARDS.shield_minions;
        expect(shieldMinions.cost).toBe(1);
      });

      it('should give all minions 4 block', () => {
        const shieldMinions = SUMMONER_CARDS.shield_minions;
        expect(shieldMinions.effects.length).toBe(1);
        expect(shieldMinions.effects[0].type).toBe(EffectType.BLOCK_ALL_MINIONS);
        expect(shieldMinions.effects[0].amount).toBe(4);
      });
    });

    describe('Rally Card', () => {
      it('should be a Skill card', () => {
        const rally = SUMMONER_CARDS.rally;
        expect(rally.type).toBe(CardType.SKILL);
      });

      it('should cost 1 Resolve', () => {
        const rally = SUMMONER_CARDS.rally;
        expect(rally.cost).toBe(1);
      });

      it('should have MINIONS_ATTACK effect', () => {
        const rally = SUMMONER_CARDS.rally;
        expect(rally.effects.length).toBe(1);
        expect(rally.effects[0].type).toBe(EffectType.MINIONS_ATTACK);
      });
    });

    describe('Soul Link Card', () => {
      it('should be a Skill card', () => {
        const soulLink = SUMMONER_CARDS.soul_link;
        expect(soulLink.type).toBe(CardType.SKILL);
      });

      it('should cost 0 Resolve', () => {
        const soulLink = SUMMONER_CARDS.soul_link;
        expect(soulLink.cost).toBe(0);
      });

      it('should have GAIN_BLOCK_FROM_MINION_HP effect', () => {
        const soulLink = SUMMONER_CARDS.soul_link;
        expect(soulLink.effects.length).toBe(1);
        expect(soulLink.effects[0].type).toBe(EffectType.GAIN_BLOCK_FROM_MINION_HP);
      });
    });
  });

  describe('Minion System (AC: 4, 5, 6, 7, 8, 9, 11)', () => {
    function createTestPlayer(): PlayerState {
      return {
        maxHp: 65,
        currentHp: 65,
        block: 0,
        resolve: 3,
        maxResolve: 3,
        hand: [],
        drawPile: createStarterDeck(CharacterClassId.SUMMONER),
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
        permanentBlockBonus: 0,
        upgradeDamageBonus: 0,
        upgradeBlockBonus: 0,
      };
    }

    function createTestEnemy() {
      return {
        id: 'test_enemy',
        name: 'Test Enemy',
        maxHp: 50,
        moves: [{ id: 'attack', name: 'Attack', intent: IntentType.ATTACK, damage: 10, weight: 1 }],
      };
    }

    it('should start with empty minions array', () => {
      const player = createTestPlayer();
      expect(player.minions).toEqual([]);
    });

    it('should summon a Wisp when playing Summon Wisp (AC: 4)', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const state = engine.getState();
      const summonWispCard = { ...SUMMONER_CARDS.summon_wisp, instanceId: 'test_summon' };
      state.player.hand = [summonWispCard];
      state.player.resolve = 1;

      // Before playing, no minions
      expect(engine.getState().player.minions.length).toBe(0);

      // Play Summon Wisp
      engine.playCard(0, 0);

      // After playing, should have 1 Wisp
      const minions = engine.getState().player.minions;
      expect(minions.length).toBe(1);
      expect(minions[0].id).toBe('wisp');
      expect(minions[0].name).toBe('Wisp');
      expect(minions[0].maxHp).toBe(4);
      expect(minions[0].currentHp).toBe(4);
      expect(minions[0].attackDamage).toBe(2);
    });

    it('should cap minions at 4 (MAX_MINIONS) (AC: 9)', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const state = engine.getState();

      // Add 4 summon wisp cards
      const cards = [];
      for (let i = 0; i < 5; i++) {
        cards.push({ ...SUMMONER_CARDS.summon_wisp, instanceId: `summon_${i}` });
      }
      state.player.hand = cards;
      state.player.resolve = 5;

      // Play 4 cards - should succeed
      engine.playCard(0, 0);
      engine.playCard(0, 0);
      engine.playCard(0, 0);
      engine.playCard(0, 0);

      expect(engine.getState().player.minions.length).toBe(4);

      // Play 5th card - should not add a 5th minion
      engine.playCard(0, 0);
      expect(engine.getState().player.minions.length).toBe(4);
    });

    it('Shield Minions should give all minions block', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const state = engine.getState();

      // Summon 2 wisps then shield them
      state.player.hand = [
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_1' },
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_2' },
        { ...SUMMONER_CARDS.shield_minions, instanceId: 'shield_1' },
      ];
      state.player.resolve = 3;

      engine.playCard(0, 0); // Summon first wisp
      engine.playCard(0, 0); // Summon second wisp
      engine.playCard(0, 0); // Shield both

      const minions = engine.getState().player.minions;
      expect(minions.length).toBe(2);
      expect(minions[0].block).toBe(4);
      expect(minions[1].block).toBe(4);
    });

    it('Soul Link should grant block equal to total minion HP (AC: 10)', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const state = engine.getState();

      // Summon 3 wisps (4 HP each = 12 total) then Soul Link
      state.player.hand = [
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_1' },
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_2' },
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_3' },
        { ...SUMMONER_CARDS.soul_link, instanceId: 'soul_link_1' },
      ];
      state.player.resolve = 3;

      engine.playCard(0, 0); // Summon wisps
      engine.playCard(0, 0);
      engine.playCard(0, 0);
      engine.playCard(0, 0); // Soul Link (costs 0)

      expect(engine.getState().player.block).toBe(12); // 3 wisps * 4 HP each
    });

    it('minions should auto-attack at end of player turn (AC: 7)', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const state = engine.getState();

      // Summon 2 wisps
      state.player.hand = [
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_1' },
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_2' },
      ];
      state.player.resolve = 2;

      engine.playCard(0, 0);
      engine.playCard(0, 0);

      expect(engine.getState().player.minions.length).toBe(2);

      // Enemy starts at 50 HP
      const enemyHpBefore = engine.getState().enemies[0].currentHp;
      expect(enemyHpBefore).toBe(50);

      // End turn - minions should auto-attack (2 damage each = 4 total)
      engine.endTurn();

      const enemyHpAfter = engine.getState().enemies[0].currentHp;
      // Enemy takes 2 damage from each wisp = 4 total, minus any enemy attack
      // Since enemy attacks back, we need to account for player HP loss too
      expect(enemyHpAfter).toBeLessThan(enemyHpBefore);
    });

    it('Rally should make all minions attack immediately', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const state = engine.getState();

      // Summon 2 wisps then Rally
      state.player.hand = [
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_1' },
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_2' },
        { ...SUMMONER_CARDS.rally, instanceId: 'rally_1' },
      ];
      state.player.resolve = 3;

      engine.playCard(0, 0); // Summon
      engine.playCard(0, 0); // Summon

      const enemyHpBefore = engine.getState().enemies[0].currentHp;

      engine.playCard(0, 0); // Rally - minions attack

      const enemyHpAfter = engine.getState().enemies[0].currentHp;
      // 2 wisps * 2 damage each = 4 damage
      expect(enemyHpAfter).toBe(enemyHpBefore - 4);
    });

    it('enemies should target minions before player (AC: 6)', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const state = engine.getState();

      // Summon a wisp
      state.player.hand = [{ ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_1' }];
      state.player.resolve = 1;

      engine.playCard(0, 0);

      const playerHpBefore = engine.getState().player.currentHp;
      expect(engine.getState().player.minions.length).toBe(1);

      // End turn - enemy attacks (should hit minion, not player)
      engine.endTurn();

      // Player HP should be unchanged (enemy hit the minion)
      const playerHpAfter = engine.getState().player.currentHp;
      expect(playerHpAfter).toBe(playerHpBefore);

      // Wisp took damage (10 damage enemy attack, wisp has 4 HP, should be dead)
      expect(engine.getState().player.minions.length).toBe(0);
    });

    it('minion with block should absorb damage', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const state = engine.getState();

      // Summon wisp and give it block
      state.player.hand = [
        { ...SUMMONER_CARDS.summon_wisp, instanceId: 'summon_1' },
        { ...SUMMONER_CARDS.shield_minions, instanceId: 'shield_1' },
      ];
      state.player.resolve = 2;

      engine.playCard(0, 0); // Summon wisp (4 HP)
      engine.playCard(0, 0); // Shield minions (4 block)

      // Wisp has 4 HP and 4 block
      const minionBefore = engine.getState().player.minions[0];
      expect(minionBefore.currentHp).toBe(4);
      expect(minionBefore.block).toBe(4);

      // End turn - enemy deals 10 damage
      // Block absorbs 4, HP takes 6 (wisp dies since it only has 4 HP)
      engine.endTurn();

      // Wisp should be dead
      expect(engine.getState().player.minions.length).toBe(0);
    });

    it('enemies target player when no minions exist (AC: 6)', () => {
      const player = createTestPlayer();
      const engine = new CombatEngine(player, [createTestEnemy()]);
      engine.startCombat();

      const playerHpBefore = engine.getState().player.currentHp;
      expect(engine.getState().player.minions.length).toBe(0);

      // End turn - enemy attacks player directly
      engine.endTurn();

      // Player HP should have decreased
      const playerHpAfter = engine.getState().player.currentHp;
      expect(playerHpAfter).toBeLessThan(playerHpBefore);
    });
  });
});
