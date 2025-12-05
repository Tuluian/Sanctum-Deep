/**
 * CollectionScreen
 *
 * Displays all unlockable cards in the game, showing which ones
 * are unlocked and providing hints for locked cards.
 */

import { Screen } from '@/ui/ScreenManager';
import { getCardUnlockService } from '@/services/CardUnlockService';
import { UNLOCKABLE_CARDS } from '@/data/unlockableCards';
import { CardUnlock } from '@/types/unlocks';
import { CharacterClassId } from '@/types/index';
import { AudioManager } from '@/services/AudioManager';

export interface CollectionScreenCallbacks {
  onBack: () => void;
}

/**
 * Get display name for a class ID
 */
function getClassName(classId: CharacterClassId): string {
  const names: Record<CharacterClassId, string> = {
    [CharacterClassId.CLERIC]: 'Cleric',
    [CharacterClassId.DUNGEON_KNIGHT]: 'Knight',
    [CharacterClassId.DIABOLIST]: 'Diabolist',
    [CharacterClassId.OATHSWORN]: 'Oathsworn',
    [CharacterClassId.FEY_TOUCHED]: 'Fey-Touched',
    [CharacterClassId.CELESTIAL]: 'Celestial',
    [CharacterClassId.SUMMONER]: 'Summoner',
    [CharacterClassId.BARGAINER]: 'Bargainer',
    [CharacterClassId.TIDECALLER]: 'Tidecaller',
    [CharacterClassId.SHADOW_STALKER]: 'Shadow Stalker',
    [CharacterClassId.GOBLIN]: 'Goblin',
  };
  return names[classId] || classId;
}

/**
 * Format card ID to display name
 */
