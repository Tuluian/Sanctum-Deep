import { CardDefinition, CardType, CardRarity, EffectType, CharacterClassId } from '@/types';

// ============================================
// CURSE CARDS
// ============================================

// Pain Curse Card (shared across all Diabolist mechanics)
export const PAIN_CURSE: CardDefinition = {
  id: 'pain',
  name: 'Pain',
  type: CardType.CURSE,
  cost: 0,
  description: 'Unplayable. When drawn, lose 1 HP. Exhausts when discarded.',
  effects: [],
  unplayable: true,
  exhaustOnDiscard: true,
  onDraw: [{ type: EffectType.LOSE_HP, amount: 1 }],
};

// Weakness Curse - reduces damage dealt
export const WEAKNESS_CURSE: CardDefinition = {
  id: 'weakness',
  name: 'Weakness',
  type: CardType.CURSE,
  cost: 0,
  description: 'Unplayable. Deal 25% less damage this combat. Exhausts when discarded.',
  effects: [],
  unplayable: true,
  exhaustOnDiscard: true,
  onDraw: [{ type: EffectType.APPLY_STATUS, amount: 1, target: 'self' }], // IMPAIRED status
};

// Doom Curse - permanent max HP loss at end of combat
export const DOOM_CURSE: CardDefinition = {
  id: 'doom',
  name: 'Doom',
  type: CardType.CURSE,
  cost: 0,
  description: 'Unplayable. At end of combat, lose 5 max HP. Exhausts when discarded.',
  effects: [],
  unplayable: true,
  exhaustOnDiscard: true,
  onCombatEnd: [{ type: EffectType.LOSE_MAX_HP, amount: 5 }],
};

// Torment Curse - lose HP at end of each turn
export const TORMENT_CURSE: CardDefinition = {
  id: 'torment_curse',
  name: 'Torment',
  type: CardType.CURSE,
  cost: 0,
  description: 'Unplayable. Lose 1 HP at end of each turn. Exhausts when discarded.',
  effects: [],
  unplayable: true,
  exhaustOnDiscard: true,
  onTurnEnd: [{ type: EffectType.LOSE_HP, amount: 1 }],
};

export const DIABOLIST_CURSES: Record<string, CardDefinition> = {
  pain: PAIN_CURSE,
  weakness: WEAKNESS_CURSE,
  doom: DOOM_CURSE,
  torment_curse: TORMENT_CURSE,
};

