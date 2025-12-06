/**
 * HapticsService - Wrapper for Capacitor Haptics API
 * Provides haptic feedback for iOS native app
 * Falls back silently on web/unsupported platforms
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export class HapticsService {
  private static instance: HapticsService;
  private enabled: boolean = true;
  private isNative: boolean;

  private constructor() {
    // Check if running in native app context
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): HapticsService {
    if (!HapticsService.instance) {
      HapticsService.instance = new HapticsService();
    }
    return HapticsService.instance;
  }

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled && this.isNative;
  }

  /**
   * Light impact - card selection, hover states
   */
  async light(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Silently fail on unsupported platforms
    }
  }

  /**
   * Medium impact - card play, button press
   */
  async medium(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Silently fail on unsupported platforms
    }
  }

  /**
   * Heavy impact - damage dealt/received, important events
   */
  async heavy(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {
      // Silently fail on unsupported platforms
    }
  }

  /**
   * Success notification - victory, achievement unlocked
   */
  async success(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      // Silently fail on unsupported platforms
    }
  }

  /**
   * Warning notification - low health, turn ending soon
   */
  async warning(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch {
      // Silently fail on unsupported platforms
    }
  }

  /**
   * Error notification - defeat, card unplayable
   */
  async error(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch {
      // Silently fail on unsupported platforms
    }
  }

  /**
   * Selection changed - useful for scrolling through cards
   */
  async selectionChanged(): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await Haptics.selectionChanged();
    } catch {
      // Silently fail on unsupported platforms
    }
  }

  // Convenience methods for game-specific events

  /**
   * Called when a card is played
   */
  async cardPlayed(): Promise<void> {
    await this.medium();
  }

  /**
   * Called when player deals damage
   */
  async damageDealt(): Promise<void> {
    await this.medium();
  }

  /**
   * Called when player receives damage
   */
  async damageReceived(): Promise<void> {
    await this.heavy();
  }

  /**
   * Called when turn changes
   */
  async turnChange(): Promise<void> {
    await this.light();
  }

  /**
   * Called on victory
   */
  async victory(): Promise<void> {
    await this.success();
  }

  /**
   * Called on defeat
   */
  async defeat(): Promise<void> {
    await this.error();
  }

  /**
   * Called when hovering over a card
   */
  async cardHover(): Promise<void> {
    await this.selectionChanged();
  }

  /**
   * Called when selecting an enemy target
   */
  async targetSelected(): Promise<void> {
    await this.light();
  }
}

// Export singleton instance for convenience
export const haptics = HapticsService.getInstance();
