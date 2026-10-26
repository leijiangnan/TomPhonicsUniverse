import { ArrowRight, Check, LockKeyhole, Play } from "lucide-react";
import { courseUnits, lessons } from "../data/lesson";
import {
  courseDone,
  courseUnlocked,
  currentCourse,
  type Progress,
} from "../lib/progress";
export function CoursePath({
  progress,
  onSelect,
}: {
  progress: Progress;
  onSelect: (n: number) => void;
}) {
  const current = currentCourse(progress);
  return (
    <main className="course-path">
      <div className="activity-heading">
        <div>
          <h1>我的学习路径</h1>
          <p>
            {current < 0
              ? "前 3 课已完成，后续课程准备中。"
              : `当前学到第 ${current + 1} 课 · 学完一课，解锁下一课`}
          </p>
        </div>
        {current >= 0 && (
          <button className="button primary" onClick={() => onSelect(current)}>
            继续学习 <ArrowRight size={20} />
          </button>
        )}
      </div>
      {courseUnits.map((unit, u) => (
        <section className="course-unit" key={unit.name} aria-label={unit.name}>
          <h2>
            <span>{u + 1}</span>
            {unit.name}
            <small>
              第 {u * 8 + 1}–{u * 8 + 8} 课
            </small>
          </h2>
          {u >= 2 && (
            <p className="unit-note">阶段方向已规划，具体课次内容待细化。</p>
          )}
          <ol className="course-grid" start={u * 8 + 1}>
            {unit.topics.map((topic, i) => {
              const n = u * 8 + i;
              const ready = n < lessons.length;
              const done = courseDone(progress, n);
              const unlocked = courseUnlocked(progress, n);
              return (
                <li key={n}>
                  <button
                    className={`course-node ${done ? "done" : unlocked ? "available" : "unavailable"}`}
                    disabled={!unlocked}
                    aria-current={n === current ? "step" : undefined}
                    aria-label={`第 ${n + 1} 课，${topic}，${done ? "已完成，可复习" : unlocked ? "继续学习" : ready ? `先完成第 ${n} 课` : "准备中"}`}
                    onClick={() => onSelect(n)}
                  >
                    <span className="course-number">
                      {n + 1}
                      {done && <Check size={20} />}
                    </span>
                    <strong>{topic}</strong>
                    <span className="course-state">
                      {done ? (
                        "已完成 · 复习"
                      ) : unlocked ? (
                        <>
                          <Play size={16} />
                          学到这里
                        </>
                      ) : ready ? (
                        <>
                          <LockKeyhole size={16} />
                          先完成第 {n} 课
                        </>
                      ) : (
                        "准备中"
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </main>
  );
}
