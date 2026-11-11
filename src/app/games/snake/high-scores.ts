import { HIGH_SCORE_STORAGE_KEY, type DifficultyId } from "./game-config";

export interface HighScores {
  facile: number;
  normal: number;
  difficile: number;
}

const EMPTY_SCORES: HighScores = { facile: 0, normal: 0, difficile: 0 };

let cache: HighScores | null = null;
const listeners = new Set<() => void>();

function readScores(): HighScores {
  if (typeof window === "undefined") return EMPTY_SCORES;

  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    if (!raw) return EMPTY_SCORES;

    const parsed = JSON.parse(raw) as Partial<HighScores>;
    return {
      facile: parsed.facile ?? 0,
      normal: parsed.normal ?? 0,
      difficile: parsed.difficile ?? 0,
    };
  } catch {
    return EMPTY_SCORES;
  }
}

/** Subscribe to record changes, including updates made in another tab. */
export function subscribeHighScores(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== HIGH_SCORE_STORAGE_KEY) return;
    cache = null;
    listener();
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Cached snapshot so repeated reads return a stable reference. */
export function getHighScoresSnapshot(): HighScores {
  if (!cache) cache = readScores();
  return cache;
}

export function getHighScoresServerSnapshot(): HighScores {
  return EMPTY_SCORES;
}

export function recordHighScore(difficulty: DifficultyId, score: number) {
  const current = getHighScoresSnapshot();
  if (score <= current[difficulty]) return;

  cache = { ...current, [difficulty]: score };

  try {
    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage can be unavailable (private mode); the score stays in memory.
  }

  for (const listener of listeners) listener();
}
