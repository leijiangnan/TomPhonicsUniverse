import { Check, RotateCcw, Volume2, ArrowRight } from "lucide-react";
import { lessons } from "../data/lesson";
import type { BlendDraftChange, Progress } from "../lib/progress";
import { useMemo, useState } from "react";
import { wordSegments } from "../data/learning";
import { MissionBrief } from "../components/MissionBrief";
export function BlendingChallenge({
  progress,
  onPlay,
  onPlaySequence,
  playingSrc,
  onDraft,
  onCheck,
  onNext,
  feedback,
}: {
  progress: Progress;
  onPlay: (src: string) => void;
  onPlaySequence: (sources: readonly string[]) => void;
  playingSrc: string | null;
  onDraft: (change: BlendDraftChange) => void;
  onCheck: () => void;
  onNext: () => void;
  feedback: string;
}) {
  const blendRounds = lessons[progress.lessonIndex].blendRounds;
  const sounds = lessons
    .slice(0, progress.lessonIndex + 1)
    .flatMap((l) => l.steps);
  const round = blendRounds[progress.blendRound];
  const [modelRound, setModelRound] = useState<string | null>(null);
  const showModel = modelRound === round.word;
  const segments = wordSegments(round.word);
  // Shuffle on entering a word; choosing tiles does not move the remaining bank.
  const bank = useMemo(() => {
    const tiles = [...round.letters];
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    return tiles;
  }, [round]);
  return (
    <main className="game-page">
      <div className="activity-heading">
        <div>
          <h1>听声音，拼单词</h1>
          <p>{lessons[progress.lessonIndex].learningNote ?? "点下面的字母，放进空格。"}</p>
        </div>
        <span className="round-count">
          {progress.blendRound + 1} / {blendRounds.length}
        </span>
      </div>
      <MissionBrief progress={progress} />
      <section
        className={`crafting-board ${progress.blendSolved ? "solved" : ""}`}
        aria-label="拼字合成台"
      >
        <div className="blend-listening"><button
          className="button listen-word"
          onClick={() => onPlay(round.audio)}
        >
          <Volume2 size={28} /> 听单词
        </button><button className="button blend-model-button" aria-expanded={showModel} onClick={() => {
          setModelRound(round.word);
          onPlaySequence([...segments.flatMap((segment) => segment.audio ? [segment.audio] : []), round.audio]);
        }}><Volume2 size={22} />一起合音</button></div>
        {showModel && <div className="blend-model" aria-label="逐音示范与整词">
          <span>先听每个声音，再听整词</span>
          <div>{segments.map((segment, index) => <button key={index} className={playingSrc === segment.audio ? "active" : ""} onClick={() => segment.audio && onPlay(segment.audio!)} aria-label={`听字素 ${segment.grapheme}，${segment.phonemes.length} 个音`}>
            <b>{segment.grapheme}</b><span>{segment.phonemes.map((_, i) => <i key={i} />)}</span>
          </button>)}<ArrowRight size={22} /><button className={playingSrc === round.audio ? "active" : ""} onClick={() => onPlay(round.audio)} aria-label={`听整词 ${round.word}`}><b>{round.word}</b></button></div>
        </div>}
        <div className="word-slots" aria-label="拼出的单词">
          {round.letters.map((_, i) => (
            <button
              key={i}
              className={`letter-slot ${progress.blendDraft[i] ? "filled" : ""}`}
              aria-label={`第 ${i + 1} 个格子${progress.blendDraft[i] ? `：${progress.blendDraft[i]}，点按移除` : "，空"}`}
              disabled={!progress.blendDraft[i] || progress.blendSolved}
              onClick={() =>
                onDraft((current) => current.filter((_, n) => n !== i))
              }
            >
              {progress.blendDraft[i] ?? <span className="slot-dot" />}
            </button>
          ))}
        </div>
        <div className="game-feedback" role="status">
          {progress.blendSolved ? (
            <div className="solved-feedback">
              <div><Check size={24} /> 拼对啦！一起读：<b>{round.word}</b></div>
              <strong>{round.ipa && <span className="word-ipa">{round.ipa} </span>}{round.meaning}</strong>
            </div>
          ) : (
            feedback || "选一个方块，放上去"
          )}
        </div>
        <div className="letter-bank" aria-label="可用字母方块">
          {bank.map((letter, tileIndex) => (
            <button
              className={`letter-option ${sounds.find((s) => s.id === letter)?.theme}`}
              key={tileIndex}
              aria-label={`选择字母 ${letter}`}
              disabled={
                progress.blendDraft.filter((l) => l === letter).length >
                  bank.slice(0, tileIndex).filter((l) => l === letter)
                    .length || progress.blendSolved
              }
              onClick={() => {
                onDraft((current) => [...current, letter]);
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
            disabled={progress.blendDraft.length !== round.letters.length}
            onClick={onCheck}
          >
            拼好了 <Check size={22} />
          </button>
        )}
      </footer>
    </main>
  );
}
