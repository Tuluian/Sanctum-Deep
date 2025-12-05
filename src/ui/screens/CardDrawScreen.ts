/**
 * CardDrawScreen
 *
 * Displays card draw opportunity after each run (win or lose).
 * Shows 3 cards, player picks 1 to add to their collection.
 */

import { Screen } from '@/ui/ScreenManager';
import { CharacterClassId, CardType, CardRarity } from '@/types';
import { drawCardsForRun, selectDrawnCard, DrawnCard } from '@/services/CardDrawService';
import { AudioManager } from '@/services/AudioManager';

export interface CardDrawScreenCallbacks {
  onComplete: () => void;
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
 * Get card type display color
 */
function getCardTypeColor(type: CardType): string {
  switch (type) {
    case CardType.ATTACK:
      return '#ff6b6b';
    case CardType.SKILL:
      return '#6baaff';
    case CardType.POWER:
      return '#ffd700';
    case CardType.CURSE:
      return '#9b59b6';
    default:
      return '#ffffff';
  }
}

/**
 * Get rarity display color
 */
function getRarityColor(rarity?: CardRarity): string {
  switch (rarity) {
    case CardRarity.COMMON:
      return '#a89880';
    case CardRarity.UNCOMMON:
      return '#4CAF50';
    case CardRarity.RARE:
      return '#FFD700';
    default:
      return '#a89880';
  }
}

/**
 * Create the card draw screen
 */
export function createCardDrawScreen(
  callbacks: CardDrawScreenCallbacks
): Screen {
  const element = document.createElement('div');
  element.id = 'card-draw-screen';
  element.className = 'card-draw-screen';

  let drawnCards: DrawnCard[] = [];
  let selectedIndex: number | null = null;
  let classId: CharacterClassId = CharacterClassId.CLERIC;
  let isVictory = false;
  let hasConfirmed = false;

  /**
   * Initialize the draw with the run's class and outcome
   */
  function initializeDraw(runClassId: CharacterClassId, victory: boolean): void {
    classId = runClassId;
    isVictory = victory;
    drawnCards = drawCardsForRun(classId, isVictory);
    selectedIndex = null;
    hasConfirmed = false;
    render();
  }

  function render(): void {
    const title = isVictory ? 'Victory Reward!' : 'Consolation Prize';
    const subtitle = isVictory
      ? 'Choose a card to add to your collection'
      : 'Even in defeat, experience grants knowledge';

    element.innerHTML = `
      <div class="card-draw-container">
        <header class="card-draw-header">
          <h1 class="card-draw-title ${isVictory ? 'victory' : 'defeat'}">${title}</h1>
          <p class="card-draw-subtitle">${subtitle}</p>
          <p class="card-draw-class">Playing as: <strong>${getClassName(classId)}</strong></p>
        </header>

        ${drawnCards.length === 0 ? `
          <div class="card-draw-empty">
            <p>No cards available to draw.</p>
            <button class="card-draw-skip-btn" id="skip-draw-btn">Continue</button>
          </div>
        ` : `
          <div class="card-draw-cards">
            ${drawnCards.map((drawn, index) => renderCard(drawn, index)).join('')}
          </div>

          <div class="card-draw-actions">
            ${selectedIndex !== null ? `
              <button class="card-draw-confirm-btn" id="confirm-draw-btn">
                Add to Collection
              </button>
            ` : `
              <p class="card-draw-prompt">Select a card to add to your collection</p>
            `}
            <button class="card-draw-skip-btn secondary" id="skip-draw-btn">
              Skip (No Card)
            </button>
          </div>
        `}

        ${hasConfirmed ? renderConfirmation() : ''}
      </div>
    `;

    // Add event listeners
    element.querySelectorAll('.draw-card').forEach((card, index) => {
      card.addEventListener('click', () => {
        if (!hasConfirmed) {
          AudioManager.playSfx('card-play');
          selectedIndex = selectedIndex === index ? null : index;
          render();
        }
      });
    });

    const confirmBtn = element.querySelector('#confirm-draw-btn');
    confirmBtn?.addEventListener('click', () => {
      if (selectedIndex !== null && !hasConfirmed) {
        AudioManager.playSfx('card-play');
        const drawn = drawnCards[selectedIndex];
        const result = selectDrawnCard(classId, drawn.card.id);
        drawn.duplicateBonus = result.duplicateSoulEchoes;
        hasConfirmed = true;
        render();
      }
    });

    const skipBtn = element.querySelector('#skip-draw-btn');
    skipBtn?.addEventListener('click', () => {
      AudioManager.playSfx('card-play');
      callbacks.onComplete();
    });

    const continueBtn = element.querySelector('#continue-btn');
    continueBtn?.addEventListener('click', () => {
      AudioManager.playSfx('card-play');
      callbacks.onComplete();
    });
  }

  function renderCard(drawn: DrawnCard, index: number): string {
    const card = drawn.card;
    const isSelected = selectedIndex === index;
    const typeColor = getCardTypeColor(card.type);
    const rarityColor = getRarityColor(card.rarity);

    return `
      <div class="draw-card ${isSelected ? 'selected' : ''} ${drawn.isNew ? 'new' : 'duplicate'}"
           data-index="${index}">
        ${drawn.isNew ? '<div class="new-badge">NEW!</div>' : '<div class="duplicate-badge">+5 Echoes</div>'}
        <div class="draw-card-cost">${card.cost}</div>
        <div class="draw-card-name" style="color: ${typeColor}">${card.name}</div>
        <div class="draw-card-type">${card.type}</div>
        <div class="draw-card-description">${card.description}</div>
        <div class="draw-card-rarity" style="color: ${rarityColor}">
          ${(card.rarity || 'common').toUpperCase()}
        </div>
      </div>
    `;
  }

  function renderConfirmation(): string {
    if (selectedIndex === null) return '';
    const drawn = drawnCards[selectedIndex];

    return `
      <div class="card-draw-confirmation-overlay">
        <div class="card-draw-confirmation">
          <div class="confirmation-icon">✓</div>
          <h2>${drawn.isNew ? 'New Card Unlocked!' : 'Duplicate Collected!'}</h2>
          <p class="confirmation-card-name">${drawn.card.name}</p>
          ${drawn.isNew ? `
            <p class="confirmation-message">Added to your ${getClassName(classId)} collection!</p>
          ` : `
            <p class="confirmation-message">+${drawn.duplicateBonus || 5} Soul Echoes</p>
          `}
          <button class="card-draw-confirm-btn" id="continue-btn">Continue</button>
        </div>
      </div>
    `;
  }

  // Expose initialization function
  (element as unknown as HTMLElement & { initializeDraw: typeof initializeDraw }).initializeDraw = initializeDraw;

  return {
    id: 'card-draw-screen',
    element,
    onEnter: () => {
      // Initial render - actual initialization will be called by the game
      render();
    },
    onExit: () => {
      drawnCards = [];
      selectedIndex = null;
      hasConfirmed = false;
    },
  };
}

/**
 * CSS styles for the card draw screen
 */
export const CARD_DRAW_SCREEN_STYLES = `
/* Card Draw Screen */
.card-draw-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(180deg, #1a1412 0%, #0d0a08 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.card-draw-container {
  max-width: 900px;
  width: 90%;
  text-align: center;
  padding: 2rem;
}

/* Header */
.card-draw-header {
  margin-bottom: 2rem;
}

.card-draw-title {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 0 20px currentColor;
}

.card-draw-title.victory {
  color: #d4af37;
}

.card-draw-title.defeat {
  color: #8b7355;
}

.card-draw-subtitle {
  color: #a89880;
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
}

.card-draw-class {
  color: #6baaff;
  font-size: 0.95rem;
  margin: 0;
}

/* Cards Container */
.card-draw-cards {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

/* Individual Card */
.draw-card {
  background: linear-gradient(180deg, #3a2f28 0%, #2a1f1a 100%);
  border: 3px solid #5a4a3a;
  border-radius: 12px;
  padding: 1rem;
  width: 200px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.draw-card:hover {
  transform: translateY(-8px);
  border-color: #8b6914;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.2);
}

.draw-card.selected {
  transform: translateY(-12px) scale(1.05);
  border-color: #d4af37;
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.4);
}

.draw-card.new {
  border-color: #4CAF50;
}

.draw-card.new.selected {
  border-color: #8BC34A;
  box-shadow: 0 12px 32px rgba(139, 195, 74, 0.4);
}

/* Badges */
.new-badge,
.duplicate-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
}

.new-badge {
  background: #4CAF50;
  color: white;
}

.duplicate-badge {
  background: #d4af37;
  color: #1a1412;
}

/* Card Content */
.draw-card-cost {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 28px;
  height: 28px;
  background: #1a1412;
  border: 2px solid #d4af37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #d4af37;
}

.draw-card-name {
  font-size: 1rem;
  font-weight: bold;
  margin: 0.5rem 0;
  padding-top: 1rem;
}

.draw-card-type {
  color: #a89880;
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}

.draw-card-description {
  color: #e8dcc8;
  font-size: 0.85rem;
  line-height: 1.4;
  min-height: 60px;
  margin-bottom: 0.75rem;
}

.draw-card-rarity {
  font-size: 0.75rem;
  font-weight: bold;
  letter-spacing: 1px;
}

/* Actions */
.card-draw-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.card-draw-prompt {
  color: #a89880;
  font-size: 1rem;
  margin: 0;
}

.card-draw-confirm-btn {
  background: linear-gradient(180deg, #d4af37 0%, #8b6914 100%);
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  color: #1a1412;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-draw-confirm-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
}

.card-draw-skip-btn {
  background: transparent;
  border: 2px solid #5a4a3a;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  color: #a89880;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-draw-skip-btn:hover {
  border-color: #8b6914;
  color: #d4af37;
}

.card-draw-skip-btn.secondary {
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
}

/* Empty State */
.card-draw-empty {
  padding: 3rem;
  color: #a89880;
}

.card-draw-empty p {
  margin-bottom: 1.5rem;
}

/* Confirmation Overlay */
.card-draw-confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  animation: fadeIn 0.3s ease;
}

.card-draw-confirmation {
  background: linear-gradient(180deg, #2a1f1a 0%, #1a1412 100%);
  border: 2px solid #d4af37;
  border-radius: 16px;
  padding: 2rem 3rem;
  text-align: center;
  animation: slideUp 0.3s ease;
}

.confirmation-icon {
  width: 60px;
  height: 60px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin: 0 auto 1rem auto;
}

.card-draw-confirmation h2 {
  color: #d4af37;
  margin: 0 0 0.5rem 0;
}

.confirmation-card-name {
  color: #e8dcc8;
  font-size: 1.2rem;
  font-weight: bold;
  margin: 0 0 0.5rem 0;
}

.confirmation-message {
  color: #a89880;
  margin: 0 0 1.5rem 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
