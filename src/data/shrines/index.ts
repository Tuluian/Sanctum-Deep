/**
 * Shrine Data Index
 *
 * Exports all shrine definitions and helper functions.
 */

import { ShrineDefinition } from '@/types/shrines';
import { ACT1_SHRINES } from './act1';
import { ACT2_SHRINES } from './act2';
import { ACT3_SHRINES } from './act3';

/**
 * All shrine definitions
 */
export const ALL_SHRINES: ShrineDefinition[] = [
  ...ACT1_SHRINES,
  ...ACT2_SHRINES,
  ...ACT3_SHRINES,
];

/**
 * Get shrines for a specific act
 */
export function getShrinesByAct(act: 1 | 2 | 3): ShrineDefinition[] {
  switch (act) {
    case 1:
      return ACT1_SHRINES;
    case 2:
      return ACT2_SHRINES;
    case 3:
      return ACT3_SHRINES;
    default:
      return [];
  }
}

/**
 * Get a specific shrine by ID
 */
export function getShrineById(id: string): ShrineDefinition | undefined {
  return ALL_SHRINES.find((shrine) => shrine.id === id);
}

/**
 * Get shrine count per act
 */
export const SHRINE_COUNTS = {
  act1: ACT1_SHRINES.length,
  act2: ACT2_SHRINES.length,
  act3: ACT3_SHRINES.length,
  total: ALL_SHRINES.length,
};

// Re-export individual act shrines for direct access
export { ACT1_SHRINES } from './act1';
export { ACT2_SHRINES } from './act2';
export { ACT3_SHRINES } from './act3';
