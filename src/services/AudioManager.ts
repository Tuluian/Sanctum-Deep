/**
 * AudioManager - Handles music and sound effects
 */

import { SaveManager } from './SaveManager';

export type MusicTrack = 'menu' | 'combat' | 'boss' | 'victory' | 'defeat' | 'shop';
export type SfxType =
  | 'card-play'
  | 'hit'
  | 'player-hit'
  | 'block'
  | 'heal'
  | 'spell'
  | 'arrow'
  | 'button'
  | 'menu-move'
  | 'menu-back'
  | 'door'
  | 'error';

const MUSIC_PATHS: Record<MusicTrack, string> = {
  menu: '/audio/music/maintheme.ogg',
  combat: '/audio/music/crypt_of_stone.ogg',
  boss: '/audio/music/boss_music.ogg',
  victory: '/audio/music/hall-of-the-king.ogg',
  defeat: '/audio/music/rust_and_shadow.ogg',
  shop: '/audio/music/inn_music.ogg',
};

const SFX_PATHS: Record<SfxType, string> = {
  'card-play': '/audio/sfx/menu_select.ogg',
  hit: '/audio/sfx/sword_swing.ogg',
  'player-hit': '/audio/sfx/player_hit.ogg',
  block: '/audio/sfx/enemy_hit.ogg',
  heal: '/audio/sfx/holy_smite.ogg',
  spell: '/audio/sfx/spell_cast.ogg',
  arrow: '/audio/sfx/arrow_shoot.ogg',
  button: '/audio/sfx/menu_select.ogg',
  'menu-move': '/audio/sfx/menu_move.ogg',
  'menu-back': '/audio/sfx/menu_back.ogg',
  door: '/audio/sfx/door_open.ogg',
  error: '/audio/sfx/error_noise.ogg',
};

class AudioManagerClass {
  private musicElement: HTMLAudioElement | null = null;
  private currentTrack: MusicTrack | null = null;
  private sfxPool: Map<SfxType, HTMLAudioElement[]> = new Map();
  private initialized = false;

  /**
   * Initialize audio system. Must be called after user interaction.
   */
  init(): void {
    if (this.initialized) return;

    // Create music element
    this.musicElement = new Audio();
    this.musicElement.loop = true;

    // Pre-create SFX pool for common sounds
    for (const sfxType of Object.keys(SFX_PATHS) as SfxType[]) {
      this.sfxPool.set(sfxType, []);
    }

    this.initialized = true;
    this.applyVolumeSettings();
  }

  /**
   * Apply current volume settings from SaveManager
   */
  applyVolumeSettings(): void {
    if (!this.initialized) return;

    const settings = SaveManager.getSettings();
    const masterMultiplier = settings.masterVolume / 100;
    const musicVolume = (settings.musicVolume / 100) * masterMultiplier;

    if (this.musicElement) {
      this.musicElement.volume = musicVolume;
    }
  }

  /**
   * Play a music track. Fades between tracks.
   */
  playMusic(track: MusicTrack): void {
    if (!this.initialized) {
      this.init();
    }

    if (!this.musicElement) return;

    // Don't restart same track
    if (this.currentTrack === track && !this.musicElement.paused) {
      return;
    }

    const path = MUSIC_PATHS[track];

    // Check if file exists by attempting to load
    this.musicElement.src = path;
    this.currentTrack = track;
    this.applyVolumeSettings();

    this.musicElement.play().catch((err) => {
      // Silently fail - file might not exist yet
      console.debug(`Music track not found: ${path}`, err);
    });
  }

  /**
   * Stop music with optional fade out
   */
  stopMusic(fadeMs: number = 500): void {
    if (!this.musicElement || this.musicElement.paused) return;

    if (fadeMs <= 0) {
      this.musicElement.pause();
      this.musicElement.currentTime = 0;
      this.currentTrack = null;
      return;
    }

    // Fade out
    const startVolume = this.musicElement.volume;
    const steps = 20;
    const stepTime = fadeMs / steps;
    const volumeStep = startVolume / steps;
    let step = 0;

    const fadeInterval = setInterval(() => {
      step++;
      if (step >= steps || !this.musicElement) {
        clearInterval(fadeInterval);
        if (this.musicElement) {
          this.musicElement.pause();
          this.musicElement.currentTime = 0;
          this.applyVolumeSettings(); // Restore volume for next play
        }
        this.currentTrack = null;
      } else {
        this.musicElement.volume = Math.max(0, startVolume - volumeStep * step);
      }
    }, stepTime);
  }

  /**
   * Play a sound effect
   */
  playSfx(sfx: SfxType): void {
    if (!this.initialized) {
      this.init();
    }

    const settings = SaveManager.getSettings();
    const masterMultiplier = settings.masterVolume / 100;
    const sfxVolume = (settings.sfxVolume / 100) * masterMultiplier;

    if (sfxVolume <= 0) return;

    const path = SFX_PATHS[sfx];
    const pool = this.sfxPool.get(sfx) || [];

    // Find available audio element or create new one
    let audio = pool.find((a) => a.paused || a.ended);

    if (!audio) {
      audio = new Audio(path);
      pool.push(audio);
      this.sfxPool.set(sfx, pool);
    }

    audio.volume = sfxVolume;
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.debug(`SFX not found: ${path}`, err);
    });
  }

  /**
   * Get current playing track
   */
  getCurrentTrack(): MusicTrack | null {
    return this.currentTrack;
  }

  /**
   * Check if music is currently playing
   */
  isMusicPlaying(): boolean {
    return this.musicElement !== null && !this.musicElement.paused;
  }
}

// Singleton instance
export const AudioManager = new AudioManagerClass();
