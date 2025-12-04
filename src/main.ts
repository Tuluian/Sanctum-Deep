import { CombatEngine } from '@/engine/CombatEngine';
import { CombatRenderer } from '@/ui/renderer';
import { ScreenManager } from '@/ui/ScreenManager';
import { createMainMenuScreen } from '@/ui/screens/MainMenuScreen';
import { createClassSelectScreen } from '@/ui/screens/ClassSelectScreen';
import { createSettingsScreen } from '@/ui/screens/SettingsScreen';
import { createMapScreen } from '@/ui/screens/MapScreen';
import { SaveManager } from '@/services/SaveManager';
import { AudioManager } from '@/services/AudioManager';
import { createStarterDeck, CLASSES } from '@/data/classes';
import { ACT1_ENEMIES } from '@/data/enemies/act1';
import { ELITE_ENEMIES } from '@/data/enemies/elites';
import { BOSSES, MINIONS } from '@/data/enemies/bosses';
import { generateFloor } from '@/map/MapGenerator';
import { CardType, CharacterClassId, CombatEventType, PlayerState, FloorMap, MapNode, NodeType, EnemyDefinition } from '@/types';
import './styles/main.css';

// Extended map screen type with custom methods
interface MapScreenExtended {
  id: string;
  element: HTMLElement;
  onEnter?: () => void;
  onExit?: () => void;
  setFloor: (floor: FloorMap) => void;
  setCurrentNode: (nodeId: string) => void;
  refresh: () => void;
}

class Game {
  private combat: CombatEngine | null = null;
  private renderer: CombatRenderer;
  private screenManager: ScreenManager;
  private combatScreen: HTMLElement;
  private currentClassId: CharacterClassId | null = null;
  private currentFloor: FloorMap | null = null;
  private currentNode: MapNode | null = null;
  private mapScreen: MapScreenExtended | null = null;

  constructor() {
    this.renderer = new CombatRenderer();
    this.screenManager = new ScreenManager('screen-container');
    this.combatScreen = document.getElementById('combat-screen')!;

    this.setupAudio();
    this.setupScreens();
    this.setupCombatEventListeners();
  }

