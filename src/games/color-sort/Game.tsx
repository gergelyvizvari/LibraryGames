import { useRef, useState } from "react";
import { useTimeouts } from "../../kit/hooks";
import { makeRng } from "../../kit/random";
import { PaintedScene, worldStyle, type PaintedView } from "../../kit/painted";
import { SceneTool } from "../../kit/scene";
import { useStage } from "../../kit/SceneShell";
import { sound } from "../../kit/sound";
import { Emoji } from "../../kit/stickers";
import type { GameProps } from "../../kit/types";
import owlHappy from "./art/owl-happy.webp";
import owl from "./art/owl.webp";
import workshopTall from "./art/workshop-tall.webp";
import workshop from "./art/workshop.webp";
import {
  PUZZLES,
  canPour,
  isDone,
  isSolved,
  makePuzzle,
  pointsFor,
  pour,
  sizeFor,
  type Tube,
} from "./logic";

type ViewId = "wide" | "tall";

/** The colour workshop; the tubes stand on its bench (and, upright with many tubes, also on the rug in front). */
const VIEWS: PaintedView<ViewId>[] = [
  {
    id: "wide",
    painting: workshop,
    world: { w: 1280, h: 800 },
    focus: { x: 60, y: 250, w: 1160, h: 470 },
    play: { x: 290, y: 400, w: 810, h: 260 },
    ground: "#a25018",
    sayAt: { x: 130, y: 340 },
  },
  {
    id: "tall",
    painting: workshopTall,
    world: { w: 720, h: 1025 },
    focus: { x: 0, y: 260, w: 720, h: 680 },
    ground: "#e48734",
    sayAt: { x: 380, y: 255 },
  },
];

/** Where the tubes stand (each row's floor line and span), the size of one layer of liquid, and the owl. */
const BENCH: Record<
  ViewId,
  {
    rows: { y: number; left: number; right: number }[];
    layer: number;
    perRow: number;
    owl: { x: number; bottom: number; h: number };
  }
> = {
  wide: {
    rows: [{ y: 655, left: 290, right: 1100 }],
    layer: 52,
    perRow: 9,
    owl: { x: 150, bottom: 660, h: 300 },
  },
  tall: {
    rows: [
      { y: 568, left: 20, right: 700 },
      { y: 905, left: 20, right: 560 },
    ],
    layer: 60,
    perRow: 5,
    owl: { x: 630, bottom: 1015, h: 265 },
  },
};

/** Shapes shown on the liquid in the high contrast theme, so colours never have to be told apart by hue alone. */
const SYMBOLS = ["●", "▲", "■", "★", "♥", "◆", "✚"];

