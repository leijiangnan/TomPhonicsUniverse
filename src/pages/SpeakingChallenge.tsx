import { useState } from "react";
import { Check, Volume2 } from "lucide-react";
import { WordArt } from "../components/Art";
import { TemporaryRecording } from "../components/TemporaryRecording";
import type { Lesson } from "../data/lesson";
import type { Progress } from "../lib/progress";
import { MissionBrief } from "../components/MissionBrief";
import { Robot } from "../components/Art";
export function SpeakingChallenge({
  speakingTask,
  progress,
  onPlay,
  onComplete,
}: {
  speakingTask: Lesson["speakingTask"];
  progress: Progress;
  onPlay: (src: string) => void;
  onComplete: () => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [recordingBusy, setRecordingBusy] = useState(false);
  return (
    <main className="speaking-page">
      <div className="activity-heading">
        <div>
          <h1>和家人说一句</h1>
          <p>听问题，看看图，再开口。</p>
        </div>
      </div>
      <MissionBrief progress={progress} />
      <section className="speaking-board" aria-label="亲子口语练习">
        <div className="speaking-host" aria-hidden="true"><Robot /></div>
        <button
          className="spoken-question"
          disabled={recordingBusy}
          onClick={() => onPlay(speakingTask.questionAudio)}
        >
          <Volume2 size={27} />
          {speakingTask.question}
        </button>
        <WordArt word={speakingTask.word} />
        <button
          className="button model-answer"
          disabled={recordingBusy}
          onClick={() => {
            setShowAnswer(true);
            onPlay(speakingTask.answerAudio);
          }}
        >
          <Volume2 size={22} />
          {showAnswer ? speakingTask.answer : "听一句示范"}
        </button>
        <TemporaryRecording onPlay={onPlay} onBusyChange={setRecordingBusy} />
      </section>
      <footer className="activity-controls">
        <p className="parent-confirm">家长确认孩子已尝试开口</p>
        <button className="button primary" onClick={onComplete} disabled={recordingBusy}>
          说好了，点亮星球 <Check size={22} />
        </button>
      </footer>
    </main>
  );
}
