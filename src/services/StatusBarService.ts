/**
 * StatusBarService - Wrapper for Capacitor StatusBar API
 * Configures iOS status bar appearance
 * Falls back silently on web/unsupported platforms
 */

import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export class StatusBarService {
  private static instance: StatusBarService;
  private isNative: boolean;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  static getInstance(): StatusBarService {
    if (!StatusBarService.instance) {
      StatusBarService.instance = new StatusBarService();
    }
    return StatusBarService.instance;
  }

  /**
   * Initialize status bar for the game
   * Sets light text on dark background for the game's dark theme
   */
  async initialize(): Promise<void> {
    if (!this.isNative) return;

    try {
      // Set light content (white text/icons) for dark game background
      await StatusBar.setStyle({ style: Style.Dark });

      // Set status bar background to match game theme
      await StatusBar.setBackgroundColor({ color: '#1a1a2e' });
    } catch {
      // Silently fail on unsupported platforms
    }
  }

  /**
   * Show the status bar
   */
  async show(): Promise<void> {
    if (!this.isNative) return;
    try {
      await StatusBar.show();
    } catch {
      // Silently fail
    }
  }

  /**
   * Hide the status bar for immersive gameplay
   */
  async hide(): Promise<void> {
    if (!this.isNative) return;
    try {
      await StatusBar.hide();
    } catch {
      // Silently fail
    }
  }

  /**
   * Set status bar to light style (dark icons on light background)
   */
  async setLight(): Promise<void> {
    if (!this.isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch {
      // Silently fail
    }
  }

  /**
   * Set status bar to dark style (light icons on dark background)
   * Use this for the game's default dark theme
   */
  async setDark(): Promise<void> {
    if (!this.isNative) return;
    try {
      await StatusBar.setStyle({ style: Style.Dark });
    } catch {
      // Silently fail
    }
  }

  /**
   * Set status bar background color
   * @param color - Hex color string (e.g., '#1a1a2e')
   */
  async setBackgroundColor(color: string): Promise<void> {
    if (!this.isNative) return;
    try {
      await StatusBar.setBackgroundColor({ color });
    } catch {
      // Silently fail
    }
  }
}

// Export singleton instance
export const statusBar = StatusBarService.getInstance();
