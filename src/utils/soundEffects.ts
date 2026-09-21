/**
 * Military Medical Clinic Sound Effects Utility
 * Uses Web Audio API for 100% offline, zero-dependency, ultra-lightweight UI sound feedback.
 * Volumes are carefully calibrated to be pleasant, warm, subtle, and non-intrusive.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * 1. CREATE Sound: Ascending gentle chime (C5 -> E5 -> G5)
 * For creating new patients, new exam records, new medicines, new doctors, new templates.
 */
export function playCreateSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.09, now);
    masterGain.connect(ctx.destination);

    // Arpeggio notes: C5 (523.25), E5 (659.25), G5 (783.99)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.12 },
      { freq: 659.25, time: 0.07, duration: 0.12 },
      { freq: 783.99, time: 0.14, duration: 0.22 }
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.7, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (e) {
    // Ignore audio errors silently
  }
}

/**
 * 2. UPDATE Sound: Soft dual-tone confirmation (E5 -> B5)
 * For updating/editing existing records, doctor profiles, medicines, departments, etc.
 */
export function playUpdateSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, now);
    masterGain.connect(ctx.destination);

    const notes = [
      { freq: 659.25, time: 0, duration: 0.1 },
      { freq: 987.77, time: 0.06, duration: 0.18 }
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.6, now + time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (e) {
    // Ignore audio errors silently
  }
}

/**
 * 3. DELETE Sound: Soft, warm, low-frequency descending note (F4 -> C4) with smooth low-pass filter
 * Non-alarming, gentle acoustic feedback for removing records or items.
 */
export function playDeleteSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.075, now);

    // Low-pass filter to make it soft and round
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, now);

    filter.connect(ctx.destination);
    masterGain.connect(filter);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(349.23, now); // F4
    osc.frequency.exponentialRampToValueAtTime(261.63, now + 0.18); // slide down to C4

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.8, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (e) {
    // Ignore audio errors silently
  }
}

/**
 * 4. EXPORT Sound: Shimmering 3-note harmonic chime (C5 -> G5 -> C6)
 * For downloading Excel spreadsheets (.xlsx), templates, and database exports.
 */
export function playExportSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.09, now);
    masterGain.connect(ctx.destination);

    // Elegant bell-like progression: C5 (523.25), G5 (783.99), C6 (1046.50)
    const notes = [
      { freq: 523.25, time: 0, duration: 0.18 },
      { freq: 783.99, time: 0.08, duration: 0.24 },
      { freq: 1046.50, time: 0.16, duration: 0.38 }
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.7, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + duration);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + time);
      osc.stop(now + time + duration);
    });
  } catch (e) {
    // Ignore audio errors silently
  }
}

/**
 * 5. General Success / Action Completed Sound
 */
export function playSuccessSound() {
  playCreateSound();
}
