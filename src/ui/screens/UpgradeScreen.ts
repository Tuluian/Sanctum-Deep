/**
 * UpgradeScreen - Soul Sanctum for purchasing permanent upgrades
 */

import { Screen } from '../ScreenManager';
import { getUpgradeService } from '@/services/UpgradeService';
import { getUpgradesByPath, getUpgradesByClass } from '@/data/upgrades';
import { Upgrade, UpgradePath, CharacterClassId } from '@/types';

interface UpgradeScreenOptions {
  onBack: () => void;
}

type UpgradeTab = UpgradePath | CharacterClassId;

export function createUpgradeScreen(options: UpgradeScreenOptions): Screen {
  const element = document.createElement('div');
  element.id = 'upgrade-screen';
  element.className = 'screen';

  let activeTab: UpgradeTab = UpgradePath.VITALITY;

  const getTabUpgrades = (tab: UpgradeTab): Upgrade[] => {
    if (Object.values(UpgradePath).includes(tab as UpgradePath)) {
      return getUpgradesByPath(tab as UpgradePath);
    }
    return getUpgradesByClass(tab as CharacterClassId);
  };

  const getTabName = (tab: UpgradeTab): string => {
    const names: Record<string, string> = {
      [UpgradePath.VITALITY]: 'Vitality',
      [UpgradePath.RESOLVE]: 'Resolve',
      [UpgradePath.COMBAT]: 'Combat',
      [UpgradePath.FORTUNE]: 'Fortune',
      [CharacterClassId.CLERIC]: 'Cleric',
      [CharacterClassId.DUNGEON_KNIGHT]: 'Knight',
      [CharacterClassId.DIABOLIST]: 'Diabolist',
      [CharacterClassId.OATHSWORN]: 'Oathsworn',
      [CharacterClassId.FEY_TOUCHED]: 'Fey-Touched',
      [CharacterClassId.CELESTIAL]: 'Celestial',
      [CharacterClassId.SUMMONER]: 'Summoner',
      [CharacterClassId.BARGAINER]: 'Bargainer',
    };
    return names[tab] || tab;
  };

  const render = () => {
    const service = getUpgradeService();
    const soulEchoes = service.getSoulEchoes();
    const respecRefund = service.getRespecRefund();
    const upgrades = getTabUpgrades(activeTab);

    // Sort by tier
    const sortedUpgrades = [...upgrades].sort((a, b) => a.tier - b.tier);

    // Group upgrades by tier for tree visualization
    const tiers = new Map<number, Upgrade[]>();
    for (const u of sortedUpgrades) {
      if (!tiers.has(u.tier)) {
        tiers.set(u.tier, []);
      }
      tiers.get(u.tier)!.push(u);
    }

    const universalTabs = [
      UpgradePath.VITALITY,
      UpgradePath.RESOLVE,
      UpgradePath.COMBAT,
      UpgradePath.FORTUNE,
    ];

    const classTabs = [
      CharacterClassId.CLERIC,
      CharacterClassId.DUNGEON_KNIGHT,
      CharacterClassId.DIABOLIST,
      CharacterClassId.OATHSWORN,
      CharacterClassId.FEY_TOUCHED,
      CharacterClassId.CELESTIAL,
      CharacterClassId.SUMMONER,
      CharacterClassId.BARGAINER,
    ];

    element.innerHTML = `
      <div class="upgrade-container">
        <header class="upgrade-header">
          <button class="back-btn" id="upgrade-back">Back</button>
          <h1 class="upgrade-title">Soul Sanctum</h1>
          <div class="soul-echoes-display">
            <span class="se-icon">&#x1F52E;</span>
            <span class="se-amount">${soulEchoes}</span>
            <span class="se-label">Soul Echoes</span>
          </div>
        </header>

        <nav class="upgrade-tabs">
          <div class="tab-group">
            <span class="tab-group-label">Universal</span>
            <div class="tab-buttons">
              ${universalTabs
                .map(
                  (tab) => `
                <button class="tab-btn ${activeTab === tab ? 'active' : ''}" data-tab="${tab}">
                  ${getTabName(tab)}
                </button>
              `
                )
                .join('')}
            </div>
          </div>
          <div class="tab-group">
            <span class="tab-group-label">Class</span>
            <div class="tab-buttons class-tabs">
              ${classTabs
                .map(
                  (tab) => `
                <button class="tab-btn ${activeTab === tab ? 'active' : ''}" data-tab="${tab}">
                  ${getTabName(tab)}
                </button>
              `
                )
                .join('')}
            </div>
          </div>
        </nav>

        <div class="upgrade-tree">
          <div class="tree-path">
            <h2 class="path-name">${getTabName(activeTab)} Path</h2>
            <div class="tree-tiers">
              ${Array.from(tiers.entries())
                .map(
                  ([tier, tierUpgrades]) => `
                <div class="tree-tier" data-tier="${tier}">
                  <span class="tier-label">Tier ${tier}</span>
                  <div class="tier-upgrades">
                    ${tierUpgrades
                      .map((upgrade) => {
                        const state = service.getUpgradeState(upgrade.id);
                        const stateClass = state.purchased
                          ? 'purchased'
                          : state.available
                            ? 'available'
                            : 'locked';
                        return `
                        <div class="upgrade-node ${stateClass}" data-upgrade-id="${upgrade.id}">
                          <div class="upgrade-name">${upgrade.name}</div>
                          <div class="upgrade-desc">${upgrade.description}</div>
                          <div class="upgrade-cost">
                            ${state.purchased ? 'Owned' : `${upgrade.cost} SE`}
                          </div>
                          ${!state.purchased && !state.available && state.reason ? `<div class="upgrade-req">${state.reason}</div>` : ''}
                        </div>
                      `;
                      })
                      .join('')}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>

        <footer class="upgrade-footer">
          <button class="respec-btn ${respecRefund > 0 ? '' : 'disabled'}" id="respec-btn" ${respecRefund > 0 ? '' : 'disabled'}>
            Respec All (Refund: ${respecRefund} SE)
          </button>
        </footer>
      </div>
    `;

    // Attach event listeners
    element.querySelector('#upgrade-back')?.addEventListener('click', options.onBack);

    // Tab navigation
    element.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.target as HTMLElement).dataset.tab as UpgradeTab;
        if (tab) {
          activeTab = tab;
          render();
        }
      });
    });

    // Upgrade purchase
    element.querySelectorAll('.upgrade-node.available').forEach((node) => {
      node.addEventListener('click', (e) => {
        const upgradeId = (e.currentTarget as HTMLElement).dataset.upgradeId;
        if (upgradeId) {
          const result = service.purchase(upgradeId);
          if (result.success) {
            render();
          }
        }
      });
    });

    // Respec
    element.querySelector('#respec-btn')?.addEventListener('click', () => {
      if (respecRefund > 0 && confirm(`Are you sure you want to respec? You will receive ${respecRefund} Soul Echoes back.`)) {
        service.respec();
        render();
      }
    });
  };

  return {
    id: 'upgrades',
    element,
    onEnter: render,
  };
}
