import { CombatEngine } from '@/engine/CombatEngine';
import { CombatRenderer } from '@/ui/renderer';
import { ScreenManager } from '@/ui/ScreenManager';
import { createMainMenuScreen } from '@/ui/screens/MainMenuScreen';
import { createClassSelectScreen } from '@/ui/screens/ClassSelectScreen';
import { createSettingsScreen } from '@/ui/screens/SettingsScreen';
import { createMapScreen } from '@/ui/screens/MapScreen';
import { createUpgradeScreen } from '@/ui/screens/UpgradeScreen';
import { createNarrativeEventScreen } from '@/ui/screens/NarrativeEventScreen';
import { StoryCardOverlay } from '@/ui/screens/StoryCardOverlay';
import { SaveManager } from '@/services/SaveManager';
import { AudioManager } from '@/services/AudioManager';
import { NarrativeEventService, initNarrativeEventService } from '@/services/NarrativeEventService';
import { applyCombatModifiersToPlayer, getRunModifiers, type RunModifiers } from '@/services/UpgradeEffects';
import { createStarterDeck, CLASSES } from '@/data/classes';
import { ACT1_ENEMIES } from '@/data/enemies/act1';
import { ELITE_ENEMIES } from '@/data/enemies/elites';
import { BOSSES, MINIONS } from '@/data/enemies/bosses';
import { HOLLOW_GOD, SHADOW_SELF } from '@/data/enemies/act3-boss';
import { ACT3_ELITE_ENEMIES } from '@/data/enemies/act3-elites';
import { ACT3_ENEMIES } from '@/data/enemies/act3';
import { generateFloor } from '@/map/MapGenerator';
import { CardType, CharacterClassId, CombatEventType, PlayerState, FloorMap, MapNode, NodeType, EnemyDefinition, StatusType } from '@/types';
import { NarrativeEvent, NarrativeChoice } from '@/types/narrativeEvents';
import { getPotion } from '@/data/potions';
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
  private narrativeService: NarrativeEventService | null = null;
  private storyCardOverlay: StoryCardOverlay | null = null;
  private isFirstCombat: boolean = true;
  private runModifiers: RunModifiers | null = null;

  constructor() {
    this.renderer = new CombatRenderer();
    this.screenManager = new ScreenManager('screen-container');
    this.combatScreen = document.getElementById('combat-screen')!;

    this.setupAudio();
    this.setupScreens();
    this.setupCombatEventListeners();
    this.setupStoryCardOverlay();
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
      () => this.screenManager.navigateTo('settings'),
      () => this.screenManager.navigateTo('upgrades')
    );

    // Upgrade Screen
    const upgradeScreen = createUpgradeScreen({
      onBack: () => this.screenManager.back(),
    });

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

    // Narrative Event Screen
    const narrativeEventScreen = createNarrativeEventScreen({
      onChoiceSelected: (event: NarrativeEvent, choice: NarrativeChoice) => {
        return this.handleNarrativeChoice(event, choice);
      },
      onEventComplete: () => this.handleNarrativeEventComplete(),
    });

    // Register screens
    this.screenManager.register(mainMenu);
    this.screenManager.register(upgradeScreen);
    this.screenManager.register(classSelect);
    this.screenManager.register(settings);
    this.screenManager.register(this.mapScreen);
    this.screenManager.register(narrativeEventScreen);

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

      // Show "Enemy Turn" banner
      this.renderer.showTurnBanner(false);

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
      } else {
        // Show "Your Turn" banner after enemy actions complete
        const delay = attackingEnemies.length * 300 + 800;
        setTimeout(() => {
          this.renderer.showTurnBanner(true);
        }, delay);
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

  private setupStoryCardOverlay(): void {
    this.storyCardOverlay = new StoryCardOverlay({
      onDismiss: () => {
        // Story card dismissed, continue with game flow
      },
    });
  }

  // ===========================================================================
  // NARRATIVE EVENT HANDLING
  // ===========================================================================

  /**
   * Handle a choice made in a narrative event
   */
  private handleNarrativeChoice(event: NarrativeEvent, choice: NarrativeChoice): {
    outcome: import('@/types/narrativeEvents').EventOutcome;
    rewardDescriptions: string[];
    penaltyDescriptions: string[];
  } {
    if (!this.narrativeService) {
      throw new Error('Narrative service not initialized');
    }

    const result = this.narrativeService.resolveChoice(event, choice);

    // Apply rewards and penalties to player state
    const runData = SaveManager.getActiveRun();
    if (runData) {
      // Create a temporary player state to apply changes
      const tempPlayer: PlayerState = {
        classId: this.currentClassId!,
        maxHp: runData.playerMaxHp,
        currentHp: runData.playerHp,
        block: 0,
        resolve: 3,
        maxResolve: 3,
        hand: [],
        drawPile: [],
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
        radiance: 0,
        maxRadiance: 10,
        minions: [],
        favor: 0,
        activePrices: [],
        baseMaxResolve: 3,
        permanentBlockBonus: 0,
        upgradeDamageBonus: 0,
        upgradeBlockBonus: 0,
      };

      const rewardDescriptions = this.narrativeService.applyRewardsToPlayer(
        tempPlayer,
        result.appliedRewards
      );
      const penaltyDescriptions = this.narrativeService.applyPenaltiesToPlayer(
        tempPlayer,
        result.appliedPenalties
      );

      // Save updated player state
      SaveManager.updateRun({
        playerHp: tempPlayer.currentHp,
        playerMaxHp: tempPlayer.maxHp,
      });

      // Handle gold changes
      for (const reward of result.appliedRewards) {
        if (reward.type === 'gold') {
          SaveManager.updateRun({
            gold: (runData.gold || 0) + (reward.amount || 0),
          });
        }
      }

      return {
        outcome: result.outcome,
        rewardDescriptions,
        penaltyDescriptions,
      };
    }

    return {
      outcome: result.outcome,
      rewardDescriptions: [],
      penaltyDescriptions: [],
    };
  }

  /**
   * Handle narrative event completion
   */
  private handleNarrativeEventComplete(): void {
    // Event completed

    // If we have pending combat (e.g., after pre-boss event), start it
    if (this.pendingCombatAfterNarrative && this.currentNode) {
      this.pendingCombatAfterNarrative = false;
      this.startCombatForNode(this.currentNode);
      return;
    }

    // Check for story card after event
    this.checkAndShowStoryCard();

    // Return to map
    this.showMapScreen();
  }

  /**
   * Check for and show story card if appropriate
   */
  private checkAndShowStoryCard(): void {
    if (!this.narrativeService || !this.storyCardOverlay) return;

    const runData = SaveManager.getActiveRun();
    if (!runData) return;

    const tempPlayer: PlayerState = {
      classId: this.currentClassId!,
      maxHp: runData.playerMaxHp,
      currentHp: runData.playerHp,
      block: 0,
      resolve: 3,
      maxResolve: 3,
      hand: [],
      drawPile: [],
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
      radiance: 0,
      maxRadiance: 10,
      minions: [],
      favor: 0,
      activePrices: [],
      baseMaxResolve: 3,
      permanentBlockBonus: 0,
      upgradeDamageBonus: 0,
      upgradeBlockBonus: 0,
    };

    const nodeType = this.currentNode?.type === NodeType.COMBAT ? 'combat'
      : this.currentNode?.type === NodeType.ELITE ? 'elite'
      : this.currentNode?.type === NodeType.BOSS ? 'boss'
      : 'combat';

    const result = this.narrativeService.checkForStoryCard(tempPlayer, {
      nodeType,
      isFirstCombat: this.isFirstCombat,
      isEliteDefeated: this.currentNode?.type === NodeType.ELITE,
    });

    if (result.shouldShow && result.card) {
      this.storyCardOverlay.show(result.card);
    }
  }

  /**
   * Check for narrative event before starting combat or after completing a room
   */
  private checkForNarrativeEvent(isBossPreFight: boolean = false, isBossPostFight: boolean = false): boolean {
    if (!this.narrativeService) return false;

    const runData = SaveManager.getActiveRun();
    if (!runData) return false;

    const tempPlayer: PlayerState = {
      classId: this.currentClassId!,
      maxHp: runData.playerMaxHp,
      currentHp: runData.playerHp,
      block: 0,
      resolve: 3,
      maxResolve: 3,
      hand: [],
      drawPile: [],
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
      radiance: 0,
      maxRadiance: 10,
      minions: [],
      favor: 0,
      activePrices: [],
      baseMaxResolve: 3,
      permanentBlockBonus: 0,
      upgradeDamageBonus: 0,
      upgradeBlockBonus: 0,
    };

    const nodeType = this.currentNode?.type === NodeType.COMBAT ? 'combat'
      : this.currentNode?.type === NodeType.ELITE ? 'elite'
      : this.currentNode?.type === NodeType.BOSS ? 'boss'
      : 'combat';

    const result = this.narrativeService.checkForEvent(tempPlayer, {
      nodeType,
      isBossPreFight,
      isBossPostFight,
      bossId: this.currentNode?.type === NodeType.BOSS ? 'boss' : undefined,
    });

    if (result.shouldTrigger && result.event) {
      this.showNarrativeEvent(result.event);
      return true;
    }

    return false;
  }

  /**
   * Show narrative event screen
   */
  private showNarrativeEvent(event: NarrativeEvent): void {
    // Get the narrative event screen and show the event
    const screen = this.screenManager.getScreen('narrative-event-screen') as ReturnType<typeof createNarrativeEventScreen> | undefined;
    if (screen && 'showEvent' in screen) {
      screen.showEvent(event);
      this.screenManager.navigateTo('narrative-event-screen');
    }
  }

  private startNewRun(classId: CharacterClassId): void {
    this.currentClassId = classId;
    const characterClass = CLASSES[classId];

    // Get run modifiers from purchased upgrades
    this.runModifiers = getRunModifiers(classId);
    const maxHp = characterClass.maxHp + this.runModifiers.maxHpBonus;

    // Generate map for Act 1
    const mapSeed = `run_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    this.currentFloor = generateFloor(1, mapSeed);
    const startNodeId = this.currentFloor.rows[0][0].id;

    // Save the new run with modified max HP and starting potions
    SaveManager.startNewRun(classId, maxHp, mapSeed, startNodeId, this.runModifiers.startingPotions);

    // Initialize narrative service for this run
    this.narrativeService = initNarrativeEventService(classId, mapSeed);
    this.isFirstCombat = true;

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

    // Initialize narrative service for continued run
    this.narrativeService = initNarrativeEventService(runData.classId, runData.mapSeed);
    this.isFirstCombat = runData.visitedNodeIds.length === 0;

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
      classId,
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
      radiance: 0,
      maxRadiance: 10,
      minions: [],
      favor: 0,
      activePrices: [],
      baseMaxResolve: characterClass.maxResolve,
      permanentBlockBonus: 0,
      upgradeDamageBonus: 0,
      upgradeBlockBonus: 0,
    };

    // Apply upgrade modifiers for combat start
    applyCombatModifiersToPlayer(player, classId);

    // Get enemies based on current node type
    const enemies = this.getEnemiesForNode();

    this.combat = new CombatEngine(player, enemies);

    // Register minion definitions for summoning abilities
    for (const minion of Object.values(MINIONS)) {
      this.combat.registerMinionDefinition(minion);
    }

    // Subscribe to combat events for logging and UI updates
    this.combat.subscribe((event) => {
      if (event.type === CombatEventType.COMBAT_LOG) {
        const data = event.data as { message: string };
        this.renderer.addLog(data.message);
      }
      // Hollow God Chomp Timer - re-render when card is chomped
      if (event.type === CombatEventType.CHOMP_TRIGGERED) {
        const data = event.data as { card: { name: string }; taunt: string };
        this.renderer.addLog(`The Void chomps! ${data.card.name} is lost... "${data.taunt}"`);
        this.render();
      }
      // Card corruption - re-render to show corrupted visual
      if (event.type === CombatEventType.CARD_CORRUPTED) {
        this.render();
      }
    });

    this.renderer.clearLog();
    this.combat.startCombat();
    this.renderer.setSelectedEnemy(0);
    this.render();

    // Show "Your Turn" banner at combat start
    this.renderer.showTurnBanner(true);
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
      // Check for pre-boss narrative event
      const isBoss = node.type === NodeType.BOSS;
      if (isBoss && this.checkForNarrativeEvent(true, false)) {
        // Event will show, combat starts after event completes
        // Store that we need to start combat after narrative
        this.pendingCombatAfterNarrative = true;
        return;
      }

      // Start combat
      this.startCombatForNode(node);
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

  /**
   * Start combat for a given node
   */
  private startCombatForNode(node: MapNode): void {
    SaveManager.setCurrentNode(node.id);
    SaveManager.setInCombat(true);

    // Track combat for narrative service
    if (this.narrativeService) {
      this.narrativeService.incrementCombatCount();
    }

    this.initCombat(this.currentClassId!);
    this.showCombatScreen();

    // No longer first combat after this
    this.isFirstCombat = false;
  }

  // Flag for pending combat after narrative event
  private pendingCombatAfterNarrative: boolean = false;

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

    // Track room cleared for narrative service
    if (this.narrativeService && victory) {
      this.narrativeService.incrementRoomsCleared();
    }

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

          // Check for post-boss narrative event
          if (this.checkForNarrativeEvent(false, true)) {
            return; // Event will show first
          }

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

          // Check for post-combat story card
          this.checkAndShowStoryCard();

          // Check for random narrative event after combat
          if (this.checkForNarrativeEvent(false, false)) {
            return; // Event will show first
          }

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
      [CharacterClassId.CELESTIAL]: {
        icon: '☀️',
        tooltip: 'Radiance: Divine energy that empowers holy spells. Build up Radiance through prayer and devotion.',
      },
      [CharacterClassId.SUMMONER]: {
        icon: '👻',
        tooltip: 'Minions: Summon spirits that protect you and auto-attack enemies. Enemies must defeat all minions before targeting you.',
      },
      [CharacterClassId.BARGAINER]: {
        icon: '🤝',
        tooltip: 'Favor: Make deals with powerful entities. Pay Prices for powerful effects, but beware of accumulating Debt.',
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
    this.renderPotions();

    // Update save with current HP
    if (this.currentClassId) {
      const state = this.combat.getState();
      SaveManager.updateRun({
        playerHp: state.player.currentHp,
        playerMaxHp: state.player.maxHp,
      });
    }
  }

  // ===========================================================================
  // POTION SYSTEM
  // ===========================================================================

  private renderPotions(): void {
    const potionSlots = document.getElementById('potion-slots');
    if (!potionSlots) return;

    const potions = SaveManager.getPotions();

    if (potions.length === 0) {
      potionSlots.innerHTML = '';
      return;
    }

    potionSlots.innerHTML = potions
      .map((slot) => {
        const potion = getPotion(slot.potionId);
        if (!potion) return '';
        return `
          <button class="potion-btn" data-potion-id="${slot.potionId}" data-tooltip="${potion.name}: ${potion.description}">
            <span class="potion-icon">${potion.icon}</span>
            ${slot.count > 1 ? `<span class="potion-count">${slot.count}</span>` : ''}
          </button>
        `;
      })
      .join('');

    // Attach click handlers
    potionSlots.querySelectorAll('.potion-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const potionId = (e.currentTarget as HTMLElement).dataset.potionId;
        if (potionId) {
          this.usePotion(potionId);
        }
      });
    });
  }

  private usePotion(potionId: string): void {
    if (!this.combat || this.combat.isGameOver()) return;

    const potion = getPotion(potionId);
    if (!potion) return;

    // Check if potion can be used
    if (!SaveManager.usePotion(potionId)) {
      this.renderer.addLog('No potions remaining!', true);
      return;
    }

    // Apply potion effect
    const state = this.combat.getState();
    const effect = potion.effect;

    AudioManager.playSfx('spell');

    switch (effect.type) {
      case 'heal': {
        const oldHp = state.player.currentHp;
        state.player.currentHp = Math.min(state.player.maxHp, state.player.currentHp + effect.amount);
        const healed = state.player.currentHp - oldHp;
        this.renderer.addLog(`Used ${potion.name}: Healed ${healed} HP`);
        break;
      }
      case 'block': {
        state.player.block += effect.amount;
        this.renderer.addLog(`Used ${potion.name}: Gained ${effect.amount} Block`);
        break;
      }
      case 'damage_all': {
        let totalDamage = 0;
        for (const enemy of state.enemies) {
          if (enemy.currentHp > 0) {
            const dmg = Math.min(enemy.currentHp, effect.amount);
            enemy.currentHp -= dmg;
            totalDamage += dmg;
          }
        }
        this.renderer.addLog(`Used ${potion.name}: Dealt ${totalDamage} damage to all enemies`);
        break;
      }
      case 'draw': {
        this.combat.drawCardsPublic(effect.amount);
        this.renderer.addLog(`Used ${potion.name}: Drew ${effect.amount} cards`);
        break;
      }
      case 'resolve': {
        state.player.resolve += effect.amount;
        this.renderer.addLog(`Used ${potion.name}: Gained ${effect.amount} Resolve`);
        break;
      }
      case 'apply_status': {
        if (effect.target === 'self') {
          const existing = state.player.statusEffects.find(s => s.type === effect.status);
          if (existing) {
            existing.amount += effect.amount;
          } else {
            state.player.statusEffects.push({ type: effect.status, amount: effect.amount });
          }
          this.renderer.addLog(`Used ${potion.name}: Gained ${effect.amount} ${StatusType[effect.status]}`);
        }
        break;
      }
    }

    this.render();

    // Check for combat end after potion use (damage potions might kill enemies)
    if (this.combat.isGameOver()) {
      this.handleCombatEnd();
    }
  }

  // ===========================================
  // DEBUG METHODS - For testing specific encounters
  // ===========================================

  /**
   * Start a debug combat with specified enemies
   * Available from browser console: window.debugCombat('hollow_god', 'knight')
   */
  debugCombat(enemyType: string, classId: CharacterClassId = CharacterClassId.DUNGEON_KNIGHT): void {
    this.currentClassId = classId;
    const characterClass = CLASSES[classId];
    const starterDeck = createStarterDeck(classId);

    // Create a powered-up player for testing boss fights
    const player: PlayerState = {
      classId,
      maxHp: 100,
      currentHp: 100,
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
      radiance: 0,
      maxRadiance: 10,
      minions: [],
      favor: 0,
      activePrices: [],
      baseMaxResolve: characterClass.maxResolve,
      permanentBlockBonus: 0,
      upgradeDamageBonus: 0,
      upgradeBlockBonus: 0,
    };

    // Get enemies based on type
    const enemies = this.getDebugEnemies(enemyType);

    if (enemies.length === 0) {
      console.error(`Unknown enemy type: ${enemyType}`);
      console.log('Available types: hollow_god, shadow_self, greater_demon, sanctum_warden, act3_common, act3_elite, bonelord, drowned_king');
      return;
    }

    this.combat = new CombatEngine(player, enemies);

    // Register minion definitions for summoning abilities
    for (const minion of Object.values(MINIONS)) {
      this.combat.registerMinionDefinition(minion);
    }
    // Register Act 3 minions
    this.combat.registerMinionDefinition(SHADOW_SELF);
    for (const enemy of Object.values(ACT3_ENEMIES)) {
      this.combat.registerMinionDefinition(enemy);
    }

    // Subscribe to combat events for logging and UI updates
    this.combat.subscribe((event) => {
      if (event.type === CombatEventType.COMBAT_LOG) {
        const data = event.data as { message: string };
        this.renderer.addLog(data.message);
      }
      // Hollow God Chomp Timer - re-render when card is chomped
      if (event.type === CombatEventType.CHOMP_TRIGGERED) {
        const data = event.data as { card: { name: string }; taunt: string };
        console.log('CHOMP!', data);
        this.renderer.addLog(`The Void chomps! ${data.card.name} is lost... "${data.taunt}"`);
        this.render();
      }
      // Card corruption - re-render to show corrupted visual
      if (event.type === CombatEventType.CARD_CORRUPTED) {
        const data = event.data as { card: { name: string } };
        console.log('Card corrupted:', data);
        this.render();
      }
      if (event.type === CombatEventType.CARD_PERMANENTLY_EXHAUSTED) {
        const data = event.data as { card: { name: string }; taunt: string };
        console.log('Card permanently exhausted:', data);
        this.renderer.addLog(`You forget how to ${data.card.name}... "${data.taunt}"`);
        this.render();
      }
      if (event.type === CombatEventType.BOSS_DIALOGUE) {
        console.log('Boss dialogue:', event.data);
      }
    });

    // Update HUD class info
    this.updateHudClassInfo(classId, characterClass.name);

    this.renderer.clearLog();
    this.combat.startCombat();
    this.renderer.setSelectedEnemy(0);
    this.render();

    // Show combat screen
    this.showCombatScreen();

    // Show "Your Turn" banner
    this.renderer.showTurnBanner(true);

    // Start Chomp Timer if fighting Hollow God
    if (enemyType === 'hollow_god' && this.combat.isHollowGodFight()) {
      this.combat.startChompTimer();
      console.log('Chomp Timer started! Cards will be discarded every 3 seconds.');
    }

    console.log(`Debug combat started: ${enemyType} vs ${characterClass.name}`);
    console.log('Tips:');
    console.log('- Use window.debugStopChomp() to stop the Chomp Timer');
    console.log('- Use window.debugDamageEnemy(amount) to deal damage to enemy 0');
    console.log('- Use window.debugHealPlayer(amount) to heal the player');
  }

  private getDebugEnemies(type: string): EnemyDefinition[] {
    switch (type.toLowerCase()) {
      case 'hollow_god':
        return [HOLLOW_GOD];
      case 'shadow_self':
        return [SHADOW_SELF];
      case 'greater_demon':
        return [ACT3_ELITE_ENEMIES.greater_demon];
      case 'sanctum_warden':
        return [ACT3_ELITE_ENEMIES.sanctum_warden];
      case 'act3_common':
        // Random Act 3 common enemies
        const commonKeys = Object.keys(ACT3_ENEMIES) as (keyof typeof ACT3_ENEMIES)[];
        const key1 = commonKeys[Math.floor(Math.random() * commonKeys.length)];
        const key2 = commonKeys[Math.floor(Math.random() * commonKeys.length)];
        return [ACT3_ENEMIES[key1], ACT3_ENEMIES[key2]];
      case 'act3_elite':
        const eliteKeys = Object.keys(ACT3_ELITE_ENEMIES) as (keyof typeof ACT3_ELITE_ENEMIES)[];
        const eliteKey = eliteKeys[Math.floor(Math.random() * eliteKeys.length)];
        return [ACT3_ELITE_ENEMIES[eliteKey]];
      case 'bonelord':
        return [BOSSES.bonelord];
      case 'drowned_king':
        return [BOSSES.drowned_king];
      default:
        return [];
    }
  }

  /**
   * Stop the Chomp Timer (useful for debugging)
   */
  debugStopChomp(): void {
    if (this.combat) {
      this.combat.stopChompTimer();
      console.log('Chomp Timer stopped.');
    }
  }

  /**
   * Deal damage to enemy 0 (useful for testing phase transitions)
   */
  debugDamageEnemy(amount: number): void {
    if (!this.combat) return;
    const state = this.combat.getState();
    if (state.enemies.length > 0) {
      const enemy = state.enemies[0];
      enemy.currentHp = Math.max(0, enemy.currentHp - amount);
      console.log(`Dealt ${amount} damage to ${enemy.name}. HP: ${enemy.currentHp}/${enemy.maxHp}`);
      this.render();
    }
  }

  /**
   * Heal the player (useful for testing)
   */
  debugHealPlayer(amount: number): void {
    if (!this.combat) return;
    const state = this.combat.getState();
    state.player.currentHp = Math.min(state.player.maxHp, state.player.currentHp + amount);
    console.log(`Healed player for ${amount}. HP: ${state.player.currentHp}/${state.player.maxHp}`);
    this.render();
  }

  /**
   * Get current combat engine (for advanced debugging)
   */
  debugGetCombat(): CombatEngine | null {
    return this.combat;
  }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();

  // Expose debug methods on window for browser console access
  // Usage: window.debugCombat('hollow_god', 'knight')
  (window as unknown as Record<string, unknown>).debugCombat = (enemyType: string, classId?: CharacterClassId) =>
    game.debugCombat(enemyType, classId);
  (window as unknown as Record<string, unknown>).debugStopChomp = () => game.debugStopChomp();
  (window as unknown as Record<string, unknown>).debugDamageEnemy = (amount: number) => game.debugDamageEnemy(amount);
  (window as unknown as Record<string, unknown>).debugHealPlayer = (amount: number) => game.debugHealPlayer(amount);
  (window as unknown as Record<string, unknown>).debugGetCombat = () => game.debugGetCombat();
  (window as unknown as Record<string, unknown>).giveSoulEchoes = (amount: number = 1000) => {
    SaveManager.addSoulEchoes(amount);
    console.log(`Added ${amount} Soul Echoes. Total: ${SaveManager.getSoulEchoes()}`);
  };
  (window as unknown as Record<string, unknown>).givePotion = (potionId: string = 'health_potion') => {
    const potion = getPotion(potionId);
    if (!potion) {
      console.log(`Unknown potion: ${potionId}. Available: health_potion, block_potion, fire_potion, swift_potion, energy_potion, might_potion, elixir_of_life`);
      return;
    }
    SaveManager.addPotion(potionId);
    console.log(`Added ${potion.name}. Potions: ${JSON.stringify(SaveManager.getPotions())}`);
  };

  console.log('Debug commands available:');
  console.log('  window.debugCombat("hollow_god")       - Fight the Hollow God');
  console.log('  window.debugCombat("greater_demon")    - Fight the Greater Demon');
  console.log('  window.debugCombat("sanctum_warden")   - Fight the Sanctum Warden');
  console.log('  window.debugCombat("act3_common")      - Fight random Act 3 enemies');
  console.log('  window.debugStopChomp()               - Stop the Chomp Timer');
  console.log('  window.debugDamageEnemy(100)          - Deal damage to enemy');
  console.log('  window.debugHealPlayer(50)            - Heal the player');
  console.log('  window.giveSoulEchoes(1000)           - Give Soul Echoes for testing');
  console.log('  window.givePotion("health_potion")    - Give a potion for testing');
});

