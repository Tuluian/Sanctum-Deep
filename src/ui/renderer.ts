import { CombatState, IntentType, StatusEffect, StatusType, Vow, VowBonusType, VowRestrictionType, CardType, EffectType, Card, PlayerState, CharacterClassId, ActNumber, VictoryChoice } from '@/types';
import {
  getDefeatNarrative,
  getVictoryNarrative,
  getCharacterName,
  DEFEAT_FRAME,
  VICTORY_FRAME,
  WARDEN_CHOICE_INTRO,
  VICTORY_CHOICES,
  BAD_ENDING,
} from '@/data/endingNarratives';

// Character portrait images for endings
function getClassImage(classId: CharacterClassId): string | null {
  const imageMap: Partial<Record<CharacterClassId, string>> = {
    [CharacterClassId.CLERIC]: '/images/characters/CLERIC.jpg',
    [CharacterClassId.DUNGEON_KNIGHT]: '/images/characters/KNIGHT.jpg',
    [CharacterClassId.DIABOLIST]: '/images/characters/DIABOLIST.jpg',
    [CharacterClassId.OATHSWORN]: '/images/characters/oathsworn.jpg',
    [CharacterClassId.FEY_TOUCHED]: '/images/characters/fey-touched.jpg',
    [CharacterClassId.CELESTIAL]: '/images/characters/celestial.jpg',
    [CharacterClassId.SUMMONER]: '/images/characters/summoner.jpg',
    [CharacterClassId.BARGAINER]: '/images/characters/bargainer.jpg',
    [CharacterClassId.TIDECALLER]: '/images/characters/tidecaller.jpg',
    [CharacterClassId.SHADOW_STALKER]: '/images/characters/shadow_stalker.jpg',
    [CharacterClassId.GOBLIN]: '/images/characters/goblin.png',
  };
  return imageMap[classId] || null;
}

// Status effect display info
const STATUS_INFO: Record<StatusType, { icon: string; name: string; description: string; isDebuff: boolean }> = {
  [StatusType.SUNDERED]: {
    icon: '💔',
    name: 'Sundered',
    description: 'Takes 50% more damage from all sources.',
    isDebuff: true,
  },
  [StatusType.IMPAIRED]: {
    icon: '🦯',
    name: 'Impaired',
    description: 'Deals 25% less damage with attacks.',
    isDebuff: true,
  },
  [StatusType.BLEEDING]: {
    icon: '🩸',
    name: 'Bleeding',
    description: 'Takes damage at the start of each turn. Stacks decrease by 1 each turn.',
    isDebuff: true,
  },
  [StatusType.CURSED]: {
    icon: '☠️',
    name: 'Cursed',
    description: 'Cannot heal. Lasts until cleansed or combat ends.',
    isDebuff: true,
  },
  [StatusType.BOUND]: {
    icon: '⛓️',
    name: 'Bound',
    description: 'Cannot gain Block. Lasts for a number of turns.',
    isDebuff: true,
  },
  [StatusType.BLESSED]: {
    icon: '✨',
    name: 'Blessed',
    description: 'Heals at the start of each turn. Stacks decrease by 1 each turn.',
    isDebuff: false,
  },
  [StatusType.EMPOWERED]: {
    icon: '⚡',
    name: 'Empowered',
    description: 'Next attack deals bonus damage, then expires.',
    isDebuff: false,
  },
  [StatusType.WARDED]: {
    icon: '🔮',
    name: 'Warded',
    description: 'Immune to the next debuff applied. Consumed on use.',
    isDebuff: false,
  },
  [StatusType.MIGHT]: {
    icon: '💪',
    name: 'Might',
    description: 'Deals increased damage with all attacks.',
    isDebuff: false,
  },
  [StatusType.RESILIENCE]: {
    icon: '🛡️',
    name: 'Resilience',
    description: 'Takes reduced damage from all sources.',
    isDebuff: false,
  },
  [StatusType.CORRUPT]: {
    icon: '🩻',
    name: 'Corrupt',
    description: 'Take damage equal to stacks when playing a card. Decays by 1 per card and per turn.',
    isDebuff: true,
  },
  [StatusType.REGENERATION]: {
    icon: '💚',
    name: 'Regeneration',
    description: 'Heal at the start of each turn.',
    isDebuff: false,
  },
  [StatusType.DIVINE_FORM]: {
    icon: '👼',
    name: 'Divine Form',
    description: 'Deal +1 damage with all attacks while at max Radiance.',
    isDebuff: false,
  },
  [StatusType.INTANGIBLE]: {
    icon: '👻',
    name: 'Intangible',
    description: 'All incoming damage reduced by 50%.',
    isDebuff: false,
  },
  [StatusType.SOAKED]: {
    icon: '💧',
    name: 'Soaked',
    description: 'Vulnerable to water attacks. Takes extra damage from Tidecaller abilities.',
    isDebuff: true,
  },
  [StatusType.SHADOW]: {
    icon: '🌑',
    name: 'In Shadow',
    description: 'Enhanced damage and 50% evasion chance.',
    isDebuff: false,
  },
  [StatusType.EVADE]: {
    icon: '💨',
    name: 'Evade',
    description: 'Negates the next incoming attack.',
    isDebuff: false,
  },
  [StatusType.GOBLIN_MODE]: {
    icon: '🦷',
    name: 'Goblin Mode',
    description: '+2 damage and block to all cards this turn.',
    isDebuff: false,
  },
};

// Vow bonus display info
const VOW_BONUS_INFO: Record<VowBonusType, string> = {
  [VowBonusType.DAMAGE_BOOST]: 'Deal +{amount} damage with attacks',
  [VowBonusType.BLOCK_PER_TURN]: 'Gain {amount} Block at start of turn',
  [VowBonusType.DRAW_CARDS]: 'Draw {amount} extra card(s) each turn',
  [VowBonusType.RESOLVE_BOOST]: '+{amount} max Resolve this combat',
  [VowBonusType.THORNS]: 'Deal {amount} damage when attacked',
  [VowBonusType.DOUBLE_BLOCK]: 'Block effects are doubled',
  [VowBonusType.HEAL_ON_DAMAGE]: 'Heal {amount} when taking damage',
};

// Vow restriction display info
const VOW_RESTRICTION_INFO: Record<VowRestrictionType, string> = {
  [VowRestrictionType.NO_BLOCK]: 'Cannot play Block cards',
  [VowRestrictionType.NO_ATTACK]: 'Cannot play Attack cards',
  [VowRestrictionType.NO_SKILL]: 'Cannot play Skill cards',
  [VowRestrictionType.MUST_ATTACK]: 'Must play an Attack card each turn',
  [VowRestrictionType.NO_POWER]: 'Cannot play Power cards',
  [VowRestrictionType.MIN_CARDS]: 'Must play at least {amount} cards per turn',
  [VowRestrictionType.NO_HEAL]: 'Cannot heal',
};

