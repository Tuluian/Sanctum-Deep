import { describe, it, expect } from 'vitest';
import { CLASSES, createStarterDeck, getClassById } from './classes';
import { CLERIC_CARDS } from './cards/cleric';
import { CharacterClassId, CardType, EffectType } from '@/types';

// =====================================================
// STORY 1.3: Cleric Starter Deck & Devotion Tests
// =====================================================
describe('Story 1.3: Cleric Starter Deck & Devotion', () => {
  describe('Cleric Class Configuration', () => {
    it('should have Cleric with 75 max HP (AC: 2)', () => {
      const cleric = CLASSES[CharacterClassId.CLERIC];
      expect(cleric.maxHp).toBe(75);
    });

    it('should have Cleric with 3 max Resolve (AC: 3)', () => {
      const cleric = CLASSES[CharacterClassId.CLERIC];
      expect(cleric.maxResolve).toBe(3);
    });

    it('should have correct Cleric name', () => {
      const cleric = CLASSES[CharacterClassId.CLERIC];
      expect(cleric.name).toBe('Cleric');
    });

    it('should retrieve Cleric by ID', () => {
      const cleric = getClassById(CharacterClassId.CLERIC);
      expect(cleric).toBeDefined();
      expect(cleric?.id).toBe(CharacterClassId.CLERIC);
    });
  });

  describe('Cleric Starter Deck Creation (AC: 1)', () => {
    it('should create exactly 11 cards total', () => {
      const deck = createStarterDeck(CharacterClassId.CLERIC);
      expect(deck.length).toBe(11);
    });

    it('should have 4 Smite cards', () => {
      const deck = createStarterDeck(CharacterClassId.CLERIC);
      const smites = deck.filter((card) => card.id === 'smite');
      expect(smites.length).toBe(4);
    });

    it('should have 4 Shield of Faith cards', () => {
      const deck = createStarterDeck(CharacterClassId.CLERIC);
      const shields = deck.filter((card) => card.id === 'shield_of_faith');
      expect(shields.length).toBe(4);
    });

    it('should have 1 Prayer of Mending card', () => {
      const deck = createStarterDeck(CharacterClassId.CLERIC);
      const prayers = deck.filter((card) => card.id === 'prayer_of_mending');
      expect(prayers.length).toBe(1);
    });

    it('should have 1 Consecrate card', () => {
      const deck = createStarterDeck(CharacterClassId.CLERIC);
      const consecrates = deck.filter((card) => card.id === 'consecrate');
      expect(consecrates.length).toBe(1);
    });

    it('should assign unique instance IDs to each card', () => {
      const deck = createStarterDeck(CharacterClassId.CLERIC);
      const instanceIds = deck.map((card) => card.instanceId);
      const uniqueIds = new Set(instanceIds);
      expect(uniqueIds.size).toBe(deck.length);
    });
  });

  describe('Cleric Card Definitions', () => {
    describe('Smite Card', () => {
      it('should be an Attack card', () => {
        const smite = CLERIC_CARDS.smite;
        expect(smite.type).toBe(CardType.ATTACK);
      });

      it('should cost 1 Resolve', () => {
        const smite = CLERIC_CARDS.smite;
        expect(smite.cost).toBe(1);
      });

      it('should deal 5 damage', () => {
        const smite = CLERIC_CARDS.smite;
        expect(smite.effects.length).toBe(1);
        expect(smite.effects[0].type).toBe(EffectType.DAMAGE);
        expect(smite.effects[0].amount).toBe(5);
      });
    });

    describe('Shield of Faith Card', () => {
      it('should be a Skill card', () => {
        const shield = CLERIC_CARDS.shield_of_faith;
        expect(shield.type).toBe(CardType.SKILL);
      });

      it('should cost 1 Resolve', () => {
        const shield = CLERIC_CARDS.shield_of_faith;
        expect(shield.cost).toBe(1);
      });

      it('should grant 5 block', () => {
        const shield = CLERIC_CARDS.shield_of_faith;
        expect(shield.effects.length).toBe(1);
        expect(shield.effects[0].type).toBe(EffectType.BLOCK);
        expect(shield.effects[0].amount).toBe(5);
      });
    });

    describe('Prayer of Mending Card', () => {
      it('should be a Skill card', () => {
        const prayer = CLERIC_CARDS.prayer_of_mending;
        expect(prayer.type).toBe(CardType.SKILL);
      });

      it('should cost 1 Resolve', () => {
        const prayer = CLERIC_CARDS.prayer_of_mending;
        expect(prayer.cost).toBe(1);
      });

      it('should heal 6 HP', () => {
        const prayer = CLERIC_CARDS.prayer_of_mending;
        expect(prayer.effects.length).toBe(1);
        expect(prayer.effects[0].type).toBe(EffectType.HEAL);
        expect(prayer.effects[0].amount).toBe(6);
      });
    });

    describe('Consecrate Card', () => {
      it('should be an Attack card', () => {
        const consecrate = CLERIC_CARDS.consecrate;
        expect(consecrate.type).toBe(CardType.ATTACK);
      });

      it('should cost 1 Resolve', () => {
        const consecrate = CLERIC_CARDS.consecrate;
        expect(consecrate.cost).toBe(1);
      });

      it('should deal 3 damage and heal 3 HP', () => {
        const consecrate = CLERIC_CARDS.consecrate;
        expect(consecrate.effects.length).toBe(2);

        const damageEffect = consecrate.effects.find((e) => e.type === EffectType.DAMAGE);
        expect(damageEffect?.amount).toBe(3);

        const healEffect = consecrate.effects.find((e) => e.type === EffectType.HEAL);
        expect(healEffect?.amount).toBe(3);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unknown class ID', () => {
      expect(() => createStarterDeck('invalid_class' as CharacterClassId)).toThrow();
    });

    it('should return undefined for unknown class in getClassById', () => {
      const result = getClassById('invalid_class' as CharacterClassId);
      expect(result).toBeUndefined();
    });
  });
});
