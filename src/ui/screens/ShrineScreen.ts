/**
 * ShrineScreen
 *
 * Full-screen UI for shrine events. Displays shrine description,
 * choices, and outcomes with appropriate styling.
 */

import { Screen } from '@/ui/ScreenManager';
import {
  ShrineDefinition,
  ShrineChoice,
  ShrineOutcome,
  PreparedShrine,
} from '@/types/shrines';
import { AudioManager } from '@/services/AudioManager';

export interface ShrineScreenCallbacks {
  onChoiceSelected: (
    shrine: ShrineDefinition,
    choice: ShrineChoice
  ) => {
    outcome: ShrineOutcome;
    rewardDescriptions: string[];
    costDescriptions: string[];
    loreFragment?: string;
  };
  onShrineComplete: () => void;
  canAffordChoice: (choice: ShrineChoice) => { canAfford: boolean; reason?: string };
}

export function createShrineScreen(callbacks: ShrineScreenCallbacks): Screen & {
  showShrine: (preparedShrine: PreparedShrine) => void;
} {
  const element = document.createElement('div');
  element.id = 'shrine-screen';
  element.className = 'shrine-screen hidden';

  let currentShrine: PreparedShrine | null = null;

  function render(): void {
    if (!currentShrine) {
      element.innerHTML = '';
      return;
    }

    const { shrine, additionalText, warningText, availableChoices } = currentShrine;

    element.innerHTML = `
      <div class="shrine-overlay">
        <div class="shrine-card">
          <div class="shrine-header">
            <h2 class="shrine-title">${shrine.name}</h2>
            <span class="shrine-act">Act ${shrine.act}</span>
          </div>

          <div class="shrine-content">
            <div class="shrine-description">
              ${formatText(shrine.description)}
            </div>

            ${shrine.wardenWhisper ? `
              <div class="shrine-warden-whisper">
                <span class="warden-label">The Warden whispers:</span>
                <p class="warden-text">"${shrine.wardenWhisper.text}"</p>
              </div>
            ` : ''}

            ${additionalText ? `
              <div class="shrine-class-text">
                <p>${formatText(additionalText)}</p>
              </div>
            ` : ''}

            ${warningText ? `
              <div class="shrine-warning">
                <span class="warning-icon">⚠️</span>
                <span class="warning-text">${warningText}</span>
              </div>
            ` : ''}

            <div class="shrine-prompt">
              ${formatText(shrine.prompt)}
            </div>
          </div>

          <div class="shrine-choices">
            ${renderChoices(availableChoices)}
          </div>
        </div>
      </div>
    `;

    // Add choice button listeners
    const choiceButtons = element.querySelectorAll('.shrine-choice-btn');
    choiceButtons.forEach((btn) => {
      btn.addEventListener('click', handleChoiceClick);
    });
  }

  function formatText(text: string): string {
    // Convert markdown-style formatting to HTML
    return text
      .split('\n\n')
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\\n/g, '<br>');
  }

  function renderChoices(choices: ShrineChoice[]): string {
    return choices
      .map((choice) => {
        const affordability = callbacks.canAffordChoice(choice);
        const disabledClass = affordability.canAfford ? '' : 'disabled';
        const disabledTitle = affordability.canAfford ? '' : affordability.reason;

        let costText = '';
        if (choice.hpCost) {
          costText = ` <span class="choice-cost hp-cost">(-${choice.hpCost} HP)</span>`;
        } else if (choice.hpPercentCost) {
          costText = ` <span class="choice-cost hp-cost">(-${Math.round(choice.hpPercentCost * 100)}% Max HP)</span>`;
        } else if (choice.goldCost) {
          costText = ` <span class="choice-cost gold-cost">(-${choice.goldCost} Gold)</span>`;
        }

        return `
          <button class="shrine-choice-btn ${disabledClass}"
                  data-choice-id="${choice.id}"
                  ${disabledTitle ? `title="${disabledTitle}"` : ''}>
            <span class="choice-text">${choice.text}</span>${costText}
            ${choice.flavorText ? `<span class="choice-flavor">${choice.flavorText}</span>` : ''}
          </button>
        `;
      })
      .join('');
  }

  function handleChoiceClick(e: Event): void {
    const button = e.currentTarget as HTMLButtonElement;
    const choiceId = button.dataset.choiceId;

    if (!currentShrine || !choiceId) return;
    if (button.classList.contains('disabled')) return;

    const choice = currentShrine.availableChoices.find((c) => c.id === choiceId);
    if (!choice) return;

    AudioManager.playSfx('card-play');

    // Resolve the choice and get outcome
    const result = callbacks.onChoiceSelected(currentShrine.shrine, choice);

    // Show outcome
    showOutcome(
      choice,
      result.outcome,
      result.rewardDescriptions,
      result.costDescriptions,
      result.loreFragment
    );
  }

  function showOutcome(
    _choice: ShrineChoice,
    outcome: ShrineOutcome,
    rewardDescriptions: string[],
    costDescriptions: string[],
    loreFragment?: string
  ): void {
    const choicesContainer = element.querySelector('.shrine-choices');
    if (!choicesContainer) return;

    // Build outcome display
    const hasRewards = rewardDescriptions.length > 0;
    const hasCosts = costDescriptions.length > 0;

    let outcomeClass = 'neutral';
    if (hasRewards && !hasCosts) {
      outcomeClass = 'positive';
      AudioManager.playSfx('heal');
    } else if (hasCosts && !hasRewards) {
      outcomeClass = 'negative';
      AudioManager.playSfx('hit');
    } else if (hasRewards && hasCosts) {
      outcomeClass = 'mixed';
      AudioManager.playSfx('spell');
    }

    choicesContainer.innerHTML = `
      <div class="shrine-outcome ${outcomeClass}">
        <div class="outcome-text">
          ${formatText(outcome.resultText)}
        </div>

        ${hasRewards ? `
          <div class="outcome-rewards">
            ${rewardDescriptions.map((r) => `<span class="reward-item">+ ${r}</span>`).join('')}
          </div>
        ` : ''}

        ${hasCosts ? `
          <div class="outcome-costs">
            ${costDescriptions.map((c) => `<span class="cost-item">- ${c}</span>`).join('')}
          </div>
        ` : ''}

        ${loreFragment ? `
          <div class="outcome-lore">
            <span class="lore-label">You learn:</span>
            <p class="lore-text">${formatText(loreFragment)}</p>
          </div>
        ` : ''}

        <button class="shrine-choice-btn continue-btn" id="shrine-continue-btn">
          Continue
        </button>
      </div>
    `;

    // Add continue button listener
    const continueBtn = element.querySelector('#shrine-continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        AudioManager.playSfx('card-play');
        callbacks.onShrineComplete();
      });
    }
  }

  function showShrine(preparedShrine: PreparedShrine): void {
    currentShrine = preparedShrine;
    render();
    element.classList.remove('hidden');

    // Play ambient sound
    AudioManager.playSfx('spell');
  }

  function hide(): void {
    element.classList.add('hidden');
    currentShrine = null;
  }

  return {
    id: 'shrine-screen',
    element,
    showShrine,
    onEnter: () => {
      element.classList.remove('hidden');
    },
    onExit: () => {
      hide();
    },
  };
}

