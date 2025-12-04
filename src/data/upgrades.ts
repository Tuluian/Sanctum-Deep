import { Upgrade, UpgradePath, CharacterClassId } from '@/types';

// ============================================================================
// VITALITY PATH - HP & Survival
// ============================================================================
const vitalityUpgrades: Upgrade[] = [
  // Tier 1
  {
    id: 'iron_constitution_1',
    name: 'Iron Constitution I',
    description: '+3 max HP',
    cost: 50,
    path: UpgradePath.VITALITY,
    prerequisites: [],
    effect: { type: 'max_hp', amount: 3 },
    tier: 1,
  },
  {
    id: 'second_wind',
    name: 'Second Wind',
    description: 'Start each run with 1 Health Potion',
    cost: 150,
    path: UpgradePath.VITALITY,
    prerequisites: [],
    effect: { type: 'starting_potion', potionId: 'health_potion' },
    tier: 1,
  },
  // Tier 2
  {
    id: 'iron_constitution_2',
    name: 'Iron Constitution II',
    description: '+5 max HP',
    cost: 100,
    path: UpgradePath.VITALITY,
    prerequisites: ['iron_constitution_1'],
    effect: { type: 'max_hp', amount: 5 },
    tier: 2,
  },
  {
    id: 'resilient_body',
    name: 'Resilient Body',
    description: 'Heal 2 HP after each combat',
    cost: 250,
    path: UpgradePath.VITALITY,
    prerequisites: ['second_wind'],
    effect: { type: 'starting_hp_heal', amount: 2 },
    tier: 2,
  },
  // Tier 3
  {
    id: 'iron_constitution_3',
    name: 'Iron Constitution III',
    description: '+7 max HP',
    cost: 200,
    path: UpgradePath.VITALITY,
    prerequisites: ['iron_constitution_2'],
    effect: { type: 'max_hp', amount: 7 },
    tier: 3,
  },
  // Tier 4 (Capstone)
  {
    id: 'deaths_door',
    name: "Death's Door",
    description: 'First fatal hit per run leaves you at 1 HP instead',
    cost: 400,
    path: UpgradePath.VITALITY,
    prerequisites: ['iron_constitution_3'],
    effect: { type: 'deaths_door' },
    tier: 4,
  },
];

// ============================================================================
// RESOLVE PATH - Resource & Cards
// ============================================================================
const resolveUpgrades: Upgrade[] = [
  // Tier 1
  {
    id: 'mental_fortitude_1',
    name: 'Mental Fortitude I',
    description: '+1 starting Resolve (4 total)',
    cost: 75,
    path: UpgradePath.RESOLVE,
    prerequisites: [],
    effect: { type: 'starting_resolve', amount: 1 },
    tier: 1,
  },
  {
    id: 'deep_pockets',
    name: 'Deep Pockets',
    description: 'Start runs with +25 gold',
    cost: 100,
    path: UpgradePath.RESOLVE,
    prerequisites: [],
    effect: { type: 'starting_gold', amount: 25 },
    tier: 1,
  },
  // Tier 2
  {
    id: 'quick_draw',
    name: 'Quick Draw',
    description: 'Draw 1 extra card on turn 1 of each combat',
    cost: 100,
    path: UpgradePath.RESOLVE,
    prerequisites: ['mental_fortitude_1'],
    effect: { type: 'draw_turn_1', amount: 1 },
    tier: 2,
  },
  {
    id: 'merchants_friend',
    name: "Merchant's Friend",
    description: '10% discount at merchants',
    cost: 200,
    path: UpgradePath.RESOLVE,
    prerequisites: ['deep_pockets'],
    effect: { type: 'merchant_discount', percent: 10 },
    tier: 2,
  },
  // Tier 3
  {
    id: 'mental_fortitude_2',
    name: 'Mental Fortitude II',
    description: '+1 starting Resolve (5 total)',
    cost: 200,
    path: UpgradePath.RESOLVE,
    prerequisites: ['quick_draw'],
    effect: { type: 'starting_resolve', amount: 1 },
    tier: 3,
  },
  {
    id: 'efficient_mind',
    name: 'Efficient Mind',
    description: 'First card each combat costs 1 less Resolve',
    cost: 150,
    path: UpgradePath.RESOLVE,
    prerequisites: ['mental_fortitude_1'],
    effect: { type: 'first_card_discount', amount: 1 },
    tier: 3,
  },
];

