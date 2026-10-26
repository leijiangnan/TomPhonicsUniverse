import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ArrowRight, Check, MousePointer2, Volume2 } from "lucide-react";
import { ReviewScene } from "../components/review/ReviewScene";
import { lessons } from "../data/lesson";
import type {
  ReviewSceneItem,
  ReviewUnit,
} from "../data/reviews";
import type { Progress } from "../lib/progress";

type DragState = {
  word: string;
  dx: number;
  dy: number;
};

export function ReviewPlacementChallenge({
  progress,
  review,
  onPlay,
  onPlace,
  onNext,
}: {
  progress: Progress;
  review: ReviewUnit;
  onPlay: (src: string) => void;
  onPlace: (roundIndex: number) => void;
  onNext: () => void;
}) {
  const lesson = lessons[progress.lessonIndex];
  const batchIndex = Math.min(
    progress.blendRound,
    review.placementBatches.length - 1,
  );
  const batchWords = review.placementBatches[batchIndex];
  const roundByWord = useMemo(
    () =>
      new Map(lesson.blendRounds.map((round, index) => [round.word, index])),
    [lesson],
  );
  const matchedItemIds = review.placementItems
    .filter((item) => {
      const round = roundByWord.get(item.word);
      return round !== undefined && progress.reviewPlacements.includes(round);
    })
    .map((item) => item.id);
  const batchComplete = batchWords.every((word) => {
    const round = roundByWord.get(word);
    return round !== undefined && progress.reviewPlacements.includes(round);
  });
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(
    "拖动单词，或先点单词再点场景中的物体。",
  );
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState<DragState | null>(null);
  const drag = useRef<{
    word: string;
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const ignoreClick = useRef(false);

  const attemptPlacement = (word: string, item: ReviewSceneItem) => {
    if (item.word === word) {
      const roundIndex = roundByWord.get(word);
      if (roundIndex !== undefined) onPlace(roundIndex);
      onPlay(`/audio/${word}.mp3`);
      setFeedback(`放对啦！${word}，${item.meaning}`);
      setSelectedWord(null);
      return;
    }
    const nextAttempts = (attempts[word] ?? 0) + 1;
    setAttempts((current) => ({ ...current, [word]: nextAttempts }));
    setFeedback(
      nextAttempts >= 2
        ? `再找找，${word}（${review.placementItems.find((item) => item.word === word)?.meaning}）对应的物体已经发光了。`
        : "这个物体和单词不匹配，再试一次。",
    );
  };

  const onPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    word: string,
  ) => {
    if (event.currentTarget.disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      word,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    setDragging({ word, dx: 0, dy: 0 });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (Math.hypot(dx, dy) > 8) current.moved = true;
    if (current.moved) {
      event.preventDefault();
      setDragging({ word: current.word, dx, dy });
    }
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (current.moved) {
      ignoreClick.current = true;
      const target = review.placementItems.find((item) => {
        const element = document.querySelector<HTMLElement>(
          `[data-object-id="${item.id}"]`,
        );
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      });
      if (target) attemptPlacement(current.word, target);
      else setFeedback("把单词放到场景中的物体上。");
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    setDragging(null);
  };

  const highlightedItemId =
    selectedWord && (attempts[selectedWord] ?? 0) >= 2
      ? review.placementItems.find((item) => item.word === selectedWord)?.id
      : undefined;

  return (
    <main className="review-page">
      <div className="activity-heading review-heading">
        <div>
          <h1>把单词放回场景</h1>
          <p>读一读备选单词，找到它对应的物体。</p>
        </div>
        <span className="round-count">
          第 {batchIndex + 1} / {review.placementBatches.length} 批
        </span>
      </div>

      <ReviewScene
        sceneId={review.sceneId}
        title={review.sceneTitle}
        items={review.placementItems}
        matchedItemIds={matchedItemIds}
        highlightedItemId={highlightedItemId}
        onItem={(item) => {
          const roundIndex = roundByWord.get(item.word);
          const placed =
            roundIndex !== undefined &&
            progress.reviewPlacements.includes(roundIndex);
          if (placed) {
            onPlay(`/audio/${item.word}.mp3`);
            setFeedback(`${item.word}，${item.meaning}`);
          } else if (selectedWord) {
            attemptPlacement(selectedWord, item);
          } else {
            onPlay(`/audio/${item.word}.mp3`);
            setFeedback(
              `${item.word}，${item.meaning}。先选一个单词，再放到这里。`,
            );
          }
        }}
      />

      <section className="review-word-tray" aria-label="备选单词">
        <div className="review-tray-heading">
          <span>
            <MousePointer2 size={20} />
            拖动，或点选后再点物体
          </span>
          <strong>
            {
              batchWords.filter((word) => {
                const round = roundByWord.get(word);
                return (
                  round !== undefined &&
                  progress.reviewPlacements.includes(round)
                );
              }).length
            }{" "}
            / {batchWords.length}
          </strong>
        </div>
        <div className="review-word-options">
          {batchWords.map((word) => {
            const roundIndex = roundByWord.get(word)!;
            const item = review.placementItems.find(
              (candidate) => candidate.word === word,
            )!;
            const placed = progress.reviewPlacements.includes(roundIndex);
            const active = selectedWord === word;
            const moving = dragging?.word === word;
            return (
              <div className="review-word-option" key={word}>
                <button
                  type="button"
                  className={`review-word-chip ${active ? "selected" : ""} ${moving ? "dragging" : ""}`}
                  disabled={placed}
                  aria-pressed={active}
                  aria-label={`选择并播放单词 ${word}，${item.meaning}`}
                  style={
                    moving
                      ? {
                          transform: `translate(${dragging.dx}px, ${dragging.dy}px)`,
                        }
                      : undefined
                  }
                  onPointerDown={(event) => onPointerDown(event, word)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => {
                    drag.current = null;
                    setDragging(null);
                  }}
                  onClick={() => {
                    if (ignoreClick.current) {
                      ignoreClick.current = false;
                      return;
                    }
                    onPlay(lesson.blendRounds[roundIndex].audio);
                    setSelectedWord(active ? null : word);
                    setFeedback(
                      active
                        ? "已取消选择。"
                        : `已选择 ${word}（${item.meaning}）`,
                    );
                  }}
                >
                  <Volume2 className="review-word-chip-audio" size={20} />
                  {placed && <Check size={20} />}
                  <span>
                    <b>{word}</b>
                    <small>{item.meaning}</small>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <div
        className={`review-feedback ${batchComplete ? "correct" : ""}`}
        role="status"
      >
        {batchComplete && <Check size={22} />}
        {batchComplete ? "这一批全部归位！" : feedback}
      </div>

      <footer className="activity-controls review-placement-controls">
        <span>放错可以继续尝试，不扣分。</span>
        <button
          className="button primary"
          disabled={!batchComplete}
          onClick={onNext}
        >
          {batchIndex === review.placementBatches.length - 1
            ? "整理完成，点亮星球"
            : "下一批单词"}
          <ArrowRight size={21} />
        </button>
      </footer>
    </main>
  );
}
