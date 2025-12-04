import {
  CardDefinition,
  CardType,
  CardRarity,
  EffectType,
  CharacterClassId,
  WhimsyEffect,
} from '@/types';

// Helper to create damage whimsy effects for a range
function createDamageRange(min: number, max: number): WhimsyEffect[] {
  const effects: WhimsyEffect[] = [];
  for (let i = min; i <= max; i++) {
    effects.push({
      weight: 1,
      effects: [{ type: EffectType.DAMAGE, amount: i }],
      description: `Deal ${i} damage`,
    });
  }
  return effects;
}

// Helper to create block whimsy effects for a range
function createBlockRange(min: number, max: number): WhimsyEffect[] {
  const effects: WhimsyEffect[] = [];
  for (let i = min; i <= max; i++) {
    effects.push({
      weight: 1,
      effects: [{ type: EffectType.BLOCK, amount: i }],
      description: `Gain ${i} block`,
    });
  }
  return effects;
}

// Starter Cards (10 cards in starter deck)
export const FEY_TOUCHED_STARTER_CARDS: Record<string, CardDefinition> = {
  fey_bolt: {
    id: 'fey_bolt',
    name: 'Fey Bolt',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Whimsy: Deal 4-8 damage.',
    effects: [], // Whimsy provides effects
    whimsy: createDamageRange(4, 8),
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  glamour: {
    id: 'glamour',
    name: 'Glamour',
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Gain 4-8 block.',
    effects: [], // Whimsy provides effects
    whimsy: createBlockRange(4, 8),
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  pixies_gift: {
    id: 'pixies_gift',
    name: "Pixie's Gift",
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Draw 2 cards OR Gain 8 block OR Deal 8 damage.',
    effects: [], // Whimsy provides effects
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.DRAW_CARDS, amount: 2 }],
        description: 'Draw 2 cards',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: 8 }],
        description: 'Gain 8 block',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.DAMAGE, amount: 8 }],
        description: 'Deal 8 damage',
      },
    ],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  tricksters_trade: {
    id: 'tricksters_trade',
    name: "Trickster's Trade",
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 1 Luck. If you have 3+ Luck, also gain 4 block.',
    effects: [
      { type: EffectType.GAIN_LUCK, amount: 1 },
    ],
    // Conditional effect handled in engine
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.FEY_TOUCHED,
  },
};

// ============================================
// COMMON CARDS (15)
// ============================================