// ============================================================================
// COMBAT PATH - Damage & Block
// ============================================================================
const combatUpgrades: Upgrade[] = [
  // Tier 1
  {
    id: 'sharp_blades',
    name: 'Sharp Blades',
    description: '+1 damage on all attacks',
    cost: 75,
    path: UpgradePath.COMBAT,
    prerequisites: [],
    effect: { type: 'damage_bonus', amount: 1 },
    tier: 1,
  },
  {
    id: 'thick_skin',
    name: 'Thick Skin',
    description: '+1 block on all block cards',
    cost: 75,
    path: UpgradePath.COMBAT,
    prerequisites: [],
    effect: { type: 'block_bonus', amount: 1 },
    tier: 1,
  },
  // Tier 2
  {
    id: 'critical_training',
    name: 'Critical Training',
    description: '5% chance for attacks to deal double damage',
    cost: 150,
    path: UpgradePath.COMBAT,
    prerequisites: ['sharp_blades'],
    effect: { type: 'crit_chance', percent: 5 },
    tier: 2,
  },
  {
    id: 'defensive_stance',
    name: 'Defensive Stance',
    description: 'Start each combat with 3 block',
    cost: 150,
    path: UpgradePath.COMBAT,
    prerequisites: ['thick_skin'],
    effect: { type: 'starting_block', amount: 3 },
    tier: 2,
  },
  // Tier 3
  {
    id: 'momentum',
    name: 'Momentum',
    description: 'After playing 3 cards in a turn, gain 2 Might',
    cost: 250,
    path: UpgradePath.COMBAT,
    prerequisites: ['critical_training'],
    effect: { type: 'momentum', cardsPlayed: 3, mightGained: 2 },
    tier: 3,
  },
  {
    id: 'perseverance',
    name: 'Perseverance',
    description: 'When reduced below 25% HP, gain 10 block (once per combat)',
    cost: 300,
    path: UpgradePath.COMBAT,
    prerequisites: ['defensive_stance'],
    effect: { type: 'perseverance', hpThreshold: 25, blockGained: 10 },
    tier: 3,
  },
];

// ============================================================================
// FORTUNE PATH - Luck & Rewards
// ============================================================================
const fortuneUpgrades: Upgrade[] = [
  // Tier 1
  {
    id: 'potion_finder',
    name: 'Potion Finder',
    description: '+10% potion drop chance',
    cost: 100,
    path: UpgradePath.FORTUNE,
    prerequisites: [],
    effect: { type: 'potion_drop_chance', percent: 10 },
    tier: 1,
  },
  {
    id: 'card_collector',
    name: 'Card Collector',
    description: 'See 4 cards instead of 3 on card rewards',
    cost: 125,
    path: UpgradePath.FORTUNE,
    prerequisites: [],
    effect: { type: 'card_reward_count', amount: 1 },
    tier: 1,
  },
  // Tier 2
  {
    id: 'treasure_hunter',
    name: 'Treasure Hunter',
    description: '+15% gold from all sources',
    cost: 150,
    path: UpgradePath.FORTUNE,
    prerequisites: ['potion_finder'],
    effect: { type: 'gold_multiplier', percent: 15 },
    tier: 2,
  },
  {
    id: 'elite_rewards',
    name: 'Elite Rewards',
    description: 'Elites always drop a potion',
    cost: 200,
    path: UpgradePath.FORTUNE,
    prerequisites: ['potion_finder'],
    effect: { type: 'elite_drops_potion' },
    tier: 2,
  },
  // Tier 3
  {
    id: 'rare_finder',
    name: 'Rare Finder',
    description: '+3% rare card drop chance',
    cost: 300,
    path: UpgradePath.FORTUNE,
    prerequisites: ['card_collector'],
    effect: { type: 'rare_card_chance', percent: 3 },
    tier: 3,
  },
];

// ============================================================================
// CLASS-SPECIFIC UPGRADES
// ============================================================================

// Cleric Upgrades
const clericUpgrades: Upgrade[] = [
  {
    id: 'cleric_faithful_start',
    name: 'Faithful Start',
    description: 'Start combats with 2 Devotion',
    cost: 100,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.CLERIC,
    prerequisites: [],
    effect: { type: 'starting_devotion', amount: 2 },
    tier: 1,
  },
  {
    id: 'cleric_empowered_healing',
    name: 'Empowered Healing',
    description: 'Healing generates +1 Devotion',
    cost: 150,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.CLERIC,
    prerequisites: ['cleric_faithful_start'],
    effect: { type: 'devotion_on_heal', amount: 1 },
    tier: 2,
  },
  {
    id: 'cleric_divine_protection',
    name: 'Divine Protection',
    description: 'Devotion abilities cost 1 less',
    cost: 200,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.CLERIC,
    prerequisites: ['cleric_empowered_healing'],
    effect: { type: 'devotion_cost_reduction', amount: 1 },
    tier: 3,
  },
];

