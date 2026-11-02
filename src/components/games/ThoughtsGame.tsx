"use client";

import { useState } from "react";
import { fmt, pick, type Locale } from "@/lib/i18n";
import { accuracy, shuffle, THOUGHTS_PER_GAME } from "@/lib/games";
import { THOUGHTS, type Thought } from "@/lib/content/thoughts";
import { IntroCard, ResultCard, useBestScore, type GamesDict, type Phase } from "./GameFrame";

// Thought sort: decide whether a thought is helpful or unhelpful; unhelpful ones show a reframe.

function deal(): Thought[] {
  const helpful = shuffle(THOUGHTS.filter((x) => x.helpful)).slice(0, THOUGHTS_PER_GAME / 2);
  const unhelpful = shuffle(THOUGHTS.filter((x) => !x.helpful)).slice(0, THOUGHTS_PER_GAME / 2);
  return shuffle([...helpful, ...unhelpful]);
}

export function ThoughtsGame({ t, locale }: { t: GamesDict; locale: Locale }) {
  const { best, submit } = useBestScore("thoughts");
  const [phase, setPhase] = useState<Phase>("intro");
  const [deck, setDeck] = useState<Thought[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [correct, setCorrect] = useState(0);
  const [newBest, setNewBest] = useState(false);

  const start = () => {
    setDeck(deal());
    setIndex(0);
    setAnswer(null);
    setCorrect(0);
    setPhase("play");
  };

  const thought = deck[index];

  const choose = (helpful: boolean) => {
    if (answer !== null) return;
    setAnswer(helpful);
    if (helpful === thought.helpful) setCorrect((c) => c + 1);
  };

  const next = () => {
    if (index + 1 >= deck.length) {
      setNewBest(submit(correct));
      setPhase("done");
      return;
    }
    setIndex(index + 1);
    setAnswer(null);
  };

  if (phase === "intro") return <IntroCard t={t} howTo={t.list.thoughts.howTo} best={best} onStart={start} />;
  if (phase === "done") {
    return (
      <ResultCard
        t={t}
        score={correct}
        details={[fmt(t.progress, { n: correct, total: deck.length }), fmt(t.accuracy, { n: accuracy(correct, deck.length) })]}
        isNewBest={newBest}
        best={best}
        onAgain={start}
      />
    );
  }

  const isRight = answer !== null && answer === thought.helpful;

  return (
    <div className="card space-y-5">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{t.list.thoughts.name}</span>
        <span className="tabular-nums">{fmt(t.progress, { n: index + 1, total: deck.length })}</span>
      </div>
      <blockquote className="rounded-2xl bg-surface-muted px-5 py-8 text-center text-lg font-medium leading-relaxed sm:text-xl">
        “{pick(thought.text, locale)}”
      </blockquote>

      {answer === null ? (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => choose(true)} className="btn-secondary py-3.5 text-base">
            <span className="text-success-strong" aria-hidden="true">✓</span> {t.thoughtsHelpful}
          </button>
          <button type="button" onClick={() => choose(false)} className="btn-secondary py-3.5 text-base">
            <span className="text-danger" aria-hidden="true">✗</span> {t.thoughtsUnhelpful}
          </button>
        </div>
      ) : (
        <div className="space-y-4" aria-live="polite">
          <p className={`font-medium ${isRight ? "text-success-strong" : "text-danger"}`}>
            {isRight ? t.thoughtsRight : t.thoughtsWrong} · {thought.helpful ? t.thoughtsHelpful : t.thoughtsUnhelpful}
          </p>
          {thought.reframe && (
            <div className="rounded-xl bg-success-soft p-4 text-sm">
              <p className="font-medium">{t.thoughtsTry}</p>
              <p className="mt-1">{pick(thought.reframe, locale)}</p>
            </div>
          )}
          <button type="button" onClick={next} className="btn-primary">{t.thoughtsNext}</button>
        </div>
      )}
    </div>
  );
}