export class CombatRenderer {
  private elements: {
    enemies: HTMLElement;
    enemySlots: HTMLElement;
    playerHp: HTMLElement;
    playerBlock: HTMLElement;
    playerResolve: HTMLElement;
    playerDevotion: HTMLElement;
    hand: HTMLElement;
    drawCount: HTMLElement;
    discardCount: HTMLElement;
    turnCount: HTMLElement;
    combatLog: HTMLElement;
    // HUD elements
    hudHp: HTMLElement;
    hudBlock: HTMLElement;
    hudResolve: HTMLElement;
    hudDevotion: HTMLElement;
    hudClassName: HTMLElement;
    hudClassIcon: HTMLElement;
    playerHud: HTMLElement;
  };

  private onCardClick: (cardIndex: number) => void = () => {};
  private onEnemyClick: (enemyIndex: number) => void = () => {};
  private selectedEnemyIndex: number = 0;

  constructor() {
    this.elements = {
      enemies: document.getElementById('enemies')!,
      enemySlots: document.getElementById('enemy-slots')!,
      playerHp: document.getElementById('player-hp')!,
      playerBlock: document.getElementById('player-block')!,
      playerResolve: document.getElementById('player-resolve')!,
      playerDevotion: document.getElementById('player-devotion')!,
      hand: document.getElementById('hand')!,
      drawCount: document.getElementById('draw-count')!,
      discardCount: document.getElementById('discard-count')!,
      turnCount: document.getElementById('turn-count')!,
      combatLog: document.getElementById('combat-log')!,
      // HUD elements
      hudHp: document.getElementById('hud-hp')!,
      hudBlock: document.getElementById('hud-block')!,
      hudResolve: document.getElementById('hud-resolve')!,
      hudDevotion: document.getElementById('hud-devotion')!,
      hudClassName: document.getElementById('hud-class-name')!,
      hudClassIcon: document.getElementById('hud-class-icon')!,
      playerHud: document.querySelector('.player-hud')!,
    };

    // Expose handlers globally for onclick attributes
    (window as unknown as { selectEnemy: (index: number) => void }).selectEnemy = (index: number) => {
      this.onEnemyClick(index);
    };
    (window as unknown as { playCard: (index: number) => void }).playCard = (index: number) => {
      this.onCardClick(index);
    };
  }

  setCardClickHandler(handler: (cardIndex: number) => void): void {
    this.onCardClick = handler;
  }

  setEnemyClickHandler(handler: (enemyIndex: number) => void): void {
    this.onEnemyClick = handler;
  }

  setSelectedEnemy(index: number): void {
    this.selectedEnemyIndex = index;
  }

  getSelectedEnemy(): number {
    return this.selectedEnemyIndex;
  }

  private getSpecialtyStat(player: PlayerState): number {
    switch (player.classId) {
      case CharacterClassId.CLERIC:
        return player.devotion;
      case CharacterClassId.DUNGEON_KNIGHT:
        return player.fortify;
      case CharacterClassId.DIABOLIST:
        return player.soulDebt;
      case CharacterClassId.OATHSWORN:
        return player.vowsActivatedThisCombat;
      case CharacterClassId.FEY_TOUCHED:
        return player.luck;
      case CharacterClassId.CELESTIAL:
        return player.radiance;
      case CharacterClassId.SUMMONER:
        return player.minions.length;
      default:
        return player.devotion;
    }
  }

  private renderStatusEffects(effects: StatusEffect[]): string {
    if (!effects || effects.length === 0) return '';

    return effects
      .map((effect) => {
        const info = STATUS_INFO[effect.type];
        if (!info) return '';

        const stacks = effect.amount > 1 ? `×${effect.amount}` : '';
        const duration = effect.duration ? ` (${effect.duration} turns)` : '';
        const tooltipText = `${info.name}${stacks}: ${info.description}${duration}`;
        const debuffClass = info.isDebuff ? 'debuff' : 'buff';

        return `
          <div class="status-effect ${debuffClass}" data-status-type="${effect.type}" data-status-amount="${effect.amount}" data-tooltip="${tooltipText}">
            <span class="status-icon">${info.icon}</span>
            ${effect.amount > 1 ? `<span class="status-stacks">${effect.amount}</span>` : ''}
          </div>
        `;
      })
      .join('');
  }

  /**
   * Trigger pop animation on a specific status effect
   */
  popStatusEffect(target: 'player' | 'enemy', statusType: string, enemyIndex?: number): void {
    let container: Element | null = null;

    if (target === 'player') {
      container = document.querySelector('.player-hud .status-effects');
    } else if (enemyIndex !== undefined) {
      const enemyElements = document.querySelectorAll('.arena-enemy');
      const enemyEl = enemyElements[enemyIndex];
      if (enemyEl) {
        container = enemyEl.querySelector('.enemy-status-effects');
      }
    }

    if (!container) return;

    const statusEl = container.querySelector(`[data-status-type="${statusType}"]`);
    if (statusEl) {
      statusEl.classList.remove('status-effect-pop');
      // Force reflow to restart animation
      void (statusEl as HTMLElement).offsetWidth;
      statusEl.classList.add('status-effect-pop');
    }
  }

  /**
   * Trigger pop animation on all new/updated status effects
   * (called when status effects change)
   */
  popNewStatusEffects(target: 'player' | 'enemy', effects: StatusEffect[], enemyIndex?: number): void {
    let container: Element | null = null;

    if (target === 'player') {
      container = document.querySelector('.player-hud .status-effects');
    } else if (enemyIndex !== undefined) {
      const enemyElements = document.querySelectorAll('.arena-enemy');
      const enemyEl = enemyElements[enemyIndex];
      if (enemyEl) {
        container = enemyEl.querySelector('.enemy-status-effects');
      }
    }

    if (!container) return;

    // Pop all status effects (simplified - could track changes for more precision)
    effects.forEach((effect) => {
      const statusEl = container!.querySelector(`[data-status-type="${effect.type}"]`);
      if (statusEl) {
        const prevAmount = statusEl.getAttribute('data-status-amount');
        if (prevAmount !== String(effect.amount)) {
          statusEl.classList.remove('status-effect-pop');
          void (statusEl as HTMLElement).offsetWidth;
          statusEl.classList.add('status-effect-pop');
          statusEl.setAttribute('data-status-amount', String(effect.amount));
        }
      }
    });
  }

  private renderVow(vow: Vow | null): string {
    if (!vow) return '';

    // Get bonus description with amount substituted
    const bonusTemplate = VOW_BONUS_INFO[vow.bonus.type] || 'Unknown bonus';
    const bonusDesc = bonusTemplate.replace('{amount}', String(vow.bonus.amount));

    // Get restriction description
    const restrictionDesc = VOW_RESTRICTION_INFO[vow.restriction.type] || vow.restriction.description;

    // Build charges display
    const chargesDisplay = vow.charges !== undefined
      ? ` (${vow.currentCharges ?? vow.charges}/${vow.charges} charges)`
      : '';

    // Build tooltip content
    const tooltipText = `${vow.name}${chargesDisplay}\n\nBonus: ${bonusDesc}\nRestriction: ${restrictionDesc}\n\nBreaking this vow triggers a penalty!`;

    return `
      <div class="vow-badge" data-tooltip="${tooltipText.replace(/"/g, '&quot;')}">
        <span class="vow-icon">⚔️</span>
        <span class="vow-name">${vow.name}</span>
        ${vow.charges !== undefined ? `<span class="vow-charges">${vow.currentCharges ?? vow.charges}</span>` : ''}
      </div>
    `;
  }

