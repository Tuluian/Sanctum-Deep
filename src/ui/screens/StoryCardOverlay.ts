/**
 * StoryCardOverlay
 *
 * Non-blocking overlay for ambient narrative moments between rooms.
 * Shows brief story text then fades away.
 */

import { StoryCard } from '@/types/narrativeEvents';
import { AudioManager } from '@/services/AudioManager';

export interface StoryCardOverlayCallbacks {
  onDismiss: () => void;
}

export class StoryCardOverlay {
  private element: HTMLElement;
  private callbacks: StoryCardOverlayCallbacks;
  private dismissTimeout: ReturnType<typeof setTimeout> | null = null;
  private isVisible: boolean = false;

  constructor(callbacks: StoryCardOverlayCallbacks) {
    this.callbacks = callbacks;
    this.element = this.createElement();
    document.body.appendChild(this.element);

    // Dismiss on click anywhere
    this.element.addEventListener('click', () => this.dismiss());

    // Dismiss on any key press
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private createElement(): HTMLElement {
    const overlay = document.createElement('div');
    overlay.id = 'story-card-overlay';
    overlay.className = 'story-card-overlay hidden';
    return overlay;
  }

  private handleKeyDown = (_e: KeyboardEvent): void => {
    if (this.isVisible) {
      this.dismiss();
    }
  };

  /**
   * Show a story card
   */
  show(card: StoryCard): void {
    // Clear any existing timeout
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
      this.dismissTimeout = null;
    }

    // Build content based on speaker type
    const speakerIcon = this.getSpeakerIcon(card.speaker);
    const speakerClass = card.speaker;

    this.element.innerHTML = `
      <div class="story-card ${speakerClass}">
        <div class="story-card-icon">${speakerIcon}</div>
        <div class="story-card-text">
          ${this.formatText(card.text)}
        </div>
        <div class="story-card-dismiss">Click or press any key to continue</div>
      </div>
    `;

    // Show with animation
    this.element.classList.remove('hidden');
    this.element.classList.add('entering');
    this.isVisible = true;

    // Play subtle sound
    AudioManager.playSfx('spell');

    // Remove entering class after animation
    setTimeout(() => {
      this.element.classList.remove('entering');
    }, 300);

    // Auto-dismiss after 8 seconds if not interacted with
    this.dismissTimeout = setTimeout(() => {
      this.dismiss();
    }, 8000);
  }

  /**
   * Dismiss the overlay
   */
  dismiss(): void {
    if (!this.isVisible) return;

    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
      this.dismissTimeout = null;
    }

    this.element.classList.add('exiting');
    this.isVisible = false;

    setTimeout(() => {
      this.element.classList.add('hidden');
      this.element.classList.remove('exiting');
      this.callbacks.onDismiss();
    }, 300);
  }

  /**
   * Get icon for speaker type
   */
  private getSpeakerIcon(speaker: string): string {
    switch (speaker) {
      case 'warden':
        return '👁️';
      case 'character':
        return '💭';
      case 'environment':
        return '🏛️';
      case 'lore':
        return '📜';
      default:
        return '✨';
    }
  }

  /**
   * Format narrative text with markdown
   */
  private formatText(text: string): string {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .split('\n\n')
      .map(p => `<p>${p}</p>`)
      .join('');
  }

  /**
   * Check if overlay is currently visible
   */
  isShowing(): boolean {
    return this.isVisible;
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.element.remove();
  }
}

/**
 * Get CSS styles for story card overlay
 * Add these to main.css
 */
export const STORY_CARD_STYLES = `
/* Story Card Overlay */
.story-card-overlay {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  z-index: 900;
  pointer-events: auto;
  display: flex;
  justify-content: center;
}

.story-card-overlay.hidden {
  display: none;
}

.story-card-overlay.entering .story-card {
  animation: storyCardEnter 0.3s ease-out;
}

.story-card-overlay.exiting .story-card {
  animation: storyCardExit 0.3s ease-in forwards;
}

@keyframes storyCardEnter {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes storyCardExit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(30px);
  }
}

.story-card {
  background: linear-gradient(180deg, rgba(42, 31, 26, 0.95) 0%, rgba(26, 20, 18, 0.95) 100%);
  border: 1px solid rgba(139, 105, 20, 0.5);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
  max-width: 650px;
  width: 100%;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.story-card-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
}

.story-card-text {
  flex: 1;
  color: #e8dcc8;
  font-size: 1rem;
  line-height: 1.6;
}

.story-card-text p {
  margin: 0 0 0.75rem 0;
}

.story-card-text p:last-child {
  margin-bottom: 0;
}

.story-card-text em {
  color: #d4af37;
  font-style: italic;
}

.story-card-text strong {
  color: #87ceeb;
  font-weight: bold;
}

.story-card-dismiss {
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  font-size: 0.75rem;
  color: rgba(168, 152, 128, 0.6);
  font-style: italic;
}

/* Speaker-specific styling */
.story-card.warden {
  border-color: rgba(100, 149, 237, 0.5);
  box-shadow: 0 -4px 20px rgba(100, 149, 237, 0.2);
}

.story-card.warden .story-card-icon {
  background: rgba(100, 149, 237, 0.2);
  color: #87ceeb;
}

.story-card.character {
  border-color: rgba(139, 105, 20, 0.5);
  box-shadow: 0 -4px 20px rgba(139, 105, 20, 0.2);
}

.story-card.character .story-card-icon {
  background: rgba(139, 105, 20, 0.2);
  color: #d4af37;
}

.story-card.environment {
  border-color: rgba(34, 139, 34, 0.5);
  box-shadow: 0 -4px 20px rgba(34, 139, 34, 0.2);
}

.story-card.environment .story-card-icon {
  background: rgba(34, 139, 34, 0.2);
  color: #90ee90;
}

.story-card.lore {
  border-color: rgba(128, 0, 128, 0.5);
  box-shadow: 0 -4px 20px rgba(128, 0, 128, 0.2);
}

.story-card.lore .story-card-icon {
  background: rgba(128, 0, 128, 0.2);
  color: #dda0dd;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .story-card {
    padding: 1rem;
  }

  .story-card-text {
    font-size: 0.95rem;
  }

  .story-card-icon {
    width: 2rem;
    height: 2rem;
    font-size: 1.2rem;
  }
}
`;