export default function ColorSort({ level, seed, t, onFinish }: GameProps) {
  const rng = useRef(makeRng(seed)).current;
  const newPuzzle = (n: number) => {
    const { colors, cap, empty } = sizeFor(level, n);
    return { ...makePuzzle(rng, colors, cap, empty), colors };
  };
  const [puzzle, setPuzzle] = useState(() => newPuzzle(0));
  const [tubes, setTubes] = useState<Tube[]>(puzzle.tubes);
  const [history, setHistory] = useState<Tube[][]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(0);
  const stage = useStage(PUZZLES, onFinish);
  const over = stage.over;
  const [message, setMessage] = useState(t("pickTube"));
  const [wobble, setWobble] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [cheer, setCheer] = useState(false);
  const later = useTimeouts();
  const { cap } = puzzle;

  const miss = (i: number, key: string) => {
    stage.slip();
    setWobble(i);
    later(() => setWobble(null), 400);
    setMessage(t(key));
  };

  const tap = (i: number) => {
    if (over || busy) return;
    if (picked === null) {
      if (tubes[i].length === 0 || isDone(tubes[i], cap)) {
        sound.tap();
        return;
      }
      sound.pop();
      setPicked(i);
      setMessage(t("pourIt"));
      return;
    }
    if (picked === i) {
      sound.tap();
      setPicked(null);
      setMessage(t("pickTube"));
      return;
    }
    if (!canPour(tubes, picked, i, cap)) {
      setPicked(null);
      miss(i, tubes[i].length >= cap ? "full" : "noFit");
      return;
    }
    const next = pour(tubes, picked, i, cap).tubes;
    const pours = moves + 1;
    setHistory((h) => [...h, tubes]);
    setTubes(next);
    setMoves(pours);
    setPicked(null);
    sound.tone(520 + next[i].length * 80, 0.08, "triangle", 0.12);
    if (isDone(next[i], cap)) {
      setCheer(true);
      later(() => setCheer(false), 1300);
    }

    if (isSolved(next, cap)) {
      setMessage(t("solved"));
      setBusy(true);
      setSolved(solved + 1);
      if (stage.good(pointsFor(puzzle.colors, pours, puzzle.par))) return;
      later(() => {
        const p = newPuzzle(solved + 1);
        setPuzzle(p);
        setTubes(p.tubes);
        setHistory([]);
        setMoves(0);
        setBusy(false);
        setMessage(t("pickTube"));
      }, 1200);
      return;
    }
    const anyPour = next.some((_, a) =>
      next.some((_, b) => canPour(next, a, b, cap) && !isDone(next[a], cap)),
    );
    setMessage(anyPour ? t("pickTube") : t("stuck"));
  };

  const undo = () => {
    if (over || busy || history.length === 0) return;
    sound.tap();
    setTubes(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setPicked(null);
    setMessage(t("pickTube"));
  };

  const restart = () => {
    if (over || busy || history.length === 0) return;
    sound.tap();
    setTubes(puzzle.tubes);
    setHistory([]);
    setPicked(null);
    setMessage(t("pickTube"));
  };

  return (
    <PaintedScene
      views={VIEWS}
      say={<Emoji e={message} />}
      stage={stage}
      className="color-sort"
      trayHeight={110}
      tray={
        <div className="cs-tools">
          <SceneTool
            kind="undo"
            label={t("undo")}
            onPress={undo}
            disabled={history.length === 0}
          />
          <SceneTool
            kind="restart"
            label={t("restart")}
            onPress={restart}
            disabled={history.length === 0}
          />
        </div>
      }
    >
      {(view) => {
        const at = BENCH[view];
        const rows = Math.ceil(tubes.length / at.perRow);
        const per = Math.ceil(tubes.length / rows);
        return (
          <>
            {/* The painter owl cheers whenever a tube is filled with one colour. */}
            <div
              className={`cs-owl${cheer ? " cs-cheer" : ""}`}
              style={worldStyle(at.owl.x, at.owl.bottom, at.owl.h)}
            >
              <img
                src={owl}
                alt=""
                draggable={false}
                className={cheer ? "cs-off" : ""}
              />
              <img
                src={owlHappy}
                alt=""
                draggable={false}
                className={cheer ? "" : "cs-off"}
              />
            </div>
            <div
              className="cs-bench"
              key={solved}
              style={{ fontSize: at.layer }}
            >
              {tubes.map((tube, i) => {
                const row = Math.floor(i / per);
                const inRow = Math.min(per, tubes.length - row * per);
                const { y, left, right } = at.rows[row];
                // Never wider apart than a comfortable gap, so a few tubes stand together in the middle.
                const gap = Math.min((right - left) / per, at.layer * 2.6);
                const x =
                  (left + right) / 2 + (i - row * per - (inRow - 1) / 2) * gap;
                return (
                  <div key={i} className="cs-spot" style={{ left: x, top: y }}>
                    <button
                      className={`cs-tube${picked === i ? " cs-picked" : ""}${wobble === i ? " cs-wobble" : ""}${isDone(tube, cap) ? " cs-done" : ""}`}
                      style={{ height: `${cap + 0.45}em` }}
                      onPointerDown={() => tap(i)}
                      aria-label={t("tube", { n: i + 1 })}
                    >
                      {tube.map((c, k) => (
                        <span
                          key={k}
                          className={`cs-layer cs-c${c}`}
                          data-sym={SYMBOLS[c]}
                        />
                      ))}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        );
      }}
    </PaintedScene>
  );
}