  render(state: CombatState): void {
    this.renderEnemies(state);
    this.renderArenaEnemies(state);
    this.renderPlayerStats(state);
    this.renderHand(state);
    this.renderPiles(state);
  }

  private renderEnemies(state: CombatState): void {
    this.elements.enemies.innerHTML = state.enemies
      .map((enemy, index) => {
        const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;
        const isDead = enemy.currentHp <= 0;
        const isSelected = index === this.selectedEnemyIndex && !isDead;

        let intentText = '';
        if (enemy.intent && !isDead) {
          if (enemy.intent.intent === IntentType.ATTACK) {
            intentText = `⚔️ Attack for ${enemy.intent.damage} damage`;
          } else if (enemy.intent.intent === IntentType.DEFEND) {
            intentText = `🛡️ Defend for ${enemy.intent.block} block`;
          }
        }

        return `
          <div class="enemy ${isDead ? 'dead' : ''} ${isSelected ? 'selected' : ''}"
               onclick="selectEnemy(${index})">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div class="enemy-name">${enemy.name}</div>
              ${enemy.block > 0 ? `<div class="block-display">🛡️ ${enemy.block}</div>` : ''}
            </div>
            <div class="hp-bar">
              <div class="hp-fill" style="width: ${hpPercent}%;"></div>
              <div class="hp-text">${enemy.currentHp} / ${enemy.maxHp}</div>
            </div>
            ${!isDead && enemy.intent ? `<div class="intent">${intentText}</div>` : ''}
          </div>
        `;
      })
      .join('');
  }

  private getIntentDescription(intent: CombatState['enemies'][0]['intent']): string {
    if (!intent) return '';

    switch (intent.intent) {
      case IntentType.ATTACK:
        return `Attacks for ${intent.damage} damage`;
      case IntentType.MULTI_ATTACK:
        return `Attacks ${intent.times} times for ${intent.damage} damage each (${intent.damage! * intent.times!} total)`;
      case IntentType.DEFEND:
        return `Gains ${intent.block} Block`;
      case IntentType.BUFF:
        return intent.buffType ? `Buffs self with ${intent.buffType}` : 'Strengthens itself';
      case IntentType.DEBUFF:
        return intent.debuffType ? `Applies ${intent.debuffType} to you` : 'Weakens you';
      case IntentType.CHARGING:
        return `Charging a powerful attack: ${intent.name}`;
      case IntentType.COMMAND:
        return 'Commands all minions to attack';
      case IntentType.SUMMON:
        return 'Summons reinforcements';
      case IntentType.HEAL:
        return intent.heal ? `Heals for ${intent.heal} HP` : 'Heals itself';
      default:
        return 'Unknown intent';
    }
  }

  private renderArenaEnemies(state: CombatState): void {
    // Scale down enemy container when there are many enemies to fit screen
    const aliveEnemies = state.enemies.filter(e => e.currentHp > 0).length;
    const scaleFactor = aliveEnemies <= 2 ? 1 : Math.max(0.65, 1 - (aliveEnemies - 2) * 0.12);
    const gap = aliveEnemies <= 2 ? '40px' : `${Math.max(20, 40 - (aliveEnemies - 2) * 8)}px`;
    this.elements.enemySlots.style.transform = `translateY(-60%) scale(${scaleFactor})`;
    this.elements.enemySlots.style.gap = gap;

    this.elements.enemySlots.innerHTML = state.enemies
      .map((enemy, index) => {
        const hpPercent = (enemy.currentHp / enemy.maxHp) * 100;
        const isDead = enemy.currentHp <= 0;
        const isSelected = index === this.selectedEnemyIndex && !isDead;

        let intentDisplay = '';
        let intentClass = '';
        let intentDescription = '';
        if (enemy.intent && !isDead) {
          intentDescription = this.getIntentDescription(enemy.intent);

          if (enemy.intent.intent === IntentType.ATTACK) {
            const times = enemy.intent.times ? `x${enemy.intent.times}` : '';
            intentDisplay = `⚔️ ${enemy.intent.damage}${times}`;
          } else if (enemy.intent.intent === IntentType.DEFEND) {
            intentDisplay = `🛡️ ${enemy.intent.block}`;
          } else if (enemy.intent.intent === IntentType.BUFF) {
            intentDisplay = `Buff`;
          } else if (enemy.intent.intent === IntentType.DEBUFF) {
            intentDisplay = `Debuff`;
          } else if (enemy.intent.intent === IntentType.CHARGING) {
            intentDisplay = `${enemy.intent.name}`;
            intentClass = 'charging';
          } else if (enemy.intent.intent === IntentType.COMMAND) {
            intentDisplay = `Command`;
          } else if (enemy.intent.intent === IntentType.SUMMON) {
            intentDisplay = `Summon`;
          } else if (enemy.intent.intent === IntentType.MULTI_ATTACK) {
            intentDisplay = `⚔️ ${enemy.intent.damage}x${enemy.intent.times}`;
          } else {
            intentDisplay = `?`;
          }
        }

        // Boss-specific styling
        const isBoss = enemy.isBoss;
        const bossClass = isBoss ? 'boss' : '';
        const phaseIndicator = isBoss && enemy.phase > 0 ? `<div class="boss-phase">Phase ${enemy.phase + 1}</div>` : '';

        // Elite-specific styling
        const isElite = enemy.isElite;
        const eliteClass = isElite ? 'elite' : '';
        const elitePhaseIndicator = isElite && enemy.phase > 0 ? `<div class="elite-phase">Phase ${enemy.phase + 1}</div>` : '';

        // Elite passive indicator
        let elitePassiveIndicator = '';
        if (isElite && enemy.id.includes('greater_demon')) {
          elitePassiveIndicator = '<div class="elite-passive">🔥 Infernal Presence: -2 damage</div>';
        } else if (isElite && enemy.id.includes('sanctum_warden')) {
          elitePassiveIndicator = '<div class="elite-passive">⚓ Reality Anchor: Draw 4 max</div>';
        }

        // Intangible styling
        const intangibleClass = enemy.intangible > 0 ? 'intangible' : '';
        const intangibleIndicator = enemy.intangible > 0 ? `<div class="intangible-indicator">👻 Intangible</div>` : '';

        // Intent tooltip HTML
        const intentTooltip = intentDescription ? `<div class="intent-tooltip">${intentDescription}</div>` : '';

        return `
          <div class="arena-enemy ${isDead ? 'dead' : ''} ${isSelected ? 'selected' : ''} ${bossClass} ${eliteClass} ${intangibleClass}"
               onclick="selectEnemy(${index})"
               data-enemy-id="${enemy.id}">
            ${phaseIndicator}
            ${elitePhaseIndicator}
            ${elitePassiveIndicator}
            ${intangibleIndicator}
            ${!isDead && enemy.intent ? `
              <div class="arena-enemy-intent-wrapper">
                <div class="arena-enemy-intent ${intentClass}">${intentDisplay}</div>
                ${intentTooltip}
              </div>
            ` : ''}
            ${enemy.block > 0 ? `<div class="arena-enemy-block">🛡️ ${enemy.block}</div>` : ''}
            <div class="arena-enemy-name">${enemy.name}</div>
            <div class="arena-enemy-hp ${isBoss ? 'boss-hp' : ''} ${isElite ? 'elite-hp' : ''} ${enemy.id.includes('hollow_god') ? 'hollow-god-hp' : ''}">
              <div class="arena-enemy-hp-fill" style="width: ${hpPercent}%;"></div>
              ${enemy.id.includes('hollow_god') ? `
                <div class="phase-marker" style="left: 70%;" title="Phase 2: Consumption"></div>
                <div class="phase-marker" style="left: 32%;" title="Phase 3: Annihilation"></div>
              ` : ''}
              <div class="arena-enemy-hp-text">${enemy.currentHp}/${enemy.maxHp}</div>
            </div>
            ${enemy.statusEffects.length > 0 ? `
              <div class="status-effects-row enemy-statuses">
                ${this.renderStatusEffects(enemy.statusEffects)}
              </div>
            ` : ''}
            <div class="enemy-figure ${isBoss ? 'boss-figure' : ''} ${isElite ? 'elite-figure' : ''}" data-enemy-type="${enemy.id.replace(/_\d+$/, '')}"></div>
          </div>
        `;
      })
      .join('');
  }

