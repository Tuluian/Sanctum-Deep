import {
  Upgrade,
  UpgradePath,
  CharacterClassId,
  UpgradeEffectType,
} from '@/types';
import { UPGRADES, getUpgradeById } from '@/data/upgrades';
import { SaveManager } from './SaveManager';

const RESPEC_REFUND_RATE = 0.5;

export interface PurchaseResult {
  success: boolean;
  reason?: string;
}

export interface UpgradeState {
  id: string;
  purchased: boolean;
  available: boolean;
  reason?: string;
}

export class UpgradeService {
  private totalSpent: number = 0;

  constructor() {
    // Calculate total spent from purchased upgrades
    this.recalculateTotalSpent();
  }

  private recalculateTotalSpent(): void {
    this.totalSpent = 0;
    for (const upgradeId of SaveManager.getPurchasedUpgrades()) {
      const upgrade = getUpgradeById(upgradeId);
      if (upgrade) {
        this.totalSpent += upgrade.cost;
      }
    }
  }

  // ============================================================================
  // SOUL ECHOES
  // ============================================================================

  getSoulEchoes(): number {
    return SaveManager.getSoulEchoes();
  }

  addSoulEchoes(amount: number): void {
    SaveManager.addSoulEchoes(amount);
  }

  getTotalSpent(): number {
    return this.totalSpent;
  }

  // ============================================================================
  // UPGRADES
  // ============================================================================

  canPurchase(upgradeId: string): PurchaseResult {
    const upgrade = getUpgradeById(upgradeId);
    if (!upgrade) {
      return { success: false, reason: 'Upgrade not found' };
    }

    if (this.isPurchased(upgradeId)) {
      return { success: false, reason: 'Already purchased' };
    }

    const soulEchoes = this.getSoulEchoes();
    if (soulEchoes < upgrade.cost) {
      return {
        success: false,
        reason: `Not enough Soul Echoes (need ${upgrade.cost}, have ${soulEchoes})`,
      };
    }

    for (const prereqId of upgrade.prerequisites) {
      if (!this.isPurchased(prereqId)) {
        const prereq = getUpgradeById(prereqId);
        return {
          success: false,
          reason: `Requires: ${prereq?.name ?? prereqId}`,
        };
      }
    }

    return { success: true };
  }

  purchase(upgradeId: string): PurchaseResult {
    const result = this.canPurchase(upgradeId);
    if (!result.success) {
      return result;
    }

    const upgrade = getUpgradeById(upgradeId)!;
    if (SaveManager.purchaseUpgrade(upgradeId, upgrade.cost)) {
      this.totalSpent += upgrade.cost;
      return { success: true };
    }

    return { success: false, reason: 'Purchase failed' };
  }

  isPurchased(upgradeId: string): boolean {
    return SaveManager.hasUpgrade(upgradeId);
  }

  getPurchasedUpgrades(): Upgrade[] {
    return SaveManager.getPurchasedUpgrades()
      .map((id) => getUpgradeById(id))
      .filter((u): u is Upgrade => u !== undefined);
  }

  getUpgradeState(upgradeId: string): UpgradeState {
    const purchased = this.isPurchased(upgradeId);
    if (purchased) {
      return { id: upgradeId, purchased: true, available: false };
    }

    const result = this.canPurchase(upgradeId);
    return {
      id: upgradeId,
      purchased: false,
      available: result.success,
      reason: result.reason,
    };
  }

  // ============================================================================
  // RESPEC
  // ============================================================================

  getRespecRefund(): number {
    return Math.floor(this.totalSpent * RESPEC_REFUND_RATE);
  }

  respec(): number {
    const refund = this.getRespecRefund();
    SaveManager.respecUpgrades(refund);
    this.totalSpent = 0;
    return refund;
  }

  // ============================================================================
  // ACTIVE UPGRADES
  // ============================================================================

  getActiveUpgrades(classId?: CharacterClassId): Upgrade[] {
    return this.getPurchasedUpgrades().filter((upgrade) => {
      if (upgrade.path === UpgradePath.CLASS) {
        return upgrade.classId === classId;
      }
      return true;
    });
  }

  hasUpgrade(upgradeId: string): boolean {
    return this.isPurchased(upgradeId);
  }

  hasUpgradeEffect(effectType: UpgradeEffectType['type'], classId?: CharacterClassId): boolean {
    return this.getActiveUpgrades(classId).some((u) => u.effect.type === effectType);
  }

  getUpgradeEffectValue<T extends UpgradeEffectType['type']>(
    effectType: T,
    classId?: CharacterClassId
  ): number {
    let total = 0;
    for (const upgrade of this.getActiveUpgrades(classId)) {
      if (upgrade.effect.type === effectType) {
        const effect = upgrade.effect as Extract<UpgradeEffectType, { type: T }>;
        if ('amount' in effect) {
          total += effect.amount;
        } else if ('percent' in effect) {
          total += effect.percent;
        }
      }
    }
    return total;
  }

  // ============================================================================
  // UPGRADE QUERIES
  // ============================================================================

  getAllUpgrades(): Upgrade[] {
    return [...UPGRADES];
  }

  getUpgradesByPath(path: UpgradePath): Upgrade[] {
    return UPGRADES.filter((u) => u.path === path);
  }

  getUpgradesByClass(classId: CharacterClassId): Upgrade[] {
    return UPGRADES.filter((u) => u.classId === classId);
  }

  getUniversalUpgrades(): Upgrade[] {
    return UPGRADES.filter((u) => u.path !== UpgradePath.CLASS);
  }

  // ============================================================================
  // DEBUG / TESTING
  // ============================================================================

  reset(): void {
    SaveManager.respecUpgrades(0);
    this.totalSpent = 0;
  }
}

// Singleton instance
let upgradeServiceInstance: UpgradeService | null = null;

export function getUpgradeService(): UpgradeService {
  if (!upgradeServiceInstance) {
    upgradeServiceInstance = new UpgradeService();
  }
  return upgradeServiceInstance;
}

// For testing - reset the singleton
export function resetUpgradeService(): void {
  upgradeServiceInstance = null;
}