/**
 * CSS styles for shrine screen
 * These should be added to main.css
 */
export const SHRINE_SCREEN_STYLES = `
/* Shrine Screen */
.shrine-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.shrine-screen.hidden {
  display: none;
}

.shrine-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: shrineOverlayFade 0.4s ease-out;
}

@keyframes shrineOverlayFade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.shrine-card {
  background: linear-gradient(180deg, #2d2420 0%, #1a1412 100%);
  border: 2px solid #6a5a4a;
  border-radius: 16px;
  max-width: 750px;
  width: 92%;
  max-height: 88vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 0 60px rgba(106, 90, 74, 0.3),
              0 0 120px rgba(139, 105, 20, 0.1),
              inset 0 0 30px rgba(0, 0, 0, 0.5);
  animation: shrineSlideIn 0.5s ease-out;
}

@keyframes shrineSlideIn {
  from {
    opacity: 0;
    transform: translateY(-40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.shrine-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(139, 105, 20, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.shrine-title {
  color: #d4af37;
  font-size: 2rem;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  font-weight: 600;
}

.shrine-act {
  background: rgba(139, 105, 20, 0.2);
  color: #a89880;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  border: 1px solid rgba(139, 105, 20, 0.3);
}

.shrine-content {
  margin-bottom: 1.5rem;
}

.shrine-description {
  color: #e8dcc8;
  font-size: 1.15rem;
  line-height: 1.9;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.shrine-description p {
  margin: 0 0 0.75rem 0;
}

.shrine-warden-whisper {
  background: rgba(100, 149, 237, 0.1);
  border-left: 3px solid #6495ed;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  border-radius: 0 8px 8px 0;
}

.warden-label {
  color: #87ceeb;
  font-size: 0.85rem;
  display: block;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.warden-text {
  color: #b8d4f0;
  margin: 0;
  font-style: italic;
  line-height: 1.7;
}

.shrine-class-text {
  background: rgba(139, 105, 20, 0.15);
  border-left: 3px solid #d4af37;
  padding: 1rem 1.25rem;
  margin-bottom: 1.5rem;
  border-radius: 0 8px 8px 0;
}

.shrine-class-text p {
  margin: 0;
  color: #d4c4a8;
  font-style: italic;
}

.shrine-warning {
  background: rgba(220, 53, 69, 0.15);
  border: 1px solid rgba(220, 53, 69, 0.4);
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.warning-icon {
  font-size: 1.2rem;
}

.warning-text {
  color: #ff9999;
  font-style: italic;
}

.shrine-prompt {
  color: #f0e6d8;
  font-size: 1.2rem;
  line-height: 1.7;
  padding: 1rem 1.25rem;
  background: rgba(139, 105, 20, 0.1);
  border-radius: 8px;
  text-align: center;
}

.shrine-prompt p {
  margin: 0;
}

/* Shrine Choices */
.shrine-choices {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.shrine-choice-btn {
  background: linear-gradient(180deg, #3a2f28 0%, #2a1f1a 100%);
  border: 1px solid #6a5a4a;
  border-radius: 10px;
  padding: 1.1rem 1.4rem;
  color: #e8dcc8;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.shrine-choice-btn:hover:not(.disabled) {
  background: linear-gradient(180deg, #4a3f38 0%, #3a2f28 100%);
  border-color: #d4af37;
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.shrine-choice-btn:active:not(.disabled) {
  transform: translateX(6px) scale(0.98);
}

.shrine-choice-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.choice-text {
  font-weight: 600;
  color: #d4af37;
  font-size: 1.05rem;
}

.choice-cost {
  font-size: 0.9rem;
  font-weight: normal;
  margin-left: 0.5rem;
}

.choice-cost.hp-cost {
  color: #ff6b6b;
}

.choice-cost.gold-cost {
  color: #ffd700;
}

.choice-flavor {
  font-size: 0.9rem;
  font-style: italic;
  color: #a89880;
}

.continue-btn {
  text-align: center;
  justify-content: center;
  background: linear-gradient(180deg, #2a4a2a 0%, #1a3a1a 100%);
  border-color: #4a8b4a;
  margin-top: 0.5rem;
}

.continue-btn:hover {
  background: linear-gradient(180deg, #3a5a3a 0%, #2a4a2a 100%);
  border-color: #6aab6a;
}

/* Outcome display */
.shrine-outcome {
  padding: 1.25rem;
  border-radius: 10px;
  animation: shrineOutcomeFade 0.3s ease-out;
}

@keyframes shrineOutcomeFade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.shrine-outcome.positive {
  background: rgba(34, 139, 34, 0.12);
  border: 1px solid rgba(34, 139, 34, 0.35);
}

.shrine-outcome.negative {
  background: rgba(139, 34, 34, 0.12);
  border: 1px solid rgba(139, 34, 34, 0.35);
}

.shrine-outcome.mixed {
  background: rgba(139, 105, 20, 0.12);
  border: 1px solid rgba(139, 105, 20, 0.35);
}

.shrine-outcome.neutral {
  background: rgba(100, 100, 100, 0.12);
  border: 1px solid rgba(100, 100, 100, 0.35);
}

.outcome-text {
  margin-bottom: 1rem;
  color: #e8dcc8;
  line-height: 1.7;
}

.outcome-text p {
  margin: 0;
}

.outcome-rewards,
.outcome-costs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reward-item {
  background: rgba(34, 139, 34, 0.25);
  color: #90ee90;
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  font-size: 0.9rem;
}

.cost-item {
  background: rgba(139, 34, 34, 0.25);
  color: #ff6b6b;
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  font-size: 0.9rem;
}

.outcome-lore {
  background: rgba(100, 149, 237, 0.1);
  border-left: 3px solid #6495ed;
  padding: 1rem 1.25rem;
  margin: 1rem 0;
  border-radius: 0 8px 8px 0;
}

.lore-label {
  color: #87ceeb;
  font-size: 0.85rem;
  display: block;
  margin-bottom: 0.5rem;
  font-style: italic;
}

.lore-text {
  color: #c8d8f0;
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.7;
  white-space: pre-wrap;
}
`;
