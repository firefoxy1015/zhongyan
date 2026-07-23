export class SuspenseBgm {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private drones: OscillatorNode[] = [];
  private pulseTimer: number | null = null;

  start() {
    if (typeof window === "undefined" || this.context) return Boolean(this.context);

    const AudioContextConstructor = window.AudioContext
      ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return false;

    const context = new AudioContextConstructor();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.24, context.currentTime + 0.45);
    master.connect(context.destination);

    this.context = context;
    this.master = master;
    this.addDrone(55, "sine", 0.19);
    this.addDrone(82.41, "triangle", 0.055);
    this.schedulePulse();
    this.pulseTimer = window.setInterval(() => this.schedulePulse(), 1500);
    void context.resume();
    return true;
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
    this.hit(55, start, 0.27, 0.17, "triangle");
    this.hit(55, start + 0.22, 0.19, 0.11, "triangle");
    this.hit(110, start + 0.74, 0.07, 0.035, "sine");
    this.hit(82.41, start + 1.1, 0.11, 0.048, "sine");
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
