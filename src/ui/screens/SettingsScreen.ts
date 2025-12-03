/**
 * SettingsScreen - Game settings and options
 */

import { Screen } from '../ScreenManager';
import { SaveManager, GameSettings } from '@/services/SaveManager';

export interface SettingsCallbacks {
  onBack: () => void;
}

export function createSettingsScreen(callbacks: SettingsCallbacks): Screen {
  const element = document.createElement('div');
  element.id = 'settings';
  element.className = 'screen';

  let settings: GameSettings;

  const render = () => {
    settings = SaveManager.getSettings();

    element.innerHTML = `
      <header class="screen-header">
        <button class="back-btn" id="btn-back">← Back</button>
        <h2>Settings</h2>
        <div class="header-spacer"></div>
      </header>

      <div class="settings-container">
        <section class="settings-section">
          <h3>Audio</h3>

          <div class="setting-row">
            <label for="master-volume">Master Volume</label>
            <div class="slider-container">
              <input type="range" id="master-volume" min="0" max="100" value="${settings.masterVolume}">
              <span class="slider-value">${settings.masterVolume}%</span>
            </div>
          </div>

          <div class="setting-row">
            <label for="music-volume">Music</label>
            <div class="slider-container">
              <input type="range" id="music-volume" min="0" max="100" value="${settings.musicVolume}">
              <span class="slider-value">${settings.musicVolume}%</span>
            </div>
          </div>

          <div class="setting-row">
            <label for="sfx-volume">Sound Effects</label>
            <div class="slider-container">
              <input type="range" id="sfx-volume" min="0" max="100" value="${settings.sfxVolume}">
              <span class="slider-value">${settings.sfxVolume}%</span>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h3>Gameplay</h3>

          <div class="setting-row">
            <label for="animation-speed">Animation Speed</label>
            <div class="slider-container">
              <input type="range" id="animation-speed" min="0.5" max="2" step="0.25" value="${settings.animationSpeed}">
              <span class="slider-value">${settings.animationSpeed}x</span>
            </div>
          </div>

          <div class="setting-row">
            <label for="screen-shake">Screen Shake</label>
            <div class="toggle-container">
              <button class="toggle-btn ${settings.screenShake ? 'active' : ''}" id="screen-shake">
                ${settings.screenShake ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </section>

        <section class="settings-section">
          <h3>Data</h3>

          <div class="setting-row">
            <label>Reset Progress</label>
            <button class="danger-btn" id="btn-reset">Reset All Data</button>
          </div>
        </section>
      </div>
    `;

    // Attach event listeners
    element.querySelector('#btn-back')?.addEventListener('click', callbacks.onBack);

    // Volume sliders
    setupSlider('master-volume', 'masterVolume', '%');
    setupSlider('music-volume', 'musicVolume', '%');
    setupSlider('sfx-volume', 'sfxVolume', '%');
    setupSlider('animation-speed', 'animationSpeed', 'x');

    // Screen shake toggle
    element.querySelector('#screen-shake')?.addEventListener('click', () => {
      SaveManager.updateSettings({ screenShake: !settings.screenShake });
      render();
    });

    // Reset button
    element.querySelector('#btn-reset')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) {
        SaveManager.resetAllData();
        render();
      }
    });
  };

  function setupSlider(id: string, settingKey: keyof GameSettings, suffix: string): void {
    const slider = element.querySelector(`#${id}`) as HTMLInputElement;
    const valueDisplay = slider?.parentElement?.querySelector('.slider-value');

    if (slider && valueDisplay) {
      slider.addEventListener('input', () => {
        const value = parseFloat(slider.value);
        valueDisplay.textContent = `${value}${suffix}`;
        SaveManager.updateSettings({ [settingKey]: value });
      });
    }
  }

  return {
    id: 'settings',
    element,
    onEnter: render,
  };
}
