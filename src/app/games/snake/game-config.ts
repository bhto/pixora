export type Direction = "up" | "down" | "left" | "right";

export type DifficultyId = "facile" | "normal" | "difficile";

export type GridSizeId = "petite" | "moyenne" | "grande" | "geant";

export interface Point {
  x: number;
  y: number;
}

export interface SnakeSettings {
  difficulty: DifficultyId;
  gridSize: GridSizeId;
  wrap: boolean;
  showGrid: boolean;
  sound: boolean;
}

export interface GameData {
  cols: number;
  rows: number;
  snake: Point[];
  dir: Direction;
  queue: Direction[];
  food: Point;
  obstacles: Point[];
  eaten: number;
  tickMs: number;
  points: number;
  wrap: boolean;
  grid: boolean;
}

export interface DifficultyPreset {
  id: DifficultyId;
  label: string;
  description: string;
  /** Milliseconds between two moves when the game starts. */
  baseTick: number;
  /** Fastest the snake is allowed to become. */
  minTick: number;
  /** Milliseconds removed from the tick for every fruit eaten. */
  acceleration: number;
  /** Whether the snake teleports through the walls. */
  wrap: boolean;
  /** Obstacle count on the reference 24×24 board; scaled by the board area. */
  obstacles: number;
  /** Score gained per fruit. */
  points: number;
}

export interface GridSizeOption {
  id: GridSizeId;
  label: string;
  cells: number;
}

/** Logical pixels per board cell. The canvas is upscaled with `image-rendering: pixelated`. */
export const CELL_SIZE = 10;

/** Board size the difficulty obstacle counts are expressed for. */
export const REFERENCE_CELLS = 24;

export const DIRECTIONS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export const DIFFICULTIES: DifficultyPreset[] = [
  {
    id: "facile",
    label: "FACILE",
    description: "Lent, murs traversables, aucun obstacle.",
    baseTick: 200,
    minTick: 150,
    acceleration: 2,
    wrap: true,
    obstacles: 0,
    points: 5,
  },
  {
    id: "normal",
    label: "NORMAL",
    description: "Rythme moyen, murs mortels.",
    baseTick: 140,
    minTick: 90,
    acceleration: 3,
    wrap: false,
    obstacles: 0,
    points: 10,
  },
  {
    id: "difficile",
    label: "DIFFICILE",
    description: "Rapide, murs mortels et blocs piégés.",
    baseTick: 100,
    minTick: 60,
    acceleration: 4,
    wrap: false,
    obstacles: 10,
    points: 20,
  },
];

export const GRID_SIZES: GridSizeOption[] = [
  { id: "petite", label: "PETITE — 16 × 16", cells: 16 },
  { id: "moyenne", label: "MOYENNE — 24 × 24", cells: 24 },
  { id: "grande", label: "GRANDE — 32 × 32", cells: 32 },
  { id: "geant", label: "GÉANTE — 40 × 40", cells: 40 },
];

export const DEFAULT_SETTINGS: SnakeSettings = {
  difficulty: "normal",
  gridSize: "moyenne",
  wrap: false,
  showGrid: true,
  sound: true,
};

export const HIGH_SCORE_STORAGE_KEY = "pixora.snake.highscores";

export function difficultyById(id: DifficultyId): DifficultyPreset {
  return DIFFICULTIES.find((preset) => preset.id === id) ?? DIFFICULTIES[1];
}

export function gridSizeById(id: GridSizeId): GridSizeOption {
  return GRID_SIZES.find((option) => option.id === id) ?? GRID_SIZES[1];
}

export function cellKey(point: Point): string {
  return `${point.x},${point.y}`;
}

/** Pick a random cell that is not already taken by the snake or a block. */
export function randomFreeCell(
  cols: number,
  rows: number,
  occupied: Point[],
  rng: () => number = Math.random
): Point | null {
  const taken = new Set(occupied.map(cellKey));
  const free: Point[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (!taken.has(`${x},${y}`)) free.push({ x, y });
    }
  }

  if (free.length === 0) return null;
  return free[Math.floor(rng() * free.length)];
}

/**
 * Scatter isolated blocks around the board. The centre band is left clear so
 * the snake never starts on top of an obstacle, and blocks never touch each
 * other so they can not wall off an area of the board.
 */
export function buildObstacles(
  cols: number,
  rows: number,
  count: number,
  reserved: Point[],
  rng: () => number = Math.random
): Point[] {
  const blocked = new Set(reserved.map(cellKey));
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  const candidates: Point[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (Math.abs(x - centerX) <= 3 && Math.abs(y - centerY) <= 2) continue;
      candidates.push({ x, y });
    }
  }

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const result: Point[] = [];

  for (const candidate of candidates) {
    if (result.length >= count) break;
    if (blocked.has(cellKey(candidate))) continue;

    const touchesNeighbour = [
      { x: candidate.x + 1, y: candidate.y },
      { x: candidate.x - 1, y: candidate.y },
      { x: candidate.x, y: candidate.y + 1 },
      { x: candidate.x, y: candidate.y - 1 },
    ].some((neighbour) => blocked.has(cellKey(neighbour)));

    if (touchesNeighbour) continue;

    result.push(candidate);
    blocked.add(cellKey(candidate));
  }

  return result;
}

export function speedAfterEat(preset: DifficultyPreset, eaten: number): number {
  return Math.max(preset.minTick, preset.baseTick - eaten * preset.acceleration);
}

/**
 * Build a fresh, playable board from the current settings. Pass a deterministic
 * `rng` to build a stable board, which is required for the initial render
 * during prerendering.
 */
export function createGame(
  settings: SnakeSettings,
  rng: () => number = Math.random
): GameData {
  const { cells } = gridSizeById(settings.gridSize);
  const preset = difficultyById(settings.difficulty);
  const center = Math.floor(cells / 2);

  const snake: Point[] = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  const obstacles =
    preset.obstacles > 0
      ? buildObstacles(
          cells,
          cells,
          Math.round(
            (preset.obstacles * cells * cells) / (REFERENCE_CELLS * REFERENCE_CELLS)
          ),
          snake,
          rng
        )
      : [];

  const food =
    randomFreeCell(cells, cells, [...snake, ...obstacles], rng) ?? {
      x: 0,
      y: 0,
    };

  return {
    cols: cells,
    rows: cells,
    snake,
    dir: "right",
    queue: [],
    food,
    obstacles,
    eaten: 0,
    tickMs: preset.baseTick,
    points: preset.points,
    wrap: settings.wrap,
    grid: settings.showGrid,
  };
}