export const FEY_TOUCHED_COMMON_CARDS: Record<string, CardDefinition> = {
  wild_strike: {
    id: 'wild_strike',
    name: 'Wild Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Whimsy: Deal 5-9 damage.',
    effects: [],
    whimsy: createDamageRange(5, 9),
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  shifting_shield: {
    id: 'shifting_shield',
    name: 'Shifting Shield',
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Gain 5-9 block.',
    effects: [],
    whimsy: createBlockRange(5, 9),
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  lucky_coin: {
    id: 'lucky_coin',
    name: 'Lucky Coin',
    type: CardType.SKILL,
    cost: 0,
    description: 'Gain 2 Luck.',
    effects: [{ type: EffectType.GAIN_LUCK, amount: 2 }],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  fey_fire: {
    id: 'fey_fire',
    name: 'Fey Fire',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 6 damage. Whimsy: +4 damage OR heal 4 OR draw 1.',
    effects: [{ type: EffectType.DAMAGE, amount: 6 }],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.DAMAGE, amount: 4 }],
        description: '+4 damage',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.HEAL, amount: 4 }],
        description: 'Heal 4 HP',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.DRAW_CARDS, amount: 1 }],
        description: 'Draw 1 card',
      },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  mischief: {
    id: 'mischief',
    name: 'Mischief',
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Enemy loses 5 block OR takes 5 damage OR is Impaired.',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: -5, target: 'enemy' }],
        description: 'Enemy loses 5 block',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.DAMAGE, amount: 5 }],
        description: 'Deal 5 damage',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.APPLY_STATUS, amount: 1 }], // Impaired
        description: 'Apply Impaired for 1 turn',
      },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  borrowed_time: {
    id: 'borrowed_time',
    name: 'Borrowed Time',
    type: CardType.SKILL,
    cost: 1,
    description: 'Draw 2 cards. Whimsy: Discard 1 OR 2 cards at end of turn.',
    effects: [{ type: EffectType.DRAW_CARDS, amount: 2 }],
    whimsy: [
      {
        weight: 3,
        effects: [],
        description: 'Discard 1 card',
      },
      {
        weight: 1,
        effects: [],
        description: 'Discard 2 cards',
      },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  chaotic_bolt: {
    id: 'chaotic_bolt',
    name: 'Chaotic Bolt',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 4 damage to a random enemy 2 times.',
    effects: [
      { type: EffectType.DAMAGE_RANDOM_ENEMY, amount: 4 },
      { type: EffectType.DAMAGE_RANDOM_ENEMY, amount: 4 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  natures_whim: {
    id: 'natures_whim',
    name: "Nature's Whim",
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Gain 8 block OR Heal 8 HP.',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: 8 }],
        description: 'Gain 8 block',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.HEAL, amount: 8 }],
        description: 'Heal 8 HP',
      },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  gamblers_strike: {
    id: 'gamblers_strike',
    name: "Gambler's Strike",
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 3 damage. Whimsy: 50% chance to deal 3 more.',
    effects: [{ type: EffectType.DAMAGE, amount: 3 }],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.DAMAGE, amount: 3 }],
        description: '+3 damage',
      },
      {
        weight: 1,
        effects: [],
        description: 'No bonus',
      },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  illusory_armor: {
    id: 'illusory_armor',
    name: 'Illusory Armor',
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Gain 10 block OR Gain 5 block.',
    effects: [],
    whimsy: [
      {
        weight: 3,
        effects: [{ type: EffectType.BLOCK, amount: 10 }],
        description: 'Gain 10 block',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: 5 }],
        description: 'Gain 5 block (halved)',
      },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  fey_blessing: {
    id: 'fey_blessing',
    name: 'Fey Blessing',
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Heal 3-7 HP.',
    effects: [],
    whimsy: [
      { weight: 1, effects: [{ type: EffectType.HEAL, amount: 3 }], description: 'Heal 3 HP' },
      { weight: 1, effects: [{ type: EffectType.HEAL, amount: 4 }], description: 'Heal 4 HP' },
      { weight: 1, effects: [{ type: EffectType.HEAL, amount: 5 }], description: 'Heal 5 HP' },
      { weight: 1, effects: [{ type: EffectType.HEAL, amount: 6 }], description: 'Heal 6 HP' },
      { weight: 1, effects: [{ type: EffectType.HEAL, amount: 7 }], description: 'Heal 7 HP' },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  changeling: {
    id: 'changeling',
    name: 'Changeling',
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Become a random Common attack OR skill.',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.DAMAGE, amount: 8 }],
        description: 'Deal 8 damage',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: 8 }],
        description: 'Gain 8 block',
      },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  lucky_strike: {
    id: 'lucky_strike',
    name: 'Lucky Strike',
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 5 damage. Gain 1 Luck.',
    effects: [
      { type: EffectType.DAMAGE, amount: 5 },
      { type: EffectType.GAIN_LUCK, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  tricksters_blade: {
    id: 'tricksters_blade',
    name: "Trickster's Blade",
    type: CardType.ATTACK,
    cost: 1,
    description: 'Deal 7 damage. Draw 1 card.',
    effects: [
      { type: EffectType.DAMAGE, amount: 7 },
      { type: EffectType.DRAW_CARDS, amount: 1 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  fortuitous_block: {
    id: 'fortuitous_block',
    name: 'Fortuitous Block',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 6 block. If Luck > 5, gain 6 more.',
    effects: [
      { type: EffectType.BLOCK, amount: 6 },
      { type: EffectType.BLOCK_IF_LUCK, amount: 6 },
    ],
    rarity: CardRarity.COMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
};

// ============================================
// UNCOMMON CARDS (8)
// ============================================

export const FEY_TOUCHED_UNCOMMON_CARDS: Record<string, CardDefinition> = {
  wild_magic: {
    id: 'wild_magic',
    name: 'Wild Magic',
    type: CardType.SKILL,
    cost: 2,
    description: 'Whimsy: Deal 15 damage OR Gain 15 block OR Draw 4 OR Heal 15.',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.DAMAGE, amount: 15 }],
        description: 'Deal 15 damage',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: 15 }],
        description: 'Gain 15 block',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.DRAW_CARDS, amount: 4 }],
        description: 'Draw 4 cards',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.HEAL, amount: 15 }],
        description: 'Heal 15 HP',
      },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  luck_surge: {
    id: 'luck_surge',
    name: 'Luck Surge',
    type: CardType.SKILL,
    cost: 1,
    description: 'Gain 5 Luck. Next Whimsy is guaranteed best outcome.',
    effects: [
      { type: EffectType.GAIN_LUCK, amount: 5 },
      { type: EffectType.SET_GUARANTEED_BEST, amount: 1 },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  chaos_theory: {
    id: 'chaos_theory',
    name: 'Chaos Theory',
    type: CardType.POWER,
    cost: 2,
    description: 'At turn start: Whimsy: +2 damage, +2 block, or draw 1.',
    effects: [], // Handled as Power effect
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.APPLY_STATUS, amount: 2 }], // +2 damage next attack
        description: '+2 damage to next attack',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: 2 }],
        description: 'Gain 2 block',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.DRAW_CARDS, amount: 1 }],
        description: 'Draw 1 card',
      },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  probability_storm: {
    id: 'probability_storm',
    name: 'Probability Storm',
    type: CardType.ATTACK,
    cost: 2,
    description: 'Whimsy: Deal 4 damage 3, 4, or 5 times.',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
        ],
        description: 'Deal 4 damage 3 times (12 total)',
      },
      {
        weight: 1,
        effects: [
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
        ],
        description: 'Deal 4 damage 4 times (16 total)',
      },
      {
        weight: 1,
        effects: [
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
          { type: EffectType.DAMAGE, amount: 4 },
        ],
        description: 'Deal 4 damage 5 times (20 total)',
      },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  fey_bargain: {
    id: 'fey_bargain',
    name: 'Fey Bargain',
    type: CardType.SKILL,
    cost: 1,
    description: 'Whimsy: Gain 12 block OR Deal 12 damage (random).',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: 12 }],
        description: 'Gain 12 block',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.DAMAGE, amount: 12 }],
        description: 'Deal 12 damage',
      },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  fortunes_favor: {
    id: 'fortunes_favor',
    name: "Fortune's Favor",
    type: CardType.SKILL,
    cost: 1,
    description: 'Spend all Luck. Gain 2 block and deal 2 damage per Luck spent.',
    effects: [{ type: EffectType.SPEND_ALL_LUCK, amount: 2 }],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  reality_warp: {
    id: 'reality_warp',
    name: 'Reality Warp',
    type: CardType.SKILL,
    cost: 2,
    description: 'Whimsy: Draw 3 cards OR Gain 10 block and 10 HP.',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.DRAW_CARDS, amount: 3 }],
        description: 'Draw 3 cards',
      },
      {
        weight: 1,
        effects: [
          { type: EffectType.BLOCK, amount: 10 },
          { type: EffectType.HEAL, amount: 10 },
        ],
        description: 'Gain 10 block and heal 10 HP',
      },
    ],
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  serendipity: {
    id: 'serendipity',
    name: 'Serendipity',
    type: CardType.POWER,
    cost: 2,
    description: 'Whenever you play a Whimsy card, gain 1 Luck.',
    effects: [], // Handled as passive Power
    rarity: CardRarity.UNCOMMON,
    classId: CharacterClassId.FEY_TOUCHED,
  },
};

