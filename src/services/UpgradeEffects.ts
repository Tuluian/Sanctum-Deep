import { PlayerState, CharacterClassId } from '@/types';
import { getUpgradeService } from './UpgradeService';

export interface RunModifiers {
  maxHpBonus: number;
  startingGoldBonus: number;
  merchantDiscount: number;
  goldMultiplier: number;
  cardRewardCountBonus: number;
  potionDropChanceBonus: number;
  rareCardChanceBonus: number;
  eliteDropsPotion: boolean;
  hasDeathsDoor: boolean;
  deathsDoorUsed: boolean;
}

export interface CombatModifiers {
  startingBlock: number;
  damageBonus: number;
  blockBonus: number;
  critChance: number;
  drawTurn1Bonus: number;
  firstCardDiscount: number;
  momentumThreshold: number;
  momentumMight: number;
  perseveranceHpThreshold: number;
  perseveranceBlock: number;
  perseveranceTriggered: boolean;
  cardsPlayedThisTurn: number;
  firstCardPlayedThisCombat: boolean;
  // Class-specific
  startingDevotion: number;
  devotionOnHeal: number;
  devotionCostReduction: number;
  startingFortify: number;
  fortifyCapBonus: number;
  fortifyReflect: number;
  curseStartExhausted: boolean;
  curseDamageReduction: number;
  contractPenaltyReduction: number;
  startingVowId: string | null;
  startingVowCharges: number;
  vowChargeBonus: number;
  firstVowBreakFree: boolean;
  vowBreakTriggeredThisCombat: boolean;
  startingLuck: number;
  whimsyBonus: number;
  whimsyRerolls: number;
  whimsyRerollsUsed: number;
  // Celestial
  startingRadiance: number;
  radianceOnBlock: number;
  divineFormThresholdReduction: number;
  // Summoner
  startingMinionId: string | null;
  minionHpBonus: number;
  minionDamageBonus: number;
  // Bargainer
  startingFavor: number;
  priceDurationReduction: number;
  favorOnPriceTrigger: number;
}

export function getRunModifiers(classId: CharacterClassId): RunModifiers {
  const service = getUpgradeService();

  return {
    maxHpBonus: service.getUpgradeEffectValue('max_hp', classId),
    startingGoldBonus: service.getUpgradeEffectValue('starting_gold', classId),
    merchantDiscount: service.getUpgradeEffectValue('merchant_discount', classId),
    goldMultiplier: service.getUpgradeEffectValue('gold_multiplier', classId),
    cardRewardCountBonus: service.getUpgradeEffectValue('card_reward_count', classId),
    potionDropChanceBonus: service.getUpgradeEffectValue('potion_drop_chance', classId),
    rareCardChanceBonus: service.getUpgradeEffectValue('rare_card_chance', classId),
    eliteDropsPotion: service.hasUpgradeEffect('elite_drops_potion', classId),
    hasDeathsDoor: service.hasUpgradeEffect('deaths_door', classId),
    deathsDoorUsed: false,
  };
}

