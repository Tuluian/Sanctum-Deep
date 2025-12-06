/**
 * WardenDialogue - Component for displaying Warden dialogue sequences
 */

import { DialogueLine } from '@/data/tutorialDialogue';
import { AudioManager } from '@/services/AudioManager';

export interface WardenDialogueOptions {
  onComplete?: () => void;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

/**
 * Create and show a Warden dialogue overlay
 */
export function showWardenDialogue(
  dialogues: DialogueLine[],
  options: WardenDialogueOptions = {}
): HTMLElement {
  const { onComplete, autoAdvance = false, autoAdvanceDelay = 3000 } = options;

  let currentIndex = 0;
  const overlay = document.createElement('div');
  overlay.className = 'warden-dialogue-overlay';

  const container = document.createElement('div');
  container.className = 'warden-dialogue-container';

  // Warden portrait area
  const portrait = document.createElement('div');
  portrait.className = 'warden-portrait';
  portrait.innerHTML = `
    <div class="warden-figure"></div>
  `;

  // Dialogue content area
  const content = document.createElement('div');
  content.className = 'warden-dialogue-content';

  // Stage direction
  const stageDirection = document.createElement('div');
  stageDirection.className = 'warden-stage-direction';

  // Speaker name
  const speakerName = document.createElement('div');
  speakerName.className = 'warden-speaker-name';

  // Dialogue text
  const text = document.createElement('div');
  text.className = 'warden-dialogue-text';

  // Continue prompt
  const continuePrompt = document.createElement('div');
  continuePrompt.className = 'warden-continue-prompt';
  continuePrompt.textContent = 'Click to continue...';

  content.appendChild(stageDirection);
  content.appendChild(speakerName);
  content.appendChild(text);
  content.appendChild(continuePrompt);

  container.appendChild(portrait);
  container.appendChild(content);
  overlay.appendChild(container);

  // Render current dialogue
  const renderDialogue = (index: number) => {
    const dialogue = dialogues[index];
    if (!dialogue) return;

    // Update stage direction
    if (dialogue.stageDirection) {
      stageDirection.textContent = `[${dialogue.stageDirection}]`;
      stageDirection.style.display = 'block';
    } else {
      stageDirection.style.display = 'none';
    }

    // Update speaker
    const speakerNames: Record<string, string> = {
      narrator: 'Narrator',
      warden: 'The Warden',
      enemy: 'Echo',
    };
    speakerName.textContent = speakerNames[dialogue.speaker] || 'Unknown';
    speakerName.className = `warden-speaker-name speaker-${dialogue.speaker}`;

    // Update text with typewriter effect
    text.textContent = '';
    typewriterText(dialogue.text, text, () => {
      if (autoAdvance) {
        setTimeout(advance, autoAdvanceDelay);
      }
    });

    // Update portrait based on speaker
    portrait.className = `warden-portrait speaker-${dialogue.speaker}`;

    // Play dialogue sound
    AudioManager.playSfx('button-click');
  };

  // Advance to next dialogue
  const advance = () => {
    currentIndex++;
    if (currentIndex >= dialogues.length) {
      // Complete
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
        onComplete?.();
      }, 300);
    } else {
      renderDialogue(currentIndex);
    }
  };

  // Click to advance
  overlay.addEventListener('click', () => {
    if (!autoAdvance) {
      advance();
    }
  });

  // Keyboard advance
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      if (!autoAdvance) {
        advance();
      }
    }
  };
  document.addEventListener('keydown', handleKeydown);

  // Cleanup on remove
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node === overlay) {
          document.removeEventListener('keydown', handleKeydown);
          observer.disconnect();
        }
      });
    });
  });
  observer.observe(document.body, { childList: true });

  // Append and show
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('visible'), 10);

  // Start with first dialogue
  renderDialogue(0);

  return overlay;
}

/**
 * Typewriter effect for text
 */
function typewriterText(
  fullText: string,
  element: HTMLElement,
  onComplete?: () => void
): void {
  let index = 0;
  const speed = 30; // ms per character

  const type = () => {
    if (index < fullText.length) {
      element.textContent += fullText.charAt(index);
      index++;
      setTimeout(type, speed);
    } else {
      onComplete?.();
    }
  };

  type();
}

/**
 * Show a simple Warden message (single line, dismissible)
 */
export function showWardenMessage(
  text: string,
  options: { duration?: number; onDismiss?: () => void } = {}
): HTMLElement {
  const { duration = 0, onDismiss } = options;

  const message = document.createElement('div');
  message.className = 'warden-message';
  message.innerHTML = `
    <div class="warden-message-icon">👁️</div>
    <div class="warden-message-text">"${text}"</div>
    <div class="warden-message-label">— The Warden</div>
  `;

  const dismiss = () => {
    message.classList.add('fade-out');
    setTimeout(() => {
      message.remove();
      onDismiss?.();
    }, 300);
  };

  message.addEventListener('click', dismiss);

  document.body.appendChild(message);
  setTimeout(() => message.classList.add('visible'), 10);

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return message;
}

/**
 * Show tutorial prompt box
 */
export function showTutorialPrompt(
  title: string,
  lines: string[],
  onDismiss?: () => void
): HTMLElement {
  const prompt = document.createElement('div');
  prompt.className = 'tutorial-prompt';
  prompt.innerHTML = `
    <div class="tutorial-prompt-title">${title}</div>
    <div class="tutorial-prompt-content">
      ${lines.map(line => `<div class="tutorial-prompt-line">${line}</div>`).join('')}
    </div>
    <div class="tutorial-prompt-dismiss">Click to continue</div>
  `;

  const dismiss = () => {
    prompt.classList.add('fade-out');
    setTimeout(() => {
      prompt.remove();
      onDismiss?.();
    }, 300);
  };

  prompt.addEventListener('click', dismiss);

  document.body.appendChild(prompt);
  setTimeout(() => prompt.classList.add('visible'), 10);

  return prompt;
}
