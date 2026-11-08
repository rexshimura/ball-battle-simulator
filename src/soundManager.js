// Sound Manager for Ball Battles
// Preloads and pools audio elements with intelligent throttling to prevent clipping

const SFX_FILES = {
  armorUp: '/sfx/sfx-ball-armor-up.mp3',
  bleed: '/sfx/sfx-ball-bleed.mp3',
  bodyHit: '/sfx/sfx-ball-body-hit.mp3',
  death: '/sfx/sfx-ball-death.mp3',
  glassDropHit: '/sfx/sfx-ball-glass-drop-hit.mp3',
  glassHit: '/sfx/sfx-ball-glass-hit.mp3',
  hammerHit: '/sfx/sfx-ball-hammer-hit.mp3',
  place: '/sfx/sfx-ball-place.mp3',
  remove: '/sfx/sfx-ball-remove.mp3',
  swordHitToArmor: '/sfx/sfx-ball-sword-hit-to-armor.mp3',
  swordHit: '/sfx/sfx-ball-sword-hit.mp3',
  wallBounce: '/sfx/sfx-ball-wallbounce.mp3',
  buttonClick: '/sfx/sfx-button-click.mp3',
  buttonHover: '/sfx/sfx-button-hover.mp3',
  fastballHit: '/sfx/sfx-fastball-hit.mp3',
  pause: '/sfx/sfx-game-pause.mp3',
  unpause: '/sfx/sfx-game-unpause.mp3',
  win: '/sfx/sfx-game-win.mp3',
  growHit: '/sfx/sfx-growball-hit.mp3',
  growing: '/sfx/sfx-ball-growing.mp3',
  spikeHit: '/sfx/sfx-spike-hit.mp3',
  shardHit: '/sfx/sfx-ball-shard-hit.mp3',
  acceleratorHit: '/sfx/sfx-ball-accelerator-hit.mp3',
  bulletShot: '/sfx/sfx-ball-bullet-shot.mp3',
  bulletHit: '/sfx/sfx-ball-bullet-hit.mp3',
  bulletHitWall: '/sfx/sfx-ball-bullet-hit-wall.mp3',
  thornSet: '/sfx/sfx-ball-thorn-set.mp3',
  thornHit: '/sfx/sfx-ball-thorn-hit.mp3',
};

// Default cooldowns (in milliseconds) between repeated triggers of the same sound
const SOUND_COOLDOWNS = {
  wallBounce: 45,
  bodyHit: 50,
  fastballHit: 60,
  acceleratorHit: 55,
  bulletShot: 50,
  bulletHit: 50,
  bulletHitWall: 50,
  thornSet: 70,
  thornHit: 60,
  buttonHover: 65,
  buttonClick: 50,
  bleed: 80,
  glassDropHit: 70,
  growHit: 80,
  growing: 80,
  shardHit: 45,
};

class SoundManager {
  constructor() {
    this.pools = {};
    this.lastPlayed = {};
    this.isMuted = false;
    this.masterVolume = 0.8;
    this.poolSize = 4;

    try {
      const savedMute = localStorage.getItem('ball_battles_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch {
      // ignore localStorage quota/disabled exceptions
    }

    // Lazy initialization of audio pools
    if (typeof window !== 'undefined') {
      this.initPools();
    }
  }

  initPools() {
    Object.entries(SFX_FILES).forEach(([key, src]) => {
      this.pools[key] = [];
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        this.pools[key].push(audio);
      }
    });
  }

  play(soundName, volumeMultiplier = 1) {
    if (this.isMuted) return;

    const pool = this.pools[soundName];
    if (!pool || pool.length === 0) return;

    // Check throttle / cooldown to prevent sound stacking
    const now = performance.now();
    const cooldown = SOUND_COOLDOWNS[soundName] || 35;
    if (this.lastPlayed[soundName] && now - this.lastPlayed[soundName] < cooldown) {
      return;
    }
    this.lastPlayed[soundName] = now;

    // Find an idle audio element or reuse the least recently played one
    let audio = pool.find(a => a.paused || a.ended);
    if (!audio) {
      audio = pool[0];
      // Rotate pool array
      pool.push(pool.shift());
    }

    try {
      audio.volume = Math.max(0, Math.min(1, this.masterVolume * volumeMultiplier));
      audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy prevented playback until user interaction
        });
      }
    } catch {
      // Audio playback exception handling
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('ball_battles_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    return this.isMuted;
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }
}

export const sound = new SoundManager();
export default sound;