  private setupAudio(): void {
    // Initialize audio on first user interaction
    const initAudio = () => {
      AudioManager.init();
      AudioManager.playMusic('menu');
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    // Update audio when settings change
    SaveManager.onSettingsChange(() => {
      AudioManager.applyVolumeSettings();
    });
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

    // Map Screen
    this.mapScreen = createMapScreen({
      onNodeSelected: (node) => this.onMapNodeSelected(node),
      onAbandon: () => {
        if (confirm('Are you sure you want to abandon this run?')) {
          this.abandonRun();
        }
      },
    }) as MapScreenExtended;

    // Register screens
    this.screenManager.register(mainMenu);
    this.screenManager.register(classSelect);
    this.screenManager.register(settings);
    this.screenManager.register(this.mapScreen);

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
        // Play sound and animation based on card type
        if (card) {
          AudioManager.playSfx('card-play');
          if (card.type === CardType.ATTACK) {
            this.renderer.playPlayerAttackAnimation(targetEnemy);
            setTimeout(() => AudioManager.playSfx('hit'), 200);
          } else if (card.type === CardType.SKILL) {
            AudioManager.playSfx('spell');
          }
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

    // Settings button in combat
    document.getElementById('combat-settings-btn')?.addEventListener('click', () => {
      this.showCombatSettings();
    });
  }

  private showCombatSettings(): void {
    // Hide combat screen and show settings
    this.combatScreen.style.display = 'none';
    document.getElementById('screen-container')!.style.display = 'block';

    // Navigate to settings with a custom back handler
    const settings = createSettingsScreen({
      onBack: () => {
        // Return to combat
        this.screenManager.navigateTo('main-menu', true);
        document.getElementById('screen-container')!.style.display = 'none';
        this.combatScreen.style.display = 'block';
      },
    });

    // Replace the settings screen with our custom one
    this.screenManager.register(settings);
    this.screenManager.navigateTo('settings');
  }

  private startNewRun(classId: CharacterClassId): void {
    this.currentClassId = classId;
    const characterClass = CLASSES[classId];

    // Generate map for Act 1
    const mapSeed = `run_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.currentFloor = generateFloor(1, mapSeed);
    const startNodeId = this.currentFloor.rows[0][0].id;

    // Save the new run
    SaveManager.startNewRun(classId, characterClass.maxHp, mapSeed, startNodeId);

    // Update class name in UI
    const classNameEl = document.getElementById('player-class-name');
    if (classNameEl) {
      classNameEl.textContent = characterClass.name;
    }

    // Update HUD class info
    this.updateHudClassInfo(classId, characterClass.name);

    // Show the map screen
    this.showMapScreen();
  }

  private continueRun(): void {
    const runData = SaveManager.getActiveRun();
    if (!runData) return;

    this.currentClassId = runData.classId;
    const characterClass = CLASSES[runData.classId];

    // Regenerate map from saved seed
    this.currentFloor = generateFloor(runData.currentAct, runData.mapSeed);

    // Restore visited nodes
    for (const nodeId of runData.visitedNodeIds) {
      const node = this.findNodeById(nodeId);
      if (node) node.visited = true;
    }

    // If we were mid-combat when the page reloaded, revert to last safe position
    // Also handle legacy saves that don't have inCombat field (treat as not in combat)
    if (runData.inCombat === true) {
      // Find the last visited node to use as current position
      // If no nodes visited yet, stay at start node (row 0)
      const startNodeId = this.currentFloor.rows[0][0].id;
      const lastVisitedId = runData.visitedNodeIds.length > 0
        ? runData.visitedNodeIds[runData.visitedNodeIds.length - 1]
        : startNodeId;

      SaveManager.setCurrentNode(lastVisitedId);
      SaveManager.setInCombat(false);

      // Note: Player will need to re-attempt the combat they abandoned
    }

    // Update class name in UI
    const classNameEl = document.getElementById('player-class-name');
    if (classNameEl) {
      classNameEl.textContent = characterClass.name;
    }

    // Update HUD class info
    this.updateHudClassInfo(runData.classId, characterClass.name);

    // Show the map screen
    this.showMapScreen();
  }

  private initCombat(classId: CharacterClassId, currentHp?: number): void {
    const characterClass = CLASSES[classId];
    const starterDeck = createStarterDeck(classId);
    const runData = SaveManager.getActiveRun();

    const player: PlayerState = {
      maxHp: runData?.playerMaxHp ?? characterClass.maxHp,
      currentHp: currentHp ?? runData?.playerHp ?? characterClass.maxHp,
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
      soulDebt: 0,
      activeVow: null,
      vowsActivatedThisCombat: 0,
      luck: 0,
      maxLuck: 10,
      guaranteedBest: false,
    };

    // Get enemies based on current node type
    const enemies = this.getEnemiesForNode();

    this.combat = new CombatEngine(player, enemies);

    // Register minion definitions for summoning abilities
    for (const minion of Object.values(MINIONS)) {
      this.combat.registerMinionDefinition(minion);
    }

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

  private getEnemiesForNode(): EnemyDefinition[] {
    if (!this.currentNode) {
      return [ACT1_ENEMIES.cultist];
    }

    const nodeType = this.currentNode.type;
    const enemyKeys = Object.keys(ACT1_ENEMIES) as (keyof typeof ACT1_ENEMIES)[];
    const eliteKeys = Object.keys(ELITE_ENEMIES) as (keyof typeof ELITE_ENEMIES)[];
    const bossKeys = Object.keys(BOSSES) as (keyof typeof BOSSES)[];

    switch (nodeType) {
      case NodeType.COMBAT: {
        // Random 1-2 common enemies
        const count = Math.random() > 0.6 ? 2 : 1;
        const enemies: EnemyDefinition[] = [];
        for (let i = 0; i < count; i++) {
          const key = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
          enemies.push(ACT1_ENEMIES[key]);
        }
        return enemies;
      }
      case NodeType.ELITE: {
        // One elite enemy
        const key = eliteKeys[Math.floor(Math.random() * eliteKeys.length)];
        return [ELITE_ENEMIES[key]];
      }
      case NodeType.BOSS: {
        // Boss fight
        const key = bossKeys[Math.floor(Math.random() * bossKeys.length)];
        return [BOSSES[key]];
      }
      default:
        return [ACT1_ENEMIES.cultist];
    }
  }

  private findNodeById(nodeId: string): MapNode | null {
    if (!this.currentFloor) return null;
    for (const row of this.currentFloor.rows) {
      for (const node of row) {
        if (node.id === nodeId) return node;
      }
    }
    return null;
  }

  private onMapNodeSelected(node: MapNode): void {
    this.currentNode = node;

    // Handle different node types
    if (node.type === NodeType.COMBAT || node.type === NodeType.ELITE || node.type === NodeType.BOSS) {
      // Start combat
      SaveManager.setCurrentNode(node.id);
      SaveManager.setInCombat(true);
      this.initCombat(this.currentClassId!);
      this.showCombatScreen();
    } else if (node.type === NodeType.CAMPFIRE) {
      // TODO: Show rest screen (heal or upgrade)
      this.handleCampfireNode(node);
    } else if (node.type === NodeType.MERCHANT) {
      // TODO: Show shop
      this.handleNonCombatNode(node, 'Shop coming soon!');
    } else if (node.type === NodeType.SHRINE) {
      // TODO: Show shrine event
      this.handleNonCombatNode(node, 'Shrine events coming soon!');
    }
  }

  private handleCampfireNode(node: MapNode): void {
    // Simple heal for now
    const runData = SaveManager.getActiveRun();
    if (runData) {
      const healAmount = Math.floor(runData.playerMaxHp * 0.3);
      const newHp = Math.min(runData.playerHp + healAmount, runData.playerMaxHp);
      SaveManager.updateRun({ playerHp: newHp });

      // Mark visited and update map
      node.visited = true;
      SaveManager.markNodeVisited(node.id);
      SaveManager.setCurrentNode(node.id);

      alert(`You rest by the campfire and heal ${healAmount} HP. (${runData.playerHp} → ${newHp})`);
      this.showMapScreen();
    }
  }

  private handleNonCombatNode(node: MapNode, message: string): void {
    node.visited = true;
    SaveManager.markNodeVisited(node.id);
    SaveManager.setCurrentNode(node.id);
    alert(message);
    this.showMapScreen();
  }

  private showMapScreen(): void {
    if (!this.mapScreen || !this.currentFloor) return;

    const runData = SaveManager.getActiveRun();
    const currentNodeId = runData?.currentNodeId || this.currentFloor.rows[0][0].id;

    this.mapScreen.setFloor(this.currentFloor);
    this.mapScreen.setCurrentNode(currentNodeId);

    this.screenManager.navigateTo('map-screen', true);
    this.mapScreen.refresh();
  }

  private handleCombatEnd(): void {
    if (!this.combat) return;

    const state = this.combat.getState();
    const victory = state.victory;

    // Play victory/defeat music
    AudioManager.playMusic(victory ? 'victory' : 'defeat');

    // Combat is over
    SaveManager.setInCombat(false);

    if (victory) {
      // Mark current node as visited
      if (this.currentNode) {
        this.currentNode.visited = true;
        SaveManager.markNodeVisited(this.currentNode.id);
      }

      // Save current HP
      SaveManager.updateRun({ playerHp: state.player.currentHp });

      // Check if this was the boss - run complete!
      const isBossNode = this.currentNode?.type === NodeType.BOSS;
      const isEliteNode = this.currentNode?.type === NodeType.ELITE;

      // Award Soul Echoes based on combat type
      const soulEchoesReward = isBossNode ? 50 : isEliteNode ? 5 : 2;
      SaveManager.addSoulEchoes(soulEchoesReward);

      if (isBossNode) {
        // Run complete - full victory!
        SaveManager.endRun(true);
        this.renderer.showGameOver(true, soulEchoesReward, () => {
          this.renderer.removeGameOver();
          this.hideCombatScreen();
          this.screenManager.navigateTo('main-menu', true);
        });
      } else {
        // Show rewards then return to map
        // TODO: Implement proper rewards screen (card selection, gold, etc.)
        const goldReward = Math.floor(Math.random() * 20) + 10;
        SaveManager.updateRun({ gold: (SaveManager.getActiveRun()?.gold || 0) + goldReward });

        this.renderer.showGameOver(true, soulEchoesReward, () => {
          this.renderer.removeGameOver();
          this.hideCombatScreen();
          this.showMapScreen();
          AudioManager.playMusic('menu');
        });
      }
    } else {
      // Defeat - end run (no Soul Echoes to prevent grinding)
      SaveManager.endRun(false);
      this.renderer.showGameOver(false, 0, () => {
        this.renderer.removeGameOver();
        this.hideCombatScreen();
        this.screenManager.navigateTo('main-menu', true);
      });
    }
  }

  private abandonRun(): void {
    SaveManager.abandonRun();
    this.renderer.removeGameOver();
    this.hideCombatScreen();
    this.screenManager.navigateTo('main-menu', true);
  }

  private updateHudClassInfo(classId: CharacterClassId, className: string): void {
    const specialtyInfo: Record<CharacterClassId, { icon: string; tooltip: string }> = {
      [CharacterClassId.CLERIC]: {
        icon: '✨',
        tooltip: 'Devotion: Healing generates Devotion. Spend it to power up certain cards for devastating bonus effects.',
      },
      [CharacterClassId.DUNGEON_KNIGHT]: {
        icon: '🏰',
        tooltip: 'Fortify: Permanent Block that persists between turns. Build up a defensive wall (max 15).',
      },
      [CharacterClassId.DIABOLIST]: {
        icon: '👹',
        tooltip: 'Soul Debt: Tracks Curses added to your deck. Some cards grow stronger the more Curses you carry.',
      },
      [CharacterClassId.OATHSWORN]: {
        icon: '📜',
        tooltip: 'Vow: Your active sacred oath. Grants a bonus but has a restriction. Breaking it triggers a penalty.',
      },
      [CharacterClassId.FEY_TOUCHED]: {
        icon: '🍀',
        tooltip: 'Luck: Build up Luck to improve Whimsy outcomes. Spend all Luck to guarantee the best result.',
      },
    };

    const hudClassIcon = document.getElementById('hud-class-icon');
    const hudClassName = document.getElementById('hud-class-name');
    const hudSpecialtyStat = document.getElementById('hud-specialty-stat');

    // Hide the class icon element (no emoji before class name)
    if (hudClassIcon) {
      hudClassIcon.style.display = 'none';
    }
    if (hudClassName) {
      hudClassName.textContent = className;
    }
    if (hudSpecialtyStat) {
      const specialty = specialtyInfo[classId];
      hudSpecialtyStat.setAttribute('data-tooltip', specialty.tooltip);
      // Update the icon and preserve the value span
      const devotionSpan = document.getElementById('hud-devotion');
      const currentValue = devotionSpan?.textContent || '0';
      hudSpecialtyStat.innerHTML = `${specialty.icon} <span id="hud-devotion">${currentValue}</span>`;
    }
  }

  private showCombatScreen(): void {
    this.combatScreen.style.display = 'block';
    document.getElementById('screen-container')!.style.display = 'none';
    AudioManager.playMusic('combat');
  }

  private hideCombatScreen(): void {
    this.combatScreen.style.display = 'none';
    document.getElementById('screen-container')!.style.display = 'block';
    AudioManager.playMusic('menu');
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
