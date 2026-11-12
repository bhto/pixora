"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ArrowLeft,
  Crown,
  Gamepad2,
  Keyboard,
  LayoutGrid,
  RotateCcw,
  Skull,
  Smartphone,
  Trophy,
  Volume2,
} from "lucide-react";

import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/8bit/card";
import { Label } from "@/components/ui/8bit/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/8bit/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select";
import { Separator } from "@/components/ui/8bit/separator";
import { Switch } from "@/components/ui/8bit/switch";

import { DirectionPad } from "./d-pad";
import {
  CELL_SIZE,
  DEFAULT_SETTINGS,
  DIFFICULTIES,
  DIRECTIONS,
  GRID_SIZES,
  OPPOSITE,
  createGame,
  difficultyById,
  gridSizeById,
  randomFreeCell,
  speedAfterEat,
  type DifficultyId,
  type Direction,
  type GameData,
  type GridSizeId,
  type SnakeSettings,
} from "./game-config";
import {
  getHighScoresServerSnapshot,
  getHighScoresSnapshot,
  highScoreKey,
  recordHighScore,
  subscribeHighScores,
} from "./high-scores";
import { renderBoard } from "./render-board";
import { useRetroSound } from "./use-retro-sound";

type Status = "idle" | "running" | "paused" | "over";

const SWIPE_THRESHOLD = 24;

/**
 * Deterministic RNG used only for the initial board. The real, randomized
 * board is built on the client by the mount effect below, which keeps
 * `Math.random()` out of the prerender pass.
 */
