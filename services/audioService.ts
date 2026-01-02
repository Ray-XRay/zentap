export class AudioService {
  private context: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  public toggleSound(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public async playWoodBlock() {
    if (!this.context || !this.isEnabled) return;

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }

    const t = this.context.currentTime;
    
    // Create oscillator for the main tone
    const osc = this.context.createOscillator();
    osc.type = 'sine';
    
    // Wooden fish is usually a bit hollow, around 800-1200Hz depending on size.
    // Let's go for a deeper, more resonant sound.
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);

    // Create a noise buffer for the "click" attack
    const bufferSize = this.context.sampleRate * 0.02; // 20ms
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;

    // Filter for the noise to make it less harsh
    const noiseFilter = this.context.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1000;

    // Gain envelope for the tone
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.8, t + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15); // Decay

    // Gain envelope for the noise (click)
    const noiseGain = this.context.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.02);

    // Filter for the main tone to simulate wood resonance
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 1;

    // Connect graph
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.context.destination);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.context.destination);

    // Start
    osc.start(t);
    osc.stop(t + 0.2);
    noise.start(t);
  }
}

export const audioService = new AudioService();