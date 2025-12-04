/**
 * NarrativeEventScreen
 *
 * Full-screen overlay for CYOA-style narrative events.
 * Shows event text, choices, and outcomes.
 */

import { Screen } from '@/ui/ScreenManager';
import { NarrativeEvent, NarrativeChoice, EventOutcome } from '@/types/narrativeEvents';
import { AudioManager } from '@/services/AudioManager';

export interface NarrativeEventScreenCallbacks {
  onChoiceSelected: (event: NarrativeEvent, choice: NarrativeChoice) => {
    outcome: EventOutcome;
    rewardDescriptions: string[];
    penaltyDescriptions: string[];
  };
  onEventComplete: () => void;
}

export function createNarrativeEventScreen(
  callbacks: NarrativeEventScreenCallbacks
): Screen & {
  showEvent: (event: NarrativeEvent) => void;
} {
  const element = document.createElement('div');
  element.id = 'narrative-event-screen';
  element.className = 'narrative-event-screen hidden';

  let currentEvent: NarrativeEvent | null = null;

  function render(): void {
    if (!currentEvent) {
      element.innerHTML = '';
      return;
    }

    const speakerClass = currentEvent.content.speakerType || 'environment';
    const speakerName = currentEvent.content.speakerName || '';

    element.innerHTML = `
      <div class="narrative-overlay">
        <div class="narrative-card">
          <div class="narrative-header">
            <h2 class="narrative-title">${currentEvent.title}</h2>
            ${speakerName ? `<span class="narrative-speaker ${speakerClass}">${speakerName}</span>` : ''}
          </div>

          <div class="narrative-content">
            <div class="narrative-text">
              ${formatNarrativeText(currentEvent.content.text)}
            </div>
          </div>

          <div class="narrative-choices">
            ${renderChoices(currentEvent)}
          </div>
        </div>
      </div>
    `;

    // Add choice button listeners
    const choiceButtons = element.querySelectorAll('.narrative-choice-btn');
    choiceButtons.forEach((btn) => {
      btn.addEventListener('click', handleChoiceClick);
    });
  }

  function formatNarrativeText(text: string): string {
    // Convert markdown-style formatting to HTML
    return text
      .split('\n\n')
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
  }

  function renderChoices(event: NarrativeEvent): string {
    if (!event.choices || event.choices.length === 0) {
      // Auto-reward event, just show continue button
      return `
        <button class="narrative-choice-btn continue-btn" data-choice-id="auto">
          Continue
        </button>
      `;
    }

    return event.choices.map((choice) => {
      let costText = '';
      if (choice.hpCost) {
        costText = ` <span class="choice-cost hp-cost">(-${choice.hpCost} HP)</span>`;
      } else if (choice.goldCost) {
        costText = ` <span class="choice-cost gold-cost">(-${choice.goldCost} Gold)</span>`;
      }

      return `
        <button class="narrative-choice-btn"
                data-choice-id="${choice.id}"
                title="${choice.flavorText || ''}">
          <span class="choice-text">${choice.text}</span>${costText}
          ${choice.flavorText ? `<span class="choice-flavor">${choice.flavorText}</span>` : ''}
        </button>
      `;
    }).join('');
  }

  function handleChoiceClick(e: Event): void {
    const button = e.currentTarget as HTMLButtonElement;
    const choiceId = button.dataset.choiceId;

    if (!currentEvent || !choiceId) return;

    AudioManager.playSfx('card-play');

    if (choiceId === 'auto') {
      // Auto-reward event, just complete
      callbacks.onEventComplete();
      return;
    }

    const choice = currentEvent.choices?.find(c => c.id === choiceId);
    if (!choice) return;

    // Resolve the choice and get outcome
    const result = callbacks.onChoiceSelected(currentEvent, choice);

    // Show outcome
    showOutcome(choice, result.outcome, result.rewardDescriptions, result.penaltyDescriptions);
  }

  function showOutcome(
    _choice: NarrativeChoice,
    outcome: EventOutcome,
    rewardDescriptions: string[],
    penaltyDescriptions: string[]
  ): void {
    const choicesContainer = element.querySelector('.narrative-choices');
    if (!choicesContainer) return;

    // Build outcome display
    const hasRewards = rewardDescriptions.length > 0;
    const hasPenalties = penaltyDescriptions.length > 0;

    let outcomeClass = 'neutral';
    if (hasRewards && !hasPenalties) {
      outcomeClass = 'positive';
      AudioManager.playSfx('heal');
    } else if (hasPenalties && !hasRewards) {
      outcomeClass = 'negative';
      AudioManager.playSfx('hit');
    } else if (hasRewards && hasPenalties) {
      outcomeClass = 'mixed';
      AudioManager.playSfx('spell');
    }

    choicesContainer.innerHTML = `
      <div class="narrative-outcome ${outcomeClass}">
        <div class="outcome-text">
          ${formatNarrativeText(outcome.resultText)}
        </div>

        ${hasRewards ? `
          <div class="outcome-rewards">
            ${rewardDescriptions.map(r => `<span class="reward-item">+ ${r}</span>`).join('')}
          </div>
        ` : ''}

        ${hasPenalties ? `
          <div class="outcome-penalties">
            ${penaltyDescriptions.map(p => `<span class="penalty-item">- ${p}</span>`).join('')}
          </div>
        ` : ''}

        <button class="narrative-choice-btn continue-btn" id="outcome-continue-btn">
          Continue
        </button>
      </div>
    `;

    // Add continue button listener
    const continueBtn = element.querySelector('#outcome-continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        AudioManager.playSfx('card-play');
        callbacks.onEventComplete();
      });
    }
  }

  function showEvent(event: NarrativeEvent): void {
    currentEvent = event;
    render();
    element.classList.remove('hidden');

    // Play ambient sound
    AudioManager.playSfx('spell');
  }

  function hide(): void {
    element.classList.add('hidden');
    currentEvent = null;
  }

  return {
    id: 'narrative-event-screen',
    element,
    showEvent,
    onEnter: () => {
      element.classList.remove('hidden');
    },
    onExit: () => {
      hide();
    },
  };
}

/**
 * Get CSS styles for narrative event screen
 * Add these to main.css
 */
export const NARRATIVE_EVENT_STYLES = `
/* Narrative Event Screen */
.narrative-event-screen {
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

.narrative-event-screen.hidden {
  display: none;
}

.narrative-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.narrative-card {
  background: linear-gradient(180deg, #2a1f1a 0%, #1a1412 100%);
  border: 2px solid #8b6914;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 0 40px rgba(139, 105, 20, 0.3),
              inset 0 0 20px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.narrative-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(139, 105, 20, 0.4);
}

.narrative-title {
  color: #d4af37;
  font-size: 1.8rem;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.narrative-speaker {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-style: italic;
}

.narrative-speaker.warden {
  background: rgba(100, 149, 237, 0.2);
  color: #87ceeb;
  border: 1px solid rgba(100, 149, 237, 0.4);
}

.narrative-speaker.character {
  background: rgba(139, 105, 20, 0.2);
  color: #d4af37;
  border: 1px solid rgba(139, 105, 20, 0.4);
}

.narrative-speaker.unknown {
  background: rgba(128, 0, 128, 0.2);
  color: #dda0dd;
  border: 1px solid rgba(128, 0, 128, 0.4);
}

.narrative-speaker.environment {
  background: rgba(34, 139, 34, 0.2);
  color: #90ee90;
  border: 1px solid rgba(34, 139, 34, 0.4);
}

.narrative-content {
  margin-bottom: 1.5rem;
}

.narrative-text {
  color: #e8dcc8;
  font-size: 1.1rem;
  line-height: 1.8;
}

.narrative-text p {
  margin: 0 0 1rem 0;
}

.narrative-text p:last-child {
  margin-bottom: 0;
}

.narrative-text em {
  color: #d4af37;
  font-style: italic;
}

.narrative-text strong {
  color: #87ceeb;
  font-weight: bold;
}

.narrative-choices {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.narrative-choice-btn {
  background: linear-gradient(180deg, #3a2f28 0%, #2a1f1a 100%);
  border: 1px solid #8b6914;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  color: #e8dcc8;
  font-size: 1rem;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.narrative-choice-btn:hover {
  background: linear-gradient(180deg, #4a3f38 0%, #3a2f28 100%);
  border-color: #d4af37;
  transform: translateX(5px);
}

.narrative-choice-btn:active {
  transform: translateX(5px) scale(0.98);
}

.choice-text {
  font-weight: 500;
  color: #d4af37;
}

.choice-cost {
  font-size: 0.85rem;
  font-weight: normal;
}

.choice-cost.hp-cost {
  color: #ff6b6b;
}

.choice-cost.gold-cost {
  color: #ffd700;
}

.choice-flavor {
  font-size: 0.85rem;
  font-style: italic;
  color: #a89880;
}

.continue-btn {
  text-align: center;
  justify-content: center;
  background: linear-gradient(180deg, #2a4a2a 0%, #1a3a1a 100%);
  border-color: #4a8b4a;
}

.continue-btn:hover {
  background: linear-gradient(180deg, #3a5a3a 0%, #2a4a2a 100%);
  border-color: #6aab6a;
}

/* Outcome display */
.narrative-outcome {
  padding: 1rem;
  border-radius: 8px;
  animation: fadeIn 0.3s ease-out;
}

.narrative-outcome.positive {
  background: rgba(34, 139, 34, 0.1);
  border: 1px solid rgba(34, 139, 34, 0.3);
}

.narrative-outcome.negative {
  background: rgba(139, 34, 34, 0.1);
  border: 1px solid rgba(139, 34, 34, 0.3);
}

.narrative-outcome.mixed {
  background: rgba(139, 105, 20, 0.1);
  border: 1px solid rgba(139, 105, 20, 0.3);
}

.narrative-outcome.neutral {
  background: rgba(100, 100, 100, 0.1);
  border: 1px solid rgba(100, 100, 100, 0.3);
}

.outcome-text {
  margin-bottom: 1rem;
}

.outcome-rewards,
.outcome-penalties {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.reward-item {
  background: rgba(34, 139, 34, 0.2);
  color: #90ee90;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.penalty-item {
  background: rgba(139, 34, 34, 0.2);
  color: #ff6b6b;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}
`;
