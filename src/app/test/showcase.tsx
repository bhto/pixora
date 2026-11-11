"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Crown,
  Gamepad2,
  Heart,
  HeartCrack,
  Info,
  Shield,
  Skull,
  Sparkles,
  Star,
  Swords,
  TriangleAlert,
  Trophy,
  Zap,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/8bit/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/8bit/alert";
import { Avatar, AvatarFallback } from "@/components/ui/8bit/avatar";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/8bit/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/8bit/card";
import { Checkbox } from "@/components/ui/8bit/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/8bit/dialog";
import { Input } from "@/components/ui/8bit/input";
import { Label } from "@/components/ui/8bit/label";
import { Textarea } from "@/components/ui/8bit/textarea";
import { Progress } from "@/components/ui/8bit/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/8bit/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/8bit/select";
import { Separator } from "@/components/ui/8bit/separator";
import { Skeleton } from "@/components/ui/8bit/skeleton";
import { Spinner } from "@/components/ui/8bit/spinner";
import { Switch } from "@/components/ui/8bit/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/8bit/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/8bit/tooltip";
import HealthBar from "@/components/ui/8bit/health-bar";
import ManaBar from "@/components/ui/8bit/mana-bar";
import XpBar from "@/components/ui/8bit/xp-bar";

function BarLabel({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="retro text-[0.625rem] tracking-widest uppercase">{label}</span>
      <span className="retro text-[0.625rem]">{value}</span>
    </div>
  );
}

