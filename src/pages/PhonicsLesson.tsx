import { ArrowRight, Check, ChevronLeft, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WordArt } from "../components/Art";
import { lessons } from "../data/lesson";
import { canCompletePhonicsStep, phonicsCardIds, visitedPhonicsCards, type Progress } from "../lib/progress";
import { MissionBrief } from "../components/MissionBrief";
export function PhonicsLesson({
  progress,
  onStep,
  onComplete,
  onPlay,
  onVisit,
  playingSrc,
}: {
  progress: Progress;
  onStep: (n: number) => void;
  onComplete: () => Promise<void>;
  onPlay: (src: string) => void;
  onVisit: (cardId: string) => void;
  playingSrc: string | null;
}) {
  const lesson = lessons[progress.lessonIndex];
  const STEP_COUNT = lesson.steps.length;
  const item = lesson.steps[progress.step];
  const visited = visitedPhonicsCards(progress);
  const ready = canCompletePhonicsStep(progress);
  const [completing, setCompleting] = useState(false);
  const pending = useRef(false);
  const tap = (cardId: string, audio: string) => {
    onPlay(audio);
    onVisit(cardId);
  };
  const complete = async () => {
    if (!ready || pending.current) return;
    pending.current = true;
    setCompleting(true);
    try { await onComplete(); }
    finally { pending.current = false; setCompleting(false); }
  };
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
          <p>{lesson.learningNote ?? "点完大字母和三张图片，再继续。"}</p>
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
      <MissionBrief progress={progress} />
      <section
        className={`classroom ${item.theme}`}
        aria-label={`字母 ${item.grapheme} 和三个例词`}
      >
        <button
          className={`letter-tile ${visited.includes("sound") ? "card-visited" : ""} ${playingSrc === item.audio ? "playing" : ""}`}
          onClick={() => tap("sound", item.audio)}
          aria-label={`播放字母音 ${item.ipa}${visited.includes("sound") ? "，已点过" : ""}`}
        >
          {visited.includes("sound") && <span className="card-visit-mark" aria-hidden="true"><Check size={16} strokeWidth={3} /></span>}
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
              className={`word-card ${visited.includes(word.word) ? "card-visited" : ""} ${playingSrc === word.audio ? "playing" : ""}`}
              onClick={() => tap(word.word, word.audio)}
              aria-label={`播放单词 ${word.word}，${word.meaning}${visited.includes(word.word) ? "，已点过" : ""}`}
            >
              {visited.includes(word.word) && <span className="card-visit-mark" aria-hidden="true"><Check size={16} strokeWidth={3} /></span>}
              <Volume2 className="word-speaker" size={23} />
              <WordArt word={word.word} />
              <span className="word-spelling">
                {word.word.slice(0, word.word.toLowerCase().indexOf(item.grapheme))}
                <em>{item.grapheme}</em>
                {word.word.slice(word.word.toLowerCase().indexOf(item.grapheme) + item.grapheme.length)}
              </span>
              <span className="word-meaning">{word.ipa && <span className="word-ipa">{word.ipa} </span>}{word.meaning}</span>
            </button>
          ))}
        </div>
      </section>
      <footer className="activity-controls phonics-controls">
        <button
          className="button secondary"
          onClick={() => onStep(progress.step - 1)}
          disabled={progress.step === 0}
        >
          <ChevronLeft size={20} /> 上一个
        </button>
        <p className={`phonics-card-status${ready ? " ready" : ""}`} id="phonics-card-status" role="status">
          已点 <strong>{visited.length} / {phonicsCardIds(progress).length}</strong> 张卡片
        </p>
        <button className="button primary" disabled={!ready || completing} aria-describedby="phonics-card-status" onClick={() => void complete()}>
          {progress.step === STEP_COUNT - 1
            ? "学好了，点亮星球"
            : "读好了，下一个"}
          <ArrowRight size={21} />
        </button>
      </footer>
    </main>
  );
}
