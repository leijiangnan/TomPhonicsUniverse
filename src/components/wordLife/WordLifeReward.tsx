import { useEffect, useRef, useState } from "react";
import { wordLifeLabels, wordLifePresentation, type WordLifeWord } from "../../lib/wordLife";
import { WordLifeScene } from "./WordLifeScene";
import { WordLifeStill } from "./WordLifeStill";

/**
 * Non-modal so the existing next control stays clickable. Focus still moves
 * in on open and returns to the trigger, or the task title if that trigger is gone.
 */
export function WordLifeReward({
  word,
  ambientMotion,
  reducedMotion,
  onDismiss,
}: {
  word: WordLifeWord;
  ambientMotion: boolean;
  reducedMotion: boolean;
  onDismiss: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;
  const [webgl, setWebgl] = useState(true);
  const [ready, setReady] = useState(false);
  const presentation = wordLifePresentation({
    text: word,
    ambientMotion,
    reducedMotion,
    webgl,
  });
  const animated = presentation?.presentation === "animated";
  const label = wordLifeLabels[word];

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const trigger = document.activeElement as HTMLElement | null;
    try {
      el.show();
    } catch {
      el.setAttribute("open", "");
    }
    skip.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      dismiss.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      el.close();
      const restore = trigger && trigger.isConnected && trigger !== document.body && !trigger.matches(":disabled")
        ? trigger
        : document.querySelector<HTMLElement>("[data-task-focus]") ?? document.querySelector<HTMLElement>("main h1");
      if (!restore) return;
      if (restore.tabIndex < 0 && restore.tagName !== "BUTTON" && restore.tagName !== "A") restore.tabIndex = -1;
      restore.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="word-life-dialog"
      aria-modal="false"
      aria-labelledby="word-life-title"
      data-word-life={word}
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <div className="word-life-card" onClick={onDismiss}>
        <div className="word-life-stage">
          {(!animated || !ready) && (
            <div className="word-life-fallback">
              <WordLifeStill word={word} />
            </div>
          )}
          {animated && (
            <WordLifeScene
              word={word}
              onReady={() => setReady(true)}
              onUnavailable={() => setWebgl(false)}
            />
          )}
        </div>
        <div className="word-life-caption">
          <p id="word-life-title">
            <b>{word}</b>
            <span>{label}活过来啦</span>
          </p>
          <button ref={skip} type="button" className="button primary word-life-skip" onClick={onDismiss}>
            跳过
          </button>
        </div>
      </div>
    </dialog>
  );
}
