/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock KeyboardNav before importing ScreenManager
vi.mock('@/ui/KeyboardNav', () => ({
  onScreenChange: vi.fn(),
}));

// Mock AudioManager before importing ScreenManager
vi.mock('@/services/AudioManager', () => ({
  AudioManager: {
    playSfx: vi.fn(),
  },
}));

import { ScreenManager, Screen } from '@/ui/ScreenManager';
import { onScreenChange } from '@/ui/KeyboardNav';
import { AudioManager } from '@/services/AudioManager';

describe('ScreenManager', () => {
  let container: HTMLElement;
  let screenManager: ScreenManager;

  beforeEach(() => {
    // Create container element
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);

    // Reset mocks
    vi.clearAllMocks();

    screenManager = new ScreenManager('test-container');
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('constructor', () => {
    it('should throw error if container not found', () => {
      expect(() => new ScreenManager('nonexistent')).toThrow(
        "Container element 'nonexistent' not found"
      );
    });

    it('should create screen manager with valid container', () => {
      expect(screenManager).toBeDefined();
    });
  });

  describe('register', () => {
    it('should register a screen', () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);

      expect(screenManager.getScreen('test-screen')).toBe(screen);
    });

    it('should add screen element to container', () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);

      expect(container.contains(screen.element)).toBe(true);
    });

    it('should add screen and hidden classes to element', () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);

      expect(screen.element.classList.contains('screen')).toBe(true);
      expect(screen.element.classList.contains('hidden')).toBe(true);
    });
  });

  describe('navigateTo', () => {
    it('should navigate to registered screen', async () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);

      await screenManager.navigateTo('test-screen');

      expect(screenManager.getCurrentScreenId()).toBe('test-screen');
    });

    it('should call onEnter when navigating to screen', async () => {
      const onEnter = vi.fn();
      const screen = createMockScreen('test-screen', { onEnter });
      screenManager.register(screen);

      await screenManager.navigateTo('test-screen');

      expect(onEnter).toHaveBeenCalled();
    });

    it('should call onExit when leaving screen', async () => {
      const onExit = vi.fn();
      const screen1 = createMockScreen('screen-1', { onExit });
      const screen2 = createMockScreen('screen-2');

      screenManager.register(screen1);
      screenManager.register(screen2);

      await screenManager.navigateTo('screen-1');
      await screenManager.navigateTo('screen-2');

      expect(onExit).toHaveBeenCalled();
    });

    it('should not navigate to unregistered screen', async () => {
      await screenManager.navigateTo('nonexistent');

      expect(screenManager.getCurrentScreenId()).toBeNull();
    });

    it('should play screen transition sound', async () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);

      await screenManager.navigateTo('test-screen');

      expect(AudioManager.playSfx).toHaveBeenCalledWith('screen-transition');
    });

    it('should call onScreenChange for keyboard focus', async () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);

      await screenManager.navigateTo('test-screen');

      expect(onScreenChange).toHaveBeenCalled();
    });

    it('should remove hidden class from screen element', async () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);

      await screenManager.navigateTo('test-screen');

      expect(screen.element.classList.contains('hidden')).toBe(false);
    });

    it('should replace screen when replace=true', async () => {
      const screen1 = createMockScreen('screen-1');
      const screen2 = createMockScreen('screen-2');
      const screen3 = createMockScreen('screen-3');

      screenManager.register(screen1);
      screenManager.register(screen2);
      screenManager.register(screen3);

      await screenManager.navigateTo('screen-1');
      await screenManager.navigateTo('screen-2');
      await screenManager.navigateTo('screen-3', true); // Replace screen-2

      // After back, should go to screen-1 (not screen-2)
      await screenManager.back();

      expect(screenManager.getCurrentScreenId()).toBe('screen-1');
    });
  });

  describe('back', () => {
    it('should navigate back to previous screen', async () => {
      const screen1 = createMockScreen('screen-1');
      const screen2 = createMockScreen('screen-2');

      screenManager.register(screen1);
      screenManager.register(screen2);

      await screenManager.navigateTo('screen-1');
      await screenManager.navigateTo('screen-2');
      await screenManager.back();

      expect(screenManager.getCurrentScreenId()).toBe('screen-1');
    });

    it('should not go back if at root', async () => {
      const screen = createMockScreen('screen-1');
      screenManager.register(screen);

      await screenManager.navigateTo('screen-1');
      await screenManager.back();

      expect(screenManager.getCurrentScreenId()).toBe('screen-1');
    });

    it('should respect onBack returning false', async () => {
      const screen1 = createMockScreen('screen-1');
      const screen2 = createMockScreen('screen-2', {
        onBack: () => false, // Prevent back
      });

      screenManager.register(screen1);
      screenManager.register(screen2);

      await screenManager.navigateTo('screen-1');
      await screenManager.navigateTo('screen-2');
      await screenManager.back();

      // Should still be on screen-2 because onBack returned false
      expect(screenManager.getCurrentScreenId()).toBe('screen-2');
    });

    it('should play menu-back sound', async () => {
      const screen1 = createMockScreen('screen-1');
      const screen2 = createMockScreen('screen-2');

      screenManager.register(screen1);
      screenManager.register(screen2);

      await screenManager.navigateTo('screen-1');
      await screenManager.navigateTo('screen-2');

      vi.clearAllMocks();
      await screenManager.back();

      expect(AudioManager.playSfx).toHaveBeenCalledWith('menu-back');
    });

    it('should call onScreenChange for keyboard focus', async () => {
      const screen1 = createMockScreen('screen-1');
      const screen2 = createMockScreen('screen-2');

      screenManager.register(screen1);
      screenManager.register(screen2);

      await screenManager.navigateTo('screen-1');
      await screenManager.navigateTo('screen-2');

      vi.clearAllMocks();
      await screenManager.back();

      expect(onScreenChange).toHaveBeenCalled();
    });
  });

  describe('getCurrentScreenId', () => {
    it('should return null when no screens navigated', () => {
      expect(screenManager.getCurrentScreenId()).toBeNull();
    });

    it('should return current screen id', async () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);
      await screenManager.navigateTo('test-screen');

      expect(screenManager.getCurrentScreenId()).toBe('test-screen');
    });
  });

  describe('getScreen', () => {
    it('should return undefined for unregistered screen', () => {
      expect(screenManager.getScreen('nonexistent')).toBeUndefined();
    });

    it('should return registered screen', () => {
      const screen = createMockScreen('test-screen');
      screenManager.register(screen);

      expect(screenManager.getScreen('test-screen')).toBe(screen);
    });
  });
});

/**
 * Helper to create mock screen objects
 */
function createMockScreen(
  id: string,
  callbacks: {
    onEnter?: () => void;
    onExit?: () => void;
    onBack?: () => boolean;
  } = {}
): Screen {
  const element = document.createElement('div');
  element.id = id;

  return {
    id,
    element,
    onEnter: callbacks.onEnter,
    onExit: callbacks.onExit,
    onBack: callbacks.onBack,
  };
}
