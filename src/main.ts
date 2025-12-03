import { CombatEngine } from '@/engine/CombatEngine';
import { CombatRenderer } from '@/ui/renderer';
import { createStarterDeck, CLASSES } from '@/data/classes';
import { ACT1_ENEMIES } from '@/data/enemies/act1';
import { CharacterClassId, CombatEventType, PlayerState } from '@/types';
import './styles/main.css';

class Game {
  private combat: CombatEngine | null = null;
  private renderer: CombatRenderer;

  constructor() {
    this.renderer = new CombatRenderer();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Card click handler
    this.renderer.setCardClickHandler((cardIndex: number) => {
      if (!this.combat || this.combat.isGameOver()) return;

      const result = this.combat.playCard(cardIndex, this.renderer.getSelectedEnemy());
      if (result.success) {
        result.log.forEach((msg) => this.renderer.addLog(msg));
        this.render();

        if (this.combat.isGameOver()) {
          this.renderer.showGameOver(this.combat.getState().victory);
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

      const result = this.combat.endTurn();
      result.log.forEach((msg) => this.renderer.addLog(msg));
      this.render();

      if (this.combat.isGameOver()) {
        this.renderer.showGameOver(this.combat.getState().victory);
      }
    });

    // Restart button
    document.getElementById('restart-btn')?.addEventListener('click', () => {
      this.renderer.clearLog();
      this.renderer.removeGameOver();
      this.initGame();
    });
  }

  initGame(): void {
    const characterClass = CLASSES[CharacterClassId.CLERIC];
    const starterDeck = createStarterDeck(CharacterClassId.CLERIC);

    const player: PlayerState = {
      maxHp: characterClass.maxHp,
      currentHp: characterClass.maxHp,
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

    this.combat.startCombat();
    this.renderer.setSelectedEnemy(0);
    this.render();
  }

  private render(): void {
    if (!this.combat) return;
    this.renderer.render(this.combat.getState());
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  game.initGame();
});
