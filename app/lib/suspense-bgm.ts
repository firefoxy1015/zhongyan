export class SuspenseBgm {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private drones: OscillatorNode[] = [];
  private pulseTimer: number | null = null;

  async start() {
    if (typeof window === "undefined") return false;

    if (!this.context) {
      const AudioContextConstructor = window.AudioContext
        ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return false;

      const context = new AudioContextConstructor();
      const master = context.createGain();
      master.gain.setValueAtTime(0.0001, context.currentTime);
      master.gain.exponentialRampToValueAtTime(0.46, context.currentTime + 0.18);
      master.connect(context.destination);

      this.context = context;
      this.master = master;
      this.addDrone(55, "sine", 0.31);
      this.addDrone(82.41, "triangle", 0.1);
    }

    try {
      // Android may suspend a live context after focus or audio-route changes.
      // Resume on every intentional in-game interaction, not only first creation.
      await this.context.resume();
      if (this.context.state !== "running") return false;

      if (this.pulseTimer === null) {
        this.schedulePulse();
        this.pulseTimer = window.setInterval(() => this.schedulePulse(), 1500);
      }
      return true;
    } catch {
      return false;
    }
  }

  stop() {
    if (this.pulseTimer !== null) {
      window.clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }

    const context = this.context;
    const master = this.master;
    this.drones.forEach((oscillator) => oscillator.stop());
    this.drones = [];
    this.context = null;
    this.master = null;

    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), context.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.16);
      window.setTimeout(() => void context.close(), 190);
    }
  }

  setDucked(ducked: boolean) {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now);
    this.master.gain.exponentialRampToValueAtTime(ducked ? 0.12 : 0.46, now + 0.12);
  }

  private addDrone(frequency: number, type: OscillatorType, volume: number) {
    if (!this.context || !this.master) return;

    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    filter.type = "lowpass";
    filter.frequency.value = 210;
    gain.gain.value = volume;
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    oscillator.start();
    this.drones.push(oscillator);
  }

  private schedulePulse() {
    const context = this.context;
    if (!context) return;

    const start = context.currentTime + 0.03;
    this.hit(55, start, 0.31, 0.33, "triangle");
    this.hit(55, start + 0.25, 0.21, 0.23, "triangle");
    this.hit(110, start + 0.76, 0.08, 0.08, "sine");
    this.hit(82.41, start + 1.1, 0.13, 0.11, "sine");
  }

  private hit(frequency: number, start: number, duration: number, volume: number, type: OscillatorType) {
    if (!this.context || !this.master) return;

    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.72), start + duration);
    filter.type = "lowpass";
    filter.frequency.value = type === "triangle" ? 190 : 720;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }
}