function formatCardName(cardId: string): string {
  return cardId
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create the collection screen
 */
export function createCollectionScreen(
  callbacks: CollectionScreenCallbacks
): Screen {
  const element = document.createElement('div');
  element.id = 'collection-screen';
  element.className = 'collection-screen';

  let selectedFilter: 'all' | 'unlocked' | 'locked' | CharacterClassId = 'all';
  let selectedCard: CardUnlock | null = null;

  function getFilteredCards(): CardUnlock[] {
    const unlockService = getCardUnlockService();

    return UNLOCKABLE_CARDS.filter((card) => {
      const isUnlocked = unlockService.isCardUnlocked(card.cardId);

      // Filter by unlock status
      if (selectedFilter === 'unlocked' && !isUnlocked) return false;
      if (selectedFilter === 'locked' && isUnlocked) return false;

      // Filter by class
      if (
        selectedFilter !== 'all' &&
        selectedFilter !== 'unlocked' &&
        selectedFilter !== 'locked'
      ) {
        if (card.classRestriction && card.classRestriction !== selectedFilter) {
          return false;
        }
        if (!card.classRestriction) {
          return false; // Only show class-specific when class filter is active
        }
      }

      return true;
    });
  }

  function render(): void {
    const unlockService = getCardUnlockService();
    const progress = unlockService.getProgress();
    const totalCards = UNLOCKABLE_CARDS.length;
    const unlockedCount = progress.unlockedCards.length;
    const filteredCards = getFilteredCards();

    element.innerHTML = `
      <div class="collection-container">
        <header class="collection-header">
          <button class="collection-back-btn" id="collection-back-btn">
            &#8592; Back
          </button>
          <h1 class="collection-title">Card Collection</h1>
          <div class="collection-progress">
            <span class="progress-count">${unlockedCount} / ${totalCards}</span>
            <span class="progress-label">Cards Unlocked</span>
          </div>
        </header>

        <div class="collection-filters">
          <button class="filter-btn ${selectedFilter === 'all' ? 'active' : ''}" data-filter="all">
            All
          </button>
          <button class="filter-btn ${selectedFilter === 'unlocked' ? 'active' : ''}" data-filter="unlocked">
            Unlocked (${unlockedCount})
          </button>
          <button class="filter-btn ${selectedFilter === 'locked' ? 'active' : ''}" data-filter="locked">
            Locked (${totalCards - unlockedCount})
          </button>
          <div class="filter-separator"></div>
          ${Object.values(CharacterClassId)
            .map(
              (classId) => `
            <button class="filter-btn class-filter ${selectedFilter === classId ? 'active' : ''}" data-filter="${classId}">
              ${getClassName(classId)}
            </button>
          `
            )
            .join('')}
        </div>

        <div class="collection-grid">
          ${filteredCards.length === 0 ? `
            <div class="collection-empty">
              <p>No cards match this filter.</p>
            </div>
          ` : filteredCards.map((card) => {
            const isUnlocked = unlockService.isCardUnlocked(card.cardId);
            return `
              <div class="collection-card ${isUnlocked ? 'unlocked' : 'locked'}"
                   data-card-id="${card.cardId}">
                <div class="card-frame">
                  <div class="card-name">
                    ${isUnlocked ? formatCardName(card.cardId) : '???'}
                  </div>
                  <div class="card-icon">
                    ${isUnlocked ? '&#9733;' : '&#128274;'}
                  </div>
                  ${card.classRestriction ? `
                    <div class="card-class-badge">
                      ${getClassName(card.classRestriction)}
                    </div>
                  ` : ''}
                </div>
                ${!isUnlocked ? `
                  <div class="card-hint">
                    ${card.hintText}
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        ${selectedCard ? renderCardDetail(selectedCard, unlockService.isCardUnlocked(selectedCard.cardId)) : ''}
      </div>
    `;

    // Add event listeners
    const backBtn = element.querySelector('#collection-back-btn');
    backBtn?.addEventListener('click', () => {
      AudioManager.playSfx('card-play');
      callbacks.onBack();
    });

    // Filter buttons
    element.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).dataset.filter;
        if (filter) {
          AudioManager.playSfx('card-play');
          selectedFilter = filter as typeof selectedFilter;
          selectedCard = null;
          render();
        }
      });
    });

    // Card clicks
    element.querySelectorAll('.collection-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        const cardId = (e.currentTarget as HTMLElement).dataset.cardId;
        const unlock = UNLOCKABLE_CARDS.find((c) => c.cardId === cardId);
        if (unlock) {
          AudioManager.playSfx('card-play');
          selectedCard = selectedCard?.cardId === cardId ? null : unlock;
          render();
        }
      });
    });

    // Close detail on backdrop click
    const detailBackdrop = element.querySelector('.card-detail-backdrop');
    detailBackdrop?.addEventListener('click', () => {
      AudioManager.playSfx('card-play');
      selectedCard = null;
      render();
    });
  }

  function renderCardDetail(card: CardUnlock, isUnlocked: boolean): string {
    return `
      <div class="card-detail-backdrop"></div>
      <div class="card-detail-panel">
        <button class="card-detail-close" id="detail-close-btn">&#10005;</button>

        <div class="card-detail-header">
          <h2 class="card-detail-name">
            ${isUnlocked ? formatCardName(card.cardId) : '???'}
          </h2>
          <div class="card-detail-status ${isUnlocked ? 'unlocked' : 'locked'}">
            ${isUnlocked ? '&#10003; Unlocked' : '&#128274; Locked'}
          </div>
        </div>

        ${card.classRestriction ? `
          <div class="card-detail-class">
            ${getClassName(card.classRestriction)} Only
          </div>
        ` : `
          <div class="card-detail-class universal">
            Available to All Classes
          </div>
        `}

        ${isUnlocked ? `
          <div class="card-detail-narrative">
            <h3>Unlock Story</h3>
            <p>${card.narrativeText}</p>
          </div>
        ` : `
          <div class="card-detail-hint">
            <h3>How to Unlock</h3>
            <p>${card.hintText}</p>
          </div>
        `}

        <div class="card-detail-triggers">
          <h3>Requirements</h3>
          <ul>
            ${card.triggers
              .map(
                (trigger) => `
              <li class="${getTriggerStatus(trigger, isUnlocked)}">
                ${formatTrigger(trigger)}
              </li>
            `
              )
              .join('')}
          </ul>
        </div>
      </div>
    `;
  }

  function getTriggerStatus(trigger: CardUnlock['triggers'][0], cardUnlocked: boolean): string {
    if (cardUnlocked) return 'complete';
    const service = getCardUnlockService();
    const progress = service.getProgress();

    switch (trigger.type) {
      case 'BOSS_DEFEAT':
        return progress.defeatedBosses[trigger.bossId!] ? 'complete' : 'incomplete';
      case 'CLASS_BOSS_DEFEAT':
        const classes = progress.defeatedBosses[trigger.bossId!] || [];
        return classes.includes(trigger.requiredClass!) ? 'complete' : 'incomplete';
      case 'ACHIEVEMENT':
        return progress.achievementsEarned.includes(trigger.achievementId!) ? 'complete' : 'incomplete';
      case 'MILESTONE':
        return progress.milestonesReached.includes(trigger.milestoneId!) ? 'complete' : 'incomplete';
      default:
        return 'incomplete';
    }
  }

  function formatTrigger(trigger: CardUnlock['triggers'][0]): string {
    switch (trigger.type) {
      case 'BOSS_DEFEAT':
        return `Defeat ${formatBossName(trigger.bossId!)}`;
      case 'CLASS_BOSS_DEFEAT':
        return `Defeat ${formatBossName(trigger.bossId!)} as ${getClassName(trigger.requiredClass!)}`;
      case 'DISCOVERY':
        return `Discovery: ${trigger.eventId}`;
      case 'EVENT_CHOICE':
        return 'Make a specific narrative choice';
      case 'SHRINE_CHOICE':
        return 'Make a specific shrine choice';
      case 'ACHIEVEMENT':
        return `Achievement: ${formatCardName(trigger.achievementId!)}`;
      case 'MILESTONE':
        return `Milestone: ${formatCardName(trigger.milestoneId!)}`;
      default:
        return 'Unknown requirement';
    }
  }

  function formatBossName(bossId: string): string {
    const names: Record<string, string> = {
      bonelord: 'the Bonelord',
      drowned_king: 'the Drowned King',
      hollow_god: 'the Hollow God',
    };
    return names[bossId] || bossId;
  }

  return {
    id: 'collection-screen',
    element,
    onEnter: () => {
      render();
    },
    onExit: () => {
      selectedCard = null;
    },
  };
}

