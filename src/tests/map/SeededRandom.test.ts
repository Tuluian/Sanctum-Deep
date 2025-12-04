import { describe, it, expect } from 'vitest';
import { SeededRandom } from '@/map/SeededRandom';

describe('SeededRandom', () => {
  describe('determinism', () => {
    it('produces same sequence with same seed', () => {
      const rng1 = new SeededRandom('test_seed');
      const rng2 = new SeededRandom('test_seed');

      const seq1 = [rng1.next(), rng1.next(), rng1.next()];
      const seq2 = [rng2.next(), rng2.next(), rng2.next()];

      expect(seq1).toEqual(seq2);
    });

    it('produces different sequences with different seeds', () => {
      const rng1 = new SeededRandom('seed_a');
      const rng2 = new SeededRandom('seed_b');

      const val1 = rng1.next();
      const val2 = rng2.next();

      expect(val1).not.toEqual(val2);
    });

    it('handles empty seed with default', () => {
      const rng = new SeededRandom('');
      expect(rng.next()).toBeGreaterThanOrEqual(0);
      expect(rng.next()).toBeLessThan(1);
    });

    it('handles very short seeds', () => {
      const rng = new SeededRandom('a');
      expect(rng.next()).toBeGreaterThanOrEqual(0);
    });

    it('handles very long seeds', () => {
      const longSeed = 'a'.repeat(1000);
      const rng = new SeededRandom(longSeed);
      expect(rng.next()).toBeGreaterThanOrEqual(0);
    });

    it('handles special characters in seed', () => {
      const rng = new SeededRandom('!@#$%^&*()_+-=[]{}|;:,.<>?');
      expect(rng.next()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('next()', () => {
    it('returns values in [0, 1) range', () => {
      const rng = new SeededRandom('range_test');
      for (let i = 0; i < 1000; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });
  });

  describe('nextInt()', () => {
    it('returns integers in specified range inclusive', () => {
      const rng = new SeededRandom('int_test');
      for (let i = 0; i < 100; i++) {
        const val = rng.nextInt(5, 10);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThanOrEqual(10);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    it('works with single value range', () => {
      const rng = new SeededRandom('single_test');
      const val = rng.nextInt(7, 7);
      expect(val).toBe(7);
    });
  });

  describe('nextBool()', () => {
    it('returns boolean values', () => {
      const rng = new SeededRandom('bool_test');
      const val = rng.nextBool();
      expect(typeof val).toBe('boolean');
    });

    it('respects probability parameter', () => {
      const rng = new SeededRandom('prob_test');
      // With probability 0, should always be false
      for (let i = 0; i < 10; i++) {
        expect(rng.nextBool(0)).toBe(false);
      }
    });
  });

  describe('shuffle()', () => {
    it('shuffles array in place', () => {
      const rng = new SeededRandom('shuffle_test');
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const original = [...arr];
      const result = rng.shuffle(arr);

      expect(result).toBe(arr); // Same reference
      expect(arr).not.toEqual(original); // Should be shuffled
      expect(arr.sort((a, b) => a - b)).toEqual(original.sort((a, b) => a - b)); // Same elements
    });

    it('produces deterministic shuffle', () => {
      const arr1 = [1, 2, 3, 4, 5];
      const arr2 = [1, 2, 3, 4, 5];

      new SeededRandom('det_shuffle').shuffle(arr1);
      new SeededRandom('det_shuffle').shuffle(arr2);

      expect(arr1).toEqual(arr2);
    });
  });

  describe('shuffled()', () => {
    it('returns new array without mutating original', () => {
      const rng = new SeededRandom('shuffled_test');
      const original = [1, 2, 3, 4, 5];
      const copy = [...original];
      const result = rng.shuffled(original);

      expect(result).not.toBe(original);
      expect(original).toEqual(copy);
    });
  });

  describe('pick()', () => {
    it('picks element from array', () => {
      const rng = new SeededRandom('pick_test');
      const arr = ['a', 'b', 'c'];
      const val = rng.pick(arr);
      expect(arr).toContain(val);
    });
  });

  describe('weightedChoice()', () => {
    it('respects weights', () => {
      const rng = new SeededRandom('weight_test');
      const items = ['rare', 'common'];
      const weights = [1, 99]; // common should be picked much more often

      const counts = { rare: 0, common: 0 };
      for (let i = 0; i < 1000; i++) {
        const picked = rng.weightedChoice(items, weights);
        counts[picked as 'rare' | 'common']++;
      }

      // Common should be picked much more often
      expect(counts.common).toBeGreaterThan(counts.rare * 5);
    });

    it('throws on mismatched array lengths', () => {
      const rng = new SeededRandom('mismatch_test');
      expect(() => rng.weightedChoice(['a', 'b'], [1])).toThrow();
    });
  });
});