  private renderPlayerStats(state: CombatState): void {
    const player = state.player;
    // Update main stats area
    this.elements.playerHp.textContent = `${player.currentHp}/${player.maxHp}`;
    this.elements.playerBlock.textContent = `🛡️ ${player.block}`;
    this.elements.playerResolve.textContent = `${player.resolve}/${player.maxResolve}`;
    this.elements.playerDevotion.textContent = String(this.getSpecialtyStat(player));

    // Update HUD overlay
    this.elements.hudHp.textContent = `${player.currentHp}/${player.maxHp}`;
    this.elements.hudBlock.textContent = String(player.block);
    this.elements.hudResolve.textContent = `${player.resolve}/${player.maxResolve}`;
    // Re-query hud-devotion since main.ts replaces the innerHTML of hud-specialty-stat
    const hudDevotionElement = document.getElementById('hud-devotion');
    if (hudDevotionElement) {
      hudDevotionElement.textContent = String(this.getSpecialtyStat(player));
    }

    // Update player status effects in HUD
    const hudStatusContainer = document.getElementById('hud-status-effects');
    if (hudStatusContainer) {
      if (player.statusEffects.length > 0) {
        hudStatusContainer.innerHTML = this.renderStatusEffects(player.statusEffects);
        hudStatusContainer.style.display = 'flex';
      } else {
        hudStatusContainer.innerHTML = '';
        hudStatusContainer.style.display = 'none';
      }
    }

    // Update active Vow display in HUD (Oathsworn class)
    const hudVowContainer = document.getElementById('hud-vow');
    if (hudVowContainer) {
      if (player.activeVow) {
        hudVowContainer.innerHTML = this.renderVow(player.activeVow);
        hudVowContainer.style.display = 'flex';
      } else {
        hudVowContainer.innerHTML = '';
        hudVowContainer.style.display = 'none';
      }
    }

    // Low HP warning effect (below 30%)
    const hpPercent = player.currentHp / player.maxHp;
    if (hpPercent <= 0.3) {
      this.elements.playerHud.classList.add('low-hp');
    } else {
      this.elements.playerHud.classList.remove('low-hp');
    }

    // Low HP vignette effect (below 30%)
    const vignette = document.getElementById('low-hp-vignette');
    if (vignette) {
      if (hpPercent <= 0.3) {
        vignette.classList.add('active');
      } else {
        vignette.classList.remove('active');
      }
    }
  }

  /**
   * Calculate damage modifier for attack cards based on active effects
   */
  private getDamageModifier(player: PlayerState): { flat: number; isBuffed: boolean; isDebuffed: boolean } {
    let flat = 0;
    let isBuffed = false;
    let isDebuffed = false;

    // Empowered attack bonus (one-time)
    if (player.empoweredAttack > 0) {
      flat += player.empoweredAttack;
      isBuffed = true;
    }

    // Vow damage bonus (Oathsworn)
    if (player.activeVow?.bonus.type === VowBonusType.DAMAGE_BOOST) {
      flat += player.activeVow.bonus.amount;
      isBuffed = true;
    }

    // IMPAIRED status (25% damage reduction) - check player status effects
    const impaired = player.statusEffects.find(e => e.type === StatusType.IMPAIRED);
    if (impaired) {
      isDebuffed = true;
    }

    return { flat, isBuffed, isDebuffed };
  }

  /**
   * Calculate block modifier based on active effects
   */
  private getBlockModifier(player: PlayerState): { flat: number; isBuffed: boolean } {
    let flat = 0;
    let isBuffed = false;

    // Permanent block bonus from cards like Iron Mastery
    if (player.permanentBlockBonus > 0) {
      flat += player.permanentBlockBonus;
      isBuffed = true;
    }

    return { flat, isBuffed };
  }