// Starter Cards (10 cards in starter deck)
export const DIABOLIST_STARTER_CARDS: Record<string, CardDefinition> = {
  soul_rend: {
    id: 'soul_rend',
    name: 'Soul Rend',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 7 damage. Lose 1 HP.',
    effects: [
      { type: EffectType.DAMAGE, amount: 7 },
      { type: EffectType.LOSE_HP, amount: 1 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DIABOLIST,
  },
  dark_bargain: {
    id: 'dark_bargain',
    name: 'Dark Bargain',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 6 block. Add a Pain to your discard pile.',
    effects: [
      { type: EffectType.BLOCK, amount: 6 },
      { type: EffectType.ADD_CARD_TO_DISCARD, amount: 1, cardId: 'pain' },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DIABOLIST,
  },
  blood_pact: {
    id: 'blood_pact',
    name: 'Blood Pact',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 10 damage. Add a Pain to your deck.',
    effects: [
      { type: EffectType.DAMAGE, amount: 10 },
      { type: EffectType.ADD_CARD_TO_DECK, amount: 1, cardId: 'pain' },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DIABOLIST,
  },
  hellfire: {
    id: 'hellfire',
    name: 'Hellfire',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 6 damage to ALL enemies. Lose 2 HP.',
    effects: [
      { type: EffectType.DAMAGE_ALL, amount: 6 },
      { type: EffectType.LOSE_HP, amount: 2 },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.DIABOLIST,
  },
};

// ============================================
// COMMON CARDS (15)
// ============================================

export const DIABOLIST_COMMON_CARDS: Record<string, CardDefinition> = {
  sacrificial_strike: {
    id: 'sacrificial_strike',
    name: 'Sacrificial Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 8 damage. Lose 2 HP.',
    effects: [
      { type: EffectType.DAMAGE, amount: 8 },
      { type: EffectType.LOSE_HP, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  dark_shield: {
    id: 'dark_shield',
    name: 'Dark Shield',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 7 block. Add a Pain to your discard pile.',
    effects: [
      { type: EffectType.BLOCK, amount: 7 },
      { type: EffectType.ADD_CARD_TO_DISCARD, amount: 1, cardId: 'pain' },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  siphon_life: {
    id: 'siphon_life',
    name: 'Siphon Life',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage. Heal equal to damage dealt.',
    effects: [
      { type: EffectType.HEAL_EQUAL_DAMAGE, amount: 5 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  infernal_bolt: {
    id: 'infernal_bolt',
    name: 'Infernal Bolt',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage.',
    effects: [
      { type: EffectType.DAMAGE, amount: 6 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  torment: {
    id: 'torment',
    name: 'Torment',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage twice.',
    effects: [
      { type: EffectType.DAMAGE, amount: 4 },
      { type: EffectType.DAMAGE, amount: 4 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  blood_offering: {
    id: 'blood_offering',
    name: 'Blood Offering',
    type: CardType.SKILL,
    cost: 0,
    description: 'Lose 3 HP. Draw 2 cards.',
    effects: [
      { type: EffectType.LOSE_HP, amount: 3 },
      { type: EffectType.DRAW_CARDS, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  cursed_strength: {
    id: 'cursed_strength',
    name: 'Cursed Strength',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal damage equal to Curses in deck × 3.',
    effects: [
      { type: EffectType.DAMAGE_PER_CURSE, amount: 3 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  grim_harvest: {
    id: 'grim_harvest',
    name: 'Grim Harvest',
    type: CardType.SKILL,
    cost: 1,
    description: 'If an enemy dies this turn, heal 8 HP.',
    effects: [
      { type: EffectType.CONDITIONAL_HEAL, amount: 8 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  demonic_guard: {
    id: 'demonic_guard',
    name: 'Demonic Guard',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 block. Gain 2 block per Curse in deck.',
    effects: [
      { type: EffectType.BLOCK, amount: 5 },
      { type: EffectType.BLOCK_PER_CURSE, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  flames_of_torment: {
    id: 'flames_of_torment',
    name: 'Flames of Torment',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Deal 5 damage to ALL enemies. Lose 1 HP.',
    effects: [
      { type: EffectType.DAMAGE_ALL, amount: 5 },
      { type: EffectType.LOSE_HP, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  soul_tap: {
    id: 'soul_tap',
    name: 'Soul Tap',
    type: CardType.SKILL,
    cost: 0,
    description: 'Lose 2 HP. Gain 2 Resolve this turn.',
    effects: [
      { type: EffectType.LOSE_HP, amount: 2 },
      { type: EffectType.GAIN_RESOLVE, amount: 2 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  tainted_blade: {
    id: 'tainted_blade',
    name: 'Tainted Blade',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 9 damage. Add Weakness to deck.',
    effects: [
      { type: EffectType.DAMAGE, amount: 9 },
      { type: EffectType.ADD_CARD_TO_DECK, amount: 1, cardId: 'weakness' },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  consume_soul: {
    id: 'consume_soul',
    name: 'Consume Soul',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Exhaust a Curse from hand. Deal 10 damage.',
    effects: [
      { type: EffectType.EXHAUST_CURSE_FROM_HAND, amount: 1 },
      { type: EffectType.DAMAGE, amount: 10 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  debt_collector: {
    id: 'debt_collector',
    name: 'Debt Collector',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 6 block. If you have 5+ Curses, gain 6 more.',
    effects: [
      { type: EffectType.BLOCK, amount: 6 },
      { type: EffectType.BLOCK_PER_CURSE, amount: 0 }, // Special: 6 if 5+ curses
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  bloodletting: {
    id: 'bloodletting',
    name: 'Bloodletting',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Lose 4 HP. Deal 12 damage.',
    effects: [
      { type: EffectType.LOSE_HP, amount: 4 },
      { type: EffectType.DAMAGE, amount: 12 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  dark_mending: {
    id: 'dark_mending',
    name: 'Dark Mending',
    type: CardType.SKILL,
    cost: 1,
    description: 'Heal 6 HP. Add a Pain to your discard pile.',
    effects: [
      { type: EffectType.HEAL, amount: 6 },
      { type: EffectType.ADD_CARD_TO_DISCARD, amount: 1, cardId: 'pain' },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.DIABOLIST,
  },
};

// ============================================
// UNCOMMON CARDS (8)
// ============================================

export const DIABOLIST_UNCOMMON_CARDS: Record<string, CardDefinition> = {
  infernal_contract: {
    id: 'infernal_contract',
    name: 'Infernal Contract',
    type: CardType.POWER,
    cost: 2,
    description: '+2 damage on all attacks. Add Pain at end of each turn.',
    effects: [
      { type: EffectType.APPLY_STATUS, amount: 2 }, // Permanent +2 damage
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  soul_furnace: {
    id: 'soul_furnace',
    name: 'Soul Furnace',
    type: CardType.POWER,
    cost: 1,
    description: 'Whenever you take self-damage, deal 3 damage to random enemy.',
    effects: [], // Handled specially
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  debt_transfer: {
    id: 'debt_transfer',
    name: 'Debt Transfer',
    type: CardType.SKILL,
    cost: 2,
    description: 'Exhaust all Curses from deck. Deal 5 damage per Curse exhausted.',
    effects: [], // Handled specially - exhaust all curses and deal damage
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  ritual_sacrifice: {
    id: 'ritual_sacrifice',
    name: 'Ritual Sacrifice',
    type: CardType.SKILL,
    cost: 2,
    description: 'Lose 5 HP. Draw 3 cards. Gain 2 Resolve.',
    effects: [
      { type: EffectType.LOSE_HP, amount: 5 },
      { type: EffectType.DRAW_CARDS, amount: 3 },
      { type: EffectType.GAIN_RESOLVE, amount: 2 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  demonic_form: {
    id: 'demonic_form',
    name: 'Demonic Form',
    type: CardType.POWER,
    cost: 2,
    description: '+1 Resolve per turn. Lose 3 HP per turn.',
    effects: [], // Handled specially - permanent effects
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  curse_eater: {
    id: 'curse_eater',
    name: 'Curse Eater',
    type: CardType.SKILL,
    cost: 1,
    description: 'Exhaust a Curse. Heal 5 HP. Gain 5 block.',
    effects: [
      { type: EffectType.EXHAUST_CURSE_FROM_HAND, amount: 1 },
      { type: EffectType.HEAL, amount: 5 },
      { type: EffectType.BLOCK, amount: 5 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  bargain_with_death: {
    id: 'bargain_with_death',
    name: 'Bargain with Death',
    type: CardType.ATTACK,
    cost: 2,
    description: 'If HP < 50%, deal 25 damage. Otherwise deal 10.',
    effects: [
      { type: EffectType.DAMAGE_IF_LOW_HP, amount: 25 }, // 25 if low, 10 otherwise
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  infernal_pact: {
    id: 'infernal_pact',
    name: 'Infernal Pact',
    type: CardType.POWER,
    cost: 1,
    description: '+5 damage to all attacks until you fall below 25% HP.',
    effects: [
      { type: EffectType.APPLY_STATUS, amount: 5 }, // Conditional power
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
  blood_transfusion: {
    id: 'blood_transfusion',
    name: 'Blood Transfusion',
    type: CardType.SKILL,
    cost: 2,
    description: 'Heal 12 HP. Add a Doom curse to your deck.',
    effects: [
      { type: EffectType.HEAL, amount: 12 },
      { type: EffectType.ADD_CARD_TO_DECK, amount: 1, cardId: 'doom' },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.DIABOLIST,
  },
};

// ============================================
// RARE CARDS (3)
// ============================================

export const DIABOLIST_RARE_CARDS: Record<string, CardDefinition> = {
  soul_shatter: {
    id: 'soul_shatter',
    name: 'Soul Shatter',
    type: CardType.ATTACK,
    cost: 3,
    description: 'Deal 30 damage. Add 3 Pain to deck. Exhaust.',
    effects: [
      { type: EffectType.DAMAGE, amount: 30 },
      { type: EffectType.ADD_CARD_TO_DECK, amount: 1, cardId: 'pain' },
      { type: EffectType.ADD_CARD_TO_DECK, amount: 1, cardId: 'pain' },
      { type: EffectType.ADD_CARD_TO_DECK, amount: 1, cardId: 'pain' },
    ],
    exhaust: true,
    rarity: CardRarity.RARE,
    classId: CharacterClassId.DIABOLIST,
  },
  lord_of_contracts: {
    id: 'lord_of_contracts',
    name: 'Lord of Contracts',
    type: CardType.POWER,
    cost: 3,
    description: 'All Contract conditions are ignored. Curses no longer trigger effects.',
    effects: [], // Handled specially - disables curse penalties
    rarity: CardRarity.RARE,
    classId: CharacterClassId.DIABOLIST,
  },
  final_sacrifice: {
    id: 'final_sacrifice',
    name: 'Final Sacrifice',
    type: CardType.ATTACK,
    cost: 0,
    description: 'Set HP to 1. Deal damage equal to HP lost × 2. Exhaust.',
    effects: [], // Handled specially
    exhaust: true,
    rarity: CardRarity.RARE,
    classId: CharacterClassId.DIABOLIST,
  },
};

// All Diabolist cards including starters and curses
export const DIABOLIST_CARDS: Record<string, CardDefinition> = {
  ...DIABOLIST_CURSES,
  ...DIABOLIST_STARTER_CARDS,
  ...DIABOLIST_COMMON_CARDS,
  ...DIABOLIST_UNCOMMON_CARDS,
  ...DIABOLIST_RARE_CARDS,
};

// Reward pool (excludes starters and curses)
export const DIABOLIST_REWARD_POOL: CardDefinition[] = [
  ...Object.values(DIABOLIST_COMMON_CARDS),
  ...Object.values(DIABOLIST_UNCOMMON_CARDS),
  ...Object.values(DIABOLIST_RARE_CARDS),
];
