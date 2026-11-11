import { useProgress } from "./lib/useProgress";
import { fuel, travel, confirmStation, stationFound, STATION_COST } from "./lib/space";
import { celebrationFuelCopy } from "./lib/celebration";
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
  Music2,
  Settings2,
  Share2,
  SquarePlus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Cube, PlanetArt } from "./components/Art";
import { Dialog } from "./components/Dialog";
import { SpaceBackground } from "./components/SpaceBackground";
import { useAtmosphere } from "./lib/useAtmosphere";
import { useBackgroundMusic } from "./lib/useBackgroundMusic";
import { SoundPanel } from "./components/SoundPanel";
import { ParentLearningCard } from "./components/ParentLearningCard";
import { ParentBackup } from "./components/ParentBackup";
import { MissionBrief } from "./components/MissionBrief";
import { QuickPractice } from "./pages/QuickPractice";
import { hintPractice, observePractice, practiceItems, practicePool, startPractice } from "./lib/practice";
import { wordLifeReward, wordLifeScope, type WordLifeWord } from "./lib/wordLife";
import { WordLifeReward } from "./components/wordLife/WordLifeReward";
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
  updateBlendDraft,
  type BlendDraftChange,
} from "./lib/progress";
import {
  advanceReviewDialogue,
  completeReviewSound,
  placeReviewWord,
} from "./lib/review";
import { playAudio, stopAudio } from "./lib/audio";
type Modal = "sound" | "settings" | "fullscreen" | "locked" | "celebration" | null;
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
    confirmedProgress,
    ready,
    retry,
  } = useProgress();
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const [previewProgress, setPreviewProgress] = useState<Progress | null>(null);
  const previewProgressRef = useRef<Progress | null>(null);
  const progress =
    previewEnabled && previewProgress ? previewProgress : savedProgress;
  const setProgress = useCallback(
    (
      change: Progress | ((current: Progress) => Progress),
      durable = false,
    ): Promise<boolean> => {
      if (!previewEnabled) return saveProgress(change, durable);
      const base = previewProgressRef.current ?? savedProgress;
      const next = typeof change === "function" ? change(base) : change;
      previewProgressRef.current = next;
      setPreviewProgress(next);
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
  const learning = ["lesson", "blending", "speaking", "practice"].includes(progress.page);
  const musicAllowed = !learning && (!modal || modal === "sound");
  const music = useBackgroundMusic({ allowed: musicAllowed, masterVolume: progress.volume });
  const musicAction = useRef(0);
  const ambientEnabled = progress.preferences?.ambientMotion ?? true;
  const rewardScope = wordLifeScope(progress.page, progress.lessonIndex, progress.blendRound);
  const rewardSerial = useRef(0);
  const [wordLife, setWordLife] = useState<{ word: WordLifeWord; scope: string; id: number } | null>(null);
  const activeReward = wordLife && wordLife.scope === rewardScope ? wordLife : null;
  const showWordLife = (text: string) => {
    const reward = wordLifeReward(text);
    if (!reward) return;
    setWordLife({ word: reward, scope: rewardScope, id: ++rewardSerial.current });
  };
  useEffect(() => { setWordLife(null); }, [rewardScope]);
  const { running: atmosphereRunning, reducedMotion } = useAtmosphere({
    active: ["map", "space", "courses"].includes(progress.page) && !modal,
    enabled: ambientEnabled,
  });
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId>("forest");
  const [celebrationGain, setCelebrationGain] = useState<number | null>(0);
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
  const taskKey = `${previewEnabled}:${progress.lessonIndex}:${progress.page}:${
    progress.page === "lesson" ? progress.step
      : progress.page === "blending" ? progress.blendRound
      : progress.page === "speaking" ? review ? progress.reviewDialogueStep : progress.dialogue?.node ?? "single"
      : progress.page === "practice" ? `${progress.practice?.turn}:${progress.practice?.session?.index}`
      : progress.page === "space" ? `${progress.space.current}:${progress.space.stationStep}` : ""
  }`;
  const taskContext = useRef(taskKey);
  taskContext.current = taskKey;
  const togglePreview = (enabled: boolean) => {
    audioRequest.current++;
    stopAudio();
    setPlayingSrc(null);
    setFeedback("");
    setNotice("");
    if (enabled) {
      previewProgressRef.current = savedProgress;
      setPreviewProgress(savedProgress);
      setPreviewEnabled(true);
    } else {
      previewProgressRef.current = null;
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
    appShell.current?.scrollTo(0, 0);
  }, [progress.page]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (document.querySelector("dialog[open]")) return;
      const target = appShell.current?.querySelector<HTMLElement>("[data-task-focus]")
        ?? appShell.current?.querySelector<HTMLElement>("main h1");
      if (target) {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [taskKey]);
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
  const audioSequence = useCallback((sources: readonly string[]) => {
    const request = ++audioRequest.current;
    stopAudio();
    void (async () => {
      try {
        for (const source of sources) {
          if (request !== audioRequest.current) return;
          setPlayingSrc(source);
          await playAudio(source, progress.volume);
        }
      } catch (error) {
        if (request === audioRequest.current && error instanceof Error && error.message !== "cancelled") setNotice(error.message);
      } finally {
        if (request === audioRequest.current) setPlayingSrc(null);
      }
    })();
  }, [progress.volume]);
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
  const celebrate = (id: PlanetId, gain: number | null) => {
    setSelectedPlanet(id);
    setCelebrationGain(gain);
    setModal("celebration");
  };
  const finishLetter = async () => {
    const expected = progress.step;
    const wasDone = forestDone(progress);
    let finished = false;
    const saved = await setProgress((p) => {
      if (p.page !== "lesson" || p.lessonIndex !== progress.lessonIndex || p.step !== expected) return p;
      const next = review ? completeReviewSound(p) : completeStep(p);
      finished = expected === STEP_COUNT - 1 && forestDone(next);
      return finished ? { ...next, page: "map" } : next;
    });
    if (saved && finished) celebrate("forest", !previewEnabled && !wasDone ? 30 : 0);
  };
  const changeStep = (n: number) => {
    setProgress((p) => p.page === "lesson" && p.lessonIndex === progress.lessonIndex && n >= 0 && n < STEP_COUNT &&
      (n === 0 || p.completed.includes(n - 1) || p.completed.includes(n)) ? { ...p, step: n } : p);
  };
  const changeDraft = (change: BlendDraftChange) => {
    setFeedback("");
    setProgress((p) => updateBlendDraft(p, change));
  };
  const dunesFirstCompletion = useRef<boolean | null>(null);
  const check = async (): Promise<boolean | null> => {
    const context = taskContext.current;
    const wasDone = dunesDone(progress);
    let attempted = false, solved = false;
    const saved = await setProgress((p) => {
      if (p.page !== "blending" || p.lessonIndex !== progress.lessonIndex || p.blendRound !== progress.blendRound || p.blendSolved) return p;
      attempted = true;
      const next = checkBlend(p);
      solved = next !== p;
      return next;
    });
    if (!saved || !attempted || context !== taskContext.current) return null;
    if (solved && progress.blendRound === blendRounds.length - 1)
      dunesFirstCompletion.current = !wasDone;
    setFeedback(solved ? "" : "再听一次，换一换方块。");
    if (solved && progress.volume > 0) audio(blendRounds[progress.blendRound].audio);
    if (solved) showWordLife(blendRounds[progress.blendRound].word);
    return solved;
  };
  const nextRound = async () => {
    let finished = false;
    const saved = await setProgress((p) => {
      if (p.page !== "blending" || p.lessonIndex !== progress.lessonIndex || p.blendRound !== progress.blendRound) return p;
      if (review) {
        const batchDone = review.placementBatches[p.blendRound].every((word) => p.reviewPlacements.includes(lesson.blendRounds.findIndex((round) => round.word === word)));
        if (!batchDone) return p;
        finished = p.blendRound === review.placementBatches.length - 1;
        return finished ? { ...p, page: "map" } : { ...p, blendRound: p.blendRound + 1 };
      }
      if (!p.blendSolved) return p;
      finished = p.blendRound === blendRounds.length - 1 && dunesDone(p);
      return finished ? { ...p, page: "map" } : { ...p, blendRound: p.blendRound + 1, blendDraft: [], blendSolved: false };
    });
    if (saved && finished) {
      const gain = previewEnabled ? 0 : dunesFirstCompletion.current === null ? null : dunesFirstCompletion.current ? 20 : 0;
      celebrate("dunes", gain);
    }
  };
  const finishSpeaking = async () => {
    const wasDone = progress.speakingCompleted;
    let finished = false;
    const saved = await setProgress((p) => {
      if (p.page !== "speaking" || p.lessonIndex !== progress.lessonIndex || !dunesDone(p)) return p;
      if (review) {
        if (p.reviewDialogueStep !== progress.reviewDialogueStep) return p;
        const next = advanceReviewDialogue(p);
        finished = next.reviewDialogueStep === review.dialogue.length;
        return finished ? { ...next, page: "map" } : next;
      }
      if (p.lessonIndex === 0 && p.dialogue?.node !== "completed") return p;
      finished = true;
      return { ...p, speakingCompleted: true, page: "map" };
    });
    if (saved && finished) celebrate("crystal", !previewEnabled && !wasDone ? 40 : 0);
  };
  const planet = planets.find((p) => p.id === selectedPlanet)!;
  const planetIndex = planets.findIndex((p) => p.id === selectedPlanet);
  const nextPlanet = planets[planetIndex + 1];
  const previousPlanet = planets[Math.max(0, planetIndex - 1)];
  const hasNextCourse = !nextPlanet && progress.lessonIndex + 1 < lessons.length;
  const celebrationFuel = celebrationFuelCopy({
    gain: celebrationGain,
    balance: fuel(progress.space),
    cost: STATION_COST,
    visited: stationFound(progress.space),
    preview: previewEnabled,
  });
  const muted = progress.volume === 0;
  const pageTitle =
    progress.page === "lesson"
      ? planets[0].name
      : progress.page === "blending"
        ? planets[1].name
        : planets[2].name;
  if (!ready) return <div className="app-shell"><main className="startup-panel" aria-live="polite">
    <h1>连接学习存档</h1>
    <p>{saveError || "正在读取电脑上的学习进度…"}</p>
    {saveError && <button className="button primary" onClick={() => void retry()}>重新连接</button>}
  </main></div>;
  return (
    <div className={`app-shell${previewEnabled ? " preview-session" : ""}`} ref={appShell}
      data-ambient-motion={atmosphereRunning ? "running" : "paused"}
      data-ambient-enabled={ambientEnabled} data-learning={learning}>
      <SpaceBackground active={atmosphereRunning} enabled={ambientEnabled} />
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
                  : progress.page === "practice"
                    ? "轻复习"
                  : `第 ${progress.lessonIndex + 1} 课 · ${pageTitle}`}
            </span>
          </>
        )}
        <div className="header-actions">
          <button
            className={`sound-button${music.playing ? " music-playing" : ""}${muted ? " muted" : ""}`}
            aria-label={`声音与音乐设置，${muted ? "声音已关闭" : music.playing ? "音乐播放中" : "声音已开启"}`}
            aria-haspopup="dialog"
            title="声音与音乐"
            onClick={() => setModal("sound")}
          >
            {muted ? <VolumeX size={24} /> : music.playing ? <Music2 size={24} /> : <Volume2 size={24} />}
            <span>{muted ? "静音" : music.playing ? "音乐中" : "声音"}</span>
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
      {progress.page === "practice" ? (
        <QuickPractice progress={progress}
          onHint={(id, sources) => { setProgress((p) => hintPractice(p, id)); audioSequence(sources); }}
          onObserve={(id, outcome) => {
            stopAudio();
            audioRequest.current++;
            setPlayingSrc(null);
            const current = progress.practice?.session?.itemIds[progress.practice.session.index] === id;
            const text = practiceItems.find((item) => item.id === id)?.text ?? "";
            setProgress((p) => observePractice(p, id, outcome));
            if (!current) return;
            const reward = wordLifeReward(text);
            if (reward) setWordLife({ word: reward, scope: rewardScope, id: ++rewardSerial.current });
            else setWordLife(null);
          }}
          onAgain={() => setProgress((p) => startPractice(p, true))}
          onBack={back} />
      ) : progress.page === "space" ? (
        <SpaceMap
          progress={progress}
          atmosphereRunning={atmosphereRunning}
          onPlay={audio}
          onPractice={practicePool(progress).length ? () => setProgress((p) => startPractice(p)) : undefined}
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
          onPractice={practicePool(progress).length ? () => setProgress((p) => startPractice(p)) : undefined}
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
          key={`${previewEnabled}:${lesson.id}:${progress.blendRound}`}
          progress={progress}
          onPlay={audio}
          onPlaySequence={audioSequence}
          playingSrc={playingSrc}
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
              dunesDone(p) && (p.dialogue?.node ?? "greeting") === (progress.dialogue?.node ?? "greeting")
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
          progress={progress}
          onPlay={audio}
          onComplete={finishSpeaking}
        />
      )}
      {activeReward && (
        <WordLifeReward
          key={activeReward.id}
          word={activeReward.word}
          ambientMotion={ambientEnabled}
          reducedMotion={reducedMotion}
          onDismiss={() => setWordLife(null)}
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
            modal === "sound"
              ? "声音与音乐"
              : modal === "settings"
              ? "家长陪伴指南"
              : modal === "fullscreen"
                ? "在 iPad 上全屏"
                : modal === "locked"
                  ? `先去${previousPlanet.name}`
                  : `${planet.name}点亮啦！`
          }
          onClose={() => setModal(null)}
        >
          {modal === "sound" && <SoundPanel muted={muted} musicAllowed={musicAllowed}
            musicIntent={music.intent} musicPlaying={music.playing} musicLoading={music.loading} musicError={music.error}
            onToggleSound={() => {
              musicAction.current++;
              setProgress((p) => ({ ...p, volume: p.volume === 0 ? 0.8 : 0 }));
            }}
            onToggleMusic={() => {
              const action = ++musicAction.current;
              if (music.intent && !music.error) music.pause();
              else {
                music.start(muted ? 0.8 : undefined);
                if (muted) void setProgress((p) => ({ ...p, volume: 0.8 })).then((saved) => {
                  if (!saved && action === musicAction.current) music.pause();
                });
              }
            }} />}
          {modal === "settings" && (
            <>
              <section className="atmosphere-setting" aria-label="背景动效设置">
                <div><b>星空背景</b><p>上课时保持静止，地图和航行时可轻轻流动。</p></div>
                <div className="atmosphere-options" role="group" aria-label="选择背景动效">
                  <button type="button" aria-pressed={ambientEnabled} onClick={() => setProgress((p) => ({ ...p, preferences: { ...p.preferences, ambientMotion: true } }))}>轻动效</button>
                  <button type="button" aria-pressed={!ambientEnabled} onClick={() => setProgress((p) => ({ ...p, preferences: { ...p.preferences, ambientMotion: false } }))}>静态</button>
                </div>
                <p className="atmosphere-note">{reducedMotion ? "设备已开启减少动态效果，当前使用静态显示。" : "打开家长面板、录音或切到后台时，背景会暂停。"}</p>
              </section>
              <ParentLearningCard progress={progress} />
              {practicePool(progress).length > 0 && <button className="button secondary full" onClick={() => { setModal(null); setProgress((p) => startPractice(p)); }}>复习一下已学内容 <ArrowRight size={20} /></button>}
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
                声音音量 <b>{Math.round(progress.volume * 100)}%</b>
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
              <p>同时调整点读与轻音乐，音乐保持较低音量。iPad 上也可使用设备音量键调整。</p>
              <div className="modal-note">
                <b>试听音频待人工校对</b>
                <p>
                  字母音含用户提供的素材，其余多为合成试听音。请家长先试听，或关闭声音后领读。学习记录统一保存在电脑后台，iPad 与电脑共用同一份进度。
                </p>
              </div>
              <ParentBackup progress={confirmedProgress} previewEnabled={previewEnabled} onImport={(imported) => saveProgress(imported, true)} />
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
              <div className="celebration-fuel" aria-label="探索燃料反馈">
                {celebrationFuel.reward && <strong>{celebrationFuel.reward}</strong>}
                <span>{celebrationFuel.destination}</span>
                <small>当前燃料 {fuel(progress.space)}</small>
              </div>
              <div className="celebration-learning">
                <span>{selectedPlanet === "forest" ? "我们练过的声音" : selectedPlanet === "dunes" ? "我们拼过的单词" : "我们尝试说过的话"}</span>
                <strong>{selectedPlanet === "forest" ? lesson.steps.map((step) => step.grapheme).join(" · ") : selectedPlanet === "dunes" ? lesson.blendRounds.map((round) => round.word).join(" · ") : lesson.id === "mission-001" ? "Hello! · I want… · Thank you! · Bye!" : lesson.speakingTask.answer}</strong>
              </div>
              <MissionBrief progress={progress} />
              {hasNextCourse && (
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
                className={`button ${!nextPlanet && !hasNextCourse ? "primary" : "secondary"} full`}
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
