import { CombatEngine } from '@/engine/CombatEngine';
import { CombatRenderer } from '@/ui/renderer';
import { ScreenManager } from '@/ui/ScreenManager';
import { createMainMenuScreen } from '@/ui/screens/MainMenuScreen';
import { createClassSelectScreen } from '@/ui/screens/ClassSelectScreen';
import { createSettingsScreen } from '@/ui/screens/SettingsScreen';
import { createMapScreen } from '@/ui/screens/MapScreen';
import { createUpgradeScreen } from '@/ui/screens/UpgradeScreen';
import { createNarrativeEventScreen } from '@/ui/screens/NarrativeEventScreen';
import { createShrineScreen } from '@/ui/screens/ShrineScreen';
import { StoryCardOverlay } from '@/ui/screens/StoryCardOverlay';
import { SaveManager } from '@/services/SaveManager';
import { AudioManager } from '@/services/AudioManager';
import { TutorialService } from '@/services/TutorialService';
import { showWardenMessage } from '@/ui/components/WardenDialogue';
import { FIRST_ELITE_MESSAGE, FIRST_BOSS_MESSAGE, FIRST_SHRINE_MESSAGE, FIRST_MERCHANT_MESSAGE } from '@/data/tutorialDialogue';
import { TutorialOverlay } from '@/ui/components/TutorialOverlay';
import { NarrativeEventService, initNarrativeEventService } from '@/services/NarrativeEventService';
import { ShrineService, initShrineService } from '@/services/ShrineService';
import { applyCombatModifiersToPlayer, getRunModifiers, type RunModifiers } from '@/services/UpgradeEffects';
import { createStarterDeck, CLASSES } from '@/data/classes';
import { getCardById, getRandomRareCard, getRandomCard, PAIN_CURSE, DIABOLIST_CURSES } from '@/data/cards';
import { ACT1_ENEMIES } from '@/data/enemies/act1';
import { ELITE_ENEMIES, ELITE_MINIONS } from '@/data/enemies/elites';
import { BOSSES, MINIONS } from '@/data/enemies/bosses';
import { HOLLOW_GOD, SHADOW_SELF } from '@/data/enemies/act3-boss';
import { ACT3_ELITE_ENEMIES, ACT3_ELITE_MINIONS } from '@/data/enemies/act3-elites';
import { ACT3_ENEMIES } from '@/data/enemies/act3';
import { ACT2_ENEMIES } from '@/data/enemies/act2';
import { ACT2_BOSSES } from '@/data/enemies/act2-boss';
import { ACT2_ELITE_MINIONS } from '@/data/enemies/act2-elites';
import { generateFloor } from '@/map/MapGenerator';
import { CardType, CharacterClassId, CombatEventType, PlayerState, FloorMap, MapNode, NodeType, EnemyDefinition, StatusType, ActNumber, CardDefinition } from '@/types';
import { NarrativeEvent, NarrativeChoice } from '@/types/narrativeEvents';
import { ShrineDefinition, ShrineChoice } from '@/types/shrines';
import { getPotion } from '@/data/potions';
import { achievementTracker, startRunTracking, endRunTracking, recordActComplete, recordBossDefeated, recordEliteDefeated, recordShrineVisited, recordCampfireRest, recordWardenChoice, countCursesInDeck } from '@/services/AchievementTracker';
import { initAchievementNotifications } from '@/ui/AchievementNotification';
import { createAchievementScreen } from '@/ui/screens/AchievementScreen';
import { setupKeyboardNavigation } from '@/ui/KeyboardNav';
import { DebugLogService } from '@/services/DebugLogService';
import { haptics } from '@/services/HapticsService';
import { statusBar } from '@/services/StatusBarService';
import { ViewportService } from '@/services/ViewportService';
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
  private shrineService: ShrineService | null = null;
  private storyCardOverlay: StoryCardOverlay | null = null;
  private isFirstCombat: boolean = true;
  private runModifiers: RunModifiers | null = null;
  private isTutorialMode: boolean = false;

  constructor() {
    this.renderer = new CombatRenderer();
    this.screenManager = new ScreenManager('screen-container');
    this.combatScreen = document.getElementById('combat-screen')!;

    this.setupAudio();
    this.setupScreens();
    this.setupCombatEventListeners();
    this.setupStoryCardOverlay();

    // Initialize achievement notifications
    initAchievementNotifications();

    // Setup keyboard navigation
    setupKeyboardNavigation(this.screenManager);
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
      () => this.screenManager.navigateTo('upgrades'),
      () => this.screenManager.navigateTo('achievement-screen'),
      () => this.startTutorial()
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

    // Shrine Screen
    const shrineScreen = createShrineScreen({
      onChoiceSelected: (shrine: ShrineDefinition, choice: ShrineChoice) => {
        return this.handleShrineChoice(shrine, choice);
      },
      onShrineComplete: () => this.handleShrineComplete(),
      canAffordChoice: (choice: ShrineChoice) => this.canAffordShrineChoice(choice),
    });

    // Achievement Screen
    const achievementScreen = createAchievementScreen({
      onBack: () => this.screenManager.back(),
    });

    // Register screens
    this.screenManager.register(mainMenu);
    this.screenManager.register(upgradeScreen);
    this.screenManager.register(classSelect);
    this.screenManager.register(settings);
    this.screenManager.register(this.mapScreen);
    this.screenManager.register(narrativeEventScreen);
    this.screenManager.register(shrineScreen);
    this.screenManager.register(achievementScreen);

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
        // Debug log: Card played
        const target = state.enemies[targetEnemy];
        DebugLogService.logCardPlayed(card, state.player, target, result.log);

        // Notify tutorial overlay that player performed an action
        if (this.isTutorialMode) {
          TutorialOverlay.notifyAction();
        }

        // Haptic feedback for card played
        haptics.cardPlayed();

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

        // Auto-advance target if current target is dead
        this.autoSelectLivingTarget();

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

      // Haptic feedback for turn change
      haptics.turnChange();

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

      // Auto-advance target if current target died during enemy turn
      this.autoSelectLivingTarget();

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

    // Abandon run button (now inside settings menu)
    document.getElementById('abandon-btn')?.addEventListener('click', () => {
      this.hideSettingsMenu();
      if (confirm('Are you sure you want to abandon this run?')) {
        this.abandonRun();
      }
    });

    // Settings gear button - toggles settings menu
    document.getElementById('settings-gear-btn')?.addEventListener('click', () => {
      this.toggleSettingsMenu();
    });

    // Settings sound toggle
    document.getElementById('settings-sound-btn')?.addEventListener('click', () => {
      // Toggle sound (placeholder for actual sound implementation)
      const btn = document.getElementById('settings-sound-btn');
      if (btn) {
        const isOn = btn.textContent?.includes('On');
        btn.textContent = isOn ? '🔇 Sound: Off' : '🔊 Sound: On';
      }
    });

    // Combat log toggle button
    document.getElementById('combat-log-toggle')?.addEventListener('click', () => {
      this.toggleCombatLog();
    });

    // Click outside settings menu to close it
    document.querySelector('.dungeon-scene')?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const settingsMenu = document.getElementById('settings-menu');
      const settingsBtn = document.getElementById('settings-gear-btn');

      if (settingsMenu?.style.display !== 'none' &&
          !settingsMenu?.contains(target) &&
          !settingsBtn?.contains(target)) {
        this.hideSettingsMenu();
      }
    });
  }

  private toggleSettingsMenu(): void {
    const menu = document.getElementById('settings-menu');
    if (menu) {
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
  }

  private hideSettingsMenu(): void {
    const menu = document.getElementById('settings-menu');
    if (menu) {
      menu.style.display = 'none';
    }
  }

  private toggleCombatLog(): void {
    const panel = document.getElementById('combat-log-panel');
    const toggle = document.getElementById('combat-log-toggle');
    if (panel && toggle) {
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'flex';
      toggle.classList.toggle('active', !isVisible);
    }
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
        fracturePile: [],
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
        tide: 0,
        shadowEnergy: 0,
        inShadow: 0,
        gobbledCardsCombat: [],
        totalGobbled: 0,
        gobbleDamageBonus: 0,
        gobbleBlockBonus: 0,
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

      // Handle special reward types
      for (const reward of result.appliedRewards) {
        if (reward.type === 'gold') {
          SaveManager.updateRun({
            gold: (runData.gold || 0) + (reward.amount || 0),
          });
        } else if (reward.type === 'card_specific' && reward.cardId) {
          // Add the specific card to the player's deck
          const cardDef = getCardById(reward.cardId);
          if (cardDef) {
            const instanceId = `${reward.cardId}_event_${Date.now()}`;
            SaveManager.addCardToDeck(reward.cardId, instanceId);
          }
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
      fracturePile: [],
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
      tide: 0,
      shadowEnergy: 0,
      inShadow: 0,
      gobbledCardsCombat: [],
      totalGobbled: 0,
      gobbleDamageBonus: 0,
      gobbleBlockBonus: 0,
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
      fracturePile: [],
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
      tide: 0,
      shadowEnergy: 0,
      inShadow: 0,
      gobbledCardsCombat: [],
      totalGobbled: 0,
      gobbleDamageBonus: 0,
      gobbleBlockBonus: 0,
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

    // Start achievement tracking for this run
    startRunTracking(classId);

    // Initialize narrative service for this run
    this.narrativeService = initNarrativeEventService(classId, mapSeed);
    // Initialize shrine service for this run
    this.shrineService = initShrineService(classId, mapSeed);
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

  /**
   * Start a tutorial battle to teach game mechanics
   */
  private startTutorial(): void {
    // Use Knight class for tutorial (simple, balanced)
    this.currentClassId = CharacterClassId.DUNGEON_KNIGHT;
    this.isTutorialMode = true;

    const characterClass = CLASSES[this.currentClassId];

    // Update class name in UI
    const classNameEl = document.getElementById('player-class-name');
    if (classNameEl) {
      classNameEl.textContent = characterClass.name;
    }

    // Update HUD class info
    this.updateHudClassInfo(this.currentClassId, characterClass.name);

    // Initialize combat with tutorial enemy (skeleton)
    this.initCombat(this.currentClassId, true); // true = tutorial mode

    // Show combat screen
    this.showCombatScreen(false);

    // Start tutorial overlay with hints
    setTimeout(() => TutorialOverlay.start(), 500);
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
    // Initialize shrine service for continued run
    this.shrineService = initShrineService(runData.classId, runData.mapSeed);
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

  private initCombat(classId: CharacterClassId, isTutorial: boolean = false, currentHp?: number): void {
    const characterClass = CLASSES[classId];
    const starterDeck = createStarterDeck(classId);
    const runData = SaveManager.getActiveRun();

    // For tutorial, don't add saved deck cards - just use starter deck
    if (!isTutorial) {
      // Add any cards acquired during the run
      const savedDeck = SaveManager.getDeck();
      for (const savedCard of savedDeck) {
        const cardDef = getCardById(savedCard.cardId);
        if (cardDef) {
          starterDeck.push({
            ...cardDef,
            instanceId: savedCard.instanceId,
          });
        }
      }
    }

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
      fracturePile: [],
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
      tide: 0,
      shadowEnergy: 0,
      inShadow: 0,
      gobbledCardsCombat: [],
      totalGobbled: 0,
      gobbleDamageBonus: 0,
      gobbleBlockBonus: 0,
    };

    // Apply upgrade modifiers for combat start (skip for tutorial)
    if (!isTutorial) {
      applyCombatModifiersToPlayer(player, classId);
    }

    // Get enemies - use tutorial enemy or node-based enemies
    const enemies = isTutorial ? this.getTutorialEnemy() : this.getEnemiesForNode();

    this.combat = new CombatEngine(player, enemies);

    // Register minion definitions for summoning abilities
    for (const minion of Object.values(MINIONS)) {
      this.combat.registerMinionDefinition(minion);
    }
    // Register elite minions (summoned_acolyte for High Cultist)
    for (const minion of Object.values(ELITE_MINIONS)) {
      this.combat.registerMinionDefinition(minion);
    }

    // Start achievement tracking for this combat
    const cursesInDeck = countCursesInDeck(starterDeck);
    achievementTracker.startTracking(this.combat, cursesInDeck);

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

      // Combat Juice: Floating damage numbers and effects
      if (event.type === CombatEventType.ENEMY_DAMAGED) {
        const data = event.data as { enemyId: string; damage: number; blocked: number; hpDamage: number };
        // Find enemy index by id
        const combatState = this.combat!.getState();
        const enemyIndex = combatState.enemies.findIndex((e) => e.id === data.enemyId);
        if (enemyIndex !== -1) {
          this.renderer.showEnemyDamageNumber(enemyIndex, data.damage, data.blocked, data.hpDamage);
          // Screen shake for big hits
          if (data.hpDamage >= 10) {
            this.renderer.shakeScreen(Math.min(data.hpDamage / 2, 8), 200);
          }
          // Haptic feedback for damage dealt
          haptics.damageDealt();
        }
      }

      if (event.type === CombatEventType.PLAYER_DAMAGED) {
        const data = event.data as { damage: number; blocked: number; fortifyAbsorbed: number; hpDamage: number };
        this.renderer.showPlayerDamageNumber(data.damage, data.blocked, data.fortifyAbsorbed, data.hpDamage);
        // Screen shake and vignette for player damage
        if (data.hpDamage > 0) {
          this.renderer.shakeScreen(Math.min(data.hpDamage / 3, 6), 250);
          this.renderer.showDamageVignette(Math.min(data.hpDamage / 30, 0.5));
          // Haptic feedback for damage received
          haptics.damageReceived();
        }
      }

      if (event.type === CombatEventType.PLAYER_HEALED) {
        const data = event.data as { amount: number };
        this.renderer.showHealNumber('player', data.amount);
      }

      if (event.type === CombatEventType.ENEMY_DIED) {
        const data = event.data as { enemyId: string };
        const combatState = this.combat!.getState();
        const enemyIndex = combatState.enemies.findIndex((e) => e.id === data.enemyId);
        const enemy = combatState.enemies.find((e) => e.id === data.enemyId);
        if (enemyIndex !== -1 && enemy) {
          this.renderer.playEnemyDeathAnimation(enemyIndex, enemy.isBoss || false);
        }
      }
    });

    this.renderer.clearLog();
    this.combat.startCombat();

    // Debug log: Start combat (after startCombat so we have Enemy[] not EnemyDefinition[])
    DebugLogService.clear();
    const combatState = this.combat.getState();
    DebugLogService.logCombatStart(combatState.player, combatState.enemies);

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

  /**
   * Get a weak tutorial enemy
   */
  private getTutorialEnemy(): EnemyDefinition[] {
    return [ACT1_ENEMIES.training_dummy];
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
      // Check for first elite encounter message
      if (node.type === NodeType.ELITE && TutorialService.shouldShowFirstEliteMessage()) {
        showWardenMessage(FIRST_ELITE_MESSAGE, {
          duration: 4000,
          onDismiss: () => {
            TutorialService.markFirstEliteSeen();
            this.startCombatSequence(node);
          }
        });
        return;
      }

      // Check for first boss encounter message
      if (node.type === NodeType.BOSS && TutorialService.shouldShowFirstBossMessage()) {
        showWardenMessage(FIRST_BOSS_MESSAGE, {
          duration: 4000,
          onDismiss: () => {
            TutorialService.markFirstBossSeen();
            this.startCombatSequence(node);
          }
        });
        return;
      }

      this.startCombatSequence(node);
    } else if (node.type === NodeType.CAMPFIRE) {
      // TODO: Show rest screen (heal or upgrade)
      this.handleCampfireNode(node);
    } else if (node.type === NodeType.MERCHANT) {
      // Check for first merchant message
      if (TutorialService.shouldShowFirstMerchantMessage()) {
        showWardenMessage(FIRST_MERCHANT_MESSAGE, {
          duration: 4000,
          onDismiss: () => {
            TutorialService.markFirstMerchantSeen();
            this.handleNonCombatNode(node, 'Shop coming soon!');
          }
        });
        return;
      }
      // TODO: Show shop
      this.handleNonCombatNode(node, 'Shop coming soon!');
    } else if (node.type === NodeType.SHRINE) {
      // Check for first shrine message
      if (TutorialService.shouldShowFirstShrineMessage()) {
        showWardenMessage(FIRST_SHRINE_MESSAGE, {
          duration: 4000,
          onDismiss: () => {
            TutorialService.markFirstShrineSeen();
            this.handleShrineNode(node);
          }
        });
        return;
      }
      // Show shrine event
      this.handleShrineNode(node);
    }
  }

  /**
   * Start the combat sequence (checks for narrative events first)
   */
  private startCombatSequence(node: MapNode): void {
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
    this.showCombatScreen(node.type === NodeType.BOSS);

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

      // Track campfire rest for achievements (blocks "Boss Rush" achievement)
      recordCampfireRest();

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

  // ===========================================================================
  // SHRINE HANDLING
  // ===========================================================================

  /**
   * Handle a shrine node selection
   */
  private handleShrineNode(node: MapNode): void {
    if (!this.shrineService || !this.currentFloor) return;

    // Get a random shrine for the current act
    const act = this.currentFloor.act as 1 | 2 | 3;
    const shrine = this.shrineService.getRandomShrine(act);

    if (!shrine) {
      // No shrines available (all oncePerRun shrines already visited)
      this.handleNonCombatNode(node, 'The shrine stands silent. Nothing remains to discover here.');
      return;
    }

    // Prepare shrine with class-specific modifications
    const preparedShrine = this.shrineService.prepareShrine(shrine);

    // Show shrine screen
    const screen = this.screenManager.getScreen('shrine-screen') as ReturnType<typeof createShrineScreen> | undefined;
    if (screen && 'showShrine' in screen) {
      // Store current node for later use
      this.currentNode = node;
      screen.showShrine(preparedShrine);
      this.screenManager.navigateTo('shrine-screen');
    }
  }

  /**
   * Handle a choice made at a shrine
   */
  private handleShrineChoice(shrine: ShrineDefinition, choice: ShrineChoice): {
    outcome: import('@/types/shrines').ShrineOutcome;
    rewardDescriptions: string[];
    costDescriptions: string[];
    loreFragment?: string;
  } {
    // Track shrine visit for achievements
    recordShrineVisited(shrine.id);

    if (!this.shrineService) {
      throw new Error('Shrine service not initialized');
    }

    const runData = SaveManager.getActiveRun();
    if (!runData) {
      throw new Error('No active run');
    }

    // Apply upfront costs (HP, gold)
    const { newHp, newGold } = this.shrineService.applyChoiceCosts(
      { currentHp: runData.playerHp, maxHp: runData.playerMaxHp } as PlayerState,
      choice,
      runData.gold || 0
    );

    SaveManager.updateRun({
      playerHp: newHp,
      gold: newGold,
    });

    // Resolve the choice
    const result = this.shrineService.resolveChoice(shrine, choice);

    // Create a temporary player state to apply changes
    const tempPlayer: PlayerState = {
      classId: this.currentClassId!,
      maxHp: runData.playerMaxHp,
      currentHp: newHp,
      block: 0,
      resolve: 3,
      maxResolve: 3,
      hand: [],
      drawPile: [],
      discardPile: [],
      fracturePile: [],
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
      tide: 0,
      shadowEnergy: 0,
      inShadow: 0,
      gobbledCardsCombat: [],
      totalGobbled: 0,
      gobbleDamageBonus: 0,
      gobbleBlockBonus: 0,
    };

    // Apply rewards
    let rewardDescriptions = this.shrineService.applyRewardsToPlayer(
      tempPlayer,
      result.appliedRewards
    );

    // Check if curse_remove reward can actually be applied (player has curses)
    const hasCurseRemoveReward = result.appliedRewards.some(r => r.type === 'curse_remove');
    if (hasCurseRemoveReward) {
      // Get the player's deck and check for curses
      const savedDeck = SaveManager.getDeck();
      const starterDeck = createStarterDeck(this.currentClassId!);
      // Combine starter deck + saved cards to check for curses
      const allCards = [
        ...starterDeck,
        ...savedDeck.map(sc => {
          const cardDef = getCardById(sc.cardId);
          return cardDef ? { ...cardDef, instanceId: sc.instanceId } : null;
        }).filter(Boolean),
      ];
      const hasCurses = allCards.some(card => card && card.type === CardType.CURSE);

      if (!hasCurses) {
        // Filter out the "Removed a curse from deck" description since there are no curses
        rewardDescriptions = rewardDescriptions.filter(desc => desc !== 'Removed a curse from deck');
        rewardDescriptions.push('No curses to remove');
      } else {
        // Actually remove a curse from the deck
        // Find the first curse in saved deck and remove it
        const curseIndex = savedDeck.findIndex(sc => {
          const cardDef = getCardById(sc.cardId);
          return cardDef && cardDef.type === CardType.CURSE;
        });
        if (curseIndex !== -1) {
          SaveManager.removeCardFromDeck(savedDeck[curseIndex].instanceId);
        }
        // Note: We can't remove starter deck curses easily, so only removes from saved deck
      }
    }

    // Handle card_rare reward - add a random rare card to deck
    const hasRareCardReward = result.appliedRewards.some(r => r.type === 'card_rare');
    if (hasRareCardReward && this.currentClassId) {
      const rareCardReward = result.appliedRewards.find(r => r.type === 'card_rare');
      let cardToAdd: CardDefinition | undefined;

      // Check if a specific cardId was provided
      if (rareCardReward?.cardId) {
        cardToAdd = getCardById(rareCardReward.cardId);
      } else {
        // Get a random rare card for the player's class
        cardToAdd = getRandomRareCard(this.currentClassId);
      }

      if (cardToAdd) {
        const instanceId = `shrine_rare_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        SaveManager.addCardToDeck(cardToAdd.id, instanceId);
        // Update the description with the actual card name
        const descIndex = rewardDescriptions.findIndex(d => d === 'Gained a rare card');
        if (descIndex !== -1) {
          rewardDescriptions[descIndex] = `Gained ${cardToAdd.name} (Rare)`;
        }
      }
    }

    // Handle card_random reward - add a random card to deck
    const hasRandomCardReward = result.appliedRewards.some(r => r.type === 'card_random');
    if (hasRandomCardReward && this.currentClassId) {
      const randomCard = getRandomCard(this.currentClassId);
      if (randomCard) {
        const instanceId = `shrine_random_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        SaveManager.addCardToDeck(randomCard.id, instanceId);
        // Update the description with the actual card name
        const descIndex = rewardDescriptions.findIndex(d => d === 'Gained a random card');
        if (descIndex !== -1) {
          rewardDescriptions[descIndex] = `Gained ${randomCard.name}`;
        }
      }
    }

    // Handle curse_add reward/cost - add curses to deck
    const curseAddRewards = [...result.appliedRewards, ...result.appliedCosts].filter(r => r.type === 'curse_add');
    for (const curseReward of curseAddRewards) {
      const count = curseReward.amount || 1;
      const curseKeys = Object.keys(DIABOLIST_CURSES);
      for (let i = 0; i < count; i++) {
        // Pick a random curse type
        const curseKey = curseKeys[Math.floor(Math.random() * curseKeys.length)];
        const curse = DIABOLIST_CURSES[curseKey as keyof typeof DIABOLIST_CURSES];
        const instanceId = `shrine_curse_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
        SaveManager.addCardToDeck(curse.id, instanceId);
      }
    }

    // Handle pain_add reward/cost - add Pain cards to deck
    const painAddRewards = [...result.appliedRewards, ...result.appliedCosts].filter(r => r.type === 'pain_add');
    for (const painReward of painAddRewards) {
      const count = painReward.amount || 1;
      for (let i = 0; i < count; i++) {
        const instanceId = `shrine_pain_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`;
        SaveManager.addCardToDeck(PAIN_CURSE.id, instanceId);
      }
    }

    // Apply costs
    const costDescriptions = this.shrineService.applyCostsToPlayer(
      tempPlayer,
      result.appliedCosts
    );

    // Save updated player state
    SaveManager.updateRun({
      playerHp: tempPlayer.currentHp,
      playerMaxHp: tempPlayer.maxHp,
    });

    // Handle gold changes from rewards/costs
    let goldChange = 0;
    for (const reward of result.appliedRewards) {
      if (reward.type === 'gold') {
        goldChange += reward.amount || 0;
      }
    }
    for (const cost of result.appliedCosts) {
      if (cost.type === 'gold_loss') {
        goldChange -= cost.amount || 0;
      }
    }
    if (goldChange !== 0) {
      SaveManager.updateRun({
        gold: Math.max(0, (runData.gold || 0) + goldChange),
      });
    }

    return {
      outcome: result.outcome,
      rewardDescriptions,
      costDescriptions,
      loreFragment: result.loreFragment,
    };
  }

  /**
   * Handle shrine completion
   */
  private handleShrineComplete(): void {
    if (this.currentNode) {
      this.currentNode.visited = true;
      SaveManager.markNodeVisited(this.currentNode.id);
      SaveManager.setCurrentNode(this.currentNode.id);
    }

    // Check for story card after shrine
    this.checkAndShowStoryCard();

    // Return to map
    this.showMapScreen();
  }

  /**
   * Check if player can afford a shrine choice
   */
  private canAffordShrineChoice(choice: ShrineChoice): { canAfford: boolean; reason?: string } {
    if (!this.shrineService) {
      return { canAfford: false, reason: 'Shrine service not initialized' };
    }

    const runData = SaveManager.getActiveRun();
    if (!runData) {
      return { canAfford: false, reason: 'No active run' };
    }

    // Create minimal player state for affordability check
    const tempPlayer = {
      currentHp: runData.playerHp,
      maxHp: runData.playerMaxHp,
    } as PlayerState;

    return this.shrineService.canAffordChoice(tempPlayer, choice, runData.gold || 0);
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

  /**
   * Auto-select the first living enemy if current target is dead
   */
  private autoSelectLivingTarget(): void {
    if (!this.combat) return;
    const enemies = this.combat.getState().enemies;
    const currentIndex = this.renderer.getSelectedEnemy();

    // If current target is dead or doesn't exist, find first living enemy
    if (!enemies[currentIndex] || enemies[currentIndex].currentHp <= 0) {
      const livingIndex = enemies.findIndex(e => e.currentHp > 0);
      if (livingIndex !== -1) {
        this.renderer.setSelectedEnemy(livingIndex);
      }
    }
  }

  private handleCombatEnd(): void {
    if (!this.combat) return;

    const state = this.combat.getState();
    const victory = state.victory;

    // Handle tutorial mode - just go back to menu
    if (this.isTutorialMode) {
      this.isTutorialMode = false;
      TutorialOverlay.stop();
      AudioManager.playMusic(victory ? 'victory' : 'menu');

      this.renderer.showGameOver(victory, 0, () => {
        this.renderer.removeGameOver();
        this.hideCombatScreen();
        this.screenManager.navigateTo('main-menu');
      });
      return;
    }

    const runData = SaveManager.getActiveRun();
    const classId = runData?.classId || CharacterClassId.CLERIC;
    const currentAct = runData?.currentAct || 1;

    // Debug log: Combat end
    DebugLogService.logCombatEnd(victory, victory ? 'All enemies defeated' : 'Player defeated');

    // Stop achievement tracking for this combat
    achievementTracker.stopTracking(victory);

    // Play victory/defeat music and haptic feedback
    AudioManager.playMusic(victory ? 'victory' : 'defeat');
    if (victory) {
      haptics.victory();
    } else {
      haptics.defeat();
    }

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

      // Mark tutorial as complete after first combat victory
      if (TutorialService.isNewPlayer()) {
        TutorialService.completeTutorial();
      }

      // Save current HP
      SaveManager.updateRun({ playerHp: state.player.currentHp });

      // Check if this was the boss - run complete!
      const isBossNode = this.currentNode?.type === NodeType.BOSS;
      const isEliteNode = this.currentNode?.type === NodeType.ELITE;
      const isHollowGodBoss = isBossNode && currentAct === 3; // Final boss

      // Track achievement progress for elite/boss defeats
      if (isEliteNode) {
        recordEliteDefeated();
      }
      if (isBossNode) {
        // Record boss defeat with appropriate boss ID
        const bossId = isHollowGodBoss ? 'hollow_god' : currentAct === 1 ? 'bonelord' : 'drowned_king';
        recordBossDefeated(bossId);
        // Record act completion
        recordActComplete(currentAct);
      }

      // Award Soul Echoes based on combat type
      // Elite rewards: 15 Soul Echoes (vs 2 normal, 50 boss)
      const soulEchoesReward = isBossNode ? 50 : isEliteNode ? 15 : 2;
      SaveManager.addSoulEchoes(soulEchoesReward);

      if (isHollowGodBoss) {
        // Hollow God defeated - show Warden choice!
        SaveManager.endRun(true);
        this.renderer.showVictoryChoice(classId, soulEchoesReward, (choice) => {
          this.handleVictoryChoice(classId, choice, soulEchoesReward);
        });
      } else if (isBossNode) {
        // Act boss defeated (not Hollow God) - continue to next act
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
        // TODO: Implement proper rewards screen (card selection, relic drops, etc.)
        // Base gold reward: 10-30 gold for normal, doubled for elite
        const baseGold = Math.floor(Math.random() * 20) + 10;
        const goldReward = isEliteNode ? baseGold * 2 : baseGold;
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
      // Defeat - show narrative defeat screen
      SaveManager.endRun(false);
      // End run tracking with defeat
      endRunTracking(false);
      // Determine act number for narrative - use 'boss' if died to a boss
      const isBossNode = this.currentNode?.type === NodeType.BOSS;
      const defeatAct: ActNumber = isBossNode ? 'boss' : (currentAct as 1 | 2 | 3);

      this.renderer.showNarrativeDefeat(classId, defeatAct, 0, () => {
        this.renderer.removeGameOver();
        this.hideCombatScreen();
        this.screenManager.navigateTo('main-menu', true);
      });
    }
  }

  /**
   * Handle the player's choice after defeating the Hollow God
   */
  private handleVictoryChoice(classId: CharacterClassId, choice: 'warden' | 'leave', soulEchoesEarned: number): void {
    // Track Warden choice for achievements
    recordWardenChoice(choice);
    // End run tracking with victory
    endRunTracking(true);

    // Gather run stats for sharing
    const classInfo = CLASSES[classId];
    const combatState = this.combat?.getState();
    const shareData = {
      className: classInfo?.name || 'Unknown',
      bossName: 'The Hollow God',
      turnsPlayed: combatState?.turn || 0,
      cardsPlayed: 0, // Not tracked currently
      actNumber: 3,
      finalHp: combatState?.player.currentHp || 0,
      maxHp: combatState?.player.maxHp || 0,
    };

    if (choice === 'warden') {
      // Player becomes the Warden - show the good ending
      this.renderer.showVictoryEnding(classId, choice, soulEchoesEarned, () => {
        this.renderer.removeGameOver();
        this.hideCombatScreen();
        this.screenManager.navigateTo('main-menu', true);
      }, shareData);
    } else {
      // Player leaves - show class-specific leave ending, then bad ending
      this.renderer.showVictoryEnding(classId, choice, soulEchoesEarned, () => {
        // After the leave narrative, show the bad ending consequences
        this.renderer.showBadEnding(soulEchoesEarned, () => {
          this.renderer.removeGameOver();
          this.hideCombatScreen();
          this.screenManager.navigateTo('main-menu', true);
        });
      }, shareData);
    }
  }

  private abandonRun(): void {
    // End run tracking with defeat (abandoned = not a victory)
    endRunTracking(false);
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
      [CharacterClassId.TIDECALLER]: {
        icon: '🌊',
        tooltip: 'Tide: Build Tide to increase Drown threshold. Drown instantly kills enemies below a certain HP percentage.',
      },
      [CharacterClassId.SHADOW_STALKER]: {
        icon: '🌑',
        tooltip: 'Shadow Energy: Build energy for burst damage. Enter Shadow state for enhanced attacks and evasion.',
      },
      [CharacterClassId.GOBLIN]: {
        icon: '🦷',
        tooltip: 'Gobble: Eat cards to gain combat bonuses. Hoard cards to trigger Goblin Mode for extra damage and block.',
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

  private showCombatScreen(isBoss: boolean = false): void {
    this.combatScreen.style.display = 'block';
    document.getElementById('screen-container')!.style.display = 'none';
    AudioManager.playMusic('combat');

    // Set arena background based on act and boss status
    const runData = SaveManager.getActiveRun();
    const act = runData?.currentAct || 1;
    const dungeonScene = document.querySelector('.dungeon-scene');
    if (dungeonScene) {
      dungeonScene.setAttribute('data-act', String(act));
      dungeonScene.setAttribute('data-boss', isBoss ? 'true' : 'false');
    }

    // Set player silhouette based on class
    const playerSilhouette = document.querySelector('.player-silhouette');
    if (playerSilhouette && this.currentClassId) {
      playerSilhouette.setAttribute('data-class', this.currentClassId);
    }

    // Recalculate viewport scaling for mobile
    ViewportService.recalculate();
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
      fracturePile: [],
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
      tide: 0,
      shadowEnergy: 0,
      inShadow: 0,
      gobbledCardsCombat: [],
      totalGobbled: 0,
      gobbleDamageBonus: 0,
      gobbleBlockBonus: 0,
    };

    // Get enemies based on type
    const enemies = this.getDebugEnemies(enemyType);

    if (enemies.length === 0) {
      console.error(`Unknown enemy type: ${enemyType}`);
      console.log('Available types: hollow_god, shadow_self, greater_demon, sanctum_warden, act3_common, act3_elite, bonelord, drowned_king, drowned_cultist, bone_archer, ghoul, shade, slime, high_cultist, tomb_guardian');
      return;
    }

    this.combat = new CombatEngine(player, enemies);

    // Register minion definitions for summoning abilities
    for (const minion of Object.values(MINIONS)) {
      this.combat.registerMinionDefinition(minion);
    }
    // Register Act 2 elite minions (void_tendril for Void Caller)
    for (const minion of Object.values(ACT2_ELITE_MINIONS)) {
      this.combat.registerMinionDefinition(minion);
    }
    // Register Act 3 minions
    this.combat.registerMinionDefinition(SHADOW_SELF);
    for (const enemy of Object.values(ACT3_ENEMIES)) {
      this.combat.registerMinionDefinition(enemy);
    }
    // Register Act 3 elite minions (memory enemies for Sanctum Warden)
    for (const minion of Object.values(ACT3_ELITE_MINIONS)) {
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
      if (event.type === CombatEventType.CARD_PERMANENTLY_FRACTURED) {
        const data = event.data as { card: { name: string }; taunt: string };
        console.log('Card permanently fractured:', data);
        this.renderer.playForgetAnimation(data.card.name);
        this.renderer.addLog(`You forget how to ${data.card.name}... "${data.taunt}"`);
        this.render();
      }
      if (event.type === CombatEventType.BOSS_DIALOGUE) {
        const data = event.data as { message: string; phase: number; bossId?: string; bossName?: string };
        console.log('Boss dialogue:', data);
        this.renderer.showBossDialogue(data.message, data.bossName);
      }
      // Act 3 mechanics - Card consumed by void
      if (event.type === CombatEventType.CARD_CONSUMED) {
        const data = event.data as { card: { name: string } };
        this.renderer.playCardConsumedAnimation(data.card.name);
        this.render();
      }
      // Act 3 mechanics - Buffs purged
      if (event.type === CombatEventType.BUFFS_PURGED) {
        const data = event.data as { buffs: Array<{ type: string }> };
        this.renderer.playBuffsPurgedAnimation(data.buffs.length);
        this.render();
      }
      // Act 3 mechanics - Demon synergy (Howl/Giggle)
      if (event.type === CombatEventType.DEMON_SYNERGY) {
        const data = event.data as { buffName: string };
        this.renderer.playDemonSynergyAnimation(data.buffName);
      }
    });

    // Update HUD class info
    this.updateHudClassInfo(classId, characterClass.name);

    this.renderer.clearLog();
    this.combat.startCombat();
    this.renderer.setSelectedEnemy(0);
    this.render();

    // Show combat screen (determine if boss fight)
    const isBossFight = ['hollow_god', 'bonelord', 'drowned_king'].includes(enemyType);
    this.showCombatScreen(isBossFight);

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
        return [ACT2_BOSSES.drowned_king];
      case 'drowned_cultist':
        return [ACT2_ENEMIES.drowned_cultist];
      case 'bone_archer':
        return [ACT1_ENEMIES.bone_archer];
      case 'ghoul':
        return [ACT1_ENEMIES.ghoul];
      case 'shade':
        return [ACT1_ENEMIES.shade];
      case 'slime':
        return [ACT2_ENEMIES.slime];
      case 'high_cultist':
        return [ELITE_ENEMIES.high_cultist];
      case 'tomb_guardian':
        return [ELITE_ENEMIES.tomb_guardian];
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

// Import accessibility initializer
import { initializeAccessibilitySettings } from '@/ui/screens/SettingsScreen';

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize iOS status bar
  statusBar.initialize();

  // Initialize accessibility settings (applies saved preferences + system preferences)
  initializeAccessibilitySettings();

  // Go straight to game - tutorial is opt-in via menu button
  initializeGame();
});

function initializeGame(): void {
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

  // Expose DebugLogService to window for console access
  (window as unknown as { debugLog: typeof DebugLogService }).debugLog = DebugLogService;

  // Unlock all classes for testing
  (window as unknown as Record<string, unknown>).unlockAllClasses = () => {
    (window as unknown as Record<string, boolean>).__ALL_CLASSES_UNLOCKED__ = true;
    console.log('All classes unlocked! Refresh the class select screen to see changes.');
  };

  // Lock classes back to normal
  (window as unknown as Record<string, unknown>).lockClasses = () => {
    (window as unknown as Record<string, boolean>).__ALL_CLASSES_UNLOCKED__ = false;
    console.log('Classes locked back to normal. Refresh the class select screen to see changes.');
  };

  // Reset tutorial state for testing
  (window as unknown as Record<string, unknown>).resetTutorial = () => {
    TutorialService.reset();
    console.log('Tutorial state reset. Refresh the page to see the entrance screen.');
  };

  // Get tutorial state for debugging
  (window as unknown as Record<string, unknown>).getTutorialState = () => {
    const state = TutorialService.getState();
    console.log('Tutorial State:', state);
    return state;
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
  console.log('  window.unlockAllClasses()             - Unlock all classes for testing');
  console.log('  window.lockClasses()                  - Lock classes back to normal');
  console.log('  window.resetTutorial()                - Reset tutorial state (then refresh)');
  console.log('  window.getTutorialState()             - View current tutorial state');
  console.log('  window.debugLog.getLogs()             - Get all debug logs');
  console.log('  window.debugLog.exportJSON()          - Export logs as JSON');
  console.log('  window.debugLog.exportText()          - Export logs as text');
}

