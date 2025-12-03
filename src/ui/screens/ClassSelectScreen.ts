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

const CLASS_DESCRIPTIONS: Record<CharacterClassId, { desc: string; mechanic: string }> = {
  [CharacterClassId.CLERIC]: {
    desc: 'Attrition warfare through sustained healing.',
    mechanic: 'Devotion: Healing generates power for stronger abilities.',
  },
  [CharacterClassId.DUNGEON_KNIGHT]: {
    desc: 'Balanced offense and defense with persistent protection.',
    mechanic: 'Fortify: Block that persists between turns (caps at 15).',
  },
  [CharacterClassId.DIABOLIST]: {
    desc: 'High risk/reward with infernal contracts.',
    mechanic: 'Contracts: Powerful cards that add Curses to your deck.',
  },
  [CharacterClassId.OATHSWORN]: {
    desc: 'Combo chains through sacred commitments.',
    mechanic: 'Vows: Declare restrictions for powerful sustained effects.',
  },
  [CharacterClassId.FEY_TOUCHED]: {
    desc: 'Embrace chaos with unpredictable outcomes.',
    mechanic: 'Whimsy: Cards with random but powerful effects.',
  },
};

const FREE_CLASSES = [CharacterClassId.CLERIC, CharacterClassId.DUNGEON_KNIGHT];

export function createClassSelectScreen(callbacks: ClassSelectCallbacks): Screen {
  const element = document.createElement('div');
  element.id = 'class-select';
  element.className = 'screen';

  let selectedClass: CharacterClassId | null = null;

  const render = () => {
    element.innerHTML = `
      <header class="screen-header">
        <button class="back-btn" id="btn-back">← Back</button>
        <h2>Choose Your Path</h2>
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
                    <strong>${info.mechanic.split(':')[0]}:</strong>
                    ${info.mechanic.split(':')[1] || ''}
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
          Begin Descent
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
    default: return '❓';
  }
}
