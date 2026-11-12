import {
  HIGH_SCORE_STORAGE_KEY,
  type DifficultyId,
  type GridSizeId,
} from "./game-config";

/** Best score per `difficulty:gridSize` combination. */
export type HighScores = Record<string, number>;

const EMPTY_SCORES: HighScores = {};

let cache: HighScores | null = null;
const listeners = new Set<() => void>();

export function highScoreKey(
  difficulty: DifficultyId,
  gridSize: GridSizeId
): string {
  return `${difficulty}:${gridSize}`;
}

function readScores(): HighScores {
  if (typeof window === "undefined") return EMPTY_SCORES;

  try {
    const raw = window.localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
    if (!raw) return EMPTY_SCORES;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const scores: HighScores = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        scores[key] = value;
      }
    }

    return scores;
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

export function recordHighScore(
  difficulty: DifficultyId,
  gridSize: GridSizeId,
  score: number
) {
  const key = highScoreKey(difficulty, gridSize);
  const current = getHighScoresSnapshot();

  if (score <= (current[key] ?? 0)) return;

  cache = { ...current, [key]: score };

  try {
    window.localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Storage can be unavailable (private mode); the score stays in memory.
  }

  for (const listener of listeners) listener();
}
