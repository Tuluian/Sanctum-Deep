/**
 * ClassSelectScreen - Choose your character class
 */

import { Screen } from '../ScreenManager';
import { CharacterClassId } from '@/types';
import { CLASSES } from '@/data/classes';

export interface ClassSelectCallbacks {
  onBack: () => void;
  onSelectClass: (classId: CharacterClassId) => void;
}

const CLASS_DESCRIPTIONS: Record<CharacterClassId, { desc: string; mechanic: string; tooltip: string }> = {
  [CharacterClassId.CLERIC]: {
    desc: 'Attrition warfare through sustained self-healing.',
    mechanic: 'Devotion: Healing generates power for stronger spells.',
    tooltip: 'Each point of healing generates 1 Devotion. Spend Devotion to power up certain cards for devastating bonus effects. Devotion persists between turns but resets each combat.',
  },
  [CharacterClassId.DUNGEON_KNIGHT]: {
    desc: 'Balanced offense and defense with damage protection.',
    mechanic: 'Fortify: Block that persists between turns (caps at 15).',
    tooltip: 'Unlike normal Block which disappears at the start of your turn, Fortify stays permanently until used. Build up a defensive wall over multiple turns. Maximum of 15 Fortify at once.',
  },
  [CharacterClassId.DIABOLIST]: {
    desc: 'High risk/reward with infernal contracts.',
    mechanic: 'Contracts: Powerful cards that add Curses to your deck.',
    tooltip: 'Contract cards offer immense power but add Curse cards to your deck. Curses clog your hand and often deal damage when drawn. Some cards can turn Curses into fuel for even more power.',
  },
  [CharacterClassId.OATHSWORN]: {
    desc: 'Combo chains through sacred commitments.',
    mechanic: 'Vows: Declare restrictions on self for sustained power.',
    tooltip: 'Activate a Vow to gain a persistent bonus (like +2 damage), but you must follow a restriction (like "no Block cards"). Breaking a Vow triggers a harsh penalty. Vows have limited charges.',
  },
  [CharacterClassId.FEY_TOUCHED]: {
    desc: 'Embrace chaos with unpredictable outcomes.',
    mechanic: 'Whimsy: Cards with random but powerful effects.',
    tooltip: 'Whimsy cards roll a random effect each time played. Build up Luck to increase your chances of the best outcomes, or spend Luck to guarantee the most powerful result.',
  },
  [CharacterClassId.CELESTIAL]: {
    desc: 'Channel divine radiance for holy power.',
    mechanic: 'Radiance: Build divine energy to empower holy spells.',
    tooltip: 'Divine actions generate Radiance. As Radiance builds, certain holy spells become more powerful. Radiance fades between combats, so use it while you have it.',
  },
  [CharacterClassId.SUMMONER]: {
    desc: 'Command spirits and minions to fight for you.',
    mechanic: 'Minions: Summon creatures that attack enemies automatically.',
    tooltip: 'Summon minions that persist between turns and attack enemies. Some cards buff your minions or sacrifice them for powerful effects.',
  },
  [CharacterClassId.BARGAINER]: {
    desc: 'Make dark deals for overwhelming power.',
    mechanic: 'Prices: Pay ongoing costs for immediate power.',
    tooltip: 'Many Bargainer cards have a "Price" - an ongoing negative effect like losing HP each turn or reduced max Resolve. Accumulate Favor to remove Prices or use Blood Payment to clear all Prices at once.',
  },
};

const FREE_CLASSES = [
  CharacterClassId.CLERIC,
  CharacterClassId.DUNGEON_KNIGHT,
  CharacterClassId.DIABOLIST,
  CharacterClassId.OATHSWORN,
  CharacterClassId.FEY_TOUCHED,
  CharacterClassId.CELESTIAL, // TODO: Remove after testing - DLC class
];

export function createClassSelectScreen(callbacks: ClassSelectCallbacks): Screen {
  const element = document.createElement('div');
  element.id = 'class-select';
  element.className = 'screen';

  let selectedClass: CharacterClassId | null = null;

  const render = () => {
    element.innerHTML = `
      <header class="screen-header">
        <button class="back-btn" id="btn-back">← Back</button>
        <h2>Choose Your Class</h2>
        <div class="header-spacer"></div>
      </header>

      <div class="class-grid">
        ${Object.values(CLASSES).map(cls => {
          const isUnlocked = FREE_CLASSES.includes(cls.id);
          const info = CLASS_DESCRIPTIONS[cls.id];
          const isSelected = selectedClass === cls.id;

          return `
            <div class="class-card ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}"
                 data-class="${cls.id}">
              <div class="class-portrait ${isUnlocked ? '' : 'locked-overlay'}">
                <div class="class-icon">${getClassIcon(cls.id)}</div>
                ${!isUnlocked ? '<span class="lock-icon">🔒</span>' : ''}
              </div>
              <div class="class-info">
                <h3>${cls.name}</h3>
                <div class="class-stats">
                  <span>❤️ ${cls.maxHp} HP</span>
                  <span>⚡ ${cls.maxResolve} Resolve</span>
                </div>
                <p class="class-desc">${info.desc}</p>
                ${isUnlocked ? `
                  <div class="class-mechanic">
                    <div class="mechanic-header">
                      <strong>${info.mechanic.split(':')[0]}:</strong>
                      <span class="mechanic-help">ⓘ</span>
                      <div class="mechanic-tooltip">${info.tooltip}</div>
                    </div>
                    <span class="mechanic-desc">${info.mechanic.split(':')[1] || ''}</span>
                  </div>
                ` : `
                  <button class="purchase-btn" disabled>Coming Soon</button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div class="class-action-bar ${selectedClass ? 'visible' : ''}">
        <button class="start-run-btn" id="btn-start" ${selectedClass ? '' : 'disabled'}>
          Enter the Sanctum
        </button>
      </div>
    `;

    // Attach event listeners
    element.querySelector('#btn-back')?.addEventListener('click', callbacks.onBack);

    element.querySelectorAll('.class-card.unlocked').forEach(card => {
      card.addEventListener('click', () => {
        const classId = card.getAttribute('data-class') as CharacterClassId;
        selectedClass = classId;
        render();
      });
    });

    element.querySelector('#btn-start')?.addEventListener('click', () => {
      if (selectedClass) {
        callbacks.onSelectClass(selectedClass);
      }
    });
  };

  return {
    id: 'class-select',
    element,
    onEnter: () => {
      selectedClass = null;
      render();
    },
  };
}

function getClassIcon(classId: CharacterClassId): string {
  switch (classId) {
    case CharacterClassId.CLERIC: return '✝️';
    case CharacterClassId.DUNGEON_KNIGHT: return '🛡️';
    case CharacterClassId.DIABOLIST: return '🔥';
    case CharacterClassId.OATHSWORN: return '⚔️';
    case CharacterClassId.FEY_TOUCHED: return '🌙';
    case CharacterClassId.CELESTIAL: return '☀️';
    case CharacterClassId.SUMMONER: return '👻';
    case CharacterClassId.BARGAINER: return '💀';
    default: return '❓';
  }
}
