/**
 * AchievementScreen - Achievement Gallery for viewing all achievements
 */

import { Screen } from '../ScreenManager';
import { AchievementService } from '@/services/AchievementService';
import { SaveManager } from '@/services/SaveManager';
import { Achievement, AchievementCategory, AchievementTier, SOUL_ECHO_REWARDS } from '@/types/achievements';

interface AchievementScreenOptions {
  onBack: () => void;
}

type AchievementTab = AchievementCategory | 'all';

const TIER_STYLES: Record<AchievementTier, { icon: string; color: string; name: string }> = {
  [AchievementTier.BRONZE]: {
    icon: '\u{1F949}',
    color: '#cd7f32',
    name: 'Bronze',
  },
  [AchievementTier.SILVER]: {
    icon: '\u{1F948}',
    color: '#c0c0c0',
    name: 'Silver',
  },
  [AchievementTier.GOLD]: {
    icon: '\u{1F947}',
    color: '#ffd700',
    name: 'Gold',
  },
  [AchievementTier.PLATINUM]: {
    icon: '\u{1F48E}',
    color: '#e5e4e2',
    name: 'Platinum',
  },
};

export function createAchievementScreen(options: AchievementScreenOptions): Screen {
  const element = document.createElement('div');
  element.id = 'achievement-screen';
  element.className = 'screen';

  let activeTab: AchievementTab = 'all';

  const getFilteredAchievements = (tab: AchievementTab): Achievement[] => {
    const all = AchievementService.getAllAchievements();
    if (tab === 'all') return all;
    return all.filter((a) => a.category === tab);
  };

  const getTabName = (tab: AchievementTab): string => {
    const names: Record<AchievementTab, string> = {
      all: 'All',
      combat: 'Combat',
      run: 'Run',
      class: 'Class',
      secret: 'Secret',
    };
    return names[tab];
  };

  const renderAchievementCard = (achievement: Achievement): string => {
    const isUnlocked = AchievementService.isUnlocked(achievement.id);
    const tierStyle = TIER_STYLES[achievement.tier];
    const reward = SOUL_ECHO_REWARDS[achievement.tier];

    // For hidden achievements that are locked, show mystery state
    const showHidden = achievement.hidden && !isUnlocked;
    const displayName = showHidden ? '???' : achievement.name;
    const displayDesc = showHidden ? 'Complete this secret achievement to reveal it.' : achievement.description;
    const displayIcon = showHidden ? '\u{2753}' : (achievement.icon || tierStyle.icon);

    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}"
           data-achievement-id="${achievement.id}"
           style="border-color: ${isUnlocked ? tierStyle.color : '#333'};">
        <div class="achievement-card-header">
          <span class="achievement-icon" style="filter: ${isUnlocked ? 'none' : 'grayscale(100%)'}">${displayIcon}</span>
          <span class="achievement-tier" style="color: ${tierStyle.color}">${tierStyle.name}</span>
        </div>
        <div class="achievement-card-body">
          <h3 class="achievement-name" style="color: ${isUnlocked ? '#fff' : '#666'}">${displayName}</h3>
          <p class="achievement-description">${displayDesc}</p>
        </div>
        <div class="achievement-card-footer">
          ${isUnlocked
            ? `<span class="achievement-earned">\u{2714} Earned</span>`
            : `<span class="achievement-reward">${reward} SE</span>`
          }
        </div>
      </div>
    `;
  };

  const render = () => {
    const achievements = getFilteredAchievements(activeTab);
    const totalSoulEchoes = SaveManager.getSoulEchoes();
    const unlockCount = AchievementService.getUnlockCount();
    const totalCount = AchievementService.getTotalCount();
    const progressPercent = Math.round((unlockCount / totalCount) * 100);

    // Group by tier for display
    const byTier = new Map<AchievementTier, Achievement[]>();
    for (const a of achievements) {
      if (!byTier.has(a.tier)) {
        byTier.set(a.tier, []);
      }
      byTier.get(a.tier)!.push(a);
    }

    const tabs: AchievementTab[] = ['all', 'combat', 'run', 'class', 'secret'];

    element.innerHTML = `
      <div class="achievement-container">
        <header class="achievement-header">
          <button class="back-btn" id="achievement-back">\u{2190} Back</button>
          <h1 class="achievement-title">Achievements</h1>
          <div class="soul-echoes-display">
            <span class="se-amount">${totalSoulEchoes}</span>
            <span class="se-label">Soul Echoes</span>
          </div>
        </header>

        <div class="achievement-progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
          <span class="progress-text">${unlockCount} / ${totalCount} (${progressPercent}%)</span>
        </div>

        <nav class="achievement-tabs">
          ${tabs.map((tab) => `
            <button class="tab-btn ${activeTab === tab ? 'active' : ''}" data-tab="${tab}">
              ${getTabName(tab)}
              <span class="tab-count">(${getFilteredAchievements(tab).filter(a => AchievementService.isUnlocked(a.id)).length}/${getFilteredAchievements(tab).length})</span>
            </button>
          `).join('')}
        </nav>

        <div class="achievement-grid">
          ${achievements.map(renderAchievementCard).join('')}
        </div>
      </div>
    `;

    // Add styles
    addStyles();

    // Tab click handlers
    element.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTab = (btn as HTMLElement).dataset.tab as AchievementTab;
        render();
      });
    });

    // Back button
    element.querySelector('#achievement-back')?.addEventListener('click', options.onBack);

    // Achievement card click for details
    element.querySelectorAll('.achievement-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = (card as HTMLElement).dataset.achievementId;
        if (id) showAchievementDetails(id);
      });
    });
  };

  const showAchievementDetails = (achievementId: string): void => {
    const achievement = AchievementService.getAllAchievements().find((a) => a.id === achievementId);
    if (!achievement) return;

    const isUnlocked = AchievementService.isUnlocked(achievementId);
    const tierStyle = TIER_STYLES[achievement.tier];

    // Don't reveal hidden achievements
    if (achievement.hidden && !isUnlocked) return;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'achievement-modal-overlay';
    modal.innerHTML = `
      <div class="achievement-modal" style="border-color: ${tierStyle.color}">
        <button class="modal-close">\u{2715}</button>
        <div class="modal-icon" style="font-size: 64px;">${achievement.icon || tierStyle.icon}</div>
        <h2 style="color: ${tierStyle.color}">${achievement.name}</h2>
        <p class="modal-tier">${tierStyle.name} Achievement</p>
        <p class="modal-description">${achievement.description}</p>
        ${achievement.flavorText ? `
          <blockquote class="modal-flavor">${achievement.flavorText}</blockquote>
        ` : ''}
        ${achievement.loreUnlock && isUnlocked ? `
          <div class="modal-lore">
            <h4>Lore Unlocked</h4>
            <p>${achievement.loreUnlock}</p>
          </div>
        ` : ''}
        <div class="modal-reward">
          ${isUnlocked
            ? `<span class="earned-badge">\u{2714} Earned</span>`
            : `<span>\u{2728} ${SOUL_ECHO_REWARDS[achievement.tier]} Soul Echoes</span>`
          }
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    modal.querySelector('.modal-close')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  const addStyles = (): void => {
    if (document.getElementById('achievement-screen-styles')) return;

    const style = document.createElement('style');
    style.id = 'achievement-screen-styles';
    style.textContent = `
      .achievement-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        min-height: 100vh;
        background: linear-gradient(180deg, #0a0a1a 0%, #1a1a2e 100%);
      }

      .achievement-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #333;
        margin-bottom: 20px;
      }

      .achievement-title {
        font-family: 'Georgia', serif;
        font-size: 32px;
        color: #ffd700;
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
      }

      .soul-echoes-display {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        color: #9370db;
      }

      .se-icon {
        font-size: 24px;
      }

      .se-amount {
        font-weight: bold;
        font-size: 24px;
      }

      .se-label {
        color: #666;
        font-size: 12px;
      }

      .achievement-progress-bar {
        position: relative;
        height: 30px;
        background: #222;
        border-radius: 15px;
        margin-bottom: 20px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #9370db, #dda0dd);
        transition: width 0.5s ease;
      }

      .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-weight: bold;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
      }

      .achievement-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .tab-btn {
        padding: 10px 20px;
        background: #1a1a2e;
        border: 1px solid #333;
        border-radius: 8px;
        color: #888;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }

      .tab-btn:hover {
        background: #252540;
        border-color: #555;
        color: #fff;
      }

      .tab-btn.active {
        background: #2a2a4e;
        border-color: #9370db;
        color: #fff;
      }

      .tab-count {
        font-size: 11px;
        color: #666;
      }

      .achievement-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 16px;
      }

      .achievement-card {
        background: #1a1a2e;
        border: 2px solid #333;
        border-radius: 12px;
        padding: 16px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .achievement-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .achievement-card.unlocked {
        background: linear-gradient(135deg, #1a1a2e 0%, #252540 100%);
      }

      .achievement-card.locked {
        opacity: 0.7;
      }

      .achievement-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .achievement-icon {
        font-size: 32px;
      }

      .achievement-tier {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .achievement-name {
        font-size: 16px;
        margin: 0 0 8px 0;
      }

      .achievement-description {
        font-size: 13px;
        color: #888;
        line-height: 1.4;
        margin: 0;
      }

      .achievement-card-footer {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #333;
        display: flex;
        justify-content: flex-end;
      }

      .achievement-earned {
        color: #4caf50;
        font-size: 12px;
      }

      .achievement-reward {
        color: #9370db;
        font-size: 12px;
      }

      .back-btn {
        padding: 10px 20px;
        background: #333;
        border: 1px solid #555;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.2s;
      }

      .back-btn:hover {
        background: #444;
      }

      /* Modal styles */
      .achievement-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }

      .achievement-modal {
        background: linear-gradient(135deg, #1a1a2e 0%, #252540 100%);
        border: 2px solid #ffd700;
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        text-align: center;
        position: relative;
      }

      .modal-close {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
      }

      .modal-close:hover {
        color: #fff;
      }

      .modal-tier {
        color: #888;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 2px;
        margin-top: -8px;
      }

      .modal-description {
        color: #ccc;
        line-height: 1.6;
        margin: 16px 0;
      }

      .modal-flavor {
        font-style: italic;
        color: #888;
        border-left: 2px solid #555;
        padding-left: 16px;
        margin: 16px 0;
        text-align: left;
      }

      .modal-lore {
        background: rgba(147, 112, 219, 0.1);
        border: 1px solid rgba(147, 112, 219, 0.3);
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
        text-align: left;
      }

      .modal-lore h4 {
        color: #9370db;
        margin: 0 0 8px 0;
        font-size: 14px;
      }

      .modal-lore p {
        color: #aaa;
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
      }

      .modal-reward {
        margin-top: 20px;
        font-size: 18px;
        color: #9370db;
      }

      .earned-badge {
        color: #4caf50;
      }
    `;
    document.head.appendChild(style);
  };

  return {
    id: 'achievement-screen',
    element,
    onEnter: render,
  };
}
