/**
 * KeyboardNav - Full keyboard navigation for menu screens
 */

import type { ScreenManager } from './ScreenManager';
import { AudioManager } from '@/services/AudioManager';

let screenManager: ScreenManager | null = null;
let focusIndex = 0;
let isSetup = false;

/**
 * Get all focusable elements in the current visible screen
 */
function getFocusableElements(): HTMLElement[] {
  const currentScreen = document.querySelector('.screen:not(.hidden)');
  if (!currentScreen) return [];

  return Array.from(
    currentScreen.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"], input:not([disabled]), select:not([disabled])'
    )
  );
}

/**
 * Check if an input element is currently focused
 */
function isInputFocused(): boolean {
  const active = document.activeElement;
  if (!active) return false;
  return active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT';
}

/**
 * Focus the element at the given index
 */
function focusElement(index: number): void {
  const focusables = getFocusableElements();
  if (focusables.length === 0) return;

  // Clamp index to valid range
  focusIndex = Math.max(0, Math.min(focusables.length - 1, index));

  const element = focusables[focusIndex];
  if (element) {
    element.focus();
    AudioManager.playSfx('button-hover');
  }
}

/**
 * Move focus in the given direction
 */
function moveFocus(direction: 'up' | 'down' | 'left' | 'right'): void {
  const focusables = getFocusableElements();
  if (focusables.length === 0) return;

  // Find current focus index
  const currentFocused = document.activeElement as HTMLElement;
  const currentIndex = focusables.indexOf(currentFocused);

  if (currentIndex !== -1) {
    focusIndex = currentIndex;
  }

  switch (direction) {
    case 'up':
    case 'left':
      focusElement(focusIndex - 1);
      break;
    case 'down':
    case 'right':
      focusElement(focusIndex + 1);
      break;
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(e: KeyboardEvent): void {
  if (!screenManager) return;

  // Don't handle shortcuts when typing in an input
  if (isInputFocused()) return;

  const currentScreenId = screenManager.getCurrentScreenId();

  switch (e.key.toLowerCase()) {
    case 'n':
      // N for New Run (only on main menu)
      if (currentScreenId === 'main-menu') {
        e.preventDefault();
        screenManager.navigateTo('class-select');
      }
      break;
    case 'c':
      // C for Continue (only on main menu)
      if (currentScreenId === 'main-menu') {
        e.preventDefault();
        const continueBtn = document.querySelector('#btn-continue:not([disabled])') as HTMLButtonElement;
        if (continueBtn) {
          continueBtn.click();
        }
      }
      break;
    case 'a':
      // A for Achievements (only on main menu)
      if (currentScreenId === 'main-menu') {
        e.preventDefault();
        screenManager.navigateTo('achievement-screen');
      }
      break;
    case 's':
      // S for Settings (only on main menu)
      if (currentScreenId === 'main-menu') {
        e.preventDefault();
        screenManager.navigateTo('settings');
      }
      break;
  }
}

/**
 * Handle main keyboard events
 */
function handleKeyDown(e: KeyboardEvent): void {
  if (!screenManager) return;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      moveFocus('up');
      break;

    case 'ArrowDown':
      e.preventDefault();
      moveFocus('down');
      break;

    case 'ArrowLeft':
      e.preventDefault();
      moveFocus('left');
      break;

    case 'ArrowRight':
      e.preventDefault();
      moveFocus('right');
      break;

    case 'Enter':
    case ' ':
      // Activate focused button
      if (document.activeElement instanceof HTMLButtonElement) {
        e.preventDefault();
        document.activeElement.click();
        AudioManager.playSfx('button-click');
      }
      break;

    case 'Tab': {
      // Tab cycling - let browser handle but track index
      const focusables = getFocusableElements();
      if (!e.shiftKey) {
        const newIndex = focusables.indexOf(document.activeElement as HTMLElement) + 1;
        if (newIndex >= focusables.length) {
          e.preventDefault();
          focusElement(0);
        } else {
          focusIndex = newIndex;
        }
      } else {
        const newIndex = focusables.indexOf(document.activeElement as HTMLElement) - 1;
        if (newIndex < 0) {
          e.preventDefault();
          focusElement(focusables.length - 1);
        } else {
          focusIndex = newIndex;
        }
      }
      break;
    }

    case 'Escape':
      // Back navigation (already handled by ScreenManager, but add sound)
      AudioManager.playSfx('button-click');
      break;

    default:
      // Handle keyboard shortcuts
      handleKeyboardShortcuts(e);
      break;
  }
}

/**
 * Reset focus when navigating to a new screen
 */
function resetFocus(): void {
  focusIndex = 0;
  // Focus first element after a short delay to let screen animate in
  setTimeout(() => {
    const focusables = getFocusableElements();
    if (focusables.length > 0) {
      focusables[0].focus();
    }
  }, 100);
}

/**
 * Setup keyboard navigation
 */
export function setupKeyboardNavigation(manager: ScreenManager): void {
  if (isSetup) return;

  screenManager = manager;
  document.addEventListener('keydown', handleKeyDown);
  isSetup = true;
}

/**
 * Call this when navigating to a new screen to reset focus
 */
export function onScreenChange(): void {
  resetFocus();
}

/**
 * Cleanup keyboard navigation
 */
export function cleanupKeyboardNavigation(): void {
  document.removeEventListener('keydown', handleKeyDown);
  screenManager = null;
  isSetup = false;
}