// ============================================
// RARE CARDS (3)
// ============================================

export const FEY_TOUCHED_RARE_CARDS: Record<string, CardDefinition> = {
  master_of_chaos: {
    id: 'master_of_chaos',
    name: 'Master of Chaos',
    type: CardType.POWER,
    cost: 3,
    description: 'All Whimsy cards trigger twice.',
    effects: [], // Handled as passive Power
    rarity: CardRarity.RARE,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  wish: {
    id: 'wish',
    name: 'Wish',
    type: CardType.SKILL,
    cost: 4,
    description: 'Choose: Deal 20 damage OR Gain 20 block OR Heal 20 OR Draw 5. Exhaust.',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [{ type: EffectType.DAMAGE, amount: 20 }],
        description: 'Deal 20 damage',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.BLOCK, amount: 20 }],
        description: 'Gain 20 block',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.HEAL, amount: 20 }],
        description: 'Heal 20 HP',
      },
      {
        weight: 1,
        effects: [{ type: EffectType.DRAW_CARDS, amount: 5 }],
        description: 'Draw 5 cards',
      },
    ],
    exhaust: true,
    rarity: CardRarity.RARE,
    classId: CharacterClassId.FEY_TOUCHED,
  },
  fey_lords_gambit: {
    id: 'fey_lords_gambit',
    name: "Fey Lord's Gambit",
    type: CardType.ATTACK,
    cost: 2,
    description: 'Whimsy: Deal 10-30 damage. Take 0-10 self-damage.',
    effects: [],
    whimsy: [
      {
        weight: 1,
        effects: [
          { type: EffectType.DAMAGE, amount: 10 },
          { type: EffectType.LOSE_HP, amount: 10 },
        ],
        description: 'Deal 10 damage, take 10 damage',
      },
      {
        weight: 2,
        effects: [
          { type: EffectType.DAMAGE, amount: 15 },
          { type: EffectType.LOSE_HP, amount: 7 },
        ],
        description: 'Deal 15 damage, take 7 damage',
      },
      {
        weight: 3,
        effects: [
          { type: EffectType.DAMAGE, amount: 20 },
          { type: EffectType.LOSE_HP, amount: 5 },
        ],
        description: 'Deal 20 damage, take 5 damage',
      },
      {
        weight: 2,
        effects: [
          { type: EffectType.DAMAGE, amount: 25 },
          { type: EffectType.LOSE_HP, amount: 2 },
        ],
        description: 'Deal 25 damage, take 2 damage',
      },
      {
        weight: 1,
        effects: [
          { type: EffectType.DAMAGE, amount: 30 },
        ],
        description: 'Deal 30 damage, take no damage!',
      },
    ],
    rarity: CardRarity.RARE,
    classId: CharacterClassId.FEY_TOUCHED,
  },
};

