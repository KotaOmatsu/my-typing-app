class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.3; // Global volume
        this.createNoiseBuffer();
      }
    }
  }

  private initAudio() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.3;
        this.createNoiseBuffer();
      }
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  private createNoiseBuffer() {
    if (!this.audioContext) return;
    const bufferSize = this.audioContext.sampleRate * 0.1; // 0.1 seconds of noise
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
  }

  playTypeSound() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain || !this.noiseBuffer) return;

    const t = this.audioContext.currentTime;

    // 1. "Thock" body (Low frequency sine/triangle)
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    // Filter to dampen the tone slightly
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1000;
    oscGain.connect(filter);
    filter.connect(this.masterGain);

    osc.type = 'triangle'; // Triangle wave gives a bit more "body" than sine
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.05); // Pitch drop

    // Envelope for the thock
    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.start(t);
    osc.stop(t + 0.1);

    // 2. "Click" (High frequency noise burst)
    const noiseSrc = this.audioContext.createBufferSource();
    const noiseGain = this.audioContext.createGain();
    const noiseFilter = this.audioContext.createBiquadFilter();

    noiseSrc.buffer = this.noiseBuffer;
    
    // Highpass filter to make it just a "click"
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 2000;

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    // Sharp envelope
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

    noiseSrc.start(t);
    noiseSrc.stop(t + 0.05);
  }

  playMissSound() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  playSuccessSound() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const notes = [523.25, 659.25]; // C5, E5

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.3, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.2);
    });
  }

  playFanfareSound() {
    this.initAudio();
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
        const osc = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();
  
        osc.connect(gain);
        gain.connect(this.masterGain!);
  
        osc.type = 'triangle';
        osc.frequency.value = freq;
  
        gain.gain.setValueAtTime(0.4, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.6);
  
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.6);
      });
  }
}

export const soundManager = new SoundManager();
