"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pause,
  Play,
} from "lucide-react";

import { Button } from "@/components/ui/8bit/button";
import { cn } from "@/lib/utils";

import type { Direction } from "./game-config";

interface DirectionPadProps {
  onDirection: (direction: Direction) => void;
  onCenter: () => void;
  centerLabel: string;
  centerIcon: "play" | "pause";
  className?: string;
}

const PAD_BUTTON = "size-16 touch-none sm:size-14";

export function DirectionPad({
  onDirection,
  onCenter,
  centerLabel,
  centerIcon,
  className,
}: DirectionPadProps) {
  const press = (direction: Direction) => (event: React.PointerEvent) => {
    event.preventDefault();
    onDirection(direction);
  };

  return (
    <div
      role="group"
      aria-label="Contrôles directionnels"
      className={cn(
        "mx-auto grid w-fit grid-cols-3 grid-rows-3 gap-1.5 select-none",
        className
      )}
    >
      <span aria-hidden="true" />
      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label="Haut"
        className={PAD_BUTTON}
        onPointerDown={press("up")}
      >
        <ChevronUp />
      </Button>
      <span aria-hidden="true" />

      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label="Gauche"
        className={PAD_BUTTON}
        onPointerDown={press("left")}
      >
        <ChevronLeft />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="default"
        aria-label={centerLabel}
        className={PAD_BUTTON}
        onPointerDown={(event) => {
          event.preventDefault();
          onCenter();
        }}
      >
        {centerIcon === "pause" ? <Pause /> : <Play />}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label="Droite"
        className={PAD_BUTTON}
        onPointerDown={press("right")}
      >
        <ChevronRight />
      </Button>

      <span aria-hidden="true" />
      <Button
        type="button"
        size="icon"
        variant="secondary"
        aria-label="Bas"
        className={PAD_BUTTON}
        onPointerDown={press("down")}
      >
        <ChevronDown />
      </Button>
      <span aria-hidden="true" />
    </div>
  );
}
