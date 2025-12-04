import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpgradeService, getUpgradeService, resetUpgradeService } from './UpgradeService';
import { SaveManager } from './SaveManager';
import { CharacterClassId } from '@/types';

// Mock SaveManager
vi.mock('./SaveManager', () => ({
  SaveManager: {
    getSoulEchoes: vi.fn(),
    addSoulEchoes: vi.fn(),
    getPurchasedUpgrades: vi.fn(),
    hasUpgrade: vi.fn(),
    purchaseUpgrade: vi.fn(),
    respecUpgrades: vi.fn(),
  },
}));

describe('UpgradeService', () => {
  let service: UpgradeService;

  beforeEach(() => {
    vi.clearAllMocks();
    resetUpgradeService();

    // Default mock returns
    vi.mocked(SaveManager.getSoulEchoes).mockReturnValue(500);
    vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([]);
    vi.mocked(SaveManager.hasUpgrade).mockReturnValue(false);
    vi.mocked(SaveManager.purchaseUpgrade).mockReturnValue(true);

    service = getUpgradeService();
  });

  describe('getSoulEchoes', () => {
    it('returns current Soul Echoes from SaveManager', () => {
      vi.mocked(SaveManager.getSoulEchoes).mockReturnValue(250);
      expect(service.getSoulEchoes()).toBe(250);
    });
  });

  describe('addSoulEchoes', () => {
    it('delegates to SaveManager', () => {
      service.addSoulEchoes(100);
      expect(SaveManager.addSoulEchoes).toHaveBeenCalledWith(100);
    });
  });

  describe('canPurchase', () => {
    it('returns success when upgrade is available and affordable', () => {
      vi.mocked(SaveManager.getSoulEchoes).mockReturnValue(100);
      vi.mocked(SaveManager.hasUpgrade).mockReturnValue(false);

      const result = service.canPurchase('iron_constitution_1');
      expect(result.success).toBe(true);
    });

    it('returns failure when upgrade is already purchased', () => {
      vi.mocked(SaveManager.hasUpgrade).mockImplementation((id) => id === 'iron_constitution_1');

      const result = service.canPurchase('iron_constitution_1');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Already purchased');
    });

    it('returns failure when not enough Soul Echoes', () => {
      vi.mocked(SaveManager.getSoulEchoes).mockReturnValue(25);

      const result = service.canPurchase('iron_constitution_1'); // costs 50
      expect(result.success).toBe(false);
      expect(result.reason).toContain('Not enough Soul Echoes');
    });

    it('returns failure when prerequisites not met', () => {
      vi.mocked(SaveManager.getSoulEchoes).mockReturnValue(200);
      vi.mocked(SaveManager.hasUpgrade).mockReturnValue(false);

      const result = service.canPurchase('iron_constitution_2'); // requires iron_constitution_1
      expect(result.success).toBe(false);
      expect(result.reason).toContain('Requires');
    });

    it('returns success when prerequisites are met', () => {
      vi.mocked(SaveManager.getSoulEchoes).mockReturnValue(200);
      vi.mocked(SaveManager.hasUpgrade).mockImplementation((id) => id === 'iron_constitution_1');

      const result = service.canPurchase('iron_constitution_2');
      expect(result.success).toBe(true);
    });

    it('returns failure for non-existent upgrade', () => {
      const result = service.canPurchase('fake_upgrade');
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Upgrade not found');
    });
  });

  describe('purchase', () => {
    it('purchases upgrade when affordable and prerequisites met', () => {
      vi.mocked(SaveManager.getSoulEchoes).mockReturnValue(100);
      vi.mocked(SaveManager.hasUpgrade).mockReturnValue(false);
      vi.mocked(SaveManager.purchaseUpgrade).mockReturnValue(true);

      const result = service.purchase('iron_constitution_1');
      expect(result.success).toBe(true);
      expect(SaveManager.purchaseUpgrade).toHaveBeenCalledWith('iron_constitution_1', 50);
    });

    it('fails when prerequisites not met', () => {
      vi.mocked(SaveManager.getSoulEchoes).mockReturnValue(200);
      vi.mocked(SaveManager.hasUpgrade).mockReturnValue(false);

      const result = service.purchase('iron_constitution_2');
      expect(result.success).toBe(false);
      expect(SaveManager.purchaseUpgrade).not.toHaveBeenCalled();
    });

    it('fails when already purchased', () => {
      vi.mocked(SaveManager.hasUpgrade).mockImplementation((id) => id === 'iron_constitution_1');

      const result = service.purchase('iron_constitution_1');
      expect(result.success).toBe(false);
      expect(SaveManager.purchaseUpgrade).not.toHaveBeenCalled();
    });
  });

  describe('getPurchasedUpgrades', () => {
    it('returns upgrade objects for purchased IDs', () => {
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([
        'iron_constitution_1',
        'sharp_blades',
      ]);

      const upgrades = service.getPurchasedUpgrades();
      expect(upgrades).toHaveLength(2);
      expect(upgrades[0].id).toBe('iron_constitution_1');
      expect(upgrades[1].id).toBe('sharp_blades');
    });

    it('filters out invalid IDs', () => {
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([
        'iron_constitution_1',
        'invalid_id',
      ]);

      const upgrades = service.getPurchasedUpgrades();
      expect(upgrades).toHaveLength(1);
      expect(upgrades[0].id).toBe('iron_constitution_1');
    });
  });

  describe('getActiveUpgrades', () => {
    it('returns all universal upgrades regardless of class', () => {
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([
        'iron_constitution_1',
        'sharp_blades',
      ]);

      const upgrades = service.getActiveUpgrades(CharacterClassId.CLERIC);
      expect(upgrades).toHaveLength(2);
    });

    it('includes class-specific upgrades only for matching class', () => {
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([
        'iron_constitution_1',
        'cleric_faithful_start',
        'knight_armored_start',
      ]);

      const clericUpgrades = service.getActiveUpgrades(CharacterClassId.CLERIC);
      expect(clericUpgrades).toHaveLength(2);
      expect(clericUpgrades.some(u => u.id === 'cleric_faithful_start')).toBe(true);
      expect(clericUpgrades.some(u => u.id === 'knight_armored_start')).toBe(false);

      const knightUpgrades = service.getActiveUpgrades(CharacterClassId.DUNGEON_KNIGHT);
      expect(knightUpgrades).toHaveLength(2);
      expect(knightUpgrades.some(u => u.id === 'knight_armored_start')).toBe(true);
      expect(knightUpgrades.some(u => u.id === 'cleric_faithful_start')).toBe(false);
    });
  });

  describe('getUpgradeEffectValue', () => {
    it('sums all matching effect values', () => {
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([
        'iron_constitution_1', // +3 max HP
        'iron_constitution_2', // +5 max HP (hypothetically with prereq)
      ]);
      vi.mocked(SaveManager.hasUpgrade).mockImplementation((id) =>
        ['iron_constitution_1', 'iron_constitution_2'].includes(id)
      );

      // First we need to reset service so it recalculates
      resetUpgradeService();
      service = getUpgradeService();

      const total = service.getUpgradeEffectValue('max_hp', CharacterClassId.CLERIC);
      expect(total).toBe(8); // 3 + 5
    });

    it('returns 0 when no matching upgrades', () => {
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([]);

      const total = service.getUpgradeEffectValue('max_hp', CharacterClassId.CLERIC);
      expect(total).toBe(0);
    });
  });

  describe('respec', () => {
    it('refunds 50% of spent Soul Echoes', () => {
      // Setup: purchased iron_constitution_1 (50) and sharp_blades (75)
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([
        'iron_constitution_1',
        'sharp_blades',
      ]);

      // Reset to recalculate totalSpent
      resetUpgradeService();
      service = getUpgradeService();

      // Total spent = 50 + 75 = 125, 50% = 62
      expect(service.getRespecRefund()).toBe(62);

      const refund = service.respec();
      expect(refund).toBe(62);
      expect(SaveManager.respecUpgrades).toHaveBeenCalledWith(62);
    });

    it('returns 0 refund when nothing purchased', () => {
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue([]);

      resetUpgradeService();
      service = getUpgradeService();

      expect(service.getRespecRefund()).toBe(0);
    });
  });

  describe('hasUpgrade', () => {
    it('returns true for purchased upgrades', () => {
      vi.mocked(SaveManager.hasUpgrade).mockImplementation((id) => id === 'iron_constitution_1');

      expect(service.hasUpgrade('iron_constitution_1')).toBe(true);
      expect(service.hasUpgrade('sharp_blades')).toBe(false);
    });
  });

  describe('hasUpgradeEffect', () => {
    it('returns true when any active upgrade has the effect', () => {
      vi.mocked(SaveManager.getPurchasedUpgrades).mockReturnValue(['iron_constitution_1']);

      resetUpgradeService();
      service = getUpgradeService();

      expect(service.hasUpgradeEffect('max_hp', CharacterClassId.CLERIC)).toBe(true);
      expect(service.hasUpgradeEffect('starting_block', CharacterClassId.CLERIC)).toBe(false);
    });
  });

  describe('singleton behavior', () => {
    it('returns same instance from getUpgradeService', () => {
      const instance1 = getUpgradeService();
      const instance2 = getUpgradeService();
      expect(instance1).toBe(instance2);
    });

    it('creates new instance after resetUpgradeService', () => {
      const instance1 = getUpgradeService();
      resetUpgradeService();
      const instance2 = getUpgradeService();
      expect(instance1).not.toBe(instance2);
    });
  });
});
