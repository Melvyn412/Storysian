/**
 * Procedural Web Audio API sound synthesizer for Viking Realm
 * Crisp, authentic Norse audio without external asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Resonant Gjallarhorn War Horn Blast
   */
  public playWarHorn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc3.type = 'sawtooth';

    // Deep horn pitch sweep
    osc1.frequency.setValueAtTime(110, t);
    osc1.frequency.linearRampToValueAtTime(130, t + 0.3);
    osc1.frequency.exponentialRampToValueAtTime(110, t + 1.8);

    osc2.frequency.setValueAtTime(165, t);
    osc2.frequency.linearRampToValueAtTime(195, t + 0.3);
    osc2.frequency.exponentialRampToValueAtTime(165, t + 1.8);

    osc3.frequency.setValueAtTime(55, t); // Sub-bass growl

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.linearRampToValueAtTime(1200, t + 0.4);
    filter.frequency.exponentialRampToValueAtTime(300, t + 2.0);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc3.start(t);
    osc1.stop(t + 2.2);
    osc2.stop(t + 2.2);
    osc3.stop(t + 2.2);
  }

  /**
   * Weapon swing whoosh
   */
  public playAxeSwing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1600, t + 0.08);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
  }

  /**
   * Impact hit (axe chop / sword clash)
   */
  public playHitImpact(isWood = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (isWood) {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    } else {
      // Metallic clash
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(620, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.18);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.2);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Shield block metallic thump
   */
  public playShieldBlock() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.15);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Mead sip & health rejuvenation
   */
  public playMeadDrink() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [260, 390, 520, 650].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0, t + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.25);
    });
  }

  /**
   * Hammer place block / barricade
   */
  public playHammerBuild() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Footstep sound
   */
  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80 + Math.random() * 20, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.06);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  /**
   * Visceral Critical Hit with ringing steel resonance
   */
  public playCriticalHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const ring = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const ringGain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.22);

    ring.type = 'sine';
    ring.frequency.setValueAtTime(1760, t);
    ring.frequency.exponentialRampToValueAtTime(1320, t + 0.35);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    ringGain.gain.setValueAtTime(0.3, t);
    ringGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    ring.connect(ringGain);
    gain.connect(this.ctx.destination);
    ringGain.connect(this.ctx.destination);

    osc.start(t);
    ring.start(t);
    osc.stop(t + 0.26);
    ring.stop(t + 0.36);
  }

  /**
   * Heavy Boss Ground Stomp / Shockwave Slam
   */
  public playBossStomp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.linearRampToValueAtTime(90, t + 0.5);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.55);
  }

  /**
   * Splintering Wood Crash / Barricade Collapse
   */
  public playBarricadeBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Layer 1: low wood thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.3);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);

    // Layer 2: splinter crack
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.25, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 850;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  /**
   * Epic Campaign Victory Fanfare
   */
  public playVictoryTriumph() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [293.66, 369.99, 440.0, 587.33, 739.99]; // D, F#, A, D, F#
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);
      gain.gain.setValueAtTime(0, t + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, t + idx * 0.12 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.65);
    });
  }

  /**
   * Quest reward / Level up victory fanfare
   */
  public playFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [220, 277.18, 329.63, 440, 554.37];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(0, t + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.25, t + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 0.45);
    });
  }

  /**
   * Atmospheric Norse weather shift audio
   */
  public playWeatherChange(weather: 'sunny' | 'foggy' | 'snowy' | 'stormy') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    if (weather === 'sunny') {
      // Warm uplifting solar chord (Odin's Dawn)
      const sunNotes = [261.63, 329.63, 392.0, 523.25]; // C, E, G, C
      sunNotes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.8, t + i * 0.07);
        osc.frequency.exponentialRampToValueAtTime(freq, t + i * 0.07 + 0.2);

        gain.gain.setValueAtTime(0.01, t + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, t + i * 0.07 + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + i * 0.07);
        osc.stop(t + i * 0.07 + 0.85);
      });
    } else if (weather === 'foggy') {
      // Low atmospheric mist horn and hollow wind drone (Niflheim)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, t);
      osc.frequency.linearRampToValueAtTime(80, t + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(280, t);
      filter.frequency.linearRampToValueAtTime(160, t + 1.2);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 1.5);
    } else if (weather === 'snowy') {
      // Swirling winter wind gust + high crystalline frost bells (Fimbulwinter)
      const windOsc = this.ctx.createOscillator();
      const windGain = this.ctx.createGain();
      const windFilter = this.ctx.createBiquadFilter();

      windOsc.type = 'triangle';
      windOsc.frequency.setValueAtTime(140, t);
      windOsc.frequency.linearRampToValueAtTime(220, t + 0.4);
      windOsc.frequency.exponentialRampToValueAtTime(90, t + 1.2);

      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(450, t);
      windFilter.Q.value = 3.0;

      windGain.gain.setValueAtTime(0.01, t);
      windGain.gain.linearRampToValueAtTime(0.15, t + 0.3);
      windGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      windOsc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.ctx.destination);
      windOsc.start(t);
      windOsc.stop(t + 1.3);

      // Frost chimes
      [880, 1174.66, 1318.51].forEach((freq, i) => {
        const chimeOsc = this.ctx!.createOscillator();
        const chimeGain = this.ctx!.createGain();
        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, t + 0.15 + i * 0.1);
        chimeGain.gain.setValueAtTime(0.08, t + 0.15 + i * 0.1);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15 + i * 0.1 + 0.4);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx!.destination);
        chimeOsc.start(t + 0.15 + i * 0.1);
        chimeOsc.stop(t + 0.15 + i * 0.1 + 0.45);
      });
    } else if (weather === 'stormy') {
      // Powerful lightning thunder roll + ominous storm gust (Thor's Tempest)
      this.playThunder();
    }
  }

  /**
   * Powerful Thunder Strike & Rolling Norse Tempest Rumble
   */
  public playThunder() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Initial sharp lightning crack
    const crackLen = Math.floor(this.ctx.sampleRate * 0.18);
    const crackBuf = this.ctx.createBuffer(1, crackLen, this.ctx.sampleRate);
    const crackData = crackBuf.getChannelData(0);
    for (let i = 0; i < crackLen; i++) {
      crackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.035));
    }
    const crackSource = this.ctx.createBufferSource();
    crackSource.buffer = crackBuf;
    const crackFilter = this.ctx.createBiquadFilter();
    crackFilter.type = 'bandpass';
    crackFilter.frequency.setValueAtTime(1400, t);
    crackFilter.frequency.exponentialRampToValueAtTime(350, t + 0.15);
    crackFilter.Q.value = 2.0;

    const crackGain = this.ctx.createGain();
    crackGain.gain.setValueAtTime(0.55, t);
    crackGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    crackSource.connect(crackFilter);
    crackFilter.connect(crackGain);
    crackGain.connect(this.ctx.destination);
    crackSource.start(t);

    // 2. Heavy Sub-bass boom
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'triangle';
    boomOsc.frequency.setValueAtTime(95, t + 0.05);
    boomOsc.frequency.exponentialRampToValueAtTime(32, t + 1.2);

    boomGain.gain.setValueAtTime(0.01, t);
    boomGain.gain.linearRampToValueAtTime(0.7, t + 0.1);
    boomGain.gain.exponentialRampToValueAtTime(0.005, t + 1.5);

    boomOsc.connect(boomGain);
    boomGain.connect(this.ctx.destination);
    boomOsc.start(t + 0.05);
    boomOsc.stop(t + 1.6);

    // 3. Low-frequency reverberant rolling thunder tail
    const rumbleLen = Math.floor(this.ctx.sampleRate * 2.4);
    const rumbleBuf = this.ctx.createBuffer(1, rumbleLen, this.ctx.sampleRate);
    const rumbleData = rumbleBuf.getChannelData(0);
    for (let i = 0; i < rumbleLen; i++) {
      const progress = i / rumbleLen;
      // Modulated low rumble
      const env = Math.sin(progress * Math.PI) * Math.exp(-progress * 1.5);
      rumbleData[i] = (Math.random() * 2 - 1) * env * (0.8 + 0.2 * Math.sin(progress * 30));
    }
    const rumbleSource = this.ctx.createBufferSource();
    rumbleSource.buffer = rumbleBuf;

    const rumbleFilter = this.ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(220, t + 0.1);
    rumbleFilter.frequency.linearRampToValueAtTime(80, t + 2.2);

    const rumbleGain = this.ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.01, t);
    rumbleGain.gain.linearRampToValueAtTime(0.6, t + 0.35);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

    rumbleSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(this.ctx.destination);
    rumbleSource.start(t + 0.1);
  }

  /**
   * Ocean Wave Plunge / Drakkar Bow Spray Splash
   */
  public playWaveSplash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const splashLen = Math.floor(this.ctx.sampleRate * 0.7);
    const buf = this.ctx.createBuffer(1, splashLen, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < splashLen; i++) {
      const p = i / splashLen;
      data[i] = (Math.random() * 2 - 1) * Math.sin(p * Math.PI) * Math.exp(-p * 2);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.exponentialRampToValueAtTime(180, t + 0.65);
    filter.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  public playBowShoot() {
    this.playAxeSwing();
  }

  public playWoodChop() {
    this.playHitImpact(true);
  }

  public playHammerHit() {
    this.playHammerBuild();
  }

  public playWhoosh() {
    this.playAxeSwing();
  }

  public playSplash() {
    this.playWaveSplash();
  }

  public playHornAlert() {
    this.playWarHorn();
  }
}

export const sound = new SoundEngine();

