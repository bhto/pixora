import type { GameData } from "./game-config";

const BOARD_BG = "#0b1020";
const GRID_LINE = "rgba(148, 163, 184, 0.10)";
const SNAKE_HEAD = "#bbf7d0";
const SNAKE_BODY = "#22c55e";
const SNAKE_BODY_ALT = "#16a34a";
const SNAKE_EYE = "#052e16";
const FOOD = "#ef4444";
const FOOD_SHINE = "#fecaca";
const FOOD_STEM = "#22c55e";
const OBSTACLE = "#475569";
const OBSTACLE_TOP = "#64748b";

function drawGrid(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  cell: number
) {
  const width = cols * cell;
  const height = rows * cell;

  ctx.fillStyle = GRID_LINE;
  for (let x = 1; x < cols; x += 1) ctx.fillRect(x * cell, 0, 1, height);
  for (let y = 1; y < rows; y += 1) ctx.fillRect(0, y * cell, width, 1);
}

function drawObstacles(ctx: CanvasRenderingContext2D, game: GameData, cell: number) {
  for (const obstacle of game.obstacles) {
    ctx.fillStyle = OBSTACLE;
    ctx.fillRect(obstacle.x * cell + 1, obstacle.y * cell + 1, cell - 2, cell - 2);
    ctx.fillStyle = OBSTACLE_TOP;
    ctx.fillRect(obstacle.x * cell + 1, obstacle.y * cell + 1, cell - 2, 2);
  }
}

function drawFood(ctx: CanvasRenderingContext2D, game: GameData, cell: number) {
  const { x, y } = game.food;

  ctx.fillStyle = FOOD;
  ctx.fillRect(x * cell + 1, y * cell + 1, cell - 2, cell - 2);
  ctx.fillStyle = FOOD_SHINE;
  ctx.fillRect(x * cell + 2, y * cell + 2, 2, 2);
  ctx.fillStyle = FOOD_STEM;
  ctx.fillRect(x * cell + cell - 4, y * cell + 1, 2, 2);
}

function drawSnake(ctx: CanvasRenderingContext2D, game: GameData, cell: number) {
  for (let index = game.snake.length - 1; index >= 0; index -= 1) {
    const segment = game.snake[index];
    const isHead = index === 0;

    ctx.fillStyle = isHead
      ? SNAKE_HEAD
      : index % 2 === 0
        ? SNAKE_BODY
        : SNAKE_BODY_ALT;

    ctx.fillRect(segment.x * cell + 1, segment.y * cell + 1, cell - 2, cell - 2);
  }

  const head = game.snake[0];
  if (!head) return;

  const hx = head.x * cell;
  const hy = head.y * cell;
  const eye = 2;

  ctx.fillStyle = SNAKE_EYE;

  if (game.dir === "left" || game.dir === "right") {
    const ex = game.dir === "right" ? hx + cell - 5 : hx + 3;
    ctx.fillRect(ex, hy + 2, eye, eye);
    ctx.fillRect(ex, hy + cell - 4, eye, eye);
  } else {
    const ey = game.dir === "down" ? hy + cell - 5 : hy + 3;
    ctx.fillRect(hx + 2, ey, eye, eye);
    ctx.fillRect(hx + cell - 4, ey, eye, eye);
  }
}

/** Paint one full frame of the board onto the canvas. */
export function renderBoard(
  ctx: CanvasRenderingContext2D,
  game: GameData,
  cell: number
) {
  const width = game.cols * cell;
  const height = game.rows * cell;

  ctx.fillStyle = BOARD_BG;
  ctx.fillRect(0, 0, width, height);

  if (game.grid) drawGrid(ctx, game.cols, game.rows, cell);

  drawObstacles(ctx, game, cell);
  drawFood(ctx, game, cell);
  drawSnake(ctx, game, cell);
}