// Dungeon Knight Upgrades
const knightUpgrades: Upgrade[] = [
  {
    id: 'knight_armored_start',
    name: 'Armored Start',
    description: 'Start combats with 5 Fortify',
    cost: 100,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    prerequisites: [],
    effect: { type: 'starting_fortify', amount: 5 },
    tier: 1,
  },
  {
    id: 'knight_steel_will',
    name: 'Steel Will',
    description: 'Fortify cap increased by 5',
    cost: 150,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    prerequisites: ['knight_armored_start'],
    effect: { type: 'fortify_cap_bonus', amount: 5 },
    tier: 2,
  },
  {
    id: 'knight_counter_stance',
    name: 'Counter Stance',
    description: 'When at max Fortify, reflect 2 damage',
    cost: 200,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.DUNGEON_KNIGHT,
    prerequisites: ['knight_steel_will'],
    effect: { type: 'fortify_reflect', damage: 2 },
    tier: 3,
  },
];

// Diabolist Upgrades
const diabolistUpgrades: Upgrade[] = [
  {
    id: 'diabolist_blood_familiar',
    name: 'Blood Familiar',
    description: 'Start combats with a Pain card exhausted (not in deck)',
    cost: 100,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.DIABOLIST,
    prerequisites: [],
    effect: { type: 'curse_start_exhausted' },
    tier: 1,
  },
  {
    id: 'diabolist_curse_affinity',
    name: 'Curse Affinity',
    description: 'Curses deal 1 less damage when drawn',
    cost: 150,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.DIABOLIST,
    prerequisites: ['diabolist_blood_familiar'],
    effect: { type: 'curse_damage_reduction', amount: 1 },
    tier: 2,
  },
  {
    id: 'diabolist_contract_negotiator',
    name: 'Contract Negotiator',
    description: 'Contract penalties reduced by 25%',
    cost: 200,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.DIABOLIST,
    prerequisites: ['diabolist_curse_affinity'],
    effect: { type: 'contract_penalty_reduction', percent: 25 },
    tier: 3,
  },
];

// Oathsworn Upgrades
const oathswornUpgrades: Upgrade[] = [
  {
    id: 'oathsworn_vow_of_preparation',
    name: 'Vow of Preparation',
    description: 'Start combats with Oath of Valor active (2 charges)',
    cost: 100,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.OATHSWORN,
    prerequisites: [],
    effect: { type: 'starting_vow', vowId: 'oath_of_valor', charges: 2 },
    tier: 1,
  },
  {
    id: 'oathsworn_extended_oath',
    name: 'Extended Oath',
    description: 'All Vows have +1 charge',
    cost: 150,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.OATHSWORN,
    prerequisites: ['oathsworn_vow_of_preparation'],
    effect: { type: 'vow_charge_bonus', amount: 1 },
    tier: 2,
  },
  {
    id: 'oathsworn_forgiveness',
    name: 'Forgiveness',
    description: 'First Vow break per combat has no penalty',
    cost: 200,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.OATHSWORN,
    prerequisites: ['oathsworn_extended_oath'],
    effect: { type: 'first_vow_break_free' },
    tier: 3,
  },
];

// Fey-Touched Upgrades
const feyTouchedUpgrades: Upgrade[] = [
  {
    id: 'fey_lucky_charm',
    name: 'Lucky Charm',
    description: 'Start combats with 3 Luck',
    cost: 100,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.FEY_TOUCHED,
    prerequisites: [],
    effect: { type: 'starting_luck', amount: 3 },
    tier: 1,
  },
  {
    id: 'fey_chaos_affinity',
    name: 'Chaos Affinity',
    description: 'Whimsy outcomes are 20% better on average',
    cost: 150,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.FEY_TOUCHED,
    prerequisites: ['fey_lucky_charm'],
    effect: { type: 'whimsy_bonus', percent: 20 },
    tier: 2,
  },
  {
    id: 'fey_reroll',
    name: 'Reroll',
    description: 'Once per combat, reroll a Whimsy outcome',
    cost: 200,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.FEY_TOUCHED,
    prerequisites: ['fey_chaos_affinity'],
    effect: { type: 'whimsy_reroll', uses: 1 },
    tier: 3,
  },
];

