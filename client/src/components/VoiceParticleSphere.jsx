import React, { useEffect, useRef } from "react";

/**
 * VoiceParticleSphere
 * 
 * Clean, modern 3D voice-reactive particle sphere for Light Mode.
 * No blur, no radial glow/shadows — crisp, sharp particles that react
 * to voice pitch and frequency via the Web Audio API.
 */
export default function VoiceParticleSphere({
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  onSpeechVolume,
  className = "",
  size = 300,
}) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Audio metrics smoothing
  const audioMetricsRef = useRef({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
  });

  // Setup / Teardown Web Audio API
  useEffect(() => {
    let active = true;

    async function initAudio() {
      if (!isListening) {
        cleanUpAudio();
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);
      } catch (err) {
        console.warn("Microphone access unavailable, using simulated voice dynamics:", err);
      }
    }

    function cleanUpAudio() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {}
        sourceRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
        audioContextRef.current = null;
      }
      analyserRef.current = null;
    }

    initAudio();

    return () => {
      active = false;
      cleanUpAudio();
    };
  }, [isListening]);

  // Main 3D Canvas Rendering Loop (Pure Light Mode, No Glow)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // 480 3D Fibonacci Particle Sphere Points
    const PARTICLE_COUNT = 480;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = Math.PI * 2 * goldenRatio;

    const baseParticles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = i / PARTICLE_COUNT;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      const x0 = Math.sin(inclination) * Math.cos(azimuth);
      const y0 = Math.cos(inclination);
      const z0 = Math.sin(inclination) * Math.sin(azimuth);

      baseParticles.push({
        x0,
        y0,
        z0,
        theta: inclination,
        phi: azimuth,
        index: i,
      });
    }

    let rotX = 0;
    let rotY = 0;
    let time = 0;

    const freqData = new Uint8Array(256);

    const render = () => {
      time += 0.018;

      const analyser = analyserRef.current;
      let rawVolume = 0;
      let rawBass = 0;
      let rawMid = 0;
      let rawTreble = 0;

      if (analyser && isListening) {
        analyser.getByteFrequencyData(freqData);

        let sum = 0;
        let bassSum = 0;
        let midSum = 0;
        let trebSum = 0;

        for (let i = 0; i < 80; i++) {
          const val = freqData[i] || 0;
          sum += val;
          if (i < 10) bassSum += val;
          else if (i < 40) midSum += val;
          else trebSum += val;
        }

        rawVolume = sum / (80 * 255);
        rawBass = bassSum / (10 * 255);
        rawMid = midSum / (30 * 255);
        rawTreble = trebSum / (40 * 255);
      } else if (isSpeaking) {
        rawVolume = 0.3 + 0.2 * Math.sin(time * 5.5) * Math.cos(time * 3);
        rawBass = 0.25 + 0.15 * Math.sin(time * 4.5);
        rawMid = 0.35 + 0.2 * Math.cos(time * 6.5);
        rawTreble = 0.2 + 0.1 * Math.sin(time * 8);
      } else if (isProcessing) {
        rawVolume = 0.18 + 0.12 * Math.sin(time * 7);
        rawBass = 0.15;
        rawMid = 0.25;
        rawTreble = 0.2;
      }

      // Smooth decay
      const metrics = audioMetricsRef.current;
      metrics.volume += (rawVolume - metrics.volume) * 0.25;
      metrics.bass += (rawBass - metrics.bass) * 0.25;
      metrics.mid += (rawMid - metrics.mid) * 0.25;
      metrics.treble += (rawTreble - metrics.treble) * 0.25;

      if (onSpeechVolume) {
        onSpeechVolume(metrics.volume);
      }

      // 3D Rotation
      const rotSpeed = isProcessing ? 0.025 : isListening ? 0.012 : 0.007;
      rotY += rotSpeed + metrics.volume * 0.018;
      rotX += rotSpeed * 0.35 + metrics.bass * 0.012;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // Clear Canvas (Transparent, No background glow)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Base Sphere Radius
      const baseRadius = size * 0.34 * dpr;

      // Calculate 3D Particle Coordinates
      const projected = [];

      for (let i = 0; i < baseParticles.length; i++) {
        const p = baseParticles[i];

        // Voice Harmonic Surface Displacement Waves
        const waveFreq = 4.0;
        const wave1 = Math.sin(p.theta * waveFreq + time * 3 + metrics.mid * 5);
        const wave2 = Math.cos(p.phi * (waveFreq * 0.75) + time * 2.5);
        const voiceDisplacement =
          (wave1 * wave2) * (metrics.volume * 34 + metrics.treble * 18) * dpr;

        // Subtle organic breathing when idle
        const idleWave = Math.sin(p.theta * 3 + time * 1.6) * 3.0 * dpr;
        const currentDisplacement = isListening || isSpeaking || isProcessing
          ? voiceDisplacement
          : idleWave;

        const effectiveRadius = baseRadius + currentDisplacement;

        // 3D coordinates
        let x = p.x0 * effectiveRadius;
        let y = p.y0 * effectiveRadius;
        let z = p.z0 * effectiveRadius;

        // Rotation around Y
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;

        // Rotation around X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        // Perspective Projection
        const fov = 340 * dpr;
        const scale = fov / (fov + z2);
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y2 * scale;

        projected.push({
          x: screenX,
          y: screenY,
          z: z2,
          scale,
          vol: metrics.volume,
          isHighDisplacement: Math.abs(currentDisplacement) > 6 * dpr,
        });
      }

      // Sort back to front for depth ordering
      projected.sort((a, b) => a.z - b.z);

      // Render Crisp, Sharp Particles (Light Mode Colors, NO Glow / NO ShadowBlur)
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Normalized Z depth: 0 (furthest back) to 1 (closest front)
        const normZ = (p.z + baseRadius) / (2 * baseRadius);
        const alpha = Math.max(0.2, Math.min(1.0, 0.22 + normZ * 0.78));
        const pRadius = Math.max(0.9, (1.3 + normZ * 2.1 + p.vol * 1.5) * dpr);

        ctx.beginPath();
        ctx.arc(p.x, p.y, pRadius, 0, Math.PI * 2);

        // Light Mode Palette:
        // Near particles: Sharp dark emerald / teal / navy
        // Far particles: Subtle soft slate / teal
        if (isProcessing) {
          // AI Thinking: Elegant Deep Indigo / Violet
          if (normZ > 0.6) {
            ctx.fillStyle = `rgba(67, 56, 202, ${alpha})`; // indigo-700
          } else {
            ctx.fillStyle = `rgba(129, 140, 248, ${alpha * 0.7})`; // indigo-400
          }
        } else if (isListening) {
          // Live Voice: Active Medical Emerald & Cyan
          if (normZ > 0.6 || p.isHighDisplacement) {
            ctx.fillStyle = `rgba(5, 150, 105, ${alpha})`; // emerald-600
          } else {
            ctx.fillStyle = `rgba(13, 148, 136, ${alpha * 0.8})`; // teal-600
          }
        } else if (isSpeaking) {
          // AI Speaking: Teal & Sky
          if (normZ > 0.6) {
            ctx.fillStyle = `rgba(15, 118, 110, ${alpha})`; // teal-700
          } else {
            ctx.fillStyle = `rgba(100, 116, 139, ${alpha * 0.6})`; // slate-500
          }
        } else {
          // Resting / Idle: Signature AarogyaVaani Deep Medical Green (#0b6651)
          if (normZ > 0.65) {
            ctx.fillStyle = `rgba(11, 102, 81, ${alpha})`; // #0b6651
          } else if (normZ > 0.35) {
            ctx.fillStyle = `rgba(15, 118, 110, ${alpha * 0.85})`; // teal-700
          } else {
            ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.55})`; // slate-400
          }
        }

        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [size, isListening, isSpeaking, isProcessing, onSpeechVolume]);

  return (
    <div
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
        }}
        className="transition-transform duration-200"
      />
    </div>
  );
}
