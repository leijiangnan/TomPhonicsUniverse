import { ArrowRight, Check, HandHeart, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Robot } from "../components/Art";
import { outcomeLabels, practiceItems, type PracticeOutcome } from "../lib/practice";
import type { Progress } from "../lib/progress";

export function QuickPractice({ progress, onHint, onObserve, onAgain, onBack }: {
  progress: Progress;
  onHint: (itemId: string, audio: readonly string[]) => void;
  onObserve: (itemId: string, outcome: PracticeOutcome) => void;
  onAgain: () => void;
  onBack: () => void;
}) {
  const session = progress.practice?.session;
  const wordRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { wordRef.current?.focus(); }, [session?.index]);
  if (!session) return null;
  const done = session.index === session.itemIds.length;
  const item = practiceItems.find((candidate) => candidate.id === session.itemIds[session.index]);
  const hinted = item && session.hintedIds.includes(item.id);
  return <main className="practice-page">
    <div className="activity-heading">
      <div><span className="eyebrow">飞船出发前 · 轻复习</span><h1>{done ? "这次练习完成啦" : "试着自己读一读"}</h1><p>{done ? "想休息就休息，下次再一起读。" : "先试一试，需要时可以听示范。"}</p></div>
      <span className="round-count">{done ? session.itemIds.length : session.index + 1} / {session.itemIds.length}</span>
    </div>
    {done ? <section className="practice-summary" aria-label="本次复习回顾">
      <div className="practice-robot"><Robot /></div>
      <div className="practice-results">{session.itemIds.map((id, index) => <div key={id}><strong>{practiceItems.find((entry) => entry.id === id)?.text}</strong><span><Check size={18} />{outcomeLabels[session.outcomes[index]]}</span></div>)}</div>
      <p>家长记录了本次尝试，可以继续复习。</p>
    </section> : item && <>
      <section className="practice-board" aria-label={item.kind === "sound" ? "看字母，说字母音" : item.kind === "phrase" ? "读一条短线索" : "看单词，尝试拼读"}>
        <span className="practice-prompt">{item.kind === "sound" ? "看字母，说出它的声音" : item.kind === "phrase" ? "把两个词连起来读" : item.transfer ? "用学过的声音，试读这个词" : "看看字母，把声音连起来"}</span>
        <h2 ref={wordRef} tabIndex={-1} className={`practice-word ${item.kind}`}>{item.text}</h2>
        <p className="practice-meaning">{hinted ? item.meaning : "轮到你来试一试"}</p>
        <button className="button practice-hint" onClick={() => onHint(item.id, item.audio)}><Volume2 size={23} />{item.kind === "phrase" ? "听逐词示范" : "听示范"}</button>
      </section>
      <div className="practice-observation" aria-label="家长记录本次尝试">
        <p>家长记录本次尝试</p>
        <div>
          <button className="button primary" disabled={Boolean(hinted)} onClick={() => onObserve(item.id, "independent")}><Check size={20} />自己完成</button>
          <button className="button secondary" onClick={() => onObserve(item.id, "prompted")}>提示后完成</button>
          <button className="button secondary" onClick={() => onObserve(item.id, "together")}><HandHeart size={20} />一起完成</button>
        </div>
      </div>
    </>}
    <footer className="activity-controls">
      <button className="button secondary" onClick={onBack}>{done ? "回到星球地图" : "先休息，稍后继续"}</button>
      {done && <button className="button primary" onClick={onAgain}><RotateCcw size={20} />再练一组<ArrowRight size={20} /></button>}
    </footer>
  </main>;
}
