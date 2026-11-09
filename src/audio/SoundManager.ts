type SoundKind = "move" | "collect" | "hurt" | "success" | "click";

class SoundManager {
  private context: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private musicOscillator: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private noteIndex = 0;

  configure(soundEnabled: boolean, musicEnabled: boolean): void {
    this.soundEnabled = soundEnabled;
    this.musicEnabled = musicEnabled;
    if (musicEnabled) this.startMusic();
    else this.stopMusic();
  }

  play(kind: SoundKind): void {
    if (!this.soundEnabled) return;
    const patterns: Record<SoundKind, number[]> = {
      move: [440],
      click: [523],
      collect: [660, 880],
      hurt: [190, 150],
      success: [523, 659, 784]
    };
    const notes = patterns[kind];
    notes.forEach((frequency, index) => {
      window.setTimeout(() => this.tone(frequency, kind === "hurt" ? 0.12 : 0.09, kind === "hurt" ? "triangle" : "sine", 0.055), index * 75);
    });
  }

  private getContext(): AudioContext | null {
    try {
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return null;
      if (!this.context) this.context = new AudioContextClass();
      if (this.context.state === "suspended") void this.context.resume();
      return this.context;
    } catch {
      return null;
    }
  }

  private tone(frequency: number, duration: number, wave: OscillatorType, volume: number): void {
    const context = this.getContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.02);
  }

  private startMusic(): void {
    if (this.musicOscillator || !this.musicEnabled) return;
    const context = this.getContext();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 261.63;
    gain.gain.value = 0.012;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    this.musicOscillator = oscillator;
    this.musicGain = gain;
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
    this.musicTimer = window.setInterval(() => {
      if (!this.musicOscillator || !this.musicEnabled) return;
      this.noteIndex = (this.noteIndex + 1) % notes.length;
      this.musicOscillator.frequency.setTargetAtTime(notes[this.noteIndex]!, context.currentTime, 0.18);
    }, 780);
  }

  private stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.musicGain && this.context) {
      this.musicGain.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.08);
    }
    if (this.musicOscillator) {
      try { this.musicOscillator.stop(this.context?.currentTime ?? 0); } catch { /* already stopped */ }
      this.musicOscillator.disconnect();
      this.musicOscillator = null;
    }
    this.musicGain?.disconnect();
    this.musicGain = null;
  }
}

export const gameAudio = new SoundManager();
