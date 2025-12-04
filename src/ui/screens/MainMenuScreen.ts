/**
 * MainMenuScreen - The game's main menu
 */

import { Screen } from '../ScreenManager';
import { SaveManager } from '@/services/SaveManager';

export function createMainMenuScreen(
  onNewRun: () => void,
  onContinue: () => void,
  onSettings: () => void,
  onUpgrades?: () => void
): Screen {
  const element = document.createElement('div');
  element.id = 'main-menu';
  element.className = 'screen';

  const render = () => {
    const hasRun = SaveManager.hasActiveRun();
    const soulEchoes = SaveManager.getSoulEchoes();
    const stats = SaveManager.getStatistics();

    element.innerHTML = `
      <div class="menu-container">
        <div class="menu-header">
          <div class="game-logo">
            <h1 class="logo-main">SANCTUM</h1>
            <h2 class="logo-sub">RUINS</h2>
          </div>
          <div class="menu-status">
            <span class="soul-echoes">${soulEchoes} Soul Echoes</span>
          </div>
        </div>

        <nav class="menu-buttons">
          <button class="menu-btn primary" id="btn-new-run">
            <span class="btn-text">New Run</span>
          </button>
          <button class="menu-btn ${hasRun ? '' : 'disabled'}" id="btn-continue" ${hasRun ? '' : 'disabled'}>
            <span class="btn-text">Continue</span>
            <span class="btn-subtitle">${hasRun ? 'Run in progress' : 'No save found'}</span>
          </button>
          <button class="menu-btn" id="btn-upgrades">
            <span class="btn-text">Soul Sanctum</span>
            <span class="btn-subtitle">Spend Soul Echoes</span>
          </button>
          <button class="menu-btn" id="btn-settings">
            <span class="btn-text">Settings</span>
          </button>
        </nav>

        <div class="menu-stats">
          <div class="stat-item">
            <span class="stat-label">Runs</span>
            <span class="stat-value">${stats.totalRuns}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Wins</span>
            <span class="stat-value">${stats.totalWins}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Deaths</span>
            <span class="stat-value">${stats.totalDeaths}</span>
          </div>
        </div>

        <footer class="menu-footer">
          <span class="version">v0.1.0</span>
        </footer>
      </div>
    `;

    // Attach event listeners
    element.querySelector('#btn-new-run')?.addEventListener('click', onNewRun);
    element.querySelector('#btn-continue')?.addEventListener('click', () => {
      if (hasRun) onContinue();
    });
    if (onUpgrades) {
      element.querySelector('#btn-upgrades')?.addEventListener('click', onUpgrades);
    }
    element.querySelector('#btn-settings')?.addEventListener('click', onSettings);
  };

  return {
    id: 'main-menu',
    element,
    onEnter: render,
  };
}