const NO_RANDOM = () => 0;

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<GameData | null>(null);

  if (gameRef.current === null) {
    gameRef.current = createGame(DEFAULT_SETTINGS, NO_RANDOM);
  }
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const scoreRef = useRef(0);
  const statusRef = useRef<Status>("idle");
  const difficultyRef = useRef<DifficultyId>(DEFAULT_SETTINGS.difficulty);
  const gridSizeRef = useRef<GridSizeId>(DEFAULT_SETTINGS.gridSize);

  const [settings, setSettings] = useState<SnakeSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [tickMs, setTickMs] = useState(
    difficultyById(DEFAULT_SETTINGS.difficulty).baseTick
  );
  const [won, setWon] = useState(false);

  const highScores = useSyncExternalStore(
    subscribeHighScores,
    getHighScoresSnapshot,
    getHighScoresServerSnapshot
  );

  const playSound = useRetroSound(settings.sound);

  const activePreset = difficultyById(settings.difficulty);
  const activeGrid = gridSizeById(settings.gridSize);
  const bestKey = highScoreKey(settings.difficulty, settings.gridSize);
  const best = Math.max(highScores[bestKey] ?? 0, score);
  const locked = status === "running" || status === "paused";

  /* ---------------------------------------------------------------- refs */

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    difficultyRef.current = settings.difficulty;
  }, [settings.difficulty]);

  useEffect(() => {
    gridSizeRef.current = settings.gridSize;
  }, [settings.gridSize]);

  /* -------------------------------------------------------------- canvas */

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const game = gameRef.current;
    if (!game) return;

    const width = game.cols * CELL_SIZE;
    const height = game.rows * CELL_SIZE;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Resizing the canvas resets its state, so this must run afterwards.
    context.imageSmoothingEnabled = false;
    renderBoard(context, game, CELL_SIZE);
  }, []);

  // Rebuild the preview board whenever the settings change outside of a game.
  useEffect(() => {
    const current = statusRef.current;
    if (current === "running" || current === "paused") return;

    gameRef.current = createGame(settings);

    if (current === "over") {
      scoreRef.current = 0;
      setScore(0);
      setWon(false);
      setStatus("idle");
    }

    render();
  }, [settings, render]);

  /* --------------------------------------------------------- game cycle */

  const endGame = useCallback(() => {
    setStatus("over");
    playSound("over");
    recordHighScore(difficultyRef.current, gridSizeRef.current, scoreRef.current);
  }, [playSound]);

  const step = useCallback(() => {
    const game = gameRef.current;
    if (!game) return;

    const queued = game.queue.shift();
    if (queued) game.dir = queued;

    const head = game.snake[0];
    const delta = DIRECTIONS[game.dir];
    let nextX = head.x + delta.x;
    let nextY = head.y + delta.y;

    if (game.wrap) {
      nextX = (nextX + game.cols) % game.cols;
      nextY = (nextY + game.rows) % game.rows;
    } else if (
      nextX < 0 ||
      nextY < 0 ||
      nextX >= game.cols ||
      nextY >= game.rows
    ) {
      endGame();
      return;
    }

    const eating = nextX === game.food.x && nextY === game.food.y;
    const body = eating ? game.snake : game.snake.slice(0, -1);
    const hitsSelf = body.some(
      (segment) => segment.x === nextX && segment.y === nextY
    );
    const hitsObstacle = game.obstacles.some(
      (block) => block.x === nextX && block.y === nextY
    );

    if (hitsSelf || hitsObstacle) {
      endGame();
      return;
    }

    game.snake.unshift({ x: nextX, y: nextY });

    if (!eating) {
      game.snake.pop();
      render();
      return;
    }

    game.eaten += 1;
    scoreRef.current += game.points;
    setScore(scoreRef.current);
    playSound("eat");

    const nextFood = randomFreeCell(game.cols, game.rows, [
      ...game.snake,
      ...game.obstacles,
    ]);

    if (!nextFood) {
      setWon(true);
      render();
      endGame();
      return;
    }

    game.food = nextFood;

    const nextTick = speedAfterEat(activePreset, game.eaten);
    if (nextTick !== game.tickMs) {
      game.tickMs = nextTick;
      setTickMs(nextTick);
    }

    render();
  }, [activePreset, endGame, playSound, render]);

  useEffect(() => {
    if (status !== "running") return;

    const id = window.setInterval(step, tickMs);
    return () => window.clearInterval(id);
  }, [status, tickMs, step]);

  /* ----------------------------------------------------------- controls */

  const startGame = useCallback(
    (initialDirection?: Direction) => {
      const game = createGame(settings);

      if (initialDirection && initialDirection !== OPPOSITE[game.dir]) {
        const delta = DIRECTIONS[initialDirection];
        const head = game.snake[0];

        game.dir = initialDirection;
        game.snake = [0, 1, 2].map((offset) => ({
          x: (head.x - delta.x * offset + game.cols) % game.cols,
          y: (head.y - delta.y * offset + game.rows) % game.rows,
        }));

        const foodUnderSnake = game.snake.some(
          (segment) => segment.x === game.food.x && segment.y === game.food.y
        );
        if (foodUnderSnake) {
          game.food =
            randomFreeCell(game.cols, game.rows, [
              ...game.snake,
              ...game.obstacles,
            ]) ?? game.food;
        }
      }

      gameRef.current = game;
      scoreRef.current = 0;
      setScore(0);
      setWon(false);
      setTickMs(game.tickMs);
      setStatus("running");
      playSound("start");
      render();
    },
    [playSound, render, settings]
  );

  const handleDirection = useCallback(
    (direction: Direction) => {
      const current = statusRef.current;

      if (current === "idle" || current === "over") {
        startGame(direction);
        return;
      }

      if (current !== "running") return;

      const game = gameRef.current;
      if (!game) return;

      const last =
        game.queue.length > 0 ? game.queue[game.queue.length - 1] : game.dir;

      if (direction === last || direction === OPPOSITE[last]) return;
      if (game.queue.length >= 2) return;

      game.queue.push(direction);
    },
    [startGame]
  );

  const togglePause = useCallback(() => {
    setStatus((current) => {
      if (current === "running") return "paused";
      if (current === "paused") return "running";
      return current;
    });
  }, []);

  const handleAction = useCallback(() => {
    const current = statusRef.current;

    if (current === "running") {
      togglePause();
      return;
    }

    if (current === "paused") {
      setStatus("running");
      return;
    }

    startGame();
  }, [startGame, togglePause]);

  // Keyboard controls: arrows / WASD to steer, space to start or pause.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName)
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          event.preventDefault();
          handleDirection("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault();
          handleDirection("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          handleDirection("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          handleDirection("right");
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          handleAction();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleAction, handleDirection]);

  // Pause automatically when the tab is hidden so the snake does not die off-screen.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        setStatus((current) => (current === "running" ? "paused" : current));
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    swipeRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.hypot(deltaX, deltaY) < SWIPE_THRESHOLD) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      handleDirection(deltaX > 0 ? "right" : "left");
    } else {
      handleDirection(deltaY > 0 ? "down" : "up");
    }
  };

  /* ----------------------------------------------------------- settings */

  const updateDifficulty = (difficulty: DifficultyId) => {
    setSettings((current) => ({
      ...current,
      difficulty,
      wrap: difficultyById(difficulty).wrap,
    }));
  };

  const updateOption = (key: "wrap" | "showGrid" | "sound", value: boolean) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  /* ------------------------------------------------------------ overlay */

  const overlay = (() => {
    if (status === "running") return null;

    if (status === "paused") {
      return {
        eyebrow: "PAUSE",
        title: "PARTIE EN PAUSE",
        subtitle: "Le serpent reprend son souffle.",
        action: "REPRENDRE",
      };
    }

    if (status === "over") {
      return {
        eyebrow: won ? "PARFAIT" : "GAME OVER",
        title: won ? "PLATEAU REMPLI !" : "VOUS AVEZ PERDU",
        subtitle: `Score ${score} — Record ${best}`,
        action: "REJOUER",
      };
    }

    return {
      eyebrow: "PRÊT ?",
      title: "SNAKE",
      subtitle: "Flèches, WASD ou boutons directionnels.",
      action: "DÉMARRER",
    };
  })();

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:py-6">
        <header className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:text-left">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Badge>JEU</Badge>
              <Badge variant="secondary">SNAKE</Badge>
              <Badge variant="outline">8BITCN</Badge>
            </div>
            <h1 className="retro text-xl leading-relaxed sm:text-2xl">
              SNAKE 8-BIT
            </h1>
            <p className="max-w-xl font-sans text-sm text-muted-foreground">
              Avalez les fruits, allongez le serpent et évitez votre propre queue.
              Choisissez la difficulté et jouez au clavier ou aux boutons
              directionnels sur mobile.
            </p>
          </div>
          <Button asChild variant="secondary" size="sm" className="lg:shrink-0">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" />
              Retour à l’accueil
            </Link>
          </Button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          {/* --------------------------------------------------- game area */}
          <Card>
            <CardContent className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">SCORE {score}</Badge>
                  <Badge variant="outline">RECORD {best}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{activePreset.label}</Badge>
                  <Badge variant="secondary">
                    {activeGrid.cells} × {activeGrid.cells}
                  </Badge>
                </div>
              </div>

              <div
                className={`relative mx-auto aspect-square w-full bg-[#0b1020] lg:max-w-[min(100%,calc(100dvh_-_19rem))] ${
                  status === "running" || status === "idle" ? "touch-none" : ""
                }`}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-1.5 z-10 border-6 border-foreground dark:border-ring"
                />
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label={`Plateau de snake ${activeGrid.cells} par ${activeGrid.cells}`}
                  className="pixelated block h-full w-full"
                />

                {overlay && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#0b1020]/90 p-4 text-center">
                    <p className="retro text-[0.6rem] text-emerald-300">
                      {overlay.eyebrow}
                    </p>
                    <h2 className="retro text-xs text-white sm:text-sm">
                      {overlay.title}
                    </h2>
                    <p className="font-sans text-xs text-slate-300">
                      {overlay.subtitle}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                        onClick={handleAction}
                      >
                        {overlay.action}
                      </Button>
                      {status === "paused" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => startGame()}
                        >
                          <RotateCcw data-icon="inline-start" />
                          RECOMMENCER
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ------------------------------------------------------ options */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:max-h-[calc(100dvh_-_12rem)] lg:overflow-y-auto lg:px-1.5">
            <DirectionPad
              onDirection={handleDirection}
              onCenter={handleAction}
              centerLabel={
                status === "running"
                  ? "Mettre en pause"
                  : status === "paused"
                    ? "Reprendre"
                    : "Démarrer la partie"
              }
              centerIcon={status === "running" ? "pause" : "play"}
            />

            <p className="text-center font-sans text-xs text-muted-foreground">
              Glissez sur le plateau ou utilisez les boutons pour tourner.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Difficulté</CardTitle>
                <CardDescription font="normal" className="text-xs">
                  {locked
                    ? "Mettez la partie en pause pour changer de réglage."
                    : "Appliquée au lancement d’une nouvelle partie."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={settings.difficulty}
                  onValueChange={(value) =>
                    updateDifficulty(value as DifficultyId)
                  }
                  disabled={locked}
                  className="gap-4"
                >
                  {DIFFICULTIES.map((preset) => (
                    <div key={preset.id} className="flex items-start gap-3">
                      <RadioGroupItem
                        value={preset.id}
                        id={`difficulty-${preset.id}`}
                        className="mt-0.5"
                      />
                      <div className="flex flex-col gap-1">
                        <Label
                          htmlFor={`difficulty-${preset.id}`}
                          className="text-xs"
                        >
                          {preset.label}
                        </Label>
                        <span className="font-sans text-xs text-muted-foreground">
                          {preset.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Options</CardTitle>
                <CardDescription font="normal" className="text-xs">
                  Taille du plateau et aides visuelles.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="grid-size"
                    className="flex items-center gap-2 text-xs"
                  >
                    <LayoutGrid className="size-4" />
                    Taille de la grille
                  </Label>
                  <Select
                    value={settings.gridSize}
                    onValueChange={(value) =>
                      setSettings((current) => ({
                        ...current,
                        gridSize: value as GridSizeId,
                      }))
                    }
                    disabled={locked}
                  >
                    <SelectTrigger id="grid-size" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRID_SIZES.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="wrap" className="text-xs">
                    Murs traversables
                  </Label>
                  <Switch
                    id="wrap"
                    checked={settings.wrap}
                    onCheckedChange={(checked) => updateOption("wrap", checked)}
                    disabled={locked}
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label
                    htmlFor="show-grid"
                    className="flex items-center gap-2 text-xs"
                  >
                    <Gamepad2 className="size-4" />
                    Afficher la grille
                  </Label>
                  <Switch
                    id="show-grid"
                    checked={settings.showGrid}
                    onCheckedChange={(checked) =>
                      updateOption("showGrid", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label
                    htmlFor="sound"
                    className="flex items-center gap-2 text-xs"
                  >
                    <Volume2 className="size-4" />
                    Sons rétro
                  </Label>
                  <Switch
                    id="sound"
                    checked={settings.sound}
                    onCheckedChange={(checked) => updateOption("sound", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Records</CardTitle>
                <CardDescription font="normal" className="text-xs">
                  Meilleurs scores en {activeGrid.cells} × {activeGrid.cells},
                  par difficulté.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {DIFFICULTIES.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="flex items-center gap-2 text-xs">
                      {preset.id === "difficile" ? (
                        <Skull className="size-4" />
                      ) : preset.id === "normal" ? (
                        <Trophy className="size-4" />
                      ) : (
                        <Crown className="size-4" />
                      )}
                      {preset.label}
                    </span>
                    <span className="retro text-xs">
                      {highScores[highScoreKey(preset.id, settings.gridSize)] ??
                        0}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contrôles</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 font-sans text-xs text-muted-foreground">
                <span className="flex items-start gap-2">
                  <Keyboard className="mt-0.5 size-4 shrink-0" />
                  Flèches ou WASD pour tourner, Espace pour démarrer ou mettre
                  en pause.
                </span>
                <span className="flex items-start gap-2">
                  <Smartphone className="mt-0.5 size-4 shrink-0" />
                  Boutons directionnels ou glissement du doigt sur le plateau.
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
