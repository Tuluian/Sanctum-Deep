/**
 * CloudSaveService - iCloud-backed storage for iOS
 *
 * Uses @capacitor/preferences which automatically syncs via iCloud on iOS.
 * Falls back to localStorage on web.
 *
 * Key features:
 * - Automatic iCloud sync on iOS
 * - Conflict resolution (latest timestamp wins)
 * - Fallback to localStorage on web/unsupported platforms
 * - Non-blocking async operations
 */

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const CLOUD_STORAGE_KEY = 'sanctum_ruins_save';
const CLOUD_SYNC_TIMESTAMP_KEY = 'sanctum_ruins_sync_timestamp';

export interface CloudSaveResult {
  success: boolean;
  error?: string;
  isFromCloud?: boolean;
}

export class CloudSaveService {
  private static instance: CloudSaveService;
  private isNative: boolean;
  private initialized = false;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): CloudSaveService {
    if (!CloudSaveService.instance) {
      CloudSaveService.instance = new CloudSaveService();
    }
    return CloudSaveService.instance;
  }

  /**
   * Initialize the cloud save service
   * Should be called early in app startup
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // On native platforms, Preferences automatically uses iCloud
    console.log(`[CloudSave] Initialized (native: ${this.isNative})`);
    this.initialized = true;
  }

  /**
   * Check if cloud saves are available
   */
  isCloudAvailable(): boolean {
    return this.isNative;
  }

  /**
   * Save data to cloud storage
   * @param data - The data to save (will be JSON stringified)
   */
  async save(data: unknown): Promise<CloudSaveResult> {
    try {
      const timestamp = Date.now();
      const savePayload = {
        data,
        timestamp,
        version: 1,
      };

      await Preferences.set({
        key: CLOUD_STORAGE_KEY,
        value: JSON.stringify(savePayload),
      });

      await Preferences.set({
        key: CLOUD_SYNC_TIMESTAMP_KEY,
        value: String(timestamp),
      });

      console.log(`[CloudSave] Saved at ${new Date(timestamp).toISOString()}`);
      return { success: true };
    } catch (error) {
      console.error('[CloudSave] Save failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Load data from cloud storage
   * @returns The saved data, or null if not found
   */
  async load<T>(): Promise<{ data: T | null; timestamp: number | null; isFromCloud: boolean }> {
    try {
      const result = await Preferences.get({ key: CLOUD_STORAGE_KEY });

      if (!result.value) {
        console.log('[CloudSave] No cloud save found');
        return { data: null, timestamp: null, isFromCloud: false };
      }

      const payload = JSON.parse(result.value) as {
        data: T;
        timestamp: number;
        version: number;
      };

      console.log(`[CloudSave] Loaded save from ${new Date(payload.timestamp).toISOString()}`);
      return {
        data: payload.data,
        timestamp: payload.timestamp,
        isFromCloud: this.isNative,
      };
    } catch (error) {
      console.error('[CloudSave] Load failed:', error);
      return { data: null, timestamp: null, isFromCloud: false };
    }
  }

  /**
   * Get the timestamp of the last cloud save
   */
  async getLastSyncTimestamp(): Promise<number | null> {
    try {
      const result = await Preferences.get({ key: CLOUD_SYNC_TIMESTAMP_KEY });
      return result.value ? parseInt(result.value, 10) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if cloud has newer data than local
   * @param localTimestamp - The timestamp of the local save
   */
  async hasNewerCloudSave(localTimestamp: number): Promise<boolean> {
    const cloudTimestamp = await this.getLastSyncTimestamp();
    if (!cloudTimestamp) return false;
    return cloudTimestamp > localTimestamp;
  }

  /**
   * Sync local data with cloud, handling conflicts
   * Uses "latest wins" conflict resolution
   *
   * @param localData - Current local save data
   * @param localTimestamp - Timestamp of local save
   * @returns The data to use (either local or cloud, whichever is newer)
   */
  async syncWithCloud<T>(
    localData: T,
    localTimestamp: number
  ): Promise<{ data: T; source: 'local' | 'cloud' }> {
    try {
      const cloudResult = await this.load<T>();

      // No cloud data - use local and push to cloud
      if (!cloudResult.data || !cloudResult.timestamp) {
        await this.save(localData);
        return { data: localData, source: 'local' };
      }

      // Cloud is newer - use cloud data
      if (cloudResult.timestamp > localTimestamp) {
        console.log('[CloudSave] Using newer cloud save');
        return { data: cloudResult.data, source: 'cloud' };
      }

      // Local is newer or same - use local and push to cloud
      if (localTimestamp >= cloudResult.timestamp) {
        console.log('[CloudSave] Local save is newer, pushing to cloud');
        await this.save(localData);
        return { data: localData, source: 'local' };
      }

      // Fallback to local
      return { data: localData, source: 'local' };
    } catch (error) {
      console.error('[CloudSave] Sync failed, using local:', error);
      return { data: localData, source: 'local' };
    }
  }

  /**
   * Force push local data to cloud (overwrite)
   */
  async forceUpload(data: unknown): Promise<CloudSaveResult> {
    console.log('[CloudSave] Force uploading to cloud');
    return this.save(data);
  }

  /**
   * Force download from cloud (overwrite local)
   */
  async forceDownload<T>(): Promise<{ data: T | null; success: boolean }> {
    console.log('[CloudSave] Force downloading from cloud');
    const result = await this.load<T>();
    return {
      data: result.data,
      success: result.data !== null,
    };
  }

  /**
   * Clear cloud save data
   */
  async clearCloudSave(): Promise<void> {
    try {
      await Preferences.remove({ key: CLOUD_STORAGE_KEY });
      await Preferences.remove({ key: CLOUD_SYNC_TIMESTAMP_KEY });
      console.log('[CloudSave] Cloud save cleared');
    } catch (error) {
      console.error('[CloudSave] Failed to clear cloud save:', error);
    }
  }

  /**
   * Get sync status for UI display
   */
  async getSyncStatus(): Promise<{
    hasCloudSave: boolean;
    cloudTimestamp: number | null;
    isNative: boolean;
  }> {
    const cloudTimestamp = await this.getLastSyncTimestamp();
    return {
      hasCloudSave: cloudTimestamp !== null,
      cloudTimestamp,
      isNative: this.isNative,
    };
  }
}

// Export singleton
export const cloudSave = CloudSaveService.getInstance();
