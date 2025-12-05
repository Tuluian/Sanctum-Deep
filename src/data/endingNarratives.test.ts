import { describe, it, expect } from 'vitest';
import {
  getDefeatNarrative,
  getVictoryNarrative,
  getCharacterName,
  DEFEAT_NARRATIVES,
  VICTORY_NARRATIVES,
  CHARACTER_NAMES,
  DEFEAT_FRAME,
  VICTORY_FRAME,
  VICTORY_CHOICES,
  BAD_ENDING,
} from './endingNarratives';
import { CharacterClassId, ActNumber } from '@/types';

describe('endingNarratives', () => {
  describe('CHARACTER_NAMES', () => {
    it('should have names for all 8 character classes', () => {
      const classIds = Object.values(CharacterClassId);
      expect(classIds.length).toBe(8);

      for (const classId of classIds) {
        expect(CHARACTER_NAMES[classId]).toBeDefined();
        expect(CHARACTER_NAMES[classId].length).toBeGreaterThan(0);
      }
    });

    it('should return correct character names', () => {
      expect(CHARACTER_NAMES[CharacterClassId.CLERIC]).toBe('Elara Dawnkeeper');
      expect(CHARACTER_NAMES[CharacterClassId.DUNGEON_KNIGHT]).toBe('Ser Varren');
      expect(CHARACTER_NAMES[CharacterClassId.DIABOLIST]).toBe('Mordecai Ashworth');
      expect(CHARACTER_NAMES[CharacterClassId.OATHSWORN]).toBe('Sister Callista');
      expect(CHARACTER_NAMES[CharacterClassId.FEY_TOUCHED]).toBe('Wren');
    });
  });

  describe('getCharacterName', () => {
    it('should return the correct name for each class', () => {
      expect(getCharacterName(CharacterClassId.CLERIC)).toBe('Elara Dawnkeeper');
      expect(getCharacterName(CharacterClassId.DUNGEON_KNIGHT)).toBe('Ser Varren');
    });
  });

  describe('DEFEAT_NARRATIVES', () => {
    const acts: ActNumber[] = [1, 2, 3, 'boss'];
    const coreClasses = [
      CharacterClassId.CLERIC,
      CharacterClassId.DUNGEON_KNIGHT,
      CharacterClassId.DIABOLIST,
      CharacterClassId.OATHSWORN,
      CharacterClassId.FEY_TOUCHED,
    ];

    it('should have defeat narratives for each core class and act', () => {
      for (const classId of coreClasses) {
        for (const act of acts) {
          const narrative = getDefeatNarrative(classId, act);
          expect(narrative).toBeDefined();
          expect(narrative?.classId).toBe(classId);
          expect(narrative?.act).toBe(act);
        }
      }
    });

    it('should have narrative text and warden quote for each defeat', () => {
      for (const narrative of DEFEAT_NARRATIVES) {
        expect(narrative.narrative).toBeDefined();
        expect(narrative.narrative.length).toBeGreaterThan(50);
        expect(narrative.wardenQuote).toBeDefined();
        expect(narrative.wardenQuote.length).toBeGreaterThan(10);
      }
    });

    it('should return undefined for non-existent combinations', () => {
      // Invalid act
      const narrative = getDefeatNarrative(CharacterClassId.CLERIC, 4 as ActNumber);
      expect(narrative).toBeUndefined();
    });
  });

  describe('getDefeatNarrative', () => {
    it('should return correct narrative for Cleric Act 1', () => {
      const narrative = getDefeatNarrative(CharacterClassId.CLERIC, 1);
      expect(narrative).toBeDefined();
      expect(narrative?.narrative).toContain('prayer book');
      expect(narrative?.wardenQuote).toContain('light');
    });

    it('should return correct narrative for Knight boss defeat', () => {
      const narrative = getDefeatNarrative(CharacterClassId.DUNGEON_KNIGHT, 'boss');
      expect(narrative).toBeDefined();
      expect(narrative?.narrative).toContain('sword shatters');
      expect(narrative?.wardenQuote).toContain('line');
    });

    it('should return correct narrative for Diabolist Act 2', () => {
      const narrative = getDefeatNarrative(CharacterClassId.DIABOLIST, 2);
      expect(narrative).toBeDefined();
      expect(narrative?.narrative).toContain('Soul Debt');
      expect(narrative?.wardenQuote).toContain('debt');
    });
  });

  describe('VICTORY_NARRATIVES', () => {
    const coreClasses = [
      CharacterClassId.CLERIC,
      CharacterClassId.DUNGEON_KNIGHT,
      CharacterClassId.DIABOLIST,
      CharacterClassId.OATHSWORN,
      CharacterClassId.FEY_TOUCHED,
    ];

    it('should have victory narratives for each core class with both choices', () => {
      for (const classId of coreClasses) {
        const wardenNarrative = getVictoryNarrative(classId, 'warden');
        const leaveNarrative = getVictoryNarrative(classId, 'leave');

        expect(wardenNarrative).toBeDefined();
        expect(wardenNarrative?.choice).toBe('warden');

        expect(leaveNarrative).toBeDefined();
        expect(leaveNarrative?.choice).toBe('leave');
      }
    });

    it('should have narrative and epilogue for each victory', () => {
      for (const narrative of VICTORY_NARRATIVES) {
        expect(narrative.narrative).toBeDefined();
        expect(narrative.narrative.length).toBeGreaterThan(50);
        expect(narrative.epilogue).toBeDefined();
        expect(narrative.epilogue.length).toBeGreaterThan(50);
      }
    });
  });

  describe('getVictoryNarrative', () => {
    it('should return correct Warden ending for Cleric', () => {
      const narrative = getVictoryNarrative(CharacterClassId.CLERIC, 'warden');
      expect(narrative).toBeDefined();
      expect(narrative?.narrative).toContain('prayer book');
      expect(narrative?.epilogue).toContain('347 years later');
    });

    it('should return correct Leave ending for Knight', () => {
      const narrative = getVictoryNarrative(CharacterClassId.DUNGEON_KNIGHT, 'leave');
      expect(narrative).toBeDefined();
      expect(narrative?.narrative).toContain('tired');
      expect(narrative?.epilogue).toContain('trains the next generation');
    });

    it('should return undefined for invalid class', () => {
      // This shouldn't happen in normal usage, but test edge case
      const narrative = getVictoryNarrative('invalid' as CharacterClassId, 'warden');
      expect(narrative).toBeUndefined();
    });
  });

  describe('Frame constants', () => {
    it('should have defeat frame with title and subtitle', () => {
      expect(DEFEAT_FRAME.title).toBe('THE SANCTUM CLAIMS ANOTHER');
      expect(DEFEAT_FRAME.subtitle).toContain('wall of the lost');
    });

    it('should have victory frame with title and subtitle', () => {
      expect(VICTORY_FRAME.title).toBe('THE HOLLOW GOD FALLS');
      expect(VICTORY_FRAME.subtitle).toContain('victories');
    });
  });

  describe('VICTORY_CHOICES', () => {
    it('should have exactly 2 choices', () => {
      expect(VICTORY_CHOICES.length).toBe(2);
    });

    it('should have warden and leave options', () => {
      const ids = VICTORY_CHOICES.map(c => c.id);
      expect(ids).toContain('warden');
      expect(ids).toContain('leave');
    });

    it('should have labels and descriptions for each choice', () => {
      for (const choice of VICTORY_CHOICES) {
        expect(choice.label.length).toBeGreaterThan(0);
        expect(choice.description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('BAD_ENDING', () => {
    it('should have a title', () => {
      expect(BAD_ENDING.title).toBe('THE WORLD REMEMBERS');
    });

    it('should have multiple lines', () => {
      expect(BAD_ENDING.lines.length).toBeGreaterThan(3);
    });

    it('should include key thematic elements', () => {
      const fullText = BAD_ENDING.lines.join(' ');
      expect(fullText).toContain('Sanctum');
      expect(fullText).toContain('Hollow God');
      expect(fullText).toContain('survived');
    });
  });

  describe('DLC classes narratives', () => {
    const dlcClasses = [
      CharacterClassId.CELESTIAL,
      CharacterClassId.SUMMONER,
      CharacterClassId.BARGAINER,
    ];

    it('should have defeat narratives for DLC classes', () => {
      for (const classId of dlcClasses) {
        for (const act of [1, 2, 3, 'boss'] as ActNumber[]) {
          const narrative = getDefeatNarrative(classId, act);
          expect(narrative).toBeDefined();
          expect(narrative?.classId).toBe(classId);
        }
      }
    });

    it('should have victory narratives for DLC classes', () => {
      for (const classId of dlcClasses) {
        const wardenNarrative = getVictoryNarrative(classId, 'warden');
        const leaveNarrative = getVictoryNarrative(classId, 'leave');

        expect(wardenNarrative).toBeDefined();
        expect(leaveNarrative).toBeDefined();
      }
    });
  });
});
