import { lessons } from "../data/lesson";
import { lessonGuide } from "../data/learning";
import { outcomeLabels, practiceItems } from "../lib/practice";
import type { Progress } from "../lib/progress";

export function ParentLearningCard({ progress }: { progress: Progress }) {
  const lesson = lessons[progress.lessonIndex];
  const guide = lessonGuide(lesson);
  const latest = progress.practice?.observations.slice(-3).reverse() ?? [];
  return <section className="parent-learning-card" aria-label="本课陪学卡">
    <span className="eyebrow">第 {progress.lessonIndex + 1} 课 · 陪学卡</span>
    <h3>{guide.goal}</h3>
    <dl>
      <div><dt>声音</dt><dd>{guide.sounds}</dd></div>
      <div><dt>拼读</dt><dd>{guide.words.join(" / ")}</dd></div>
      <div><dt>开口说</dt><dd>{guide.expression}</dd></div>
    </dl>
    <p>{guide.support}</p>
    <p>合音时用手指从左到右指着字素，再连起来读整词。需要帮助时一起读，不扣奖励。</p>
    {latest.length > 0 && <div className="parent-recent"><b>最近的复习观察</b>{latest.map((observation) => <div key={observation.turn}><strong>{practiceItems.find((item) => item.id === observation.itemId)?.text}</strong><span>{outcomeLabels[observation.outcome]}</span></div>)}<p>只反映本次尝试，不作为掌握或发音准确的判定。</p></div>}
  </section>;
}
