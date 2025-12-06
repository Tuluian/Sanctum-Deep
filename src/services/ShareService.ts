/**
 * ShareService - Wrapper for Capacitor Share API
 * Enables sharing game victories and achievements on iOS
 * Falls back gracefully on web (uses Web Share API if available)
 */

import { Share, ShareResult } from '@capacitor/share';

export interface VictoryShareData {
  className: string;
  bossName: string;
  turnsPlayed: number;
  cardsPlayed: number;
  actNumber: number;
  finalHp: number;
  maxHp: number;
}

export class ShareService {
  private static instance: ShareService;

  private constructor() {
    // Constructor for singleton
  }

  static getInstance(): ShareService {
    if (!ShareService.instance) {
      ShareService.instance = new ShareService();
    }
    return ShareService.instance;
  }

  /**
   * Check if sharing is available on this platform
   */
  async canShare(): Promise<boolean> {
    try {
      const result = await Share.canShare();
      return result.value;
    } catch {
      // Check for Web Share API fallback
      return typeof navigator !== 'undefined' && !!navigator.share;
    }
  }

  /**
   * Share a victory with run statistics
   */
  async shareVictory(data: VictoryShareData): Promise<ShareResult | null> {
    const message = this.formatVictoryMessage(data);

    try {
      return await Share.share({
        title: 'Victory in Sanctum Ruins!',
        text: message,
        url: 'https://sanctumruins.com',
        dialogTitle: 'Share your victory',
      });
    } catch (error) {
      console.warn('Share failed:', error);
      return null;
    }
  }

  /**
   * Share a custom message
   */
  async shareText(title: string, text: string, url?: string): Promise<ShareResult | null> {
    try {
      return await Share.share({
        title,
        text,
        url,
        dialogTitle: title,
      });
    } catch (error) {
      console.warn('Share failed:', error);
      return null;
    }
  }

  /**
   * Format victory message for sharing
   */
  private formatVictoryMessage(data: VictoryShareData): string {
    const actName = data.actNumber === 3 ? 'the Hollow God' : `Act ${data.actNumber}`;
    const healthPercent = Math.round((data.finalHp / data.maxHp) * 100);

    return [
      `I conquered ${actName} in Sanctum Ruins!`,
      ``,
      `Class: ${data.className}`,
      `Boss: ${data.bossName}`,
      `Turns: ${data.turnsPlayed}`,
      `Cards Played: ${data.cardsPlayed}`,
      `Final HP: ${data.finalHp}/${data.maxHp} (${healthPercent}%)`,
      ``,
      `Can you survive the descent?`,
    ].join('\n');
  }

  /**
   * Share an achievement unlock
   */
  async shareAchievement(achievementName: string, description: string): Promise<ShareResult | null> {
    const message = `I just unlocked "${achievementName}" in Sanctum Ruins!\n\n${description}\n\nCan you match this?`;

    try {
      return await Share.share({
        title: `Achievement Unlocked: ${achievementName}`,
        text: message,
        url: 'https://sanctumruins.com',
        dialogTitle: 'Share achievement',
      });
    } catch (error) {
      console.warn('Share failed:', error);
      return null;
    }
  }
}

// Export singleton instance
export const shareService = ShareService.getInstance();
