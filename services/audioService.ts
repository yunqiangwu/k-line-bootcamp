
// Singleton Audio Service using Web Audio API
// No external assets required

class AudioService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Initialize strictly on user interaction usually, but we prepare here
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  private getCtx() {
    if (!this.ctx) return null;
    // Resume context if suspended (browser policy)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  // --- OSCILLATOR HELPERS ---

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) {
    const ctx = this.getCtx();
    if (!ctx || this.isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }

  // --- SFX LIBRARY ---

  playClick() {
    // Short high blip
    this.playTone(800, 'sine', 0.05, 0, 0.05);
  }

  playBuy() {
    // "Coin" sound: two rapid notes rising
    this.playTone(1200, 'sine', 0.1, 0, 0.1);
    this.playTone(2000, 'square', 0.2, 0.05, 0.05);
  }

  playSell() {
    // "Cash" register-ish: noise or sliding tones
    // Simulating with tones: High to Low slide
    const ctx = this.getCtx();
    if (!ctx || this.isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  playWin() {
    // Major Arpeggio Fanfare
    const now = 0;
    const speed = 0.1;
    this.playTone(523.25, 'triangle', 0.2, now, 0.1);       // C5
    this.playTone(659.25, 'triangle', 0.2, now + speed, 0.1); // E5
    this.playTone(783.99, 'triangle', 0.2, now + speed*2, 0.1); // G5
    this.playTone(1046.50, 'square', 0.4, now + speed*3, 0.1); // C6
  }

  playLoss() {
    // Sad descending tritone/minor
    const now = 0;
    const speed = 0.15;
    this.playTone(392.00, 'triangle', 0.3, now, 0.1); // G4
    this.playTone(369.99, 'triangle', 0.3, now + speed, 0.1); // F#4
    this.playTone(349.23, 'sawtooth', 0.6, now + speed*2, 0.15); // F4
  }

  playCorrect() {
    // Ding!
    this.playTone(880, 'sine', 0.1, 0, 0.1); // A5
    this.playTone(1760, 'sine', 0.3, 0.05, 0.1); // A6
  }

  playWrong() {
    // Buzzer
    this.playTone(150, 'sawtooth', 0.3, 0, 0.2);
    this.playTone(100, 'sawtooth', 0.3, 0.1, 0.2);
  }
}

export const audioService = new AudioService();
