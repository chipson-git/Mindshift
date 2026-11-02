"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";

// Plays a session. If a studio recording exists (`audioUrl`), it uses a normal <audio> player.
// Otherwise it reads the script paragraph by paragraph with the browser's speech synthesis,
// pausing between paragraphs and highlighting the current one.

const SPEECH_LANG: Record<Locale, string> = { ka: "ka-GE", en: "en-US" };
const PAUSE_MS = 1800;

interface Labels {
  play: string;
  pause: string;
  resume: string;
  stop: string;
  noVoice: string;
  voiceNote: string;
}

export function SessionPlayer({
  paragraphs,
  locale,
  labels,
  audioUrl,
}: {
  paragraphs: string[];
  locale: Locale;
  labels: Labels;
  audioUrl?: string;
}) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null | undefined>(undefined);
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [current, setCurrent] = useState(-1);
  const runId = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Voices load asynchronously in most browsers.
  useEffect(() => {
    if (audioUrl || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoice(null);
      return;
    }
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      setVoice(voices.find((v) => v.lang.toLowerCase().startsWith(locale)) ?? null);
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    const fallback = setTimeout(() => setVoice((v) => (v === undefined ? null : v)), 1500);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
      clearTimeout(fallback);
    };
  }, [audioUrl, locale]);

  const stop = useCallback(() => {
    runId.current++;
    if (timer.current) clearTimeout(timer.current);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setStatus("idle");
    setCurrent(-1);
  }, []);

  useEffect(() => stop, [stop]);

  const speakFrom = useCallback(
    (index: number, id: number) => {
      if (id !== runId.current || !voice) return;
      if (index >= paragraphs.length) {
        setStatus("idle");
        setCurrent(-1);
        return;
      }
      setCurrent(index);
      const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
      utterance.voice = voice;
      utterance.lang = SPEECH_LANG[locale];
      utterance.rate = 0.82;
      utterance.pitch = 0.95;
      utterance.onend = () => {
        timer.current = setTimeout(() => speakFrom(index + 1, id), PAUSE_MS);
      };
      window.speechSynthesis.speak(utterance);
    },
    [paragraphs, locale, voice],
  );

  const play = () => {
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }
    stop();
    const id = runId.current;
    setStatus("playing");
    speakFrom(0, id);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setStatus("paused");
  };

  return (
    <div>
      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full" preload="none" />
      ) : (
        <div className="card flex flex-col items-center gap-4 py-8">
          <div className="relative size-28" aria-hidden="true">
            <div className={`absolute inset-0 rounded-full bg-accent-soft ${status === "playing" ? "breathe" : ""}`} />
            <div className="absolute inset-[22%] rounded-full bg-surface" />
          </div>
          {voice ? (
            <>
              <div className="flex gap-2">
                {status === "playing" ? (
                  <button onClick={pause} className="btn-primary min-w-28">{labels.pause}</button>
                ) : (
                  <button onClick={play} className="btn-primary min-w-28">
                    {status === "paused" ? labels.resume : labels.play}
                  </button>
                )}
                {status !== "idle" && (
                  <button onClick={stop} className="btn-secondary">{labels.stop}</button>
                )}
              </div>
              <p className="text-center text-xs text-muted">{labels.voiceNote}</p>
            </>
          ) : voice === null ? (
            <p className="max-w-sm text-center text-sm text-muted">{labels.noVoice}</p>
          ) : null}
        </div>
      )}

      <div className="mt-6 space-y-4 text-[1.05rem] leading-relaxed">
        {paragraphs.map((p, i) => (
          <p
            key={i}
            className={`rounded-lg px-2 py-1 transition-colors ${
              i === current ? "bg-accent-soft text-text" : current >= 0 ? "text-muted" : ""
            }`}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