export function getCombatModifiers(classId: CharacterClassId): CombatModifiers {
  const service = getUpgradeService();
  const upgrades = service.getActiveUpgrades(classId);

  // Find starting vow if any
  let startingVowId: string | null = null;
  let startingVowCharges = 0;
  const vowUpgrade = upgrades.find((u) => u.effect.type === 'starting_vow');
  if (vowUpgrade && vowUpgrade.effect.type === 'starting_vow') {
    startingVowId = vowUpgrade.effect.vowId;
    startingVowCharges = vowUpgrade.effect.charges;
  }

  // Find starting minion if any
  let startingMinionId: string | null = null;
  const minionUpgrade = upgrades.find((u) => u.effect.type === 'starting_minion');
  if (minionUpgrade && minionUpgrade.effect.type === 'starting_minion') {
    startingMinionId = minionUpgrade.effect.minionId;
  }

  // Find momentum settings
  let momentumThreshold = 0;
  let momentumMight = 0;
  const momentumUpgrade = upgrades.find((u) => u.effect.type === 'momentum');
  if (momentumUpgrade && momentumUpgrade.effect.type === 'momentum') {
    momentumThreshold = momentumUpgrade.effect.cardsPlayed;
    momentumMight = momentumUpgrade.effect.mightGained;
  }

  // Find perseverance settings
  let perseveranceHpThreshold = 0;
  let perseveranceBlock = 0;
  const perseveranceUpgrade = upgrades.find((u) => u.effect.type === 'perseverance');
  if (perseveranceUpgrade && perseveranceUpgrade.effect.type === 'perseverance') {
    perseveranceHpThreshold = perseveranceUpgrade.effect.hpThreshold;
    perseveranceBlock = perseveranceUpgrade.effect.blockGained;
  }

  // Find whimsy reroll uses
  let whimsyRerolls = 0;
  const rerollUpgrade = upgrades.find((u) => u.effect.type === 'whimsy_reroll');
  if (rerollUpgrade && rerollUpgrade.effect.type === 'whimsy_reroll') {
    whimsyRerolls = rerollUpgrade.effect.uses;
  }

  return {
    startingBlock: service.getUpgradeEffectValue('starting_block', classId),
    damageBonus: service.getUpgradeEffectValue('damage_bonus', classId),
    blockBonus: service.getUpgradeEffectValue('block_bonus', classId),
    critChance: service.getUpgradeEffectValue('crit_chance', classId),
    drawTurn1Bonus: service.getUpgradeEffectValue('draw_turn_1', classId),
    firstCardDiscount: service.getUpgradeEffectValue('first_card_discount', classId),
    momentumThreshold,
    momentumMight,
    perseveranceHpThreshold,
    perseveranceBlock,
    perseveranceTriggered: false,
    cardsPlayedThisTurn: 0,
    firstCardPlayedThisCombat: false,
    // Class-specific
    startingDevotion: service.getUpgradeEffectValue('starting_devotion', classId),
    devotionOnHeal: service.getUpgradeEffectValue('devotion_on_heal', classId),
    devotionCostReduction: service.getUpgradeEffectValue('devotion_cost_reduction', classId),
    startingFortify: service.getUpgradeEffectValue('starting_fortify', classId),
    fortifyCapBonus: service.getUpgradeEffectValue('fortify_cap_bonus', classId),
    fortifyReflect: service.getUpgradeEffectValue('fortify_reflect', classId),
    curseStartExhausted: service.hasUpgradeEffect('curse_start_exhausted', classId),
    curseDamageReduction: service.getUpgradeEffectValue('curse_damage_reduction', classId),
    contractPenaltyReduction: service.getUpgradeEffectValue('contract_penalty_reduction', classId),
    startingVowId,
    startingVowCharges,
    vowChargeBonus: service.getUpgradeEffectValue('vow_charge_bonus', classId),
    firstVowBreakFree: service.hasUpgradeEffect('first_vow_break_free', classId),
    vowBreakTriggeredThisCombat: false,
    startingLuck: service.getUpgradeEffectValue('starting_luck', classId),
    whimsyBonus: service.getUpgradeEffectValue('whimsy_bonus', classId),
    whimsyRerolls,
    whimsyRerollsUsed: 0,
    // Celestial
    startingRadiance: service.getUpgradeEffectValue('starting_radiance', classId),
    radianceOnBlock: service.getUpgradeEffectValue('radiance_on_block', classId),
    divineFormThresholdReduction: service.getUpgradeEffectValue('divine_form_threshold_reduction', classId),
    // Summoner
    startingMinionId,
    minionHpBonus: service.getUpgradeEffectValue('minion_hp_bonus', classId),
    minionDamageBonus: service.getUpgradeEffectValue('minion_damage_bonus', classId),
    // Bargainer
    startingFavor: service.getUpgradeEffectValue('starting_favor', classId),
    priceDurationReduction: service.getUpgradeEffectValue('price_duration_reduction', classId),
    favorOnPriceTrigger: service.getUpgradeEffectValue('favor_on_price_trigger', classId),
  };
}

export function applyRunModifiersToPlayer(
  player: PlayerState,
  classId: CharacterClassId
): RunModifiers {
  const mods = getRunModifiers(classId);

  // Apply max HP bonus
  player.maxHp += mods.maxHpBonus;
  player.currentHp += mods.maxHpBonus;

  return mods;
}

export function applyCombatModifiersToPlayer(
  player: PlayerState,
  classId: CharacterClassId
): CombatModifiers {
  const mods = getCombatModifiers(classId);

  // Apply starting block
  if (mods.startingBlock > 0) {
    player.block += mods.startingBlock;
  }

  // Apply starting devotion (Cleric)
  if (mods.startingDevotion > 0) {
    player.devotion += mods.startingDevotion;
  }

  // Apply starting fortify (Knight)
  if (mods.startingFortify > 0) {
    player.fortify = Math.min(player.fortify + mods.startingFortify, player.maxFortify + mods.fortifyCapBonus);
  }

  // Apply fortify cap bonus
  if (mods.fortifyCapBonus > 0) {
    player.maxFortify += mods.fortifyCapBonus;
  }

  // Apply starting luck (Fey-Touched)
  if (mods.startingLuck > 0) {
    player.luck = Math.min(player.luck + mods.startingLuck, player.maxLuck);
  }

  // Apply starting radiance (Celestial)
  if (mods.startingRadiance > 0) {
    player.radiance = Math.min(player.radiance + mods.startingRadiance, player.maxRadiance);
  }

  // Apply starting favor (Bargainer)
  if (mods.startingFavor > 0) {
    player.favor = Math.min(player.favor + mods.startingFavor, 10);
  }

  return mods;
}
