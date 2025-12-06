/**
 * TutorialOverlay - Shows contextual hints during tutorial combat
 */

export interface TutorialStep {
  id: string;
  message: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  waitFor?: 'click' | 'action' | 'turn'; // What triggers moving to next step
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    message: 'Welcome to Sanctum Ruins! This tutorial will teach you the basics.',
    position: 'center',
    waitFor: 'click',
  },
  {
    id: 'cards',
    message: 'These are your cards. Each card has a cost (top-left) and an effect.',
    target: '.hand-area',
    position: 'top',
    waitFor: 'click',
  },
  {
    id: 'resolve',
    message: 'You have 3 Resolve (⚡) per turn. Playing cards costs Resolve.',
    target: '#hud-resolve',
    position: 'right',
    waitFor: 'click',
  },
  {
    id: 'enemy',
    message: 'This is your enemy. The icon above shows what they plan to do next turn.',
    target: '.enemy-slot',
    position: 'bottom',
    waitFor: 'click',
  },
  {
    id: 'play-card',
    message: 'Click a card to select it, then click the enemy to attack!',
    target: '.hand-area',
    position: 'top',
    waitFor: 'action',
  },
  {
    id: 'end-turn',
    message: 'When you\'re done playing cards, click "End Turn" to let the enemy act.',
    target: '#end-turn-btn',
    position: 'left',
    waitFor: 'click',
  },
  {
    id: 'block',
    message: 'Defend cards give you Block (🛡️). Block absorbs damage before your HP.',
    position: 'center',
    waitFor: 'click',
  },
  {
    id: 'finish',
    message: 'Defeat the enemy to complete the tutorial. Good luck!',
    position: 'center',
    waitFor: 'click',
  },
];

class TutorialOverlayClass {
  private overlay: HTMLElement | null = null;
  private currentStepIndex: number = 0;
  private isActive: boolean = false;

  /**
   * Start the tutorial overlay
   */
  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.currentStepIndex = 0;
    this.createOverlay();
    this.showStep(0);
  }

  /**
   * Stop and remove the tutorial overlay
   */
  stop(): void {
    this.isActive = false;
    this.removeOverlay();
    this.removeHighlight();
  }

  /**
   * Check if tutorial is active
   */
  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * Notify that player performed an action (for waitFor: 'action')
   */
  notifyAction(): void {
    if (!this.isActive) return;

    const currentStep = TUTORIAL_STEPS[this.currentStepIndex];
    if (currentStep?.waitFor === 'action') {
      this.nextStep();
    }
  }

  /**
   * Notify that turn ended (for waitFor: 'turn')
   */
  notifyTurnEnd(): void {
    if (!this.isActive) return;

    const currentStep = TUTORIAL_STEPS[this.currentStepIndex];
    if (currentStep?.waitFor === 'turn') {
      this.nextStep();
    }
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.innerHTML = `
      <div class="tutorial-backdrop"></div>
      <div class="tutorial-hint">
        <div class="tutorial-hint-text"></div>
        <div class="tutorial-hint-continue">Click to continue</div>
      </div>
    `;

    // Click handler for advancing steps
    this.overlay.addEventListener('click', (e) => {
      const currentStep = TUTORIAL_STEPS[this.currentStepIndex];
      if (currentStep?.waitFor === 'click') {
        e.stopPropagation();
        this.nextStep();
      }
    });

    document.body.appendChild(this.overlay);
  }

  private removeOverlay(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  private showStep(index: number): void {
    if (!this.overlay || index >= TUTORIAL_STEPS.length) {
      this.stop();
      return;
    }

    const step = TUTORIAL_STEPS[index];
    const hintEl = this.overlay.querySelector('.tutorial-hint') as HTMLElement;
    const textEl = this.overlay.querySelector('.tutorial-hint-text') as HTMLElement;
    const continueEl = this.overlay.querySelector('.tutorial-hint-continue') as HTMLElement;

    if (!hintEl || !textEl) return;

    // Update text
    textEl.textContent = step.message;

    // Show/hide continue prompt based on waitFor
    if (continueEl) {
      continueEl.style.display = step.waitFor === 'click' ? 'block' : 'none';
    }

    // Remove previous highlight
    this.removeHighlight();

    // Position the hint
    this.positionHint(hintEl, step);

    // Highlight target element if specified
    if (step.target) {
      this.highlightElement(step.target);
    }
  }

  private positionHint(hintEl: HTMLElement, step: TutorialStep): void {
    // Reset positioning
    hintEl.style.top = '';
    hintEl.style.bottom = '';
    hintEl.style.left = '';
    hintEl.style.right = '';
    hintEl.style.transform = '';

    if (step.target && step.position !== 'center') {
      const targetEl = document.querySelector(step.target);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();

        switch (step.position) {
          case 'top':
            hintEl.style.bottom = `${window.innerHeight - rect.top + 20}px`;
            hintEl.style.left = `${rect.left + rect.width / 2}px`;
            hintEl.style.transform = 'translateX(-50%)';
            break;
          case 'bottom':
            hintEl.style.top = `${rect.bottom + 20}px`;
            hintEl.style.left = `${rect.left + rect.width / 2}px`;
            hintEl.style.transform = 'translateX(-50%)';
            break;
          case 'left':
            hintEl.style.top = `${rect.top + rect.height / 2}px`;
            hintEl.style.right = `${window.innerWidth - rect.left + 20}px`;
            hintEl.style.transform = 'translateY(-50%)';
            break;
          case 'right':
            hintEl.style.top = `${rect.top + rect.height / 2}px`;
            hintEl.style.left = `${rect.right + 20}px`;
            hintEl.style.transform = 'translateY(-50%)';
            break;
        }
        return;
      }
    }

    // Default: center
    hintEl.style.top = '50%';
    hintEl.style.left = '50%';
    hintEl.style.transform = 'translate(-50%, -50%)';
  }

  private highlightElement(selector: string): void {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add('tutorial-highlight');
    }
  }

  private removeHighlight(): void {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
  }

  private nextStep(): void {
    this.currentStepIndex++;

    if (this.currentStepIndex >= TUTORIAL_STEPS.length) {
      this.stop();
    } else {
      this.showStep(this.currentStepIndex);
    }
  }
}

export const TutorialOverlay = new TutorialOverlayClass();
