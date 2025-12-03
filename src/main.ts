import { CombatEngine } from '@/engine/CombatEngine';
import { CombatRenderer } from '@/ui/renderer';
import { ScreenManager } from '@/ui/ScreenManager';
import { createMainMenuScreen } from '@/ui/screens/MainMenuScreen';
import { createClassSelectScreen } from '@/ui/screens/ClassSelectScreen';
import { createSettingsScreen } from '@/ui/screens/SettingsScreen';
import { SaveManager } from '@/services/SaveManager';
import { createStarterDeck, CLASSES } from '@/data/classes';
import { ACT1_ENEMIES } from '@/data/enemies/act1';
import { CardType, CharacterClassId, CombatEventType, PlayerState } from '@/types';
import './styles/main.css';

class Game {
  private combat: CombatEngine | null = null;
  private renderer: CombatRenderer;
  private screenManager: ScreenManager;
  private combatScreen: HTMLElement;
  private currentClassId: CharacterClassId | null = null;

  constructor() {
    this.renderer = new CombatRenderer();
    this.screenManager = new ScreenManager('screen-container');
    this.combatScreen = document.getElementById('combat-screen')!;

    this.setupScreens();
    this.setupCombatEventListeners();
  }

  private setupScreens(): void {
    // Main Menu
    const mainMenu = createMainMenuScreen(
      () => this.screenManager.navigateTo('class-select'),
      () => this.continueRun(),
      () => this.screenManager.navigateTo('settings')
    );

    // Class Select
    const classSelect = createClassSelectScreen({
      onBack: () => this.screenManager.back(),
      onSelectClass: (classId) => this.startNewRun(classId),
    });

    // Settings
    const settings = createSettingsScreen({
      onBack: () => this.screenManager.back(),
    });

    // Register screens
    this.screenManager.register(mainMenu);
    this.screenManager.register(classSelect);
    this.screenManager.register(settings);

    // Start at main menu
    this.screenManager.navigateTo('main-menu');
  }

