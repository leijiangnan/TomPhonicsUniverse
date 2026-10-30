import { fuel } from "../lib/space";
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Play,
  RotateCcw,
  Star,
  Rocket,
} from "lucide-react";
import { PlanetArt } from "../components/Art";
import { lessons, planets, type PlanetId } from "../data/lesson";
import {
  courseDone,
  currentCourse,
  litCount,
  planetStatus,
  type Progress,
} from "../lib/progress";
export function GalaxyMap({
  progress,
  previewEnabled,
  onEnter,
  onCourses,
  onContinue,
  onSpace,
}: {
  progress: Progress;
  previewEnabled: boolean;
  onSpace: () => void;
  onCourses: () => void;
  onContinue: () => void;
  onEnter: (id: PlanetId) => void;
}) {
  const count = litCount(progress);
  return (
    <main className="map-page">
      <div className="course-banner">
        <span>
          {previewEnabled
            ? `家长预览 · 正在查看第 ${progress.lessonIndex + 1} 课`
            : currentCourse(progress) < 0
            ? "字母启航已完成"
            : `当前学到第 ${currentCourse(progress) + 1} 课`}{" "}
          · 已完成 {lessons.filter((_, n) => courseDone(progress, n)).length} /
          48 课
        </span>
        <div className="map-navigation">
          <button
            className="button voyage-entry"
            disabled={previewEnabled}
            onClick={onSpace}
          >
            <Rocket size={22} />
            {previewEnabled ? (
              "预览不计燃料"
            ) : (
              <>
                驾驶飞船 <span>{fuel(progress.space)} 燃料</span>
              </>
            )}
          </button>
          <button className="button secondary" onClick={onCourses}>
            全部课程 <ArrowRight size={20} />
          </button>
        </div>
      </div>
      <div className="map-heading">
        <div>
          <h1>
            第 {progress.lessonIndex + 1} 课 ·{" "}
            {lessons[progress.lessonIndex].focus}
          </h1>
          <p>
            {count === planets.length
              ? currentCourse(progress) < 0
                ? "已开发课程全部完成，随时可以复习。"
                : "本课已完成，可以复习或继续下一课。"
              : "完成一站，就点亮一颗。"}
          </p>
        </div>
        <div
          className="lit-total"
          aria-label={`已点亮 ${count} / ${planets.length} 颗星球`}
        >
          <Star fill="currentColor" size={25} />
          <strong>
            {count} / {planets.length}
          </strong>
          <span>已点亮</span>
        </div>
      </div>
      {count === 3 && (
        <button
          className="button primary continue-course"
          onClick={
            previewEnabled || currentCourse(progress) < 0
              ? onCourses
              : onContinue
          }
        >
          {previewEnabled
            ? "查看其他课程"
            : currentCourse(progress) < 0
            ? "查看学习路径"
            : `继续第 ${currentCourse(progress) + 1} 课`}{" "}
          <ArrowRight size={20} />
        </button>
      )}
      <section
        className="planet-route"
        aria-label="全部星球：认声音、拼单词、开口说"
      >
        {planets.map((planet, i) => {
          const status = planetStatus(progress, planet.id);
          const previewable = previewEnabled && status === "locked";
          return (
            <div className="route-stop" key={planet.id}>
              <button
                className={`planet-card status-${previewable ? "preview" : status}`}
                onClick={() => onEnter(planet.id)}
                aria-label={`${planet.name}，${status === "completed" ? "已点亮，再玩一次" : status === "current" ? "开始探索" : previewable ? "家长预览" : `先完成${planets[i - 1].name}`}`}
              >
                <div className="planet-card-top">
                  <span className="planet-number">{i + 1}</span>
                  <span className="planet-status">
                    {status === "completed" ? (
                      <>
                        <Check size={21} /> 已点亮
                      </>
                    ) : status === "current" ? (
                      "到这里啦"
                    ) : previewable ? (
                      "可预览"
                    ) : (
                      <>
                        <LockKeyhole size={18} /> 未解锁
                      </>
                    )}
                  </span>
                </div>
                <div className="planet-illustration">
                  <PlanetArt kind={planet.art} />
                  {status === "completed" && (
                    <span className="planet-lit-check">
                      <Check size={28} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <h2>{planet.name}</h2>
                <p className="planet-activity">{planet.activity}</p>
                <span className="planet-action">
                  {status === "completed" ? (
                    <>
                      <RotateCcw size={19} /> 再玩一次
                    </>
                  ) : status === "current" ? (
                    <>
                      <Play size={19} fill="currentColor" />{" "}
                      {planet.id === "forest" && progress.completed.length
                        ? "继续学习"
                        : "开始"}
                    </>
                  ) : previewable ? (
                    <>
                      <Play size={19} fill="currentColor" /> 家长预览
                    </>
                  ) : (
                    `先完成${planets[i - 1].name}`
                  )}
                </span>
              </button>
              {i < planets.length - 1 && (
                <ArrowRight
                  className={`route-arrow ${status === "completed" ? "connected" : ""}`}
                  aria-hidden="true"
                  size={26}
                />
              )}
            </div>
          );
        })}
      </section>
    </main>
  );
}
