import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Eye, LockKeyhole, Play } from "lucide-react";
import { courseUnits, lessons } from "../data/lesson";
import {
  courseDone,
  courseUnlocked,
  currentCourse,
  type Progress,
} from "../lib/progress";
export function CoursePath({
  progress,
  previewEnabled,
  onSelect,
}: {
  progress: Progress;
  previewEnabled: boolean;
  onSelect: (n: number) => void;
}) {
  const current = currentCourse(progress);
  const activeUnit = current >= 0 ? Math.floor(current / 8) : Math.floor((lessons.length - 1) / 8);
  const [expandedUnits, setExpandedUnits] = useState<ReadonlySet<number>>(() => new Set([activeUnit]));
  const allExpanded = expandedUnits.size === courseUnits.length;
  const toggleUnit = (unitIndex: number) => {
    setExpandedUnits((currentUnits) => {
      const next = new Set(currentUnits);
      if (next.has(unitIndex)) next.delete(unitIndex);
      else next.add(unitIndex);
      return next;
    });
  };
  return (
    <main className="course-path">
      <div className="activity-heading">
        <div>
          <h1>我的学习路径</h1>
          <p>
            {previewEnabled
              ? `家长预览已开启 · 可直接查看已开发的第 1–${lessons.length} 课`
              : current < 0
              ? "已开发课程全部完成，后续课程准备中。"
              : `当前学到第 ${current + 1} 课 · 学完一课，解锁下一课`}
          </p>
        </div>
        {!previewEnabled && current >= 0 && (
          <button className="button primary" onClick={() => onSelect(current)}>
            继续学习 <ArrowRight size={20} />
          </button>
        )}
      </div>
      <div className="course-path-tools">
        <p>{allExpanded ? "完整 48 课已展开，逐课状态保持不变。" : "先展开当前单元，其他单元可以按需查看。"}</p>
        <button
          className="button secondary"
          onClick={() => setExpandedUnits(allExpanded ? new Set([activeUnit]) : new Set(courseUnits.map((_, index) => index)))}
        >
          {allExpanded ? "收起其他单元" : "展开全部 48 课"}
        </button>
      </div>
      {courseUnits.map((unit, u) => {
        const expanded = expandedUnits.has(u);
        const unitDone = unit.topics.every((_, i) => courseDone(progress, u * 8 + i));
        const unitState = unitDone ? "已完成" : u >= 2 ? "规划中" : previewEnabled ? "家长预览" : u === activeUnit ? "当前单元" : "按课解锁";
        const toggleId = `course-unit-toggle-${u}`;
        return (
          <section className="course-unit" data-expanded={expanded} key={unit.name} aria-label={unit.name}>
            <h2>
              <button
                id={toggleId}
                className="course-unit-toggle"
                aria-expanded={expanded}
                aria-controls={`course-unit-panel-${u}`}
                aria-label={`${unit.name}，第 ${u * 8 + 1}–${u * 8 + 8} 课，${unitState}，${expanded ? "收起" : "展开"}单元`}
                onClick={() => toggleUnit(u)}
              >
                <span className="course-unit-number">{u + 1}</span>
                <span className="course-unit-name">
                  {unit.name}
                  <small>第 {u * 8 + 1}–{u * 8 + 8} 课</small>
                </span>
                <span className="course-unit-state">{unitState}</span>
                <ChevronDown size={24} aria-hidden="true" />
              </button>
            </h2>
            {expanded && (
              <div className="course-unit-panel" id={`course-unit-panel-${u}`} role="region" aria-labelledby={toggleId}>
                {u >= 2 && <p className="unit-note">阶段方向已规划，具体课次内容待细化。</p>}
                <ol className="course-grid" start={u * 8 + 1}>
                  {unit.topics.map((topic, i) => {
                    const n = u * 8 + i;
                    const ready = n < lessons.length;
                    const done = courseDone(progress, n);
                    const unlocked = courseUnlocked(progress, n);
                    const previewable = previewEnabled && ready && !unlocked;
                    const accessible = unlocked || previewable;
                    return (
                      <li key={n}>
                        <button
                          className={`course-node ${done ? "done" : accessible ? "available" : "unavailable"}`}
                          disabled={!accessible}
                          aria-current={n === current ? "step" : undefined}
                          aria-label={`第 ${n + 1} 课，${topic}，${done ? "已完成，可复习" : unlocked ? "继续学习" : previewable ? "家长预览" : ready ? `先完成第 ${n} 课` : "准备中"}`}
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
                            ) : previewable ? (
                              <>
                                <Eye size={16} />
                                家长预览
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
              </div>
            )}
          </section>
        );
      })}
    </main>
  );
}
