import { ArrowRight, Check, ChevronLeft, Volume2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { WordArt } from "../components/Art";
import { lessons } from "../data/lesson";
import type { Progress } from "../lib/progress";
export function PhonicsLesson({
  progress,
  onStep,
  onComplete,
  onPlay,
  playingSrc,
}: {
  progress: Progress;
  onStep: (n: number) => void;
  onComplete: () => void;
  onPlay: (src: string) => void;
  playingSrc: string | null;
}) {
  const lesson = lessons[progress.lessonIndex];
  const STEP_COUNT = lesson.steps.length;
  const item = lesson.steps[progress.step];
  const currentStep = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const button = currentStep.current;
    const steps = button?.parentElement;
    if (!button || !steps) return;
    const timer = window.setTimeout(() => {
      const buttonRect = button.getBoundingClientRect();
      const stepsRect = steps.getBoundingClientRect();
      steps.scrollTo({
        left:
          steps.scrollLeft +
          buttonRect.left -
          stepsRect.left -
          (steps.clientWidth - button.offsetWidth) / 2,
        behavior: "auto",
      });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [progress.step]);
  return (
    <main className="lesson-page">
      <div className="activity-heading">
        <div>
          <h1>
            {lesson.review ? "复习" : "认识"}{" "}
            <span className="heading-letter">{item.grapheme}</span>
          </h1>
          <p>点字母听发音，点图片听单词。</p>
        </div>
        <nav className="letter-steps" aria-label="字母学习步骤">
          {lesson.steps.map((s, i) => (
            <button
              key={s.id}
              ref={progress.step === i ? currentStep : undefined}
              onClick={() => onStep(i)}
              aria-label={`学习字母 ${s.grapheme}`}
              aria-current={progress.step === i ? "step" : undefined}
              disabled={
                i > 0 &&
                !progress.completed.includes(i - 1) &&
                !progress.completed.includes(i)
              }
            >
              {s.grapheme}
              {progress.completed.includes(i) && <Check size={15} />}
            </button>
          ))}
        </nav>
      </div>
      <section
        className={`classroom ${item.theme}`}
        aria-label={`字母 ${item.grapheme} 和三个例词`}
      >
        <button
          className={`letter-tile ${playingSrc === item.audio ? "playing" : ""}`}
          onClick={() => onPlay(item.audio)}
          aria-label={`播放字母音 ${item.ipa}`}
        >
          <span className="large-letter">{item.grapheme}</span>
          <span className="letter-sound">
            <Volume2 size={27} />
            {item.ipa}
          </span>
        </button>
        <div className="word-grid">
          {item.words.map((word) => (
            <button
              key={word.word}
              className={`word-card ${playingSrc === word.audio ? "playing" : ""}`}
              onClick={() => onPlay(word.audio)}
              aria-label={`播放单词 ${word.word}，${word.meaning}`}
            >
              <Volume2 className="word-speaker" size={23} />
              <WordArt word={word.word} />
              <span className="word-spelling">
                <em>{word.word[0]}</em>
                {word.word.slice(1)}
              </span>
              <span className="word-meaning">{word.meaning}</span>
            </button>
          ))}
        </div>
      </section>
      <footer className="activity-controls">
        <button
          className="button secondary"
          onClick={() => onStep(progress.step - 1)}
          disabled={progress.step === 0}
        >
          <ChevronLeft size={20} /> 上一个
        </button>
        <button className="button primary" onClick={onComplete}>
          {progress.step === STEP_COUNT - 1
            ? "学好了，点亮星球"
            : "读好了，下一个"}
          <ArrowRight size={21} />
        </button>
      </footer>
    </main>
  );
}
