import type { Metadata } from "next";

import { SnakeGame } from "./snake-game";

export const metadata: Metadata = {
  title: "Snake 8-bit — Pixora Arcade",
  description:
    "Jouez à Snake en pixels : difficulté réglable, options et contrôles directionnels pour mobile.",
};

export default function SnakePage() {
  return <SnakeGame />;
}
