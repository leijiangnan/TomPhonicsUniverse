import { useState } from "react";
import { Check, Volume2 } from "lucide-react";
import { WordArt } from "../components/Art";
import type { Lesson } from "../data/lesson";
export function SpeakingChallenge({
  speakingTask,
  onPlay,
  onComplete,
}: {
  speakingTask: Lesson["speakingTask"];
  onPlay: (src: string) => void;
  onComplete: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <main className="speaking-page">
      <div className="activity-heading">
        <div>
          <h1>和家人说一句</h1>
          <p>听问题，看看图，再开口。</p>
        </div>
      </div>
      <section className="speaking-board" aria-label="亲子口语练习">
        <button
          className="spoken-question"
          onClick={() => onPlay(speakingTask.questionAudio)}
        >
          <Volume2 size={27} />
          {speakingTask.question}
        </button>
        <WordArt word={speakingTask.word} />
        <button
          className="button model-answer"
          onClick={() => {
            setShowAnswer(true);
            onPlay(speakingTask.answerAudio);
          }}
        >
          <Volume2 size={22} />
          {showAnswer ? speakingTask.answer : "听一句示范"}
        </button>
      </section>
      <footer className="activity-controls">
        <p className="parent-confirm">家长确认孩子已尝试开口</p>
        <button className="button primary" onClick={onComplete}>
          说好了，点亮星球 <Check size={22} />
        </button>
      </footer>
    </main>
  );
}
