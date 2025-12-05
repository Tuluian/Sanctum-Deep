/**
 * CardUnlockPopup
 *
 * A modal popup that displays when a new card is unlocked.
 * Shows the card, narrative text explaining how it was unlocked,
 * and which class(es) can use it.
 */

import { CardUnlockResult } from '@/types/unlocks';
import { AudioManager } from '@/services/AudioManager';
import { CharacterClassId } from '@/types/index';

export interface CardUnlockPopupCallbacks {
  onClose: () => void;
}

/**
 * Get display name for a class ID
 */
function getClassName(classId: CharacterClassId): string {
  const names: Record<CharacterClassId, string> = {
    [CharacterClassId.CLERIC]: 'Cleric',
    [CharacterClassId.DUNGEON_KNIGHT]: 'Dungeon Knight',
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
 * Create a card unlock popup element
 */
export function createCardUnlockPopup(
  unlocks: CardUnlockResult[],
  callbacks: CardUnlockPopupCallbacks
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'card-unlock-popup-overlay';

  // Current index for multi-unlock navigation
  let currentIndex = 0;

  function render(): void {
    const unlock = unlocks[currentIndex];
    const hasMultiple = unlocks.length > 1;

    container.innerHTML = `
      <div class="card-unlock-popup">
        <div class="card-unlock-header">
          <div class="card-unlock-icon">&#10024;</div>
          <h2 class="card-unlock-title">Card Unlocked!</h2>
          ${hasMultiple ? `<div class="card-unlock-counter">${currentIndex + 1} / ${unlocks.length}</div>` : ''}
        </div>

        <div class="card-unlock-content">
          <div class="card-unlock-card-display">
            <div class="card-unlock-card-frame">
              <div class="card-unlock-card-name">${formatCardName(unlock.cardId)}</div>
              <div class="card-unlock-card-image">
                <span class="card-unlock-card-icon">&#9733;</span>
              </div>
              ${unlock.classRestriction ? `
                <div class="card-unlock-class-badge">
                  ${getClassName(unlock.classRestriction)} Only
                </div>
              ` : `
                <div class="card-unlock-class-badge universal">
                  All Classes
                </div>
              `}
            </div>
          </div>

          <div class="card-unlock-narrative">
            <p>${unlock.narrativeText}</p>
          </div>

          <div class="card-unlock-info">
            <p class="card-unlock-pool-info">
              This card has been added to ${unlock.classRestriction ? `the ${getClassName(unlock.classRestriction)}'s` : 'all'} reward pool.
            </p>
          </div>
        </div>

        <div class="card-unlock-actions">
          ${hasMultiple && currentIndex > 0 ? `
            <button class="card-unlock-btn prev-btn" id="unlock-prev-btn">
              &#8592; Previous
            </button>
          ` : ''}
          ${hasMultiple && currentIndex < unlocks.length - 1 ? `
            <button class="card-unlock-btn next-btn" id="unlock-next-btn">
              Next &#8594;
            </button>
          ` : `
            <button class="card-unlock-btn continue-btn" id="unlock-continue-btn">
              Continue
            </button>
          `}
        </div>
      </div>
    `;

    // Add event listeners
    const prevBtn = container.querySelector('#unlock-prev-btn');
    const nextBtn = container.querySelector('#unlock-next-btn');
    const continueBtn = container.querySelector('#unlock-continue-btn');

    prevBtn?.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        AudioManager.playSfx('card-play');
        render();
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (currentIndex < unlocks.length - 1) {
        currentIndex++;
        AudioManager.playSfx('card-play');
        render();
      }
    });

    continueBtn?.addEventListener('click', () => {
      AudioManager.playSfx('card-play');
      callbacks.onClose();
    });
  }

  render();

  // Play unlock sound
  AudioManager.playSfx('heal');

  return container;
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
 * Show card unlock popup(s) and return a promise that resolves when closed
 */
export function showCardUnlockPopup(unlocks: CardUnlockResult[]): Promise<void> {
  if (unlocks.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const popup = createCardUnlockPopup(unlocks, {
      onClose: () => {
        popup.remove();
        resolve();
      },
    });
    document.body.appendChild(popup);
  });
}

/**
 * CSS styles for the card unlock popup
 * Add these to main.css
 */
export const CARD_UNLOCK_POPUP_STYLES = `
/* Card Unlock Popup Overlay */
.card-unlock-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

/* Card Unlock Popup Container */
.card-unlock-popup {
  background: linear-gradient(180deg, #2a1f1a 0%, #1a1412 100%);
  border: 3px solid #d4af37;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  padding: 2rem;
  box-shadow: 0 0 60px rgba(212, 175, 55, 0.4),
              inset 0 0 30px rgba(0, 0, 0, 0.5);
  animation: unlockSlideIn 0.5s ease-out;
}

@keyframes unlockSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.card-unlock-header {
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.card-unlock-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  animation: sparkle 1s infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
}

.card-unlock-title {
  color: #d4af37;
  font-size: 1.8rem;
  margin: 0;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.card-unlock-counter {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

/* Content */
.card-unlock-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Card Display */
.card-unlock-card-display {
  display: flex;
  justify-content: center;
}

.card-unlock-card-frame {
  background: linear-gradient(135deg, #3a2f28 0%, #2a1f1a 100%);
  border: 2px solid #d4af37;
  border-radius: 8px;
  padding: 1rem;
  width: 140px;
  text-align: center;
  animation: cardReveal 0.6s ease-out 0.2s both;
}

@keyframes cardReveal {
  from {
    opacity: 0;
    transform: rotateY(90deg);
  }
  to {
    opacity: 1;
    transform: rotateY(0);
  }
}

.card-unlock-card-name {
  color: #d4af37;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-unlock-card-image {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  padding: 1.5rem;
  margin-bottom: 0.75rem;
}

.card-unlock-card-icon {
  font-size: 2.5rem;
  color: #d4af37;
}

.card-unlock-class-badge {
  background: rgba(100, 149, 237, 0.2);
  color: #87ceeb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  border: 1px solid rgba(100, 149, 237, 0.4);
}

.card-unlock-class-badge.universal {
  background: rgba(34, 139, 34, 0.2);
  color: #90ee90;
  border-color: rgba(34, 139, 34, 0.4);
}

/* Narrative Text */
.card-unlock-narrative {
  background: rgba(0, 0, 0, 0.3);
  border-left: 3px solid #d4af37;
  padding: 1rem;
  border-radius: 0 8px 8px 0;
}

.card-unlock-narrative p {
  color: #e8dcc8;
  font-style: italic;
  line-height: 1.6;
  margin: 0;
}

/* Info */
.card-unlock-info {
  text-align: center;
}

.card-unlock-pool-info {
  color: #a89880;
  font-size: 0.9rem;
  margin: 0;
}

/* Actions */
.card-unlock-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.card-unlock-btn {
  background: linear-gradient(180deg, #3a2f28 0%, #2a1f1a 100%);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: #d4af37;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.card-unlock-btn:hover {
  background: linear-gradient(180deg, #4a3f38 0%, #3a2f28 100%);
  border-color: #d4af37;
  transform: translateY(-2px);
}

.card-unlock-btn:active {
  transform: translateY(0);
}

.card-unlock-btn.continue-btn {
  background: linear-gradient(180deg, #2a4a2a 0%, #1a3a1a 100%);
  border-color: #4a8b4a;
}

.card-unlock-btn.continue-btn:hover {
  background: linear-gradient(180deg, #3a5a3a 0%, #2a4a2a 100%);
  border-color: #6aab6a;
}
`;
