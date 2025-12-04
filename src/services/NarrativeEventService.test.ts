/**
 * Tests for NarrativeEventService
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NarrativeEventService, initNarrativeEventService } from './NarrativeEventService';
import { CharacterClassId, PlayerState } from '@/types/index';
import { NarrativeEvent, NarrativeChoice, EventOutcome } from '@/types/narrativeEvents';

// Helper to create a test player state
function createTestPlayer(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    classId: CharacterClassId.DUNGEON_KNIGHT,
    maxHp: 75,
    currentHp: 75,
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

// Helper to create a test narrative event
function createTestEvent(overrides: Partial<NarrativeEvent> = {}): NarrativeEvent {
  const defaultChoice: NarrativeChoice = {
    id: 'test-choice',
    text: 'Test choice',
    outcomes: [
      {
        id: 'outcome-1',
        weight: 100,
        resultText: 'Test result',
        rewards: [{ type: 'hp_heal', amount: 10 }],
      },
    ],
  };

  return {
    id: 'test-event',
    title: 'Test Event',
    act: 1,
    rarity: 'common',
    triggerType: 'random',
    content: {
      text: 'Test event text',
    },
    choices: [defaultChoice],
    ...overrides,
  };
}

describe('NarrativeEventService', () => {
  let service: NarrativeEventService;

  beforeEach(() => {
    service = initNarrativeEventService(CharacterClassId.DUNGEON_KNIGHT, 'test-seed');
  });

  describe('initialization', () => {
    it('should create a service with initial state', () => {
      expect(service).toBeDefined();
      const state = service.getState();
      expect(state.currentAct).toBe(1);
      expect(state.roomsCleared).toBe(0);
      expect(state.combatCount).toBe(0);
      expect(state.seenEventIds).toHaveLength(0);
      expect(state.seenStoryCardIds).toHaveLength(0);
    });

    it('should reset state correctly', () => {
      service.incrementRoomsCleared();
      service.incrementCombatCount();
      service.setAct(2);

      service.reset(CharacterClassId.CLERIC, 'new-seed');

      const state = service.getState();
      expect(state.currentAct).toBe(1);
      expect(state.roomsCleared).toBe(0);
      expect(state.combatCount).toBe(0);
    });
  });

  describe('state management', () => {
    it('should track rooms cleared', () => {
      service.incrementRoomsCleared();
      service.incrementRoomsCleared();
      expect(service.getState().roomsCleared).toBe(2);
    });

    it('should track combat count', () => {
      service.incrementCombatCount();
      service.incrementCombatCount();
      service.incrementCombatCount();
      expect(service.getState().combatCount).toBe(3);
    });

    it('should set act and reset progress counters', () => {
      service.incrementRoomsCleared();
      service.incrementCombatCount();
      service.setAct(2);

      const state = service.getState();
      expect(state.currentAct).toBe(2);
      expect(state.roomsCleared).toBe(0);
      expect(state.combatCount).toBe(0);
    });

    it('should not reset counters if act is same', () => {
      service.incrementRoomsCleared();
      service.setAct(1); // Same act

      expect(service.getState().roomsCleared).toBe(1);
    });

    it('should load saved state', () => {
      const savedState = {
        currentAct: 2,
        roomsCleared: 5,
        combatCount: 3,
        seenEventIds: ['event-1', 'event-2'],
        seenStoryCardIds: ['card-1'],
        choicesMade: ['event-1:choice-1:outcome-1'],
        damageBonus: 5,
        blockBonus: 3,
        bossDamageBonuses: { bonelord: 10 },
      };

      service.loadState(savedState);
      const state = service.getState();

      expect(state.currentAct).toBe(2);
      expect(state.roomsCleared).toBe(5);
      expect(state.seenEventIds).toContain('event-1');
      expect(state.damageBonus).toBe(5);
    });
  });

  describe('event checking', () => {
    it('should check for events with random trigger', () => {
      const player = createTestPlayer();
      const result = service.checkForEvent(player, { nodeType: 'combat' });

      // Result depends on RNG, just verify structure
      expect(result).toHaveProperty('shouldTrigger');
      if (result.shouldTrigger) {
        expect(result.event).toBeDefined();
      }
    });

    it('should check for boss pre-fight events', () => {
      const player = createTestPlayer();
      const result = service.checkForEvent(player, {
        nodeType: 'boss',
        isBossPreFight: true,
        bossId: 'bonelord',
      });

      expect(result).toHaveProperty('shouldTrigger');
    });

    it('should check for boss post-fight events', () => {
      const player = createTestPlayer();
      const result = service.checkForEvent(player, {
        nodeType: 'boss',
        isBossPostFight: true,
        bossId: 'bonelord',
      });

      expect(result).toHaveProperty('shouldTrigger');
    });
  });

  describe('choice resolution', () => {
    it('should resolve a choice and return outcome', () => {
      const event = createTestEvent();
      const choice = event.choices![0];

      const result = service.resolveChoice(event, choice);

      expect(result.outcome).toBeDefined();
      expect(result.outcome.resultText).toBe('Test result');
      expect(result.appliedRewards).toHaveLength(1);
      expect(result.appliedRewards[0].type).toBe('hp_heal');
    });

    it('should mark event as seen after resolution', () => {
      const event = createTestEvent({ id: 'unique-test-event' });
      const choice = event.choices![0];

      service.resolveChoice(event, choice);

      expect(service.getState().seenEventIds).toContain('unique-test-event');
    });

    it('should track choices made', () => {
      const event = createTestEvent({ id: 'tracked-event' });
      const choice = event.choices![0];

      service.resolveChoice(event, choice);

      const state = service.getState();
      expect(state.choicesMade.length).toBeGreaterThan(0);
      expect(state.choicesMade[0]).toContain('tracked-event');
    });

    it('should select outcome based on weights', () => {
      const outcomes: EventOutcome[] = [
        { id: 'heavy', weight: 90, resultText: 'Heavy outcome' },
        { id: 'light', weight: 10, resultText: 'Light outcome' },
      ];

      const event = createTestEvent({
        choices: [{ id: 'choice', text: 'Choose', outcomes }],
      });
      const choice = event.choices![0];

      // Run multiple times to verify weighted selection works
      const results = new Map<string, number>();
      for (let i = 0; i < 100; i++) {
        const testService = initNarrativeEventService(
          CharacterClassId.DUNGEON_KNIGHT,
          `seed-${i}`
        );
        const result = testService.resolveChoice(event, choice);
        const count = results.get(result.outcome.id) || 0;
        results.set(result.outcome.id, count + 1);
      }

      // Heavy should appear more often than light
      expect((results.get('heavy') || 0)).toBeGreaterThan((results.get('light') || 0));
    });
  });

  describe('reward application', () => {
    it('should apply hp_heal reward to player', () => {
      const player = createTestPlayer({ currentHp: 50, maxHp: 75 });
      const rewards = [{ type: 'hp_heal' as const, amount: 20 }];

      const descriptions = service.applyRewardsToPlayer(player, rewards);

      expect(player.currentHp).toBe(70);
      expect(descriptions).toContain('Healed 20 HP');
    });

    it('should cap healing at max HP', () => {
      const player = createTestPlayer({ currentHp: 70, maxHp: 75 });
      const rewards = [{ type: 'hp_heal' as const, amount: 20 }];

      service.applyRewardsToPlayer(player, rewards);

      expect(player.currentHp).toBe(75);
    });

    it('should apply hp_max reward to player', () => {
      const player = createTestPlayer({ currentHp: 75, maxHp: 75 });
      const rewards = [{ type: 'hp_max' as const, amount: 10 }];

      const descriptions = service.applyRewardsToPlayer(player, rewards);

      expect(player.maxHp).toBe(85);
      expect(player.currentHp).toBe(85);
      expect(descriptions).toContain('+10 Max HP');
    });

    it('should apply resolve_max reward to player', () => {
      const player = createTestPlayer({ maxResolve: 3, baseMaxResolve: 3 });
      const rewards = [{ type: 'resolve_max' as const, amount: 1 }];

      const descriptions = service.applyRewardsToPlayer(player, rewards);

      expect(player.maxResolve).toBe(4);
      expect(player.baseMaxResolve).toBe(4);
      expect(descriptions).toContain('+1 Max Resolve');
    });

    it('should apply full heal (hp_heal: 999)', () => {
      const player = createTestPlayer({ currentHp: 10, maxHp: 100 });
      const rewards = [{ type: 'hp_heal' as const, amount: 999 }];

      const descriptions = service.applyRewardsToPlayer(player, rewards);

      expect(player.currentHp).toBe(100);
      expect(descriptions).toContain('Healed to full HP');
    });
  });

  describe('penalty application', () => {
    it('should apply hp_loss penalty to player', () => {
      const player = createTestPlayer({ currentHp: 50 });
      const penalties = [{ type: 'hp_loss' as const, amount: 15 }];

      const descriptions = service.applyPenaltiesToPlayer(player, penalties);

      expect(player.currentHp).toBe(35);
      expect(descriptions).toContain('Lost 15 HP');
    });

    it('should not reduce HP below 1', () => {
      const player = createTestPlayer({ currentHp: 5 });
      const penalties = [{ type: 'hp_loss' as const, amount: 100 }];

      service.applyPenaltiesToPlayer(player, penalties);

      expect(player.currentHp).toBe(1);
    });

    it('should apply hp_max_loss penalty to player', () => {
      const player = createTestPlayer({ currentHp: 75, maxHp: 75 });
      const penalties = [{ type: 'hp_max_loss' as const, amount: 10 }];

      const descriptions = service.applyPenaltiesToPlayer(player, penalties);

      expect(player.maxHp).toBe(65);
      expect(player.currentHp).toBe(65);
      expect(descriptions).toContain('-10 Max HP');
    });

    it('should apply resolve_loss penalty to player', () => {
      const player = createTestPlayer({ maxResolve: 3, baseMaxResolve: 3 });
      const penalties = [{ type: 'resolve_loss' as const, amount: 1 }];

      const descriptions = service.applyPenaltiesToPlayer(player, penalties);

      expect(player.maxResolve).toBe(2);
      expect(player.baseMaxResolve).toBe(2);
      expect(descriptions).toContain('-1 Max Resolve');
    });

    it('should not reduce max resolve below 1', () => {
      const player = createTestPlayer({ maxResolve: 1, baseMaxResolve: 1 });
      const penalties = [{ type: 'resolve_loss' as const, amount: 5 }];

      service.applyPenaltiesToPlayer(player, penalties);

      expect(player.maxResolve).toBe(1);
    });
  });

  describe('story cards', () => {
    it('should check for story cards', () => {
      const player = createTestPlayer();
      const result = service.checkForStoryCard(player, { nodeType: 'combat' });

      expect(result).toHaveProperty('shouldShow');
      if (result.shouldShow) {
        expect(result.card).toBeDefined();
      }
    });

    it('should check for first blood story card', () => {
      const player = createTestPlayer();
      service.incrementCombatCount(); // First combat

      const result = service.checkForStoryCard(player, {
        nodeType: 'combat',
        isFirstCombat: true,
      });

      expect(result).toHaveProperty('shouldShow');
    });

    it('should check for pre-boss story card', () => {
      const player = createTestPlayer();
      const result = service.checkForStoryCard(player, {
        nodeType: 'boss',
        isBossPreFight: true,
        bossId: 'bonelord',
      });

      expect(result).toHaveProperty('shouldShow');
    });

    it('should check for health threshold story card', () => {
      const player = createTestPlayer({ currentHp: 20, maxHp: 100 });
      const result = service.checkForStoryCard(player, { nodeType: 'combat' });

      expect(result).toHaveProperty('shouldShow');
    });
  });

  describe('combat bonuses', () => {
    it('should track damage bonus from rewards', () => {
      const event = createTestEvent({
        choices: [
          {
            id: 'damage-choice',
            text: 'Gain damage',
            outcomes: [
              {
                id: 'outcome',
                weight: 100,
                resultText: 'Gained damage bonus',
                rewards: [{ type: 'damage_bonus', amount: 5 }],
              },
            ],
          },
        ],
      });

      service.resolveChoice(event, event.choices![0]);

      expect(service.getDamageBonus()).toBe(5);
    });

    it('should track block bonus from rewards', () => {
      const event = createTestEvent({
        choices: [
          {
            id: 'block-choice',
            text: 'Gain block',
            outcomes: [
              {
                id: 'outcome',
                weight: 100,
                resultText: 'Gained block bonus',
                rewards: [{ type: 'block_bonus', amount: 3 }],
              },
            ],
          },
        ],
      });

      service.resolveChoice(event, event.choices![0]);

      expect(service.getBlockBonus()).toBe(3);
    });

    it('should track boss-specific damage bonus', () => {
      const event = createTestEvent({
        choices: [
          {
            id: 'boss-damage-choice',
            text: 'Gain boss damage',
            outcomes: [
              {
                id: 'outcome',
                weight: 100,
                resultText: 'Learned weakness',
                rewards: [{ type: 'boss_damage_bonus', amount: 10, bossId: 'bonelord' }],
              },
            ],
          },
        ],
      });

      service.resolveChoice(event, event.choices![0]);

      expect(service.getBossDamageBonus('bonelord')).toBe(10);
      expect(service.getBossDamageBonus('other-boss')).toBe(0);
    });
  });

  describe('seeded random consistency', () => {
    it('should produce consistent results with same seed', () => {
      const service1 = initNarrativeEventService(CharacterClassId.DUNGEON_KNIGHT, 'test-seed-123');
      const service2 = initNarrativeEventService(CharacterClassId.DUNGEON_KNIGHT, 'test-seed-123');

      const player = createTestPlayer();

      const result1 = service1.checkForEvent(player, { nodeType: 'combat' });
      const result2 = service2.checkForEvent(player, { nodeType: 'combat' });

      expect(result1.shouldTrigger).toBe(result2.shouldTrigger);
      if (result1.shouldTrigger && result2.shouldTrigger) {
        expect(result1.event?.id).toBe(result2.event?.id);
      }
    });

    it('should produce different results with different seeds', () => {
      // Run multiple times to ensure we get at least one difference
      let foundDifference = false;

      for (let i = 0; i < 20; i++) {
        const service1 = initNarrativeEventService(CharacterClassId.DUNGEON_KNIGHT, `seed-a-${i}`);
        const service2 = initNarrativeEventService(CharacterClassId.DUNGEON_KNIGHT, `seed-b-${i}`);

        const player = createTestPlayer();

        const result1 = service1.checkForEvent(player, { nodeType: 'combat' });
        const result2 = service2.checkForEvent(player, { nodeType: 'combat' });

        if (result1.shouldTrigger !== result2.shouldTrigger) {
          foundDifference = true;
          break;
        }
      }

      expect(foundDifference).toBe(true);
    });
  });
});
