/**
 * Procedural Web Audio API sound synthesizer for Squishy.
 * Generates tactile, juicy, toybox-like sound effects without requiring external audio files.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Squish sound when tapping or bouncing Squishy
  public playSquish() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency drops and bounces back up like a compressed rubber balloon
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Eating / Munching treat sound
  public playMunch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const times = [0, 0.08, 0.16];
    times.forEach((t, idx) => {
      const now = this.ctx!.currentTime + t;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      const baseFreq = 440 + idx * 80;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.06);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    });
  }

  // Sparkling chime for feeding rare food or leveling up
  public playChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const pitches = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    pitches.forEach((freq, i) => {
      const now = this.ctx!.currentTime + i * 0.06;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  // Golden coin clink
  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  }

  // Soft purr / petting sound
  public playPet() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(320, now + 0.15);
    osc.frequency.linearRampToValueAtTime(280, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playPurr() {
    this.playPet();
  }

  // Triumphant Level Up fanfare
  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.1 },  // G5
      { f: 1046.5, d: 0.35 }, // C6
    ];

    let offset = 0;
    notes.forEach((n) => {
      const now = this.ctx!.currentTime + offset;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + n.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + n.d + 0.05);

      offset += 0.11;
    });
  }

  // Soft UI tap
  public playTap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Gentle raindrop splash sound
  public playRaindrop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    [0, 0.06, 0.14].forEach((delay, idx) => {
      const now = this.ctx!.currentTime + delay;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      const f = 900 + idx * 120 + Math.random() * 80;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.45, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    });
  }

  // Warm sunshine chime
  public playSunshineChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.002, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.42);
    });
  }

  // Soft breezy chime for sakura petals
  public playPetalBreeze() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.002, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    });
  }

  // Toggle background cozy music
  public toggleMusic(enable?: boolean) {
    const targetState = enable !== undefined ? enable : !this.isMusicPlaying;
    if (targetState) {
      this.isMusicPlaying = true;
      this.startMusicLoop();
    } else {
      this.isMusicPlaying = false;
      if (this.musicTimer) {
        clearInterval(this.musicTimer);
        this.musicTimer = null;
      }
    }
  }

  private startMusicLoop() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    const chords = [
      [261.63, 329.63, 392.00], // C maj
      [220.00, 261.63, 329.63], // A min
      [174.61, 220.00, 261.63], // F maj
      [196.00, 246.94, 293.66], // G maj
    ];
    let step = 0;

    const playChordStep = () => {
      if (!this.isMusicPlaying || this.isMuted) return;
      this.initContext();
      if (!this.ctx) return;

      const chord = chords[step % chords.length];
      chord.forEach((freq, idx) => {
        const now = this.ctx!.currentTime + idx * 0.15;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.5, now);

        gain.gain.setValueAtTime(0.035, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.85);
      });
      step++;
    };

    playChordStep();
    this.musicTimer = window.setInterval(playChordStep, 1800);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const sounds = new SoundEngine();
