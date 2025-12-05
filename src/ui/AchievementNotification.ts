/**
 * Achievement Notification UI
 * Displays a slide-in notification when an achievement is unlocked
 */

import { Achievement, AchievementTier, SOUL_ECHO_REWARDS } from '@/types/achievements';
import { AchievementService } from '@/services/AchievementService';
import { AudioManager } from '@/services/AudioManager';

// Tier-specific styling
const TIER_STYLES: Record<AchievementTier, { icon: string; color: string; glow: string }> = {
  [AchievementTier.BRONZE]: {
    icon: '\u{1F949}', // Bronze medal
    color: '#cd7f32',
    glow: 'rgba(205, 127, 50, 0.5)',
  },
  [AchievementTier.SILVER]: {
    icon: '\u{1F948}', // Silver medal
    color: '#c0c0c0',
    glow: 'rgba(192, 192, 192, 0.5)',
  },
  [AchievementTier.GOLD]: {
    icon: '\u{1F947}', // Gold medal
    color: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.5)',
  },
  [AchievementTier.PLATINUM]: {
    icon: '\u{1F48E}', // Gem
    color: '#e5e4e2',
    glow: 'rgba(229, 228, 226, 0.7)',
  },
};

// Notification queue for multiple unlocks
const notificationQueue: Achievement[] = [];
let isShowingNotification = false;

/**
 * Show achievement unlock notification
 */
export function showAchievementNotification(achievement: Achievement): void {
  notificationQueue.push(achievement);
  if (!isShowingNotification) {
    processQueue();
  }
}

function processQueue(): void {
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }

  isShowingNotification = true;
  const achievement = notificationQueue.shift()!;
  displayNotification(achievement);
}

function displayNotification(achievement: Achievement): void {
  const tierStyle = TIER_STYLES[achievement.tier];
  const reward = SOUL_ECHO_REWARDS[achievement.tier];

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: -400px;
    width: 360px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid ${tierStyle.color};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 0 20px ${tierStyle.glow}, 0 4px 20px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    font-family: 'Georgia', serif;
    transition: right 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;

  // Achievement icon
  const iconDisplay = achievement.icon || tierStyle.icon;

  notification.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="
        font-size: 40px;
        line-height: 1;
        filter: drop-shadow(0 0 8px ${tierStyle.glow});
      ">${iconDisplay}</div>
      <div style="flex: 1;">
        <div style="
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: ${tierStyle.color};
          margin-bottom: 4px;
        ">Achievement Unlocked</div>
        <div style="
          font-size: 18px;
          font-weight: bold;
          color: #fff;
          margin-bottom: 6px;
          text-shadow: 0 0 10px ${tierStyle.glow};
        ">${achievement.name}</div>
        <div style="
          font-size: 13px;
          color: #a0a0a0;
          line-height: 1.4;
          margin-bottom: 8px;
        ">${achievement.hidden ? achievement.flavorText || achievement.description : achievement.description}</div>
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #9370db;
        ">
          <span style="font-size: 16px;">\u{2728}</span>
          <span>+${reward} Soul Echoes</span>
        </div>
      </div>
    </div>
    ${achievement.flavorText && !achievement.hidden ? `
      <div style="
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        font-style: italic;
        font-size: 12px;
        color: #888;
        line-height: 1.5;
      ">${achievement.flavorText}</div>
    ` : ''}
  `;

  document.body.appendChild(notification);

  // Play sound
  try {
    AudioManager.playSfx('spell'); // Use existing spell sound for now
  } catch {
    // Audio may not be initialized yet
  }

  // Slide in
  requestAnimationFrame(() => {
    notification.style.right = '20px';
  });

  // Slide out after delay
  setTimeout(() => {
    notification.style.right = '-400px';
    setTimeout(() => {
      notification.remove();
      processQueue();
    }, 500);
  }, 4000);
}

/**
 * Initialize achievement notification listener
 * Call this once at app startup
 */
export function initAchievementNotifications(): void {
  AchievementService.onAchievementUnlocked((event) => {
    showAchievementNotification(event.achievement);
  });
}
