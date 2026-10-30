import { useProgress } from "./lib/useProgress";
import { fuel, travel, confirmStation } from "./lib/space";
import { SpaceMap } from "./pages/SpaceMap";
import { DialogueAdventure } from "./pages/DialogueAdventure";
import { dialogueReducer, newDialogue } from "./lib/dialogue";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  House,
  Maximize2,
  Minimize2,
  Rocket,
  Settings2,
  Share2,
  SquarePlus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Cube, PlanetArt } from "./components/Art";
import { Dialog } from "./components/Dialog";
import { CoursePath } from "./pages/CoursePath";
import { GalaxyMap } from "./pages/GalaxyMap";
import { PhonicsLesson } from "./pages/PhonicsLesson";
import { BlendingChallenge } from "./pages/BlendingChallenge";
import { SpeakingChallenge } from "./pages/SpeakingChallenge";
import { lessons, planets, type PlanetId } from "./data/lesson";
import { reviewForLesson } from "./data/reviews";
import { ReviewSoundScan } from "./pages/ReviewSoundScan";
import { ReviewPlacementChallenge } from "./pages/ReviewPlacementChallenge";
import { ReviewDialogueChallenge } from "./pages/ReviewDialogueChallenge";
import {
  selectCourse,
  selectCourseForPreview,
  currentCourse,
  checkBlend,
  completeStep,
  dunesDone,
  forestDone,
  openPlanet,
  openPlanetForPreview,
  planetStatus,
  type Progress,
} from "./lib/progress";
import {
  advanceReviewDialogue,
  completeReviewSound,
  placeReviewWord,
} from "./lib/review";
import { playAudio, stopAudio } from "./lib/audio";
type Modal = "settings" | "fullscreen" | "locked" | "celebration" | null;
type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type WebkitElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};
export default function App() {
  const {
    progress: savedProgress,
    setProgress: saveProgress,
    saveError,
  } = useProgress();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewProgress, setPreviewProgress] = useState<Progress | null>(null);
  const progress =
    previewEnabled && previewProgress ? previewProgress : savedProgress;
  const setProgress = useCallback(
    (
      change: Progress | ((current: Progress) => Progress),
      durable = false,
    ): Promise<boolean> => {
      if (!previewEnabled) return saveProgress(change, durable);
      setPreviewProgress((current) => {
        const base = current ?? savedProgress;
        return typeof change === "function" ? change(base) : change;
      });
      return Promise.resolve(true);
    },
    [previewEnabled, saveProgress, savedProgress],
  );
  const lesson = lessons[progress.lessonIndex];
  const review = reviewForLesson(lesson.id);
  const blendRounds = lesson.blendRounds;
  const STEP_COUNT = lesson.steps.length;
  const goCourse = (n: number) => {
    setProgress((p) =>
      previewEnabled
        ? selectCourseForPreview(p, n)
        : selectCourse(p, n),
    );
    setModal(null);
  };
  const [modal, setModal] = useState<Modal>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>("forest");
  const [notice, setNotice] = useState("");
  const [playingSrc, setPlayingSrc] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [standalone] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
  );
  const audioRequest = useRef(0);
  const appShell = useRef<HTMLDivElement>(null);
  const togglePreview = (enabled: boolean) => {
    audioRequest.current++;
    stopAudio();
    setPlayingSrc(null);
    setFeedback("");
    setNotice("");
    if (enabled) {
      setPreviewProgress(savedProgress);
      setPreviewEnabled(true);
    } else {
      setPreviewEnabled(false);
      setPreviewProgress(null);
    }
  };
  useEffect(() => {
    audioRequest.current++;
    stopAudio();
    setPlayingSrc(null);
    setNotice("");
    setFeedback("");
  }, [
    progress.page,
    progress.lessonIndex,
    progress.step,
    progress.blendRound,
    progress.volume,
    progress.dialogue?.node,
    progress.dialogue?.confirmed,
    progress.dialogue?.hint,
    progress.space.current,
    progress.space.stationStep,
  ]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [progress.page]);
  useEffect(() => () => stopAudio(), []);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    const update = () =>
      setFullscreen(
        Boolean(
          document.fullscreenElement ||
            (document as WebkitDocument).webkitFullscreenElement,
        ),
      );
    document.addEventListener("fullscreenchange", update);
    document.addEventListener("webkitfullscreenchange", update);
    update();
    return () => {
      document.removeEventListener("fullscreenchange", update);
      document.removeEventListener("webkitfullscreenchange", update);
    };
  }, []);
  const toggleFullscreen = async () => {
    const webkitDocument = document as WebkitDocument;
    const active =
      document.fullscreenElement || webkitDocument.webkitFullscreenElement;
    try {
      if (active) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else await webkitDocument.webkitExitFullscreen?.();
        return;
      }
      const target = appShell.current as WebkitElement | null;
      if (!target) return;
      if (target.requestFullscreen) await target.requestFullscreen();
      else if (target.webkitRequestFullscreen)
        await target.webkitRequestFullscreen();
      else setModal("fullscreen");
    } catch {
      setModal("fullscreen");
    }
  };
  const audio = useCallback(
    (src: string) => {
      const request = ++audioRequest.current;
      setPlayingSrc(src);
      void playAudio(src, progress.volume)
        .catch((error: Error) => {
          if (error.message !== "cancelled" && request === audioRequest.current)
            setNotice(error.message);
        })
        .finally(() => {
          if (request === audioRequest.current) setPlayingSrc(null);
        });
    },
    [progress.volume],
  );
  const back = () => setProgress((p) => ({ ...p, page: "map" }));
  const enter = (id: PlanetId) => {
    if (!previewEnabled && planetStatus(progress, id) === "locked") {
      setSelectedPlanet(id);
      setModal("locked");
      return;
    }
    setModal(null);
    setProgress((p) =>
      previewEnabled ? openPlanetForPreview(p, id) : openPlanet(p, id),
    );
  };
  const celebrate = (id: PlanetId) => {
    setSelectedPlanet(id);
    setModal("celebration");
  };
  const finishLetter = () => {
    const next = review
      ? completeReviewSound(progress)
      : completeStep(progress);
    if (progress.step === STEP_COUNT - 1 && forestDone(next)) {
      setProgress({ ...next, page: "map" });
      celebrate("forest");
    } else setProgress(next);
  };
  const changeStep = (n: number) => {
    if (
      n >= 0 &&
      n < STEP_COUNT &&
      (n === 0 ||
        progress.completed.includes(n - 1) ||
        progress.completed.includes(n))
    )
      setProgress((p) => ({ ...p, step: n }));
  };
  const changeDraft = (letters: string[]) => {
    setFeedback("");
    setProgress((p) => ({ ...p, blendDraft: letters, blendSolved: false }));
  };
  const check = () => {
    const next = checkBlend(progress);
    if (next === progress) {
      setFeedback("再听一次，换一换方块。");
      return;
    }
    setProgress(next);
    setFeedback("");
    if (progress.volume > 0) audio(blendRounds[progress.blendRound].audio);
  };
  const nextRound = () => {
    if (review) {
      const currentBatch = review.placementBatches[progress.blendRound];
      const currentBatchDone = currentBatch.every((word) => {
        const roundIndex = lesson.blendRounds.findIndex(
          (round) => round.word === word,
        );
        return progress.reviewPlacements.includes(roundIndex);
      });
      if (!currentBatchDone) return;
      if (progress.blendRound === review.placementBatches.length - 1) {
        setProgress((p) => ({ ...p, page: "map" }));
        celebrate("dunes");
      } else {
        setProgress((p) => ({ ...p, blendRound: p.blendRound + 1 }));
      }
      return;
    }
    if (!progress.blendSolved) return;
    if (progress.blendRound === blendRounds.length - 1 && dunesDone(progress)) {
      setProgress((p) => ({ ...p, page: "map" }));
      celebrate("dunes");
    } else
      setProgress((p) => ({
        ...p,
        blendRound: p.blendRound + 1,
        blendDraft: [],
        blendSolved: false,
      }));
  };
  const finishSpeaking = () => {
    if (review) {
      if (!dunesDone(progress)) return;
      const next = advanceReviewDialogue(progress);
      if (next.speakingCompleted) {
        setProgress({ ...next, page: "map" });
        celebrate("crystal");
      } else setProgress(next);
      return;
    }
    if (
      !dunesDone(progress) ||
      (progress.lessonIndex === 0 && progress.dialogue?.node !== "completed")
    )
      return;
    setProgress((p) => ({ ...p, speakingCompleted: true, page: "map" }));
    celebrate("crystal");
  };
  const planet = planets.find((p) => p.id === selectedPlanet)!;
  const planetIndex = planets.findIndex((p) => p.id === selectedPlanet);
  const nextPlanet = planets[planetIndex + 1];
  const previousPlanet = planets[Math.max(0, planetIndex - 1)];
  const muted = progress.volume === 0;
  const pageTitle =
    progress.page === "lesson"
      ? planets[0].name
      : progress.page === "blending"
        ? planets[1].name
        : planets[2].name;
  return (
    <div className="app-shell" ref={appShell}>
      <header className="topbar">
        {progress.page === "map" ? (
          <div className="brand">
            <svg viewBox="0 0 64 70" aria-hidden="true">
              <Cube x={3} y={19} size={29} />
            </svg>
            <span>Tom 的星球</span>
          </div>
        ) : (
          <>
            <button
              className="back-button"
              aria-label="返回星球地图"
              onClick={back}
            >
              <ArrowLeft size={22} />
              <span>星球地图</span>
            </button>
            <span className="header-title">
              {progress.page === "space"
                ? "星际航行"
                : progress.page === "courses"
                  ? "课程总览"
                  : `第 ${progress.lessonIndex + 1} 课 · ${pageTitle}`}
            </span>
          </>
        )}
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label={muted ? "开启声音" : "关闭声音"}
            onClick={() =>
              setProgress((p) => ({ ...p, volume: muted ? 0.8 : 0 }))
            }
          >
            {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
          {!standalone && (
            <button
              className="icon-button"
              aria-label={fullscreen ? "退出全屏" : "进入全屏"}
              title={fullscreen ? "退出全屏" : "进入全屏"}
              onClick={() => void toggleFullscreen()}
            >
              {fullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
            </button>
          )}
          <button
            className="parent-button"
            aria-label="家长指南与设置"
            onClick={() => setModal("settings")}
          >
            <Settings2 size={22} />
            <span>{previewEnabled ? "预览中" : "家长"}</span>
          </button>
        </div>
      </header>
      {progress.page === "space" ? (
        <SpaceMap
          progress={progress}
          onPlay={audio}
          onTravel={(target) => setProgress((p) => travel(p, target), true)}
          onConfirm={(step) =>
            setProgress((p) => confirmStation(p, step), true)
          }
          onLearn={() =>
            goCourse(currentCourse(progress) < 0 ? 0 : currentCourse(progress))
          }
        />
      ) : progress.page === "courses" ? (
        <CoursePath
          progress={progress}
          previewEnabled={previewEnabled}
          onSelect={goCourse}
        />
      ) : progress.page === "map" ? (
        <GalaxyMap
          progress={progress}
          previewEnabled={previewEnabled}
          onEnter={enter}
          onSpace={() => setProgress((p) => ({ ...p, page: "space" }))}
          onCourses={() => setProgress((p) => ({ ...p, page: "courses" }))}
          onContinue={() =>
            goCourse(currentCourse(progress) < 0 ? 0 : currentCourse(progress))
          }
        />
      ) : progress.page === "lesson" && review ? (
        <ReviewSoundScan
          progress={progress}
          review={review}
          onStep={changeStep}
          onComplete={finishLetter}
          onPlay={audio}
        />
      ) : progress.page === "lesson" ? (
        <PhonicsLesson
          progress={progress}
          onStep={changeStep}
          onComplete={finishLetter}
          onPlay={audio}
          playingSrc={playingSrc}
        />
      ) : progress.page === "blending" && review ? (
        <ReviewPlacementChallenge
          progress={progress}
          review={review}
          onPlay={audio}
          onPlace={(roundIndex) =>
            setProgress((p) => placeReviewWord(p, roundIndex))
          }
          onNext={nextRound}
        />
      ) : progress.page === "blending" ? (
        <BlendingChallenge
          progress={progress}
          onPlay={audio}
          onDraft={changeDraft}
          onCheck={check}
          onNext={nextRound}
          feedback={feedback}
        />
      ) : review ? (
        <ReviewDialogueChallenge
          progress={progress}
          review={review}
          onPlay={audio}
          onConfirm={finishSpeaking}
        />
      ) : progress.lessonIndex === 0 ? (
        <DialogueAdventure
          state={progress.dialogue ?? newDialogue()}
          onPlay={audio}
          onComplete={finishSpeaking}
          onAction={(action) =>
            setProgress((p) =>
              dunesDone(p)
                ? {
                    ...p,
                    dialogue: dialogueReducer(
                      p.dialogue ?? newDialogue(),
                      action,
                    ),
                  }
                : p,
            )
          }
        />
      ) : (
        <SpeakingChallenge
          key={lesson.id}
          speakingTask={lesson.speakingTask}
          onPlay={audio}
          onComplete={finishSpeaking}
        />
      )}
      {saveError && (
        <div className="storage-warning" role="status">
          {saveError}
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button aria-label="关闭提示" onClick={() => setNotice("")}>
            <X size={20} />
          </button>
        </div>
      )}
      {modal && (
        <Dialog
          title={
            modal === "settings"
              ? "家长陪伴指南"
              : modal === "fullscreen"
                ? "在 iPad 上全屏"
                : modal === "locked"
                  ? `先去${previousPlanet.name}`
                  : `${planet.name}点亮啦！`
          }
          onClose={() => setModal(null)}
        >
          {modal === "settings" && (
            <>
              <p>
                按顺序完成「认声音 → 拼单词 →
                开口说」。完成一颗星球后，它会发光、显示勾号，并解锁下一颗。
              </p>
              {progress.page === "lesson" && (
                <div className="modal-note">
                  {review ? (
                    <>
                      <b>声音扫描</b>
                      <p>
                        听目标音，再点场景中以该声音开头的物品。连续两次选错后会高亮正确物品，不扣分。
                      </p>
                    </>
                  ) : (
                    <>
                      <b>{lesson.steps[progress.step].grapheme} 的领读提示</b>
                      <p>{lesson.steps[progress.step].parentTip}</p>
                      <p>这三个例词只用于听说拓展，不要求孩子独立拼读。</p>
                    </>
                  )}
                </div>
              )}
              {progress.page === "blending" && (
                <div className="modal-note">
                  {review ? (
                    <>
                      <b>词语归位</b>
                      <p>
                        本课练习 {blendRounds.map((r) => r.word).join("、")}
                        。可以拖动单词，也可以先点单词再点对应物体；所有词都只使用已教规则。
                      </p>
                    </>
                  ) : (
                    <>
                      本课练习 {blendRounds.map((r) => r.word).join("、")}
                      ，只使用本课和之前学过的字母音。先听单词，再点选字母；拼错可以点格子移除，或重新放。
                    </>
                  )}
                </div>
              )}
              {progress.page === "speaking" && (
                <div className="modal-note">
                  {review
                    ? "复习课在刚刚整理好的飞船场景中完成多轮对话。先听机器人，再观察高亮物体并尝试回答；每轮可临时录音回放，由家长确认推进。"
                    : "口语练习可临时录音、回放和重录；录音最长 30 秒，仅在当前轮次或页面内使用，换轮或离开时清除，不上传、不保存。口语由家长确认，系统不判断发音是否准确。"}
                </div>
              )}
              <div
                className={`parent-preview ${previewEnabled ? "active" : ""}`}
              >
                <div>
                  <b>家长预览模式</b>
                  <p>
                    直接查看第 1–{lessons.length}
                    课和课内三颗星球。预览操作只在当前页面生效，不保存学习完成状态，也不发放燃料。
                  </p>
                </div>
                <label className="toggle-control">
                  <input
                    type="checkbox"
                    aria-label="家长预览模式"
                    checked={previewEnabled}
                    onChange={(event) => togglePreview(event.target.checked)}
                  />
                  <span className="toggle-track" aria-hidden="true">
                    <span />
                  </span>
                  <strong>{previewEnabled ? "已开启" : "已关闭"}</strong>
                </label>
                {previewEnabled && (
                  <button
                    className="button secondary full"
                    onClick={() => {
                      setModal(null);
                      setProgress((p) => ({ ...p, page: "courses" }));
                    }}
                  >
                    <BookOpen size={20} />
                    查看可预览课程
                  </button>
                )}
              </div>
              <div className="modal-note">
                <b>探索燃料：{fuel(progress.space)}</b>
                <p>
                  每课认声音 +30、拼读 +20、口语 +30、整课完成 +10，共
                  90。已有完成记录自动补发；复习和重玩不重复领取。首次飞往虚构补给站花费
                  50，往返免费。补给方块与收藏卡不增加燃料。
                </p>
              </div>
              <label className="volume-label" htmlFor="volume">
                示范音量 <b>{Math.round(progress.volume * 100)}%</b>
              </label>
              <input
                id="volume"
                type="range"
                min="0"
                max="1"
                step=".1"
                value={progress.volume}
                onChange={(e) =>
                  setProgress((p) => ({ ...p, volume: Number(e.target.value) }))
                }
              />
              <p>iPad 上也可使用设备音量键调整。</p>
              <div className="modal-note">
                <b>试听音频待人工校对</b>
                <p>
                  当前为合成试听音。请家长先试听，或关闭声音后领读。学习进度保存在当前浏览器，更换设备不会自动同步。
                </p>
              </div>
              <button
                className="button primary full"
                onClick={() => setModal(null)}
              >
                返回学习 <Check size={21} />
              </button>
            </>
          )}
          {modal === "fullscreen" && (
            <>
              <p>
                当前浏览器不允许网页直接隐藏顶部栏。把网站添加到主屏幕后，从主屏幕打开即可使用独立窗口。
              </p>
              <ol className="fullscreen-steps">
                <li>
                  <Share2 size={22} />
                  <span>在 Safari 工具栏点击「分享」。</span>
                </li>
                <li>
                  <SquarePlus size={22} />
                  <span>选择「添加到主屏幕」。</span>
                </li>
                <li>
                  <House size={22} />
                  <span>回到主屏幕，点击「Tom 自然拼读」。</span>
                </li>
              </ol>
              <div className="modal-note">
                <b>说明</b>
                <p>
                  主屏幕模式会隐藏 Safari 顶部栏，但学习记录仍保存在当前设备。首次添加和打开需要由家长操作。
                </p>
              </div>
              <button
                className="button primary full"
                onClick={() => setModal(null)}
              >
                知道了 <Check size={21} />
              </button>
            </>
          )}
          {modal === "locked" && (
            <>
              <p>
                点亮{previousPlanet.name}后，就能进入{planet.name}。
              </p>
              <button
                className="button primary full"
                onClick={() => enter(previousPlanet.id)}
              >
                去{previousPlanet.name}
                <ArrowRight size={21} />
              </button>
            </>
          )}
          {modal === "celebration" && (
            <>
              <div className="celebration-planet">
                <PlanetArt kind={planet.art} />
                <span>
                  <Check size={35} strokeWidth={3} />
                </span>
              </div>
              <p className="celebration-message">
                {nextPlanet
                  ? `下一站：${nextPlanet.name}`
                  : `第 ${progress.lessonIndex + 1} 课完成啦！${progress.lessonIndex + 1 < lessons.length ? "下一课已解锁。" : "已开发课程全部完成！"}`}
              </p>
              <p className="celebration-message">
                探索燃料：{fuel(progress.space)}
              </p>
              {!previewEnabled && (
                <button
                  className="button secondary full"
                  onClick={() => {
                    setModal(null);
                    setProgress((p) => ({ ...p, page: "space" }));
                  }}
                >
                  <Rocket size={21} />
                  驾驶飞船
                </button>
              )}
              {!nextPlanet && progress.lessonIndex + 1 < lessons.length && (
                <button
                  className="button primary full"
                  onClick={() => goCourse(progress.lessonIndex + 1)}
                >
                  去第 {progress.lessonIndex + 2} 课 <ArrowRight size={21} />
                </button>
              )}
              {nextPlanet && (
                <button
                  className="button primary full"
                  onClick={() => enter(nextPlanet.id)}
                >
                  去{nextPlanet.name}
                  <ArrowRight size={21} />
                </button>
              )}
              <button
                className={`button ${nextPlanet ? "secondary" : "primary"} full`}
                onClick={() => {
                  setModal(null);
                  back();
                }}
              >
                <House size={21} /> 回到星球地图
              </button>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}
