import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, ChevronLeft, Volume2 } from "lucide-react";
import { ReviewScene } from "../components/review/ReviewScene";
import { lessons } from "../data/lesson";
import type { ReviewUnit } from "../data/reviews";
import type { Progress } from "../lib/progress";

export function ReviewSoundScan({
  progress,
  review,
  onStep,
  onComplete,
  onPlay,
}: {
  progress: Progress;
  review: ReviewUnit;
  onStep: (step: number) => void;
  onComplete: () => void;
  onPlay: (src: string) => void;
}) {
  const lesson = lessons[progress.lessonIndex];
  const targets = useMemo(
    () => review.soundBatches.flatMap((batch) => batch.targets),
    [review],
  );
  const target = targets[progress.step];
  const batchIndex = review.soundBatches.findIndex((batch) =>
    batch.targets.includes(target),
  );
  const batch = review.soundBatches[Math.max(0, batchIndex)];
  const correctItem = batch.items.find((item) => item.id === target.itemId)!;
  const alreadyFound = progress.reviewSounds.includes(progress.step);
  const [solved, setSolved] = useState(alreadyFound);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setSolved(progress.reviewSounds.includes(progress.step));
    setMistakes(0);
    setFeedback("");
  }, [progress.step, progress.reviewSounds]);

  return (
    <main className="review-page">
      <div className="activity-heading review-heading">
        <div>
          <h1>启动声音扫描</h1>
          <p>
            听 <b>{lesson.steps[progress.step].ipa}</b>
            ，找到以这个声音开头的物品。
          </p>
        </div>
        <span className="round-count">
          {progress.step + 1} / {lesson.steps.length}
        </span>
      </div>

      <div className="review-scan-toolbar">
        <button
          className="button listen-word"
          onClick={() => onPlay(lesson.steps[progress.step].audio)}
        >
          <Volume2 size={25} />
          再听一次 {lesson.steps[progress.step].ipa}
        </button>
        <span>
          场景 {batchIndex + 1} / {review.soundBatches.length}
        </span>
      </div>

      <ReviewScene
        sceneId={review.sceneId}
        title={review.sceneTitle}
        items={batch.items}
        matchedItemIds={solved ? [correctItem.id] : []}
        highlightedItemId={mistakes >= 2 ? correctItem.id : undefined}
        onItem={(item) => {
          onPlay(`/audio/${item.word}.mp3`);
          if (solved) return;
          if (item.id === correctItem.id) {
            setSolved(true);
            setFeedback(`找到了！${item.word}，${item.meaning}`);
          } else {
            const nextMistakes = mistakes + 1;
            setMistakes(nextMistakes);
            setFeedback(
              nextMistakes >= 2
                ? "再听一次，发光的物品会给你提示。"
                : "声音不一样，再听一次试试。",
            );
          }
        }}
      />

      <div className={`review-feedback ${solved ? "correct" : ""}`} role="status">
        {solved && <Check size={22} />}
        {feedback || "点场景中的物品"}
      </div>

      <footer className="activity-controls">
        <button
          className="button secondary"
          onClick={() => onStep(progress.step - 1)}
          disabled={progress.step === 0}
        >
          <ChevronLeft size={20} />
          上一个
        </button>
        <button
          className="button primary"
          disabled={!solved}
          onClick={onComplete}
        >
          {progress.step === lesson.steps.length - 1
            ? "扫描完成，点亮星球"
            : "下一个声音"}
          <ArrowRight size={21} />
        </button>
      </footer>
    </main>
  );
}