  /**
   * Generate card description with modified damage and block values highlighted
   */
  private getModifiedCardDescription(card: Card, player: PlayerState): string {
    let modifiedDesc = card.description;
    const isAttackCard = card.type === CardType.ATTACK;

    // Handle damage modifications for attack cards
    if (isAttackCard) {
      const damageModifier = this.getDamageModifier(player);

      if (damageModifier.flat !== 0 || damageModifier.isDebuffed) {
        for (const effect of card.effects) {
          if (effect.type === EffectType.DAMAGE || effect.type === EffectType.DAMAGE_ALL) {
            const baseDamage = effect.amount;
            let modifiedDamage = baseDamage + damageModifier.flat;

            // Apply IMPAIRED reduction (25% less damage)
            if (damageModifier.isDebuffed) {
              modifiedDamage = Math.floor(modifiedDamage * 0.75);
            }

            // Determine highlight class
            let highlightClass = '';
            if (modifiedDamage > baseDamage) {
              highlightClass = 'damage-buffed';
            } else if (modifiedDamage < baseDamage) {
              highlightClass = 'damage-debuffed';
            }

            if (highlightClass) {
              // Replace the base damage number with highlighted modified value
              // Match patterns like "Deal X damage" or "X damage"
              const damageRegex = new RegExp(`\\b${baseDamage}\\b(?=\\s*damage)`, 'gi');
              modifiedDesc = modifiedDesc.replace(damageRegex,
                `<span class="${highlightClass}">${modifiedDamage}</span>`
              );
            }
          }
        }
      }
    }

    // Handle block modifications for any card with block effects
    const blockModifier = this.getBlockModifier(player);
    if (blockModifier.flat !== 0) {
      for (const effect of card.effects) {
        if (effect.type === EffectType.BLOCK) {
          const baseBlock = effect.amount;
          const modifiedBlock = baseBlock + blockModifier.flat;

          if (modifiedBlock > baseBlock) {
            // Replace the base block number with highlighted modified value
            // Match patterns like "Gain X block" or "X block"
            const blockRegex = new RegExp(`\\b${baseBlock}\\b(?=\\s*block)`, 'gi');
            modifiedDesc = modifiedDesc.replace(blockRegex,
              `<span class="block-buffed">${modifiedBlock}</span>`
            );
          }
        }
      }
    }

    // Handle DAMAGE_EQUAL_BLOCK - show current block value as damage
    for (const effect of card.effects) {
      if (effect.type === EffectType.DAMAGE_EQUAL_BLOCK) {
        const currentBlock = player.block;
        const highlightClass = currentBlock > 0 ? 'damage-buffed' : '';
        // Replace "damage equal to your Block" with actual value
        modifiedDesc = modifiedDesc.replace(
          /damage equal to your Block/i,
          `<span class="${highlightClass}">${currentBlock}</span> damage (your Block)`
        );
      }
    }

    // Handle DAMAGE_EQUAL_FORTIFY - show current fortify value as damage
    for (const effect of card.effects) {
      if (effect.type === EffectType.DAMAGE_EQUAL_FORTIFY) {
        const currentFortify = player.fortify;
        const highlightClass = currentFortify > 0 ? 'damage-buffed' : '';
        modifiedDesc = modifiedDesc.replace(
          /damage equal to your Fortify/i,
          `<span class="${highlightClass}">${currentFortify}</span> damage (your Fortify)`
        );
      }
    }

    // Handle BLOCK_EQUAL_FORTIFY - show current fortify value as block
    for (const effect of card.effects) {
      if (effect.type === EffectType.BLOCK_EQUAL_FORTIFY) {
        const currentFortify = player.fortify;
        const highlightClass = currentFortify > 0 ? 'block-buffed' : '';
        modifiedDesc = modifiedDesc.replace(
          /block equal to your Fortify/i,
          `<span class="${highlightClass}">${currentFortify}</span> Block (your Fortify)`
        );
      }
    }

    return modifiedDesc;
  }

  private renderHand(state: CombatState): void {
    const player = state.player;
    this.elements.hand.innerHTML = player.hand
      .map((card, index) => {
        const canPlay = card.cost <= player.resolve && !state.gameOver;
        const typeClass = card.type.toLowerCase();
        const modifiedDescription = this.getModifiedCardDescription(card, player);
        // Use card's classId if available, otherwise use player's class, fallback to neutral
        const cardClassId = card.classId || player.classId || 'neutral';
        const classStyleClass = `class-${cardClassId}`;

        return `
          <div class="card ${typeClass} ${classStyleClass} ${!canPlay ? 'unplayable' : ''}"
               onclick="playCard(${index})">
            <div class="card-header">
              <div class="card-name">${card.name}</div>
              <div class="card-cost">${card.cost}</div>
            </div>
            <div class="card-type">${card.type}</div>
            <div class="card-description">${modifiedDescription}</div>
          </div>
        `;
      })
      .join('');
  }

  private renderPiles(state: CombatState): void {
    this.elements.drawCount.textContent = String(state.player.drawPile.length);
    this.elements.discardCount.textContent = String(state.player.discardPile.length);
    this.elements.turnCount.textContent = String(state.turn);
  }

  addLog(message: string, isError: boolean = false): void {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    if (isError) entry.style.color = '#e74c3c';
    entry.textContent = message;
    this.elements.combatLog.appendChild(entry);
    this.elements.combatLog.scrollTop = this.elements.combatLog.scrollHeight;
  }

  clearLog(): void {
    this.elements.combatLog.innerHTML = '';
  }

  showGameOver(victory: boolean, soulEchoesEarned: number = 0, onContinue?: () => void): void {
    const existing = document.querySelector('.game-over');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = `game-over ${victory ? 'victory' : 'defeat'}`;

    div.innerHTML = `
      <h2>${victory ? '🎉 VICTORY! 🎉' : '💀 DEFEAT 💀'}</h2>
      <p style="font-size: 1em; margin: 15px 0;">
        ${victory ? 'You defeated all enemies!' : 'You were defeated...'}
      </p>
      <p style="font-size: 0.9em; color: #9b59b6; margin-bottom: 15px;">
        +${soulEchoesEarned} 🔮 Soul Echoes
      </p>
      <button id="game-over-continue" style="margin-top: 10px;">${victory ? 'Continue' : 'Return to Menu'}</button>
    `;
    document.body.appendChild(div);

    const continueBtn = document.getElementById('game-over-continue');
    if (continueBtn && onContinue) {
      continueBtn.addEventListener('click', onContinue);
    } else if (continueBtn) {
      continueBtn.addEventListener('click', () => location.reload());
    }
  }

  removeGameOver(): void {
    const gameOverDiv = document.querySelector('.game-over');
    if (gameOverDiv) gameOverDiv.remove();
  }

  /**
   * Show narrative defeat screen with class-specific text
   */
  showNarrativeDefeat(
    classId: CharacterClassId,
    act: ActNumber,
    _soulEchoesEarned: number,
    onContinue?: () => void
  ): void {
    const existing = document.querySelector('.game-over');
    if (existing) existing.remove();

    const characterName = getCharacterName(classId);
    const narrative = getDefeatNarrative(classId, act);
    const classImage = getClassImage(classId);

    const div = document.createElement('div');
    div.className = 'game-over defeat narrative-ending';

    // Build narrative content
    const narrativeText = narrative?.narrative || 'The Sanctum claims another soul...';
    const wardenQuote = narrative?.wardenQuote || 'Another falls. The void grows.';

    // Character portrait with image or fallback
    const portraitContent = classImage
      ? `<img src="${classImage}" alt="${characterName}" class="defeat-portrait-img" />`
      : '';

    div.innerHTML = `
      <div class="ending-frame defeat-frame">
        <h2 class="ending-title">${DEFEAT_FRAME.title}</h2>
        <div class="ending-character">
          <div class="character-portrait defeat-portrait">${portraitContent}</div>
          <div class="character-name">${characterName}</div>
        </div>
        <p class="ending-subtitle">"${DEFEAT_FRAME.subtitle}"</p>
      </div>
      <div class="narrative-content">
        <div class="narrative-text">${this.formatNarrativeText(narrativeText)}</div>
        <div class="warden-quote">
          <span class="warden-attribution">— The Warden</span>
          <p>"${wardenQuote}"</p>
        </div>
      </div>
      <div class="ending-footer">
        <button id="game-over-continue" class="ending-button">Return to Menu</button>
      </div>
    `;
    document.body.appendChild(div);

    const continueBtn = document.getElementById('game-over-continue');
    if (continueBtn && onContinue) {
      continueBtn.addEventListener('click', onContinue);
    } else if (continueBtn) {
      continueBtn.addEventListener('click', () => location.reload());
    }
  }

