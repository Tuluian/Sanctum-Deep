/**
 * SeededRandom - Deterministic random number generator using mulberry32 algorithm.
 * Same seed always produces same sequence of random numbers.
 */
export class SeededRandom {
  private state: number;

  constructor(seed: string) {
    this.state = this.hashString(seed);
  }

  /**
   * Convert string seed to a numeric seed using DJB2 hash algorithm
   */
  private hashString(str: string): number {
    if (!str || str.length === 0) {
      str = 'default_seed';
    }
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) + hash) ^ char;
    }
    return Math.abs(hash) || 1;
  }

  /**
   * Generate next random number in range [0, 1)
   * Uses mulberry32 algorithm
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer in range [min, max] inclusive
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Generate random boolean with given probability of true
   */
  nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Shuffle array in place using Fisher-Yates algorithm
   * Returns the same array reference, mutated
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Return a shuffled copy of the array (does not mutate original)
   */
  shuffled<T>(array: T[]): T[] {
    return this.shuffle([...array]);
  }

  /**
   * Pick a random element from array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Pick a random element based on weights
   * @param items Array of items to pick from
   * @param weights Array of weights (must match items length)
   */
  weightedChoice<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error('Items and weights must have same length');
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = this.next() * totalWeight;

    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }

    // Fallback (should never reach here)
    return items[items.length - 1];
  }

  /**
   * Get current state (for debugging/serialization)
   */
  getState(): number {
    return this.state;
  }
}
