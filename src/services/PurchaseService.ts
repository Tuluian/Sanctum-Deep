/**
 * PurchaseService - In-App Purchase Service for iOS
 *
 * This is a scaffold for Apple IAP integration.
 * Requires App Store Connect configuration to be fully functional.
 *
 * Implementation uses cordova-plugin-purchase via Capacitor.
 * Install with: npm install cordova-plugin-purchase
 */

import { Capacitor } from '@capacitor/core';
import { CharacterClassId } from '@/types';

// Product IDs for App Store Connect
export const PRODUCT_IDS = {
  // Individual class purchases ($4.99 each)
  CLASS_DIABOLIST: 'com.sanctumruins.class.diabolist',
  CLASS_OATHSWORN: 'com.sanctumruins.class.oathsworn',
  CLASS_FEY_TOUCHED: 'com.sanctumruins.class.feytouched',
  CLASS_CELESTIAL: 'com.sanctumruins.class.celestial',
  CLASS_SUMMONER: 'com.sanctumruins.class.summoner',
  CLASS_BARGAINER: 'com.sanctumruins.class.bargainer',
  // Bundle ($19.99)
  BUNDLE_ALL_CLASSES: 'com.sanctumruins.bundle.allclasses',
} as const;

// Map class IDs to product IDs
export const CLASS_TO_PRODUCT: Record<string, string> = {
  [CharacterClassId.DIABOLIST]: PRODUCT_IDS.CLASS_DIABOLIST,
  [CharacterClassId.OATHSWORN]: PRODUCT_IDS.CLASS_OATHSWORN,
  [CharacterClassId.FEY_TOUCHED]: PRODUCT_IDS.CLASS_FEY_TOUCHED,
  [CharacterClassId.CELESTIAL]: PRODUCT_IDS.CLASS_CELESTIAL,
  [CharacterClassId.SUMMONER]: PRODUCT_IDS.CLASS_SUMMONER,
  [CharacterClassId.BARGAINER]: PRODUCT_IDS.CLASS_BARGAINER,
};

// Free classes (no purchase required)
export const FREE_CLASSES: CharacterClassId[] = [
  CharacterClassId.CLERIC,
  CharacterClassId.DUNGEON_KNIGHT,
];

export interface ProductInfo {
  id: string;
  title: string;
  description: string;
  price: string;
  priceMicros: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  error?: string;
}

export class PurchaseService {
  private static instance: PurchaseService;
  private initialized = false;
  private isNative: boolean;
  private products: Map<string, ProductInfo> = new Map();
  private ownedProducts: Set<string> = new Set();

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): PurchaseService {
    if (!PurchaseService.instance) {
      PurchaseService.instance = new PurchaseService();
    }
    return PurchaseService.instance;
  }

  /**
   * Initialize the purchase service
   * Must be called before any purchase operations
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    if (!this.isNative) {
      console.log('[PurchaseService] Not on native platform, purchases disabled');
      return false;
    }

    try {
      // TODO: Initialize cordova-plugin-purchase
      // CdvPurchase.store.register([
      //   { id: PRODUCT_IDS.CLASS_DIABOLIST, type: CdvPurchase.ProductType.NON_CONSUMABLE },
      //   { id: PRODUCT_IDS.CLASS_OATHSWORN, type: CdvPurchase.ProductType.NON_CONSUMABLE },
      //   // ... register all products
      // ]);
      //
      // CdvPurchase.store.when()
      //   .approved(transaction => this.handleApproved(transaction))
      //   .verified(receipt => this.handleVerified(receipt));
      //
      // await CdvPurchase.store.initialize([CdvPurchase.Platform.APPLE_APPSTORE]);

      this.initialized = true;
      console.log('[PurchaseService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[PurchaseService] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if a class is owned (purchased or free)
   */
  isClassOwned(classId: CharacterClassId): boolean {
    // Free classes are always owned
    if (FREE_CLASSES.includes(classId)) {
      return true;
    }

    // Check if product is in owned set
    const productId = CLASS_TO_PRODUCT[classId];
    if (productId && this.ownedProducts.has(productId)) {
      return true;
    }

    // Check if bundle is owned
    if (this.ownedProducts.has(PRODUCT_IDS.BUNDLE_ALL_CLASSES)) {
      return true;
    }

    // Check local storage for offline persistence
    const savedPurchases = this.loadSavedPurchases();
    return savedPurchases.includes(classId);
  }

  /**
   * Get product info for a class
   */
  getProductInfo(classId: CharacterClassId): ProductInfo | null {
    const productId = CLASS_TO_PRODUCT[classId];
    return productId ? this.products.get(productId) || null : null;
  }

  /**
   * Get bundle info
   */
  getBundleInfo(): ProductInfo | null {
    return this.products.get(PRODUCT_IDS.BUNDLE_ALL_CLASSES) || null;
  }

  /**
   * Purchase a class
   */
  async purchaseClass(classId: CharacterClassId): Promise<PurchaseResult> {
    const productId = CLASS_TO_PRODUCT[classId];
    if (!productId) {
      return { success: false, error: 'Invalid class ID' };
    }

    return this.purchaseProduct(productId);
  }

  /**
   * Purchase the all-classes bundle
   */
  async purchaseBundle(): Promise<PurchaseResult> {
    return this.purchaseProduct(PRODUCT_IDS.BUNDLE_ALL_CLASSES);
  }

  /**
   * Purchase a product by ID
   */
  private async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.initialized) {
      return { success: false, error: 'Purchase service not initialized' };
    }

    if (!this.isNative) {
      return { success: false, error: 'Purchases only available on iOS' };
    }

    try {
      // TODO: Implement actual purchase flow
      // const product = CdvPurchase.store.get(productId);
      // if (!product) return { success: false, error: 'Product not found' };
      //
      // const offer = product.getOffer();
      // if (!offer) return { success: false, error: 'No offer available' };
      //
      // await offer.order();

      console.log('[PurchaseService] Purchase initiated:', productId);
      return { success: true, productId };
    } catch (error) {
      console.error('[PurchaseService] Purchase failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<boolean> {
    if (!this.isNative) {
      console.log('[PurchaseService] Restore not available on web');
      return false;
    }

    try {
      // TODO: Implement restore
      // await CdvPurchase.store.restorePurchases();
      console.log('[PurchaseService] Restore initiated');
      return true;
    } catch (error) {
      console.error('[PurchaseService] Restore failed:', error);
      return false;
    }
  }

  // TODO: These handlers will be used when IAP is fully integrated
  // handleApproved(transaction: unknown): void { transaction.verify(); }
  // handleVerified(receipt: { productId: string }): void { ... }

  /**
   * Load saved purchases from local storage
   */
  private loadSavedPurchases(): CharacterClassId[] {
    try {
      const saved = localStorage.getItem('sanctum_purchases');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
}

// Export singleton
export const purchaseService = PurchaseService.getInstance();
