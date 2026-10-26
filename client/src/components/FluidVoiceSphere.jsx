import React, { useEffect, useRef } from "react";

/**
 * FluidVoiceSphere
 * 
 * Luminous, organic voice-reactive sphere for Light Mode.
 * Inspired by modern AI voice interfaces (ChatGPT Voice / Gemini Live).
 * Uses HTML5 2D Canvas with procedural multi-layered fluid wave synthesis,
 * light refraction crest, and Web Audio API microphone pitch/volume reactivity.
 */
export default function FluidVoiceSphere({
  isListening = false,
  isSpeaking = false,
  isProcessing = false,
  size = 130,
  theme = "ocean", // 'ocean' (blue/periwinkle like screenshot) | 'emerald' (AarogyaVaani medical)
  className = "",
  onClick,
}) {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Audio metrics with exponential smoothing
  const audioMetricsRef = useRef({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
  });

  // Setup / teardown Web Audio API for real microphone pitch/volume
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
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.85;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);
      } catch (err) {
        // Fallback gracefully: simulation will take over
        console.warn("Microphone WebAudio inactive or permission not granted, using organic simulation:", err);
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

  // Main 60FPS fluid canvas renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const renderSize = size * dpr;
    canvas.width = renderSize;
    canvas.height = renderSize;

    let time = 0;
    const freqData = new Uint8Array(128);

    const render = () => {
      time += 0.024;

      const analyser = analyserRef.current;
      let rawVolume = 0;
      let rawBass = 0;
      let rawMid = 0;

      if (analyser && isListening) {
        analyser.getByteFrequencyData(freqData);
        let sum = 0;
        let bassSum = 0;
        let midSum = 0;
        for (let i = 0; i < 40; i++) {
          const val = freqData[i] || 0;
          sum += val;
          if (i < 8) bassSum += val;
          else if (i < 24) midSum += val;
        }
        rawVolume = sum / (40 * 255);
        rawBass = bassSum / (8 * 255);
        rawMid = midSum / (16 * 255);
      } else if (isSpeaking) {
        // AI Speaking: rhythmic melodious fluid waves
        rawVolume = 0.38 + 0.22 * Math.sin(time * 5.2) * Math.cos(time * 3.1);
        rawBass = 0.32 + 0.18 * Math.sin(time * 4.4);
        rawMid = 0.4 + 0.2 * Math.cos(time * 6.2);
      } else if (isProcessing) {
        // AI Thinking: fast swirling harmonic
        rawVolume = 0.28 + 0.15 * Math.sin(time * 8.0);
        rawBass = 0.22;
        rawMid = 0.35;
      } else if (isListening) {
        // Listening quietly: gentle anticipation
        rawVolume = 0.12 + 0.06 * Math.sin(time * 2.5);
        rawBass = 0.1;
        rawMid = 0.12;
      } else {
        // Idle breathing
        rawVolume = 0.05 + 0.03 * Math.sin(time * 1.6);
        rawBass = 0.04;
        rawMid = 0.05;
      }

      // Smooth decay
      const metrics = audioMetricsRef.current;
      metrics.volume += (rawVolume - metrics.volume) * 0.22;
      metrics.bass += (rawBass - metrics.bass) * 0.22;
      metrics.mid += (rawMid - metrics.mid) * 0.22;

      ctx.clearRect(0, 0, renderSize, renderSize);

      const cx = renderSize / 2;
      const cy = renderSize / 2;
      const baseR = (size * 0.44) * dpr;

      // 1. Dynamic scale pulsation
      const pulseScale = 1 + metrics.volume * 0.18 + Math.sin(time * 2.2) * 0.02;
      const r = baseR * pulseScale;

      ctx.save();

      // Circular clip mask for the sphere
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // 2. Base Spherical Gradient (Deep background layer of orb)
      const baseGrad = ctx.createRadialGradient(
        cx,
        cy + r * 0.35,
        r * 0.1,
        cx,
        cy,
        r * 1.05
      );

      if (theme === "emerald") {
        baseGrad.addColorStop(0, "#0b6651"); // deep emerald
        baseGrad.addColorStop(0.5, "#0d9488"); // rich teal
        baseGrad.addColorStop(0.85, "#2dd4bf"); // bright cyan-teal
        baseGrad.addColorStop(1, "#99f6e4"); // light mint
      } else {
        // Ocean / Periwinkle theme (matching user's screenshot exactly!)
        baseGrad.addColorStop(0, "#2563eb"); // vibrant royal blue
        baseGrad.addColorStop(0.45, "#4f46e5"); // deep indigo
        baseGrad.addColorStop(0.75, "#818cf8"); // soft periwinkle
        baseGrad.addColorStop(1, "#c7d2fe"); // lavender/sky
      }

      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, renderSize, renderSize);

      // 3. Fluid Internal Swirling Waves (Simulating cloudy volumetric light)
      const numWaves = 4;
      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        const waveSpeed = time * (1.8 + w * 0.5) + w * 1.5;
        const waveFreq = 2.5 + w * 0.7;
        const waveAmp = (r * 0.12 + metrics.volume * r * 0.25) * (1 - w * 0.15);
        const yOffset = cy + (w - 1.2) * (r * 0.28) + Math.sin(waveSpeed) * (r * 0.1);

        ctx.moveTo(cx - r, renderSize);
        for (let x = cx - r; x <= cx + r; x += 4 * dpr) {
          const normX = (x - cx) / r;
          const sineVal = Math.sin(normX * waveFreq * Math.PI + waveSpeed);
          const cosVal = Math.cos(normX * (waveFreq * 1.3) * Math.PI - waveSpeed * 0.7);
          const y = yOffset + (sineVal + cosVal * 0.5) * waveAmp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(cx + r, renderSize);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, cy - r, 0, cy + r);
        if (theme === "emerald") {
          waveGrad.addColorStop(0, "rgba(204, 251, 241, 0.45)");
          waveGrad.addColorStop(0.6, "rgba(45, 212, 191, 0.28)");
          waveGrad.addColorStop(1, "rgba(11, 102, 81, 0.0)");
        } else {
          // Soft cyan / sky blue fluid wave
          waveGrad.addColorStop(0, "rgba(224, 242, 254, 0.65)");
          waveGrad.addColorStop(0.5, "rgba(147, 197, 253, 0.38)");
          waveGrad.addColorStop(1, "rgba(99, 102, 241, 0.0)");
        }

        ctx.fillStyle = waveGrad;
        ctx.fill();
      }

      // 4. Luminous Cloud / Crescent Top Crest (Exact look from screenshot!)
      // In the screenshot, the upper hemisphere has a bright white/cream glowing curve
      const crestGrad = ctx.createRadialGradient(
        cx,
        cy - r * 0.45,
        r * 0.05,
        cx,
        cy - r * 0.1,
        r * 0.95
      );
      crestGrad.addColorStop(0, "rgba(255, 255, 255, 0.96)");
      crestGrad.addColorStop(0.35, "rgba(240, 249, 255, 0.82)");
      crestGrad.addColorStop(0.7, "rgba(186, 230, 253, 0.35)");
      crestGrad.addColorStop(1, "rgba(255, 255, 255, 0.0)");

      ctx.beginPath();
      // Draw organic curved crest in upper part
      ctx.ellipse(
        cx,
        cy - r * 0.3 + Math.sin(time * 2.0) * (r * 0.04),
        r * 0.88,
        r * 0.52 + metrics.volume * (r * 0.18),
        0,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = crestGrad;
      ctx.fill();

      // 5. Subtle Inner Rim Specular Highlight (Glassy 3D sphere depth)
      const rimGrad = ctx.createRadialGradient(
        cx,
        cy,
        r * 0.82,
        cx,
        cy,
        r
      );
      rimGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
      rimGrad.addColorStop(0.85, "rgba(255, 255, 255, 0.28)");
      rimGrad.addColorStop(1, "rgba(255, 255, 255, 0.55)");

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = rimGrad;
      ctx.fill();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [size, isListening, isSpeaking, isProcessing, theme]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none group ${className}`}
      style={{ width: size + 40, height: size + 40 }}
    >
      {/* 1. Acoustic Ripple Rings (Expand smoothly when user or AI is speaking in Light Mode) */}
      {(isListening || isSpeaking || isProcessing) && (
        <>
          <div
            className={`absolute rounded-full pointer-events-none transition-all duration-700 animate-ping opacity-25 ${
              theme === "emerald"
                ? "bg-teal-300"
                : "bg-blue-300"
            }`}
            style={{
              width: size * 1.15,
              height: size * 1.15,
              animationDuration: isSpeaking ? "1.8s" : isListening ? "2.2s" : "1.4s",
            }}
          />
          <div
            className={`absolute rounded-full pointer-events-none transition-all duration-500 opacity-20 ${
              theme === "emerald"
                ? "bg-emerald-400"
                : "bg-indigo-300"
            }`}
            style={{
              width: size * 1.35,
              height: size * 1.35,
              animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </>
      )}

      {/* 2. Soft Light-Mode Ambient Drop Shadow (Gives tactile floating depth) */}
      <div
        className={`absolute rounded-full pointer-events-none transition-transform duration-300 blur-xl ${
          theme === "emerald"
            ? "bg-emerald-500/25"
            : "bg-blue-500/25"
        } ${isListening || isSpeaking ? "scale-115 opacity-80" : "scale-95 opacity-50"}`}
        style={{
          width: size * 0.85,
          height: size * 0.85,
          transform: "translateY(10px)",
        }}
      />

      {/* 3. The Fluid Canvas Orb */}
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
        }}
        className={`relative z-10 rounded-full transition-transform duration-200 cursor-pointer ${
          isListening ? "hover:scale-105" : ""
        }`}
      />
    </div>
  );
}
