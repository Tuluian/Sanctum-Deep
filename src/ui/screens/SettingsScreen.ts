/**
 * SettingsScreen - Game settings and options
 */

import { Screen } from '../ScreenManager';
import { SaveManager, GameSettings } from '@/services/SaveManager';

export interface SettingsCallbacks {
  onBack: () => void;
}

/**
 * Apply accessibility settings to the document
 */
export function applyAccessibilitySettings(settings: GameSettings): void {
  const root = document.documentElement;

  // Reduced motion
  if (settings.reducedMotion) {
    root.classList.add('reduced-motion');
  } else {
    root.classList.remove('reduced-motion');
  }

  // High contrast
  if (settings.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // Large text
  if (settings.largeText) {
    root.classList.add('large-text');
  } else {
    root.classList.remove('large-text');
  }

  // Colorblind mode
  root.classList.remove('colorblind-deuteranopia', 'colorblind-protanopia', 'colorblind-tritanopia');
  if (settings.colorblindMode !== 'off') {
    root.classList.add(`colorblind-${settings.colorblindMode}`);
  }
}

/**
 * Initialize accessibility settings from saved preferences
 */
export function initializeAccessibilitySettings(): void {
  const settings = SaveManager.getSettings();

  // Check system preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !settings.reducedMotion) {
    // Auto-enable reduced motion if system prefers it (but don't save - just apply)
    applyAccessibilitySettings({ ...settings, reducedMotion: true });
  } else {
    applyAccessibilitySettings(settings);
  }
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
          <h3>Accessibility</h3>

          <div class="setting-row">
            <label for="reduced-motion">Reduced Motion</label>
            <div class="toggle-container">
              <button class="toggle-btn ${settings.reducedMotion ? 'active' : ''}" id="reduced-motion" aria-pressed="${settings.reducedMotion}">
                ${settings.reducedMotion ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div class="setting-row">
            <label for="high-contrast">High Contrast</label>
            <div class="toggle-container">
              <button class="toggle-btn ${settings.highContrast ? 'active' : ''}" id="high-contrast" aria-pressed="${settings.highContrast}">
                ${settings.highContrast ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div class="setting-row">
            <label for="large-text">Large Text</label>
            <div class="toggle-container">
              <button class="toggle-btn ${settings.largeText ? 'active' : ''}" id="large-text" aria-pressed="${settings.largeText}">
                ${settings.largeText ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div class="setting-row">
            <label for="colorblind-mode">Colorblind Mode</label>
            <div class="select-container">
              <select id="colorblind-mode" class="setting-select">
                <option value="off" ${settings.colorblindMode === 'off' ? 'selected' : ''}>Off</option>
                <option value="deuteranopia" ${settings.colorblindMode === 'deuteranopia' ? 'selected' : ''}>Deuteranopia (Red-Green)</option>
                <option value="protanopia" ${settings.colorblindMode === 'protanopia' ? 'selected' : ''}>Protanopia (Red-Green)</option>
                <option value="tritanopia" ${settings.colorblindMode === 'tritanopia' ? 'selected' : ''}>Tritanopia (Blue-Yellow)</option>
              </select>
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

    // Accessibility toggles
    element.querySelector('#reduced-motion')?.addEventListener('click', () => {
      const newValue = !settings.reducedMotion;
      SaveManager.updateSettings({ reducedMotion: newValue });
      applyAccessibilitySettings({ ...settings, reducedMotion: newValue });
      render();
    });

    element.querySelector('#high-contrast')?.addEventListener('click', () => {
      const newValue = !settings.highContrast;
      SaveManager.updateSettings({ highContrast: newValue });
      applyAccessibilitySettings({ ...settings, highContrast: newValue });
      render();
    });

    element.querySelector('#large-text')?.addEventListener('click', () => {
      const newValue = !settings.largeText;
      SaveManager.updateSettings({ largeText: newValue });
      applyAccessibilitySettings({ ...settings, largeText: newValue });
      render();
    });

    // Colorblind mode select
    element.querySelector('#colorblind-mode')?.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value as GameSettings['colorblindMode'];
      SaveManager.updateSettings({ colorblindMode: value });
      applyAccessibilitySettings({ ...settings, colorblindMode: value });
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
