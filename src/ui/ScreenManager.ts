/**
 * ScreenManager - Handles navigation between game screens
 */

export interface Screen {
  id: string;
  element: HTMLElement;
  onEnter?: () => void;
  onExit?: () => void;
  onBack?: () => boolean; // Return false to prevent back
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class ScreenManager {
  private screens: Map<string, Screen> = new Map();
  private screenStack: string[] = [];
  private container: HTMLElement;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element '${containerId}' not found`);
    }
    this.container = container;
    this.setupKeyboardNav();
  }

  register(screen: Screen): void {
    this.screens.set(screen.id, screen);
    screen.element.classList.add('screen', 'hidden');
    this.container.appendChild(screen.element);
  }

  async navigateTo(screenId: string, replace: boolean = false): Promise<void> {
    const newScreen = this.screens.get(screenId);
    if (!newScreen) {
      console.warn(`Screen '${screenId}' not found`);
      return;
    }

    // Exit current screen
    if (this.screenStack.length > 0) {
      const currentId = this.screenStack[this.screenStack.length - 1];
      const currentScreen = this.screens.get(currentId);
      if (currentScreen) {
        await this.animateOut(currentScreen);
        currentScreen.onExit?.();
      }
    }

    // Update stack
    if (replace && this.screenStack.length > 0) {
      this.screenStack.pop();
    }
    this.screenStack.push(screenId);

    // Enter new screen
    newScreen.onEnter?.();
    await this.animateIn(newScreen);
  }

  async back(): Promise<void> {
    if (this.screenStack.length <= 1) return;

    const currentId = this.screenStack[this.screenStack.length - 1];
    const currentScreen = this.screens.get(currentId);

    if (currentScreen?.onBack?.() === false) return;

    this.screenStack.pop();
    const prevId = this.screenStack[this.screenStack.length - 1];

    if (currentScreen) {
      await this.animateOut(currentScreen);
      currentScreen.onExit?.();
    }

    const prevScreen = this.screens.get(prevId);
    if (prevScreen) {
      prevScreen.onEnter?.();
      await this.animateIn(prevScreen);
    }
  }

  getCurrentScreenId(): string | null {
    return this.screenStack.length > 0
      ? this.screenStack[this.screenStack.length - 1]
      : null;
  }

  getScreen(screenId: string): Screen | undefined {
    return this.screens.get(screenId);
  }

  private async animateOut(screen: Screen): Promise<void> {
    screen.element.classList.add('exiting');
    await sleep(300);
    screen.element.classList.add('hidden');
    screen.element.classList.remove('exiting');
  }

  private async animateIn(screen: Screen): Promise<void> {
    screen.element.classList.remove('hidden');
    screen.element.classList.add('entering');
    await sleep(50); // Allow DOM update
    screen.element.classList.remove('entering');
  }

  private setupKeyboardNav(): void {
    document.addEventListener('keydown', (e) => {
      // Escape to go back
      if (e.key === 'Escape') {
        e.preventDefault();
        this.back();
      }
    });
  }
}