export function TestShowcase() {
  const [hp, setHp] = useState(78);
  const [mana, setMana] = useState(45);
  const [xp, setXp] = useState(60);

  const [heroName, setHeroName] = useState("");
  const [heroClass, setHeroClass] = useState("guerrier");
  const [difficulty, setDifficulty] = useState("normal");
  const [hardcore, setHardcore] = useState(false);
  const [sound, setSound] = useState(true);

  const classLabels: Record<string, string> = {
    guerrier: "Guerrier",
    mage: "Mage",
    voleur: "Voleur",
  };

  return (
    <div className="flex flex-1 flex-col bg-background">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
        {/* En-tête */}
        <header className="flex flex-col items-center gap-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge>TEST</Badge>
            <Badge variant="secondary">8BITCN</Badge>
            <Badge variant="outline">V 0.1</Badge>
          </div>
          <h1 className="retro text-2xl leading-relaxed sm:text-3xl">PIXORA ARCADE</h1>
          <p className="max-w-xl font-sans text-sm text-muted-foreground">
            Page de démonstration des composants <code className="font-mono">8bitcn</code> —
            boutons, cartes, formulaires, jauges, dialogues et tableaux, le tout en pixels.
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" />
              Retour à l’accueil
            </Link>
          </Button>
        </header>

        {/* Boutons + Badges & alertes */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Boutons</CardTitle>
              <CardDescription font="normal" className="text-sm">
                Variantes, tailles et groupes de boutons.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <Button>Attaquer</Button>
                <Button variant="secondary">Défendre</Button>
                <Button variant="outline">Objet</Button>
                <Button variant="ghost">Fuir</Button>
                <Button variant="link">Aide</Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg">
                  <Swords data-icon="inline-start" />
                  Grand
                </Button>
                <Button size="sm">Petit</Button>
                <Button size="icon" aria-label="Carte du donjon">
                  <Gamepad2 />
                </Button>
              </div>
              <ButtonGroup>
                <Button size="sm">Attaquer</Button>
                <ButtonGroupSeparator />
                <Button size="sm" variant="secondary">
                  Défendre
                </Button>
                <ButtonGroupSeparator />
                <Button size="sm" variant="secondary">
                  Magie
                </Button>
              </ButtonGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges & alertes</CardTitle>
              <CardDescription font="normal" className="text-sm">
                États et messages d’interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                <Badge>GUERRIER</Badge>
                <Badge variant="secondary">MAGE</Badge>
                <Badge variant="outline">VOLEUR</Badge>
                <Badge variant="destructive">
                  <Skull className="size-3" />
                  BOSS
                </Badge>
              </div>
              <Alert>
                <Info />
                <AlertTitle>Nouvelle quête disponible</AlertTitle>
                <AlertDescription className="font-sans text-sm">
                  Le maire du village cherche un héros pour nettoyer la cave aux slimes.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <TriangleAlert />
                <AlertTitle>Points de vie critiques</AlertTitle>
                <AlertDescription className="font-sans text-sm">
                  Buvez une potion avant le prochain combat !
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Jauges */}
        <Card>
          <CardHeader>
            <CardTitle>Jauges</CardTitle>
            <CardDescription font="normal" className="text-sm">
              Points de vie, mana et expérience — cliquez sur les boutons pour interagir.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <BarLabel label="HP" value={`${hp} / 100`} />
              <HealthBar value={hp} variant="retro" aria-label="Points de vie" />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => setHp((v) => Math.max(0, v - 13))}>
                  <HeartCrack data-icon="inline-start" />
                  Dégâts
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setHp((v) => Math.min(100, v + 15))}>
                  <Heart data-icon="inline-start" />
                  Potion
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <BarLabel label="MP" value={`${mana} / 100`} />
              <ManaBar value={mana} variant="retro" aria-label="Points de mana" />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={() => setMana((v) => Math.max(0, v - 25))}>
                  <Zap data-icon="inline-start" />
                  Sort
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setMana((v) => Math.min(100, v + 40))}>
                  <Sparkles data-icon="inline-start" />
                  Méditer
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <BarLabel label="XP" value={`${xp} / 100`} />
              <XpBar value={xp} variant="retro" levelUpMessage="NIVEAU SUP !" aria-label="Expérience" />
              <Button size="sm" onClick={() => setXp((v) => Math.min(100, v + 25))}>
                <Star data-icon="inline-start" />
                Terminer une quête (+25 XP)
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <BarLabel label="DONJON" value="62 %" />
              <Progress value={62} variant="retro" progressBg="bg-emerald-500" aria-label="Chargement du donjon" />
            </div>
          </CardContent>
        </Card>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Création de personnage</CardTitle>
            <CardDescription font="normal" className="text-sm">
              Formulaire complet : champ texte, zone de texte, sélection, boutons radio, cases et interrupteur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-6 sm:grid-cols-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="hero-name" font="normal" className="text-xs uppercase tracking-widest">
                  Nom du héros
                </Label>
                <Input
                  id="hero-name"
                  value={heroName}
                  onChange={(event) => setHeroName(event.target.value)}
                  placeholder="Ex. : Pixel Knight"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label font="normal" className="text-xs uppercase tracking-widest" htmlFor="hero-class">
                  Classe
                </Label>
                <Select value={heroClass} onValueChange={setHeroClass}>
                  <SelectTrigger id="hero-class" className="w-full">
                    <SelectValue placeholder="Choisir une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guerrier">Guerrier</SelectItem>
                    <SelectItem value="mage">Mage</SelectItem>
                    <SelectItem value="voleur">Voleur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="hero-bio" font="normal" className="text-xs uppercase tracking-widest">
                  Histoire
                </Label>
                <Textarea
                  id="hero-bio"
                  placeholder="Il était une fois, dans un monde de 256 pixels…"
                  rows={3}
                />
              </div>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-1 font-sans text-xs tracking-widest uppercase text-foreground">
                  Difficulté
                </legend>
                <RadioGroup value={difficulty} onValueChange={setDifficulty} className="gap-3">
                  {(["facile", "normal", "hardcore"] as const).map((level) => (
                    <div key={level} className="flex items-center gap-2">
                      <RadioGroupItem value={level} id={`difficulty-${level}`} />
                      <Label htmlFor={`difficulty-${level}`} font="normal" className="text-sm capitalize">
                        {level}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </fieldset>

              <div className="flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="hardcore"
                    checked={hardcore}
                    onCheckedChange={(checked) => setHardcore(checked === true)}
                  />
                  <Label htmlFor="hardcore" font="normal" className="text-sm">
                    Mode hardcore (une seule vie)
                  </Label>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="sound" font="normal" className="text-sm">
                    Effets sonores rétro
                  </Label>
                  <Switch id="sound" checked={sound} onCheckedChange={setSound} />
                </div>
              </div>

              <div className="sm:col-span-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button type="submit">Créer le personnage</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Personnage créé !</DialogTitle>
                      <DialogDescription className="font-sans text-sm">
                        Récapitulatif de votre héros avant de plonger dans le donjon.
                      </DialogDescription>
                    </DialogHeader>
                    <dl className="flex flex-col gap-2 font-sans text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Nom</dt>
                        <dd className="font-medium">{heroName.trim() || "Sans nom"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Classe</dt>
                        <dd className="font-medium">{classLabels[heroClass]}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Difficulté</dt>
                        <dd className="font-medium capitalize">{difficulty}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Mode hardcore</dt>
                        <dd className="font-medium">{hardcore ? "Activé" : "Désactivé"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-muted-foreground">Sons rétro</dt>
                        <dd className="font-medium">{sound ? "Activés" : "Désactivés"}</dd>
                      </div>
                    </dl>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">C’est parti !</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Interface de jeu + classement */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Interface de jeu</CardTitle>
              <CardDescription font="normal" className="text-sm">
                Onglets et fenêtre de pause.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <Tabs defaultValue="perso">
                <TabsList className="w-full">
                  <TabsTrigger value="perso" className="flex-1">
                    Perso
                  </TabsTrigger>
                  <TabsTrigger value="sac" className="flex-1">
                    Sac
                  </TabsTrigger>
                  <TabsTrigger value="quetes" className="flex-1">
                    Quêtes
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="perso" className="flex flex-col gap-2 font-sans text-sm">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="size-4" />
                    Épée rouillée (+3 ATQ)
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="size-4" />
                    Bouclier en bois (+2 DEF)
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="size-4" />
                    Amulette de chance (+1 CHANCE)
                  </div>
                </TabsContent>
                <TabsContent value="sac" className="flex flex-col gap-2 font-sans text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="size-4" />
                    Potion ×3
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="size-4" />
                    Clé du donjon ×1
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="size-4" />
                    Slime gelée ×12
                  </div>
                </TabsContent>
                <TabsContent value="quetes" className="flex flex-col gap-2 font-sans text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span>Nettoyer la cave aux slimes</span>
                    <Badge variant="secondary">EN COURS</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Trouver l’épée légendaire</span>
                    <Badge>TERMINÉE</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span>Vaincre le dragon</span>
                    <Badge variant="destructive">BOSS</Badge>
                  </div>
                </TabsContent>
              </Tabs>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">
                    <Gamepad2 data-icon="inline-start" />
                    Mettre en pause
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Partie en pause</DialogTitle>
                    <DialogDescription className="font-sans text-sm">
                      Le monde des pixels attend votre retour.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3">
                    <Button>Reprendre</Button>
                    <Button variant="secondary">Réglages</Button>
                    <Button variant="outline">Menu principal</Button>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="ghost">Fermer</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Classement</CardTitle>
              <CardDescription font="normal" className="text-sm">
                Tableau des meilleurs héros du donjon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">Rang</TableHead>
                    <TableHead>Joueur</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-center">
                      <Crown className="mx-auto size-4" />
                    </TableCell>
                    <TableCell>PixelKnight</TableCell>
                    <TableCell className="text-right">999 999</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">2</TableCell>
                    <TableCell>SlimeMaster</TableCell>
                    <TableCell className="text-right">42 000</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">3</TableCell>
                    <TableCell>RetroRider</TableCell>
                    <TableCell className="text-right">12 345</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center">4</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <Shield className="size-4" />
                        Vous ?
                      </span>
                    </TableCell>
                    <TableCell className="text-right">0</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* FAQ + équipe */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
              <CardDescription font="normal" className="text-sm">
                Accordéon des questions fréquentes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="xp">
                  <AccordionTrigger className="text-xs">
                    Comment gagner de l’XP ?
                  </AccordionTrigger>
                  <AccordionContent font="normal" className="text-sm">
                    Terminez des quêtes, explorez le donjon et combattez des monstres.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="mort">
                  <AccordionTrigger className="text-xs">
                    Que se passe-t-il en mode hardcore ?
                  </AccordionTrigger>
                  <AccordionContent font="normal" className="text-sm">
                    Une seule vie : la mort est définitive et le héros repart de zéro.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="sauvegarde">
                  <AccordionTrigger className="text-xs">
                    Où sont mes sauvegardes ?
                  </AccordionTrigger>
                  <AccordionContent font="normal" className="text-sm">
                    Sur une cartouche fictive de 256 Ko, quelque part entre deux pixels.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Équipe</CardTitle>
              <CardDescription font="normal" className="text-sm">
                Avatars avec info-bulles.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <TooltipProvider delayDuration={100}>
                <div className="flex flex-wrap gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Héros" className="cursor-pointer">
                        <Avatar className="size-12">
                          <AvatarFallback className="text-xs">PX</AvatarFallback>
                        </Avatar>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[0.625rem]">Pixel Knight — Guerrier</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Mage" className="cursor-pointer">
                        <Avatar className="size-12">
                          <AvatarFallback className="text-xs">MG</AvatarFallback>
                        </Avatar>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[0.625rem]">Slime Master — Mage</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="Voleuse" className="cursor-pointer">
                        <Avatar className="size-12">
                          <AvatarFallback className="text-xs">RR</AvatarFallback>
                        </Avatar>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="text-[0.625rem]">Retro Rider — Voleuse</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              <div className="flex flex-wrap items-center gap-6 font-sans text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Trophy className="size-4" /> 42 quêtes terminées
                </span>
                <span className="inline-flex items-center gap-2">
                  <Skull className="size-4" /> 7 morts héroïques
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chargement */}
        <Card>
          <CardHeader>
            <CardTitle>Chargement</CardTitle>
            <CardDescription font="normal" className="text-sm">
                Squelettes et indicateurs d’attente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <div className="flex w-full flex-col gap-3">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="flex items-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Spinner />
                <span className="font-sans text-xs text-muted-foreground">Chargement…</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Spinner variant="diamond" />
                <span className="font-sans text-xs text-muted-foreground">Sauvegarde…</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pied de page */}
        <footer className="flex flex-col items-center gap-4 pt-2 text-center">
          <Separator className="max-w-xs" />
          <p className="font-sans text-xs text-muted-foreground">
            Composants 8-bit par <code className="font-mono">8bitcn.com</code> — page de test Pixora.
          </p>
        </footer>
      </div>
    </div>
  );
}
