type SoundKind = "move" | "collect" | "hurt" | "success" | "click";

class SoundManager {
  private context: AudioContext | null = null;
  private soundEnabled = true;
  private musicEnabled = false;
  private musicTimer: number | null = null;
  private noteIndex = 0;

  configure(soundEnabled: boolean, musicEnabled: boolean): void {
    this.soundEnabled = soundEnabled;
    if (musicEnabled && !this.musicEnabled) {
      this.musicEnabled = true;
      this.startMusic();
    } else if (!musicEnabled && this.musicEnabled) {
      this.musicEnabled = false;
      this.stopMusic();
    } else {
      this.musicEnabled = musicEnabled;
    }
  }

  unlock(): void {
    const context = this.getContext();
    if (!context) return;
    if (context.state === "suspended") {
      void context.resume().then(() => {
        if (this.musicEnabled && this.musicTimer === null) this.startMusic();
      }).catch(() => undefined);
    } else if (this.musicEnabled && this.musicTimer === null) {
      this.startMusic();
    }
  }

  play(kind: SoundKind): void {
    if (!this.soundEnabled) return;
    const patterns: Record<SoundKind, number[]> = {
      move: [392],
      click: [587],
      collect: [659, 784, 988],
      hurt: [220, 174],
      success: [523, 659, 784, 1047]
    };
    const notes = patterns[kind];
    notes.forEach((frequency, index) => {
      window.setTimeout(() => this.tone(
        frequency,
        kind === "success" ? 0.17 : kind === "hurt" ? 0.14 : 0.11,
        kind === "hurt" ? "triangle" : "sine",
        kind === "move" ? 0.035 : 0.065
      ), index * 85);
    });
  }

  private getContext(): AudioContext | null {
    try {
      const AudioContextClass = window.AudioContext;
      if (!AudioContextClass) return null;
      if (!this.context) this.context = new AudioContextClass();
      if (this.context.state === "suspended") void this.context.resume().catch(() => undefined);
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
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume, context.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration + 0.025);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  private startMusic(): void {
    if (this.musicTimer !== null || !this.musicEnabled) return;
    const context = this.getContext();
    if (!context) return;
    if (context.state === "suspended") {
      void context.resume().then(() => {
        if (this.musicEnabled && this.musicTimer === null) this.startMusic();
      }).catch(() => undefined);
      return;
    }
    // A gentle, clearly audible storybook tune in C major / A minor.
    // Melody, soft harmony and bass notes are synthesized locally; no network audio.
    const melody = [
      523.25, 659.25, 783.99, 659.25,
      587.33, 698.46, 880.00, 698.46,
      523.25, 659.25, 783.99, 1046.5,
      783.99, 698.46, 659.25, 523.25
    ];
    const harmony = [
      392.00, 440.00, 392.00, 349.23,
      329.63, 392.00, 349.23, 293.66
    ];
    const bass = [130.81, 110.00, 87.31, 98.00];

    const playBeat = (): void => {
      if (!this.musicEnabled) return;
      const step = this.noteIndex % melody.length;
      this.tone(melody[step]!, 0.34, "triangle", 0.105);
      if (step % 2 === 0) {
        this.tone(harmony[(step / 2) % harmony.length]!, 0.62, "sine", 0.038);
      }
      if (step % 4 === 0) {
        this.tone(bass[Math.floor(step / 4) % bass.length]!, 0.82, "sine", 0.055);
      }
      this.noteIndex = (step + 1) % melody.length;
    };

    playBeat();
    this.musicTimer = window.setInterval(playBeat, 430);
    // The context is already running here; scheduling now keeps the melody audible.
  }

  private stopMusic(): void {
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const gameAudio = new SoundManager();
