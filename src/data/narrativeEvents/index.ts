/**
 * Narrative Events Index
 *
 * Exports all narrative events and provides helper functions.
 */

import { NarrativeEvent } from '@/types/narrativeEvents';
import { UNIVERSAL_EVENTS } from './universal';
import { CLASS_SPECIFIC_EVENTS } from './classSpecific';

// Export individual event modules
export * from './universal';
export * from './classSpecific';

/**
 * All narrative events combined
 */
export const ALL_NARRATIVE_EVENTS: NarrativeEvent[] = [
  ...UNIVERSAL_EVENTS,
  ...CLASS_SPECIFIC_EVENTS,
];

/**
 * Get events by act
 */
export function getEventsByAct(act: 1 | 2 | 3): NarrativeEvent[] {
  return ALL_NARRATIVE_EVENTS.filter(
    (event) => event.act === act || event.act === 'any'
  );
}

/**
 * Get event by ID
 */
export function getEventById(id: string): NarrativeEvent | undefined {
  return ALL_NARRATIVE_EVENTS.find((event) => event.id === id);
}
