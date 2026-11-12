"use client";

import { useCallback, useEffect, useRef } from "react";

export type RetroSound = "start" | "eat" | "over";

interface RetroNote {
  freq: number;
  at: number;
  dur: number;
}

/** Tiny square-wave jingles, the kind a 8-bit console would hum. */
const NOTES: Record<RetroSound, RetroNote[]> = {
  start: [
    { freq: 523, at: 0, dur: 0.08 },
    { freq: 659, at: 0.08, dur: 0.08 },
    { freq: 784, at: 0.16, dur: 0.14 },
  ],
  eat: [
    { freq: 988, at: 0, dur: 0.06 },
    { freq: 1319, at: 0.06, dur: 0.09 },
  ],
  over: [
    { freq: 392, at: 0, dur: 0.16 },
    { freq: 311, at: 0.16, dur: 0.16 },
    { freq: 233, at: 0.32, dur: 0.32 },
  ],
};

/**
 * Plays short retro blips through the Web Audio API. The audio context is
 * created lazily on the first sound so it is only unlocked after a user
 * gesture, and the enabled flag is read from a ref so callers can keep a
 * stable callback.
 */
export function useRetroSound(enabled: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    return () => {
      const context = contextRef.current;
      contextRef.current = null;
      if (context && context.state !== "closed") {
        void context.close().catch(() => {});
      }
    };
  }, []);

  return useCallback((sound: RetroSound) => {
    if (!enabledRef.current || typeof window === "undefined") return;

    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;

    let context = contextRef.current;
    if (!context) {
      context = new AudioContextClass();
      contextRef.current = context;
    }

    if (context.state === "suspended") {
      void context.resume().catch(() => {});
    }

    const now = context.currentTime;

    for (const note of NOTES[sound]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(note.freq, now + note.at);

      gain.gain.setValueAtTime(0.0001, now + note.at);
      gain.gain.exponentialRampToValueAtTime(0.12, now + note.at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.dur);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + note.at);
      oscillator.stop(now + note.at + note.dur + 0.02);
    }
  }, []);
}
