"use client";

import React, { forwardRef, useRef, useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PAD = 4;
const KNOB = 46;

export const SlideToConfirmButton = forwardRef(function SlideToConfirmButton(
  {
    className,
    trackClassName,
    knobClassName,
    label = "Slide to dispatch 108 ambulance",
    confirmedLabel = "108 Ambulance Dispatched",
    onConfirm,
    colorScheme = "rose", // "rose" | "emerald" | "amber" | "indigo"
    isLoading = false,
    disabled = false,
    ...props
  },
  ref
) {
  const trackRef = useRef(null);
  const draggingRef = useRef(false);
  const [x, setX] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const maxX = () => {
    const track = trackRef.current;
    if (!track) return 0;
    return track.offsetWidth - KNOB - PAD * 2;
  };

  const handleDown = (event) => {
    if (confirmed || disabled || isLoading) return;
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMove = (event) => {
    if (!draggingRef.current || confirmed || disabled || isLoading) return;
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const next = Math.min(
      Math.max(event.clientX - rect.left - PAD - KNOB / 2, 0),
      maxX()
    );
    setX(next);
  };

  const handleUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (x >= maxX() - 6) {
      setX(maxX());
      setConfirmed(true);
      if (onConfirm) {
        onConfirm();
      }
    } else {
      setX(0);
    }
  };

  const handleReset = (e) => {
    e?.stopPropagation();
    setConfirmed(false);
    setX(0);
  };

  const progress = maxX() > 0 ? x / maxX() : 0;

  const getActiveTheme = () => {
    if (colorScheme === "emerald") {
      return {
        confirmedBg: "bg-emerald-600 dark:bg-emerald-700 text-white shadow-emerald-900/20",
        knobBg: "bg-emerald-600 text-white",
        trackActive: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
      };
    }
    if (colorScheme === "amber") {
      return {
        confirmedBg: "bg-amber-600 dark:bg-amber-700 text-white shadow-amber-900/20",
        knobBg: "bg-amber-600 text-white",
        trackActive: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
      };
    }
    // Default: Rose (Emergency)
    return {
      confirmedBg: "bg-rose-600 dark:bg-rose-700 text-white shadow-rose-900/20",
      knobBg: "bg-rose-600 text-white",
      trackActive: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900",
    };
  };

  const theme = getActiveTheme();

  return (
    <div
      ref={ref}
      data-slot="slide-to-confirm-button"
      className={cn("font-sans select-none w-full", className)}
      {...props}
    >
      <div
        ref={trackRef}
        className={cn(
          "relative isolate h-13 w-full transform-gpu overflow-hidden rounded-xl p-1 transition-all duration-300 border flex items-center shadow-xs",
          confirmed
            ? theme.confirmedBg
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
          trackClassName
        )}
      >
        {/* Progress Background Fill */}
        {!confirmed && progress > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 bg-rose-500/15 dark:bg-rose-500/20 transition-none pointer-events-none rounded-xl"
            style={{ width: `${(progress * 100).toFixed(1)}%` }}
          />
        )}

        {/* Track Label */}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 flex items-center justify-center text-xs font-bold tracking-wide uppercase transition-all duration-200 px-12 text-center pointer-events-none",
            confirmed
              ? "text-white"
              : "text-slate-600 dark:text-slate-300"
          )}
          style={{ opacity: confirmed ? 1 : Math.max(0.2, 1 - progress * 1.5) }}
        >
          {confirmed ? confirmedLabel : label}
        </span>

        {/* Slider Knob */}
        <button
          type="button"
          aria-label={label}
          disabled={confirmed || disabled || isLoading}
          onPointerDown={handleDown}
          onPointerMove={handleMove}
          onPointerUp={handleUp}
          onPointerCancel={handleUp}
          style={{
            transform: `translateX(${x}px)`,
            width: `${KNOB}px`,
            height: `${KNOB}px`,
          }}
          className={cn(
            "relative z-10 flex shrink-0 items-center justify-center rounded-lg transition-transform touch-none shadow-sm cursor-grab active:cursor-grabbing",
            confirmed
              ? "bg-white text-rose-600 dark:text-rose-700 cursor-default"
              : "bg-rose-600 text-white hover:bg-rose-700 active:scale-95",
            knobClassName
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : confirmed ? (
            <Check className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <ArrowRight className="w-5 h-5 stroke-[2.5] transition-transform group-hover:translate-x-0.5" />
          )}
        </button>

        {/* Reset button if confirmed */}
        {confirmed && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute right-3 text-[10px] uppercase font-bold tracking-wider text-white/80 hover:text-white underline underline-offset-2 z-20 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
});

export default SlideToConfirmButton;
