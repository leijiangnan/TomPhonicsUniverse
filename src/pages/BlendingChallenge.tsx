import { Check, RotateCcw, Volume2, ArrowRight } from "lucide-react";
import { lessons } from "../data/lesson";
import type { Progress } from "../lib/progress";
export function BlendingChallenge({
  progress,
  onPlay,
  onDraft,
  onCheck,
  onNext,
  feedback,
}: {
  progress: Progress;
  onPlay: (src: string) => void;
  onDraft: (letters: string[]) => void;
  onCheck: () => void;
  onNext: () => void;
  feedback: string;
}) {
  const blendRounds = lessons[progress.lessonIndex].blendRounds;
  const sounds = lessons
    .slice(0, progress.lessonIndex + 1)
    .flatMap((l) => l.steps);
  const round = blendRounds[progress.blendRound];
  return (
    <main className="game-page">
      <div className="activity-heading">
        <div>
          <h1>听声音，拼单词</h1>
          <p>点下面的字母，放进空格。</p>
        </div>
        <span className="round-count">
          {progress.blendRound + 1} / {blendRounds.length}
        </span>
      </div>
      <section
        className={`crafting-board ${progress.blendSolved ? "solved" : ""}`}
        aria-label="拼字合成台"
      >
        <button
          className="button listen-word"
          onClick={() => onPlay(round.audio)}
        >
          <Volume2 size={28} /> 听单词
        </button>
        <div className="word-slots" aria-label="拼出的单词">
          {[...round.word].map((_, i) => (
            <button
              key={i}
              className={`letter-slot ${progress.blendDraft[i] ? "filled" : ""}`}
              aria-label={`第 ${i + 1} 个格子${progress.blendDraft[i] ? `：${progress.blendDraft[i]}，点按移除` : "，空"}`}
              disabled={!progress.blendDraft[i] || progress.blendSolved}
              onClick={() =>
                onDraft(progress.blendDraft.filter((_, n) => n !== i))
              }
            >
              {progress.blendDraft[i] ?? <span className="slot-dot" />}
            </button>
          ))}
        </div>
        <div className="game-feedback" role="status">
          {progress.blendSolved ? (
            <>
              <Check size={24} /> 拼对啦！一起读：<b>{round.word}</b>
            </>
          ) : (
            feedback || "选一个方块，放上去"
          )}
        </div>
        <div className="letter-bank" aria-label="可用字母方块">
          {round.letters.map((letter, tileIndex) => (
            <button
              className={`letter-option ${sounds.find((s) => s.id === letter)?.theme}`}
              key={tileIndex}
              aria-label={`选择字母 ${letter}`}
              disabled={
                progress.blendDraft.filter((l) => l === letter).length >
                  round.letters.slice(0, tileIndex).filter((l) => l === letter)
                    .length || progress.blendSolved
              }
              onClick={() => {
                onDraft([...progress.blendDraft, letter]);
                const sound = sounds.find((s) => s.id === letter);
                if (sound && progress.volume > 0) onPlay(sound.audio);
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      </section>
      <footer className="activity-controls">
        <button
          className="button secondary"
          onClick={() => onDraft([])}
          disabled={progress.blendDraft.length === 0 || progress.blendSolved}
        >
          <RotateCcw size={20} /> 重新放
        </button>
        {progress.blendSolved ? (
          <button className="button primary" onClick={onNext}>
            {progress.blendRound === blendRounds.length - 1
              ? "点亮星球"
              : "下一个单词"}
            <ArrowRight size={21} />
          </button>
        ) : (
          <button
            className="button primary"
            disabled={progress.blendDraft.length !== round.word.length}
            onClick={onCheck}
          >
            拼好了 <Check size={22} />
          </button>
        )}
      </footer>
    </main>
  );
}