  private setupCombatEventListeners(): void {
    // Card click handler
    this.renderer.setCardClickHandler((cardIndex: number) => {
      if (!this.combat || this.combat.isGameOver()) return;

      const state = this.combat.getState();
      const card = state.player.hand[cardIndex];
      const targetEnemy = this.renderer.getSelectedEnemy();

      const result = this.combat.playCard(cardIndex, targetEnemy);
      if (result.success) {
        // Play attack animation for attack cards
        if (card && card.type === CardType.ATTACK) {
          this.renderer.playPlayerAttackAnimation(targetEnemy);
        }

        result.log.forEach((msg) => this.renderer.addLog(msg));
        this.render();

        if (this.combat.isGameOver()) {
          this.handleCombatEnd();
        }
      } else {
        this.renderer.addLog(result.message || 'Cannot play that card', true);
      }
    });

    // Enemy selection handler
    this.renderer.setEnemyClickHandler((enemyIndex: number) => {
      if (!this.combat) return;
      const enemies = this.combat.getState().enemies;
      if (enemies[enemyIndex] && enemies[enemyIndex].currentHp > 0) {
        this.renderer.setSelectedEnemy(enemyIndex);
        this.render();
      }
    });

    // End turn button
    document.getElementById('end-turn-btn')?.addEventListener('click', () => {
      if (!this.combat || this.combat.isGameOver()) return;

      // Get enemy intents before the turn ends to know who will attack
      const stateBefore = this.combat.getState();
      const attackingEnemies = stateBefore.enemies
        .map((enemy, index) => ({ enemy, index }))
        .filter(({ enemy }) => enemy.currentHp > 0 && enemy.intent?.damage);

      const result = this.combat.endTurn();

      // Play enemy attack animations with staggered timing
      attackingEnemies.forEach(({ index }, i) => {
        setTimeout(() => {
          this.renderer.playEnemyAttackAnimation(index);
        }, i * 300);
      });

      result.log.forEach((msg) => this.renderer.addLog(msg));
      this.render();

      if (this.combat.isGameOver()) {
        // Delay game over to let animations finish
        const delay = attackingEnemies.length * 300 + 500;
        setTimeout(() => this.handleCombatEnd(), delay);
      }
    });

    // Abandon run button
    document.getElementById('abandon-btn')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to abandon this run?')) {
        this.abandonRun();
      }
    });
  }

  private startNewRun(classId: CharacterClassId): void {
    this.currentClassId = classId;
    const characterClass = CLASSES[classId];

    // Save the new run
    SaveManager.startNewRun(classId, characterClass.maxHp);

    // Update class name in UI
    const classNameEl = document.getElementById('player-class-name');
    if (classNameEl) {
      classNameEl.textContent = characterClass.name;
    }

    // Start combat
    this.initCombat(classId);

    // Show combat screen
    this.showCombatScreen();
  }

  private continueRun(): void {
    const runData = SaveManager.getActiveRun();
    if (!runData) return;

    this.currentClassId = runData.classId;
    const characterClass = CLASSES[runData.classId];

    // Update class name in UI
    const classNameEl = document.getElementById('player-class-name');
    if (classNameEl) {
      classNameEl.textContent = characterClass.name;
    }

    // For now, just start a new combat with saved HP
    // Later this would restore full run state
    this.initCombat(runData.classId, runData.playerHp);

    // Show combat screen
    this.showCombatScreen();
  }

  private initCombat(classId: CharacterClassId, currentHp?: number): void {
    const characterClass = CLASSES[classId];
    const starterDeck = createStarterDeck(classId);

    const player: PlayerState = {
      maxHp: characterClass.maxHp,
      currentHp: currentHp ?? characterClass.maxHp,
      block: 0,
      resolve: characterClass.maxResolve,
      maxResolve: characterClass.maxResolve,
      hand: [],
      drawPile: starterDeck,
      discardPile: [],
      exhaustPile: [],
      statusEffects: [],
      devotion: 0,
      fortify: 0,
      maxFortify: 15,
      empoweredAttack: 0,
    };

    // Create combat with a single Cultist enemy
    this.combat = new CombatEngine(player, [ACT1_ENEMIES.cultist]);

    // Subscribe to combat events for logging
    this.combat.subscribe((event) => {
      if (event.type === CombatEventType.COMBAT_LOG) {
        const data = event.data as { message: string };
        this.renderer.addLog(data.message);
      }
    });

    this.renderer.clearLog();
    this.combat.startCombat();
    this.renderer.setSelectedEnemy(0);
    this.render();
  }

  private handleCombatEnd(): void {
    if (!this.combat) return;

    const state = this.combat.getState();
    const victory = state.victory;

    // Update save data
    if (victory) {
      // For MVP, winning one combat ends the run
      SaveManager.endRun(true);
    } else {
      SaveManager.endRun(false);
    }

    // Show game over with callback to return to menu
    this.renderer.showGameOver(victory, () => {
      this.hideCombatScreen();
      this.screenManager.navigateTo('main-menu', true);
    });
  }

  private abandonRun(): void {
    SaveManager.abandonRun();
    this.renderer.removeGameOver();
    this.hideCombatScreen();
    this.screenManager.navigateTo('main-menu', true);
  }

  private showCombatScreen(): void {
    this.combatScreen.style.display = 'block';
    document.getElementById('screen-container')!.style.display = 'none';
  }

  private hideCombatScreen(): void {
    this.combatScreen.style.display = 'none';
    document.getElementById('screen-container')!.style.display = 'block';
  }

  private render(): void {
    if (!this.combat) return;
    this.renderer.render(this.combat.getState());

    // Update save with current HP
    if (this.currentClassId) {
      const state = this.combat.getState();
      SaveManager.updateRun({
        playerHp: state.player.currentHp,
        playerMaxHp: state.player.maxHp,
      });
    }
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Game();
});