/**
 * CSS styles for the collection screen
 * Add these to main.css
 */
export const COLLECTION_SCREEN_STYLES = `
/* Collection Screen */
.collection-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #1a1412 0%, #0d0a08 100%);
  overflow: hidden;
}

.collection-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Header */
.collection-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(139, 105, 20, 0.3);
  margin-bottom: 1rem;
}

.collection-back-btn {
  background: transparent;
  border: 1px solid #8b6914;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  color: #d4af37;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collection-back-btn:hover {
  background: rgba(139, 105, 20, 0.2);
  border-color: #d4af37;
}

.collection-title {
  color: #d4af37;
  font-size: 1.5rem;
  margin: 0;
}

.collection-progress {
  text-align: right;
}

.progress-count {
  display: block;
  color: #d4af37;
  font-size: 1.2rem;
  font-weight: bold;
}

.progress-label {
  color: #a89880;
  font-size: 0.9rem;
}

/* Filters */
.collection-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(139, 105, 20, 0.2);
}

.filter-btn {
  background: rgba(42, 31, 26, 0.5);
  border: 1px solid rgba(139, 105, 20, 0.3);
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  color: #a89880;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: rgba(139, 105, 20, 0.2);
  color: #d4af37;
}

.filter-btn.active {
  background: rgba(139, 105, 20, 0.3);
  border-color: #d4af37;
  color: #d4af37;
}

.filter-separator {
  width: 1px;
  background: rgba(139, 105, 20, 0.3);
  margin: 0 0.5rem;
}

.filter-btn.class-filter {
  font-size: 0.8rem;
  padding: 0.3rem 0.6rem;
}

/* Grid */
.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
  overflow-y: auto;
  padding-bottom: 2rem;
  flex: 1;
}

.collection-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #a89880;
}

/* Card */
.collection-card {
  background: linear-gradient(180deg, #3a2f28 0%, #2a1f1a 100%);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.collection-card:hover {
  transform: translateY(-4px);
  border-color: #d4af37;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
}

.collection-card.locked {
  opacity: 0.6;
  filter: grayscale(50%);
}

.collection-card.locked:hover {
  opacity: 0.8;
  filter: grayscale(30%);
}

.card-frame {
  text-align: center;
}

.card-name {
  color: #d4af37;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  min-height: 2.4em;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collection-card.locked .card-name {
  color: #a89880;
}

.card-icon {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.collection-card.unlocked .card-icon {
  color: #d4af37;
}

.collection-card.locked .card-icon {
  color: #666;
}

.card-class-badge {
  background: rgba(100, 149, 237, 0.2);
  color: #87ceeb;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  margin-top: 0.5rem;
}

.card-hint {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 20, 18, 0.95);
  border: 1px solid #8b6914;
  border-radius: 4px;
  padding: 0.5rem;
  color: #a89880;
  font-size: 0.75rem;
  width: 180px;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 10;
  margin-bottom: 0.5rem;
}

.collection-card:hover .card-hint {
  opacity: 1;
}

/* Card Detail Panel */
.card-detail-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 100;
}

.card-detail-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(180deg, #2a1f1a 0%, #1a1412 100%);
  border: 2px solid #d4af37;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  z-index: 101;
  animation: slideIn 0.3s ease-out;
}

.card-detail-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: #a89880;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}

.card-detail-close:hover {
  color: #d4af37;
}

.card-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-detail-name {
  color: #d4af37;
  font-size: 1.3rem;
  margin: 0;
}

.card-detail-status {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.card-detail-status.unlocked {
  background: rgba(34, 139, 34, 0.2);
  color: #90ee90;
}

.card-detail-status.locked {
  background: rgba(139, 34, 34, 0.2);
  color: #ff6b6b;
}

.card-detail-class {
  background: rgba(100, 149, 237, 0.2);
  color: #87ceeb;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.card-detail-class.universal {
  background: rgba(34, 139, 34, 0.2);
  color: #90ee90;
}

.card-detail-narrative,
.card-detail-hint {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #d4af37;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0 8px 8px 0;
}

.card-detail-narrative h3,
.card-detail-hint h3,
.card-detail-triggers h3 {
  color: #d4af37;
  font-size: 0.9rem;
  margin: 0 0 0.5rem 0;
}

.card-detail-narrative p,
.card-detail-hint p {
  color: #e8dcc8;
  font-style: italic;
  margin: 0;
  line-height: 1.6;
}

.card-detail-triggers {
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
}

.card-detail-triggers ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card-detail-triggers li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #a89880;
  font-size: 0.9rem;
}

.card-detail-triggers li::before {
  content: '\\25CB';
  position: absolute;
  left: 0;
  color: #666;
}

.card-detail-triggers li.complete {
  color: #90ee90;
}

.card-detail-triggers li.complete::before {
  content: '\\2713';
  color: #90ee90;
}
`;
