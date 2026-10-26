import { useState } from "react";
import { ArrowRight, Check, Volume2 } from "lucide-react";
import { Robot } from "../components/Art";
import { ReviewScene } from "../components/review/ReviewScene";
import type { ReviewUnit } from "../data/reviews";
import type { Progress } from "../lib/progress";

export function ReviewDialogueChallenge({
  progress,
  review,
  onPlay,
  onConfirm,
}: {
  progress: Progress;
  review: ReviewUnit;
  onPlay: (src: string) => void;
  onConfirm: () => void;
}) {
  const step = Math.min(progress.reviewDialogueStep, review.dialogue.length - 1);
  const line = review.dialogue[step];
  const [revealedStep, setRevealedStep] = useState<number | null>(null);
  const showReply = revealedStep === step;

  return (
    <main className="review-page">
      <div className="activity-heading review-heading">
        <div>
          <h1>和机器人检查场景</h1>
          <p>听机器人的问题，看场景开口回答。</p>
        </div>
        <span className="round-count">
          {step + 1} / {review.dialogue.length}
        </span>
      </div>

      <div className="review-dialogue-layout">
        <ReviewScene
          sceneId={review.sceneId}
          title={review.sceneTitle}
          items={review.placementItems}
          matchedItemIds={review.placementItems.map((item) => item.id)}
          highlightedItemId={line.focusItemId}
          onItem={(item) => onPlay(`/audio/${item.word}.mp3`)}
        />

        <section className="review-dialogue-panel" aria-label="情景对话">
          <Robot />
          <div className="review-dialogue-lines">
            <button
              type="button"
              className="review-npc-line"
              onClick={() => onPlay(line.npcAudio)}
            >
              <Volume2 size={23} />
              <span>
                <small>机器人</small>
                <b>{line.npc}</b>
                <em>{line.npcMeaning}</em>
              </span>
            </button>
            <button
              type="button"
              className="review-reply-line"
              onClick={() => {
                setRevealedStep(step);
                onPlay(line.replyAudio);
              }}
            >
              <Volume2 size={23} />
              <span>
                <small>一起说</small>
                {showReply ? (
                  <>
                    <b>{line.reply}</b>
                    <em>{line.replyMeaning}</em>
                  </>
                ) : (
                  "听一句示范"
                )}
              </span>
            </button>
          </div>
        </section>
      </div>

      <footer className="activity-controls">
        <p className="parent-confirm">家长确认孩子已尝试开口</p>
        <button className="button primary" onClick={onConfirm}>
          {step === review.dialogue.length - 1
            ? "检查完成，点亮星球"
            : "说好了，继续"}
          {step === review.dialogue.length - 1 ? (
            <Check size={22} />
          ) : (
            <ArrowRight size={21} />
          )}
        </button>
      </footer>
    </main>
  );
}