// Celestial Upgrades
const celestialUpgrades: Upgrade[] = [
  {
    id: 'celestial_inner_light',
    name: 'Inner Light',
    description: 'Start combats with 2 Radiance',
    cost: 100,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.CELESTIAL,
    prerequisites: [],
    effect: { type: 'starting_radiance', amount: 2 },
    tier: 1,
  },
  {
    id: 'celestial_radiant_shield',
    name: 'Radiant Shield',
    description: 'Gain 1 Radiance when you gain Block',
    cost: 150,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.CELESTIAL,
    prerequisites: ['celestial_inner_light'],
    effect: { type: 'radiance_on_block', amount: 1 },
    tier: 2,
  },
  {
    id: 'celestial_ascendant',
    name: 'Ascendant',
    description: 'Divine Form activates 2 Radiance sooner',
    cost: 200,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.CELESTIAL,
    prerequisites: ['celestial_radiant_shield'],
    effect: { type: 'divine_form_threshold_reduction', amount: 2 },
    tier: 3,
  },
];

// Summoner Upgrades
const summonerUpgrades: Upgrade[] = [
  {
    id: 'summoner_familiar',
    name: 'Familiar',
    description: 'Start combats with a Wisp summoned',
    cost: 100,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.SUMMONER,
    prerequisites: [],
    effect: { type: 'starting_minion', minionId: 'wisp' },
    tier: 1,
  },
  {
    id: 'summoner_empowered_minions',
    name: 'Empowered Minions',
    description: 'All minions have +2 HP',
    cost: 150,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.SUMMONER,
    prerequisites: ['summoner_familiar'],
    effect: { type: 'minion_hp_bonus', amount: 2 },
    tier: 2,
  },
  {
    id: 'summoner_pack_tactics',
    name: 'Pack Tactics',
    description: 'All minions deal +1 damage',
    cost: 200,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.SUMMONER,
    prerequisites: ['summoner_empowered_minions'],
    effect: { type: 'minion_damage_bonus', amount: 1 },
    tier: 3,
  },
];

// Bargainer Upgrades
const bargainerUpgrades: Upgrade[] = [
  {
    id: 'bargainer_initial_favor',
    name: 'Initial Favor',
    description: 'Start combats with 2 Favor',
    cost: 100,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.BARGAINER,
    prerequisites: [],
    effect: { type: 'starting_favor', amount: 2 },
    tier: 1,
  },
  {
    id: 'bargainer_swift_debt',
    name: 'Swift Debt',
    description: 'Prices expire 1 turn sooner',
    cost: 150,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.BARGAINER,
    prerequisites: ['bargainer_initial_favor'],
    effect: { type: 'price_duration_reduction', amount: 1 },
    tier: 2,
  },
  {
    id: 'bargainer_suffering_rewards',
    name: 'Suffering Rewards',
    description: 'Gain 1 Favor when a Price triggers',
    cost: 200,
    path: UpgradePath.CLASS,
    classId: CharacterClassId.BARGAINER,
    prerequisites: ['bargainer_swift_debt'],
    effect: { type: 'favor_on_price_trigger', amount: 1 },
    tier: 3,
  },
];

// ============================================================================
// EXPORTS
// ============================================================================

export const UPGRADES: Upgrade[] = [
  ...vitalityUpgrades,
  ...resolveUpgrades,
  ...combatUpgrades,
  ...fortuneUpgrades,
  ...clericUpgrades,
  ...knightUpgrades,
  ...diabolistUpgrades,
  ...oathswornUpgrades,
  ...feyTouchedUpgrades,
  ...celestialUpgrades,
  ...summonerUpgrades,
  ...bargainerUpgrades,
];

export function getUpgradeById(id: string): Upgrade | undefined {
  return UPGRADES.find((u) => u.id === id);
}

export function getUpgradesByPath(path: UpgradePath): Upgrade[] {
  return UPGRADES.filter((u) => u.path === path);
}

export function getUpgradesByClass(classId: CharacterClassId): Upgrade[] {
  return UPGRADES.filter((u) => u.classId === classId);
}

export function getUniversalUpgrades(): Upgrade[] {
  return UPGRADES.filter((u) => u.path !== UpgradePath.CLASS);
}