  /**
   * Show victory screen with Warden choice
   */
  showVictoryChoice(
    classId: CharacterClassId,
    soulEchoesEarned: number,
    onChoice: (choice: 'warden' | 'leave') => void
  ): void {
    const existing = document.querySelector('.game-over');
    if (existing) existing.remove();

    const characterName = getCharacterName(classId);

    const div = document.createElement('div');
    div.className = 'game-over victory narrative-ending';

    div.innerHTML = `
      <div class="ending-frame victory-frame">
        <h2 class="ending-title">${VICTORY_FRAME.title}</h2>
        <div class="ending-character">
          <div class="character-portrait victory-portrait"></div>
          <div class="character-name">${characterName}</div>
        </div>
        <p class="ending-subtitle">"${VICTORY_FRAME.subtitle}"</p>
      </div>
      <div class="narrative-content">
        <div class="warden-speech">${this.formatNarrativeText(WARDEN_CHOICE_INTRO)}</div>
        <div class="victory-choices">
          ${VICTORY_CHOICES.map((choice: VictoryChoice) => `
            <button class="victory-choice-btn" data-choice="${choice.id}">
              <span class="choice-label">${choice.label}</span>
              <span class="choice-description">"${choice.description}"</span>
            </button>
          `).join('')}
        </div>
      </div>
      <div class="ending-footer">
        <p class="soul-echoes-earned">+${soulEchoesEarned} 🔮 Soul Echoes</p>
      </div>
    `;
    document.body.appendChild(div);

    // Add click handlers for choices
    const choiceButtons = div.querySelectorAll('.victory-choice-btn');
    choiceButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-choice') as 'warden' | 'leave';
        onChoice(choice);
      });
    });
  }

  /**
   * Show the ending narrative after player makes their choice
   */
  showVictoryEnding(
    classId: CharacterClassId,
    choice: 'warden' | 'leave',
    soulEchoesEarned: number,
    onContinue?: () => void
  ): void {
    const existing = document.querySelector('.game-over');
    if (existing) existing.remove();

    const characterName = getCharacterName(classId);
    const narrative = getVictoryNarrative(classId, choice);

    const div = document.createElement('div');
    div.className = 'game-over victory narrative-ending ending-finale';

    const narrativeText = narrative?.narrative || 'Your journey ends here...';
    const epilogueText = narrative?.epilogue || '';

    const choiceTitle = choice === 'warden' ? 'THE NEW WARDEN' : 'FREEDOM';

    div.innerHTML = `
      <div class="ending-frame victory-frame">
        <h2 class="ending-title">${choiceTitle}</h2>
        <div class="ending-character">
          <div class="character-portrait victory-portrait"></div>
          <div class="character-name">${characterName}</div>
        </div>
      </div>
      <div class="narrative-content">
        <div class="narrative-text">${this.formatNarrativeText(narrativeText)}</div>
        ${epilogueText ? `
          <div class="epilogue">
            <div class="epilogue-divider">* * *</div>
            <div class="epilogue-text">${this.formatNarrativeText(epilogueText)}</div>
          </div>
        ` : ''}
      </div>
      <div class="ending-footer">
        <p class="soul-echoes-earned">+${soulEchoesEarned} 🔮 Soul Echoes</p>
        <button id="game-over-continue" class="ending-button">Return to Menu</button>
      </div>
    `;
    document.body.appendChild(div);

    const continueBtn = document.getElementById('game-over-continue');
    if (continueBtn && onContinue) {
      continueBtn.addEventListener('click', onContinue);
    } else if (continueBtn) {
      continueBtn.addEventListener('click', () => location.reload());
    }
  }

  /**
   * Show the bad ending when player leaves without becoming Warden
   */
  showBadEnding(soulEchoesEarned: number, onContinue?: () => void): void {
    const existing = document.querySelector('.game-over');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'game-over bad-ending narrative-ending';

    div.innerHTML = `
      <div class="ending-frame bad-ending-frame">
        <h2 class="ending-title">${BAD_ENDING.title}</h2>
      </div>
      <div class="narrative-content bad-ending-content">
        ${BAD_ENDING.lines.map(line =>
          line ? `<p class="bad-ending-line">"${line}"</p>` : '<p class="bad-ending-line">&nbsp;</p>'
        ).join('')}
      </div>
      <div class="ending-footer">
        <p class="soul-echoes-earned">+${soulEchoesEarned} 🔮 Soul Echoes</p>
        <button id="game-over-continue" class="ending-button">Return to Menu</button>
      </div>
    `;
    document.body.appendChild(div);

    const continueBtn = document.getElementById('game-over-continue');
    if (continueBtn && onContinue) {
      continueBtn.addEventListener('click', onContinue);
    } else if (continueBtn) {
      continueBtn.addEventListener('click', () => location.reload());
    }
  }

  /**
   * Format narrative text with proper paragraph breaks
   */
  private formatNarrativeText(text: string): string {
    return text
      .split('\n\n')
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }

  // Turn announcements
  showTurnBanner(isPlayerTurn: boolean): void {
    const banner = document.getElementById('turn-banner');
    if (!banner) return;

    // Reset any existing animation
    banner.classList.remove('active', 'player-turn', 'enemy-turn');

    // Set content and style based on turn type
    if (isPlayerTurn) {
      banner.textContent = 'Your Turn';
      banner.classList.add('player-turn');
    } else {
      banner.textContent = 'Enemy Turn';
      banner.classList.add('enemy-turn');
    }

    // Trigger animation
    requestAnimationFrame(() => {
      banner.classList.add('active');
    });

    // Remove animation class after it completes
    setTimeout(() => {
      banner.classList.remove('active');
    }, 1200);
  }

  // Combat animations
  playPlayerAttackAnimation(targetEnemyIndex: number): void {
    const playerSilhouette = document.querySelector('.player-silhouette');
    const enemyElements = this.elements.enemySlots.querySelectorAll('.arena-enemy');
    const targetEnemy = enemyElements[targetEnemyIndex];

    if (playerSilhouette) {
      playerSilhouette.classList.add('attacking');
      setTimeout(() => playerSilhouette.classList.remove('attacking'), 400);
    }

    if (targetEnemy) {
      setTimeout(() => {
        // Show slash effect
        this.showSlashEffect(targetEnemy as HTMLElement);
        targetEnemy.classList.add('hit');
        setTimeout(() => targetEnemy.classList.remove('hit'), 400);
      }, 200);
    }
  }

  playEnemyAttackAnimation(enemyIndex: number): void {
    const playerSilhouette = document.querySelector('.player-silhouette');
    const enemyElements = this.elements.enemySlots.querySelectorAll('.arena-enemy');
    const attackingEnemy = enemyElements[enemyIndex];

    if (attackingEnemy) {
      attackingEnemy.classList.add('attacking');
      setTimeout(() => attackingEnemy.classList.remove('attacking'), 400);
    }

    if (playerSilhouette) {
      setTimeout(() => {
        // Show slash effect on player
        this.showSlashEffect(playerSilhouette as HTMLElement);
        playerSilhouette.classList.add('hit');
        setTimeout(() => playerSilhouette.classList.remove('hit'), 500);
      }, 250);
    }
  }

  private showSlashEffect(target: HTMLElement): void {
    // Create slash element
    const slash = document.createElement('div');
    slash.className = 'slash-effect diagonal';
    target.appendChild(slash);

    // Trigger animation
    requestAnimationFrame(() => {
      slash.classList.add('active');
    });

    // Remove after animation
    setTimeout(() => {
      slash.remove();
    }, 400);
  }

  // Card consumed by void (Consume Light effect)
  playCardConsumedAnimation(cardName: string): void {
    const handContainer = document.querySelector('.hand-container, .cards-in-hand');
    if (!handContainer) return;

    // Create floating card that gets consumed
    const consumedCard = document.createElement('div');
    consumedCard.className = 'consumed-card-effect';
    consumedCard.innerHTML = `<span class="consumed-card-name">${cardName}</span>`;
    handContainer.appendChild(consumedCard);

    // Trigger animation
    requestAnimationFrame(() => {
      consumedCard.classList.add('active');
    });

    // Remove after animation
    setTimeout(() => {
      consumedCard.remove();
    }, 800);
  }

  // Buffs stripped (Purge effect)
  playBuffsPurgedAnimation(buffCount: number): void {
    const playerArea = document.querySelector('.player-silhouette, .player-status-bar');
    if (!playerArea) return;

    // Create shatter effect
    const purgeEffect = document.createElement('div');
    purgeEffect.className = 'purge-effect';
    purgeEffect.innerHTML = `<span class="purge-text">-${buffCount} Buff${buffCount > 1 ? 's' : ''}!</span>`;
    playerArea.appendChild(purgeEffect);

    // Trigger animation
    requestAnimationFrame(() => {
      purgeEffect.classList.add('active');
    });

    // Remove after animation
    setTimeout(() => {
      purgeEffect.remove();
    }, 1000);
  }

  // Demon synergy triggered (Howl/Giggle)
  playDemonSynergyAnimation(buffName: string): void {
    const enemyArea = this.elements.enemySlots;
    if (!enemyArea) return;

    // Create synergy indicator
    const synergyEffect = document.createElement('div');
    synergyEffect.className = 'demon-synergy-effect';
    synergyEffect.innerHTML = `<span class="synergy-text">🔥 ${buffName}! 🔥</span>`;
    enemyArea.appendChild(synergyEffect);

    // Add pulsing glow to all demon enemies
    const enemies = enemyArea.querySelectorAll('.arena-enemy:not(.dead)');
    enemies.forEach(enemy => enemy.classList.add('demon-synergy-active'));

    // Trigger animation
    requestAnimationFrame(() => {
      synergyEffect.classList.add('active');
    });

    // Remove after animation
    setTimeout(() => {
      synergyEffect.remove();
      enemies.forEach(enemy => enemy.classList.remove('demon-synergy-active'));
    }, 1200);
  }

  // Forget attack effect (Hollow God permanently fractures a card)
  playForgetAnimation(cardName: string): void {
    // Create overlay effect
    const forgetOverlay = document.createElement('div');
    forgetOverlay.className = 'forget-effect';
    document.body.appendChild(forgetOverlay);

    // Create card dissolve display
    const cardDissolve = document.createElement('div');
    cardDissolve.className = 'forget-card-dissolve';
    cardDissolve.innerHTML = `You forget how to...<br><strong>${cardName}</strong>`;
    document.body.appendChild(cardDissolve);

    // Remove after animation
    setTimeout(() => {
      forgetOverlay.remove();
      cardDissolve.remove();
    }, 1500);
  }

  /**
   * Show floating damage number on an enemy
   */
  showEnemyDamageNumber(enemyIndex: number, _damage: number, blocked: number, hpDamage: number): void {
    const enemySlots = document.getElementById('enemy-slots');
    if (!enemySlots) return;

    const enemyElements = enemySlots.querySelectorAll('.arena-enemy');
    const enemyEl = enemyElements[enemyIndex] as HTMLElement;
    if (!enemyEl) return;

    const rect = enemyEl.getBoundingClientRect();
    const containerRect = enemySlots.getBoundingClientRect();

    // Create damage number element
    const damageEl = document.createElement('div');
    damageEl.className = 'floating-damage';

    // Determine style based on damage type
    if (hpDamage === 0 && blocked > 0) {
      damageEl.classList.add('blocked');
      damageEl.textContent = `🛡️ ${blocked}`;
    } else if (hpDamage > 0) {
      // Size based on damage amount
      if (hpDamage >= 16) {
        damageEl.classList.add('large');
      } else if (hpDamage >= 6) {
        damageEl.classList.add('medium');
      }
      damageEl.textContent = String(hpDamage);
      if (blocked > 0) {
        damageEl.innerHTML = `${hpDamage} <span class="partial-block">(🛡️${blocked})</span>`;
      }
    } else {
      return; // No visible damage
    }

    // Position above enemy with random X offset
    const randomX = (Math.random() - 0.5) * 40;
    damageEl.style.left = `${rect.left - containerRect.left + rect.width / 2 + randomX}px`;
    damageEl.style.top = `${rect.top - containerRect.top + 20}px`;

    enemySlots.appendChild(damageEl);

    // Trigger animation
    requestAnimationFrame(() => {
      damageEl.classList.add('animate');
    });

    // Remove after animation
    setTimeout(() => damageEl.remove(), 1000);
  }

  /**
   * Show floating damage number on the player
   */
  showPlayerDamageNumber(_damage: number, blocked: number, fortifyAbsorbed: number, hpDamage: number): void {
    const playerHud = document.getElementById('player-hud');
    if (!playerHud) return;

    const rect = playerHud.getBoundingClientRect();

    // Create damage number element
    const damageEl = document.createElement('div');
    damageEl.className = 'floating-damage player-damage';

    const totalBlocked = blocked + fortifyAbsorbed;

    if (hpDamage === 0 && totalBlocked > 0) {
      damageEl.classList.add('blocked');
      damageEl.textContent = `🛡️ ${totalBlocked}`;
    } else if (hpDamage > 0) {
      if (hpDamage >= 16) {
        damageEl.classList.add('large');
      } else if (hpDamage >= 6) {
        damageEl.classList.add('medium');
      }
      damageEl.textContent = String(hpDamage);
      if (totalBlocked > 0) {
        damageEl.innerHTML = `${hpDamage} <span class="partial-block">(🛡️${totalBlocked})</span>`;
      }
    } else {
      return;
    }

    // Position above player HUD
    const randomX = (Math.random() - 0.5) * 30;
    damageEl.style.left = `${rect.left + rect.width / 2 + randomX}px`;
    damageEl.style.top = `${rect.top - 20}px`;
    damageEl.style.position = 'fixed';

    document.body.appendChild(damageEl);

    requestAnimationFrame(() => {
      damageEl.classList.add('animate');
    });

    setTimeout(() => damageEl.remove(), 1000);
  }

  /**
   * Show healing number (green, positive)
   */
  showHealNumber(target: 'player' | 'enemy', amount: number, enemyIndex?: number): void {
    const healEl = document.createElement('div');
    healEl.className = 'floating-damage heal';
    healEl.textContent = `+${amount}`;

    if (target === 'player') {
      const playerHud = document.getElementById('player-hud');
      if (!playerHud) return;
      const rect = playerHud.getBoundingClientRect();
      healEl.style.left = `${rect.left + rect.width / 2}px`;
      healEl.style.top = `${rect.top - 20}px`;
      healEl.style.position = 'fixed';
      document.body.appendChild(healEl);
    } else if (enemyIndex !== undefined) {
      const enemySlots = document.getElementById('enemy-slots');
      if (!enemySlots) return;
      const enemyElements = enemySlots.querySelectorAll('.arena-enemy');
      const enemyEl = enemyElements[enemyIndex] as HTMLElement;
      if (!enemyEl) return;
      const rect = enemyEl.getBoundingClientRect();
      const containerRect = enemySlots.getBoundingClientRect();
      healEl.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
      healEl.style.top = `${rect.top - containerRect.top + 20}px`;
      enemySlots.appendChild(healEl);
    }

    requestAnimationFrame(() => {
      healEl.classList.add('animate');
    });

    setTimeout(() => healEl.remove(), 1000);
  }

  /**
   * Screen shake effect
   */
  shakeScreen(intensity: number = 4, duration: number = 300): void {
    // Check if screen shake is enabled in settings
    const dungeon = document.querySelector('.dungeon-scene') as HTMLElement;
    if (!dungeon) return;

    dungeon.animate([
      { transform: 'translate(0, 0)' },
      { transform: `translate(${intensity}px, ${intensity / 2}px)` },
      { transform: `translate(-${intensity}px, -${intensity / 2}px)` },
      { transform: `translate(${intensity / 2}px, ${-intensity}px)` },
      { transform: `translate(-${intensity / 2}px, ${intensity / 2}px)` },
      { transform: 'translate(0, 0)' }
    ], {
      duration,
      easing: 'ease-out'
    });
  }

  /**
   * Red vignette flash when player takes damage
   */
  showDamageVignette(intensity: number = 0.3): void {
    const existing = document.querySelector('.damage-vignette');
    if (existing) existing.remove();

    const vignette = document.createElement('div');
    vignette.className = 'damage-vignette';
    vignette.style.opacity = String(intensity);
    document.body.appendChild(vignette);

    // Fade out
    setTimeout(() => {
      vignette.style.opacity = '0';
      setTimeout(() => vignette.remove(), 300);
    }, 150);
  }

  /**
   * Play dramatic enemy death animation
   */
  playEnemyDeathAnimation(enemyIndex: number, isBoss: boolean = false): void {
    const enemySlots = document.getElementById('enemy-slots');
    if (!enemySlots) return;

    const enemyElements = enemySlots.querySelectorAll('.arena-enemy');
    const enemyEl = enemyElements[enemyIndex] as HTMLElement;
    if (!enemyEl) return;

    const figureEl = enemyEl.querySelector('.enemy-figure') as HTMLElement;
    if (!figureEl) return;

    // Stage 1: Hit stagger (0.1s)
    figureEl.classList.add('death-stagger');

    // Stage 2: Freeze frame (0.3s) - already paused via CSS animation-play-state
    setTimeout(() => {
      figureEl.classList.remove('death-stagger');
      figureEl.classList.add('death-freeze');

      // Screen shake on death
      this.shakeScreen(isBoss ? 6 : 3, isBoss ? 400 : 150);
    }, 100);

    // Stage 3: Fade + shrink (0.4s)
    setTimeout(() => {
      figureEl.classList.remove('death-freeze');
      figureEl.classList.add('death-dissolve');

      // Create soul particles
      this.createDeathParticles(enemyEl, isBoss);
    }, 400);

    // Stage 4: Mark as dead (cleanup happens in render)
    setTimeout(() => {
      enemyEl.classList.add('enemy-dead');
    }, 800);
  }

  /**
   * Create particle burst effect on enemy death
   */
  private createDeathParticles(enemyEl: HTMLElement, isBoss: boolean): void {
    const rect = enemyEl.getBoundingClientRect();
    const particleCount = isBoss ? 20 : 10;
    const container = document.getElementById('enemy-slots');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'death-particle';

      // Random position within enemy
      const startX = rect.left - containerRect.left + rect.width / 2;
      const startY = rect.top - containerRect.top + rect.height / 2;

      // Random end position (spreading outward)
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const distance = 60 + Math.random() * 80;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance - 30; // Drift upward

      particle.style.left = `${startX}px`;
      particle.style.top = `${startY}px`;
      particle.style.setProperty('--end-x', `${endX}px`);
      particle.style.setProperty('--end-y', `${endY}px`);

      // Stagger particle animations
      particle.style.animationDelay = `${i * 0.03}s`;

      container.appendChild(particle);

      // Cleanup
      setTimeout(() => particle.remove(), 1000);
    }
  }

  /**
   * Show boss dialogue during phase transitions
   * Creates a dramatic text overlay that fades in and out
   */
  showBossDialogue(message: string, bossName?: string, duration: number = 4000): void {
    // Remove any existing dialogue
    const existing = document.querySelector('.boss-dialogue');
    if (existing) existing.remove();

    // Create dialogue container
    const dialogueContainer = document.createElement('div');
    dialogueContainer.className = 'boss-dialogue';

    // Add boss name if provided
    if (bossName) {
      const nameEl = document.createElement('div');
      nameEl.className = 'boss-dialogue-name';
      nameEl.textContent = bossName;
      dialogueContainer.appendChild(nameEl);
    }

    // Add dialogue text
    const textEl = document.createElement('div');
    textEl.className = 'boss-dialogue-text';
    textEl.textContent = `"${message}"`;
    dialogueContainer.appendChild(textEl);

    document.body.appendChild(dialogueContainer);

    // Fade out after duration
    setTimeout(() => {
      dialogueContainer.classList.add('fade-out');
      setTimeout(() => dialogueContainer.remove(), 500);
    }, duration);
  }

  /**
   * Hide boss dialogue immediately
   */
  hideBossDialogue(): void {
    const existing = document.querySelector('.boss-dialogue');
    if (existing) existing.remove();
  }
}
