import type { Metadata } from "next";

import { TestShowcase } from "./showcase";

export const metadata: Metadata = {
  title: "Pixora Arcade — Composants 8bitcn",
  description:
    "Page de test des composants 8bitcn : boutons, cartes, jauges, formulaires, onglets et tableaux en pixels.",
};

export default function TestPage() {
  return <TestShowcase />;
}