// Starter Block Bonus Card
export const FEY_TOUCHED_BLOCK_BONUS_CARD: Record<string, CardDefinition> = {
  enchanted_ward: {
    id: 'enchanted_ward',
    name: 'Enchanted Ward',
    type: CardType.POWER,
    cost: 2,
    description: 'Permanently increase all block from cards by 1. Exhaust.',
    effects: [{ type: EffectType.PERMANENT_BLOCK_BONUS, amount: 1 }],
    rarity: CardRarity.STARTER,
    classId: CharacterClassId.FEY_TOUCHED,
    exhaust: true,
  },
};

// All Fey-Touched cards including starters
export const FEY_TOUCHED_CARDS: Record<string, CardDefinition> = {
  ...FEY_TOUCHED_STARTER_CARDS,
  ...FEY_TOUCHED_BLOCK_BONUS_CARD,
  ...FEY_TOUCHED_COMMON_CARDS,
  ...FEY_TOUCHED_UNCOMMON_CARDS,
  ...FEY_TOUCHED_RARE_CARDS,
};

// Reward pool (excludes starters)
export const FEY_TOUCHED_REWARD_POOL: CardDefinition[] = [
  ...Object.values(FEY_TOUCHED_COMMON_CARDS),
  ...Object.values(FEY_TOUCHED_UNCOMMON_CARDS),
  ...Object.values(FEY_TOUCHED_RARE_CARDS),
];
