/**
 * Web Audio API Sound Generator for Tele-consultation Calling Experience
 * Provides realistic telephone ring tone, call connected chime, and call termination tone.
 * 100% synthetic, zero external audio asset dependencies, cross-browser compatible.
 */

class CallSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.activeRingtone = null;
  }

  _getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Starts a realistic telephone ringing tone.
   * Standard North American / Indian PBX ring: Dual frequencies 440 Hz + 480 Hz
   * Cadence: 1.2s tone ON, 1.8s silence.
   */
  startRingtone() {
    this.stopRingtone();
    const ctx = this._getAudioContext();
    if (!ctx) return { stop: () => {} };

    let isPlaying = true;
    let timerId = null;
    let activeNodes = [];

    const playRingCycle = () => {
      if (!isPlaying || ctx.state === "closed") return;

      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(440, now); // 440 Hz
        osc2.frequency.setValueAtTime(480, now); // 480 Hz

        // Envelope: soft ramp up, hold 1.2s, smooth fade out
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.08);
        gain.gain.setValueAtTime(0.08, now + 1.2);
        gain.gain.linearRampToValueAtTime(0, now + 1.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.3);
        osc2.stop(now + 1.3);

        activeNodes = [osc1, osc2, gain];

        // Next cycle after 3.0 seconds total (1.2s ring + 1.8s silence)
        timerId = setTimeout(() => {
          if (isPlaying) playRingCycle();
        }, 3000);
      } catch (err) {
        console.warn("Ringtone error:", err);
      }
    };

    playRingCycle();

    this.activeRingtone = {
      stop: () => {
        isPlaying = false;
        if (timerId) clearTimeout(timerId);
        activeNodes.forEach((node) => {
          try {
            if (node.stop) node.stop();
            if (node.disconnect) node.disconnect();
          } catch {}
        });
        activeNodes = [];
      },
    };

    return this.activeRingtone;
  }

  /**
   * Stop any actively playing ringtone.
   */
  stopRingtone() {
    if (this.activeRingtone) {
      this.activeRingtone.stop();
      this.activeRingtone = null;
    }
  }

  /**
   * Play pleasant ascending two-tone chime when the doctor answers the call.
   */
  playCallConnectedChime() {
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("Connected chime error:", e);
    }
  }

  /**
   * Play gentle descending tone when call is terminated.
   */
  playCallEndTone() {
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(493.88, now); // B4
      osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.18); // E4

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      console.warn("Call end tone error:", e);
    }
  }

  /**
   * High-priority clinical telemetry emergency alarm (IEC 60601-1-8 compliant pattern)
   * 3 rapid pulse bursts (880 Hz, 880 Hz, 988 Hz) with decay
   */
  playEmergencyBeep() {
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 880, start: 0, dur: 0.12 },
        { freq: 880, start: 0.16, dur: 0.12 },
        { freq: 988, start: 0.32, dur: 0.20 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.freq, now + n.start);

        gain.gain.setValueAtTime(0, now + n.start);
        gain.gain.linearRampToValueAtTime(0.08, now + n.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + n.start);
        osc.stop(now + n.start + n.dur);
      });
    } catch (e) {
      console.warn("Emergency beep error:", e);
    }
  }

  /**
   * Continuous emergency alarm loop (can be toggled by doctor)
   */
  startEmergencyAlarmLoop(intervalMs = 4000) {
    this.stopEmergencyAlarmLoop();
    this.playEmergencyBeep();
    this._emergencyAlarmTimer = setInterval(() => {
      this.playEmergencyBeep();
    }, intervalMs);
  }

  stopEmergencyAlarmLoop() {
    if (this._emergencyAlarmTimer) {
      clearInterval(this._emergencyAlarmTimer);
      this._emergencyAlarmTimer = null;
    }
  }
}

export const callSounds = new CallSoundEngine();
