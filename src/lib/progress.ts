import { initialSpace, restoreSpace, type SpaceProgress } from "./space";
import { parseDialogue, type DialogueState } from "./dialogue";
import { lessons, type PlanetId } from "../data/lesson";
import { reviewForLesson } from "../data/reviews";
// Retain the original key across all data migrations.
export const STORAGE_KEY = "tom-phonics-progress-v1";
export type Progress = {
  version: 4;
  space: SpaceProgress;
  dialogue?: DialogueState;
  lessonIndex: number;
  records: Record<string, LessonProgress>;
  step: number;
  completed: number[];
  volume: number;
  page: "map" | "space" | "courses" | "lesson" | "blending" | "speaking";
  blendRound: number;
  blendCompleted: number[];
  blendDraft: string[];
  blendSolved: boolean;
  speakingCompleted: boolean;
  reviewSounds: number[];
  reviewPlacements: number[];
  reviewDialogueStep: number;
};
export type LessonProgress = Pick<
  Progress,
  | "step"
  | "completed"
  | "blendRound"
  | "blendCompleted"
  | "blendDraft"
  | "blendSolved"
  | "speakingCompleted"
  | "reviewSounds"
  | "reviewPlacements"
  | "reviewDialogueStep"
  | "dialogue"
>;
export const initialProgress: Progress = {
  version: 4,
  space: initialSpace(),
  lessonIndex: 0,
  records: {},
  step: 0,
  completed: [],
  volume: 0.8,
  page: "map",
  blendRound: 0,
  blendCompleted: [],
  blendDraft: [],
  blendSolved: false,
  speakingCompleted: false,
  reviewSounds: [],
  reviewPlacements: [],
  reviewDialogueStep: 0,
};
function validIndices(value: unknown, count: number): number[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (n): n is number => Number.isInteger(n) && n >= 0 && n < count,
          ),
        ),
      ].sort((a, b) => a - b)
    : [];
}
function index(value: unknown, count: number) {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < count
    ? value
    : 0;
}
function inclusiveIndex(value: unknown, max: number) {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= max
    ? value
    : 0;
}
export function forestDone(progress: Progress) {
  return lessons[progress.lessonIndex].steps.every((_, n) =>
    progress.completed.includes(n),
  );
}

export function dunesDone(progress: Progress) {
  return (
    forestDone(progress) &&
    lessons[progress.lessonIndex].blendRounds.every((_, n) =>
      progress.blendCompleted.includes(n),
    )
  );
}
export function planetStatus(
  progress: Progress,
  id: PlanetId,
): "completed" | "current" | "locked" {
  if (id === "forest") return forestDone(progress) ? "completed" : "current";
  if (id === "dunes")
    return !forestDone(progress)
      ? "locked"
      : dunesDone(progress)
        ? "completed"
        : "current";
  return !dunesDone(progress)
    ? "locked"
    : progress.speakingCompleted
      ? "completed"
      : "current";
}
export function litCount(progress: Progress) {
  return (["forest", "dunes", "crystal"] as const).filter(
    (id) => planetStatus(progress, id) === "completed",
  ).length;
}
function snapshot(p: Progress): LessonProgress {
  const {
    step,
    completed,
    blendRound,
    blendCompleted,
    blendDraft,
    blendSolved,
    speakingCompleted,
    reviewSounds,
    reviewPlacements,
    reviewDialogueStep,
  } = p;
  return {
    step,
    completed,
    blendRound,
    blendCompleted,
    blendDraft,
    blendSolved,
    speakingCompleted,
    reviewSounds,
    reviewPlacements,
    reviewDialogueStep,
    ...(p.dialogue ? { dialogue: p.dialogue } : {}),
  };
}
export function lessonProgress(p: Progress, n: number): Progress {
  return n === p.lessonIndex
    ? p
    : { ...initialProgress, ...p.records[lessons[n]?.id], lessonIndex: n };
}
export function courseDone(p: Progress, n: number) {
  if (!lessons[n]) return false;
  const state = lessonProgress(p, n);
  return dunesDone(state) && state.speakingCompleted;
}
export function courseUnlocked(p: Progress, n: number): boolean {
  return (
    Number.isInteger(n) &&
    n >= 0 &&
    n < lessons.length &&
    Array.from({ length: n }, (_, i) => i).every((i) => courseDone(p, i))
  );
}
export function currentCourse(p: Progress) {
  return lessons.findIndex((_, n) => !courseDone(p, n));
}

function switchCourse(p: Progress, n: number): Progress {
  if (n === p.lessonIndex) return { ...p, page: "map" };
  const records = { ...p.records, [lessons[p.lessonIndex].id]: snapshot(p) };
  delete records[lessons[n].id];
  const next: Progress = {
    ...p,
    ...snapshot(lessonProgress(p, n)),
    lessonIndex: n,
    page: "map",
    records,
  };
  if (n !== 0) delete next.dialogue;
  return next;
}

export function selectCourse(p: Progress, n: number): Progress {
  return courseUnlocked(p, n) ? switchCourse(p, n) : p;
}

export function selectCourseForPreview(p: Progress, n: number): Progress {
  return Number.isInteger(n) && n >= 0 && n < lessons.length
    ? switchCourse(p, n)
    : p;
}
function sanitize(
  v: Record<string, unknown>,
  n: number,
  legacy = false,
): Progress {
  const lesson = lessons[n];
  const review = reviewForLesson(lesson.id);
  const state: Progress = {
    ...initialProgress,
    lessonIndex: n,
    step: index(v.step, lesson.steps.length),
    completed: validIndices(v.completed, lesson.steps.length),
  };
  // Do not restore skipped steps or exercises from malformed records.
  state.completed = state.completed.filter((_, i, a) => a[i] === i);
  state.step = Math.min(
    state.step,
    state.completed.length,
    lesson.steps.length - 1,
  );
  if (review) {
    state.reviewSounds = (
      Object.hasOwn(v, "reviewSounds")
        ? validIndices(v.reviewSounds, lesson.steps.length)
        : [...state.completed]
    ).filter((_, i, values) => values[i] === i);
  }
  if (!legacy && forestDone(state)) {
    const legacyReviewComplete =
      review &&
      !Object.hasOwn(v, "reviewDialogueStep") &&
      v.speakingCompleted === true &&
      validIndices(
        v.blendCompleted,
        review.legacyBlendRoundCount,
      ).length === review.legacyBlendRoundCount;
    if (legacyReviewComplete) {
      state.blendCompleted = lesson.blendRounds.map((_, i) => i);
      state.reviewPlacements = [...state.blendCompleted];
      state.blendRound = review.placementBatches.length - 1;
      state.speakingCompleted = true;
      state.reviewDialogueStep = review.dialogue.length;
    } else if (review && Object.hasOwn(v, "reviewPlacements")) {
      state.blendCompleted = validIndices(
        v.blendCompleted,
        lesson.blendRounds.length,
      );
      state.reviewPlacements = validIndices(
        v.reviewPlacements,
        lesson.blendRounds.length,
      ).filter((round) => state.blendCompleted.includes(round));
      state.blendRound = index(
        v.blendRound,
        review.placementBatches.length,
      );
      state.speakingCompleted =
        dunesDone(state) && v.speakingCompleted === true;
      state.reviewDialogueStep = Math.min(
        inclusiveIndex(v.reviewDialogueStep, review.dialogue.length),
        state.speakingCompleted
          ? review.dialogue.length
          : review.dialogue.length - 1,
      );
    } else if (!review) {
      state.blendCompleted = validIndices(
        v.blendCompleted,
        lesson.blendRounds.length,
      );
      state.blendCompleted = state.blendCompleted.filter(
        (_, i, values) => values[i] === i,
      );
      state.blendRound = Math.min(
        index(v.blendRound, lesson.blendRounds.length),
        state.blendCompleted.length,
        lesson.blendRounds.length - 1,
      );
      const pool = [...lesson.blendRounds[state.blendRound].letters];
      state.blendDraft = [];
      if (Array.isArray(v.blendDraft))
        for (const letter of v.blendDraft) {
          const at = pool.indexOf(letter);
          if (at >= 0) {
            state.blendDraft.push(letter);
            pool.splice(at, 1);
          }
        }
      state.blendSolved =
        v.blendSolved === true &&
        state.blendDraft.join("") ===
          lesson.blendRounds[state.blendRound].word &&
        state.blendCompleted.includes(state.blendRound);
      state.speakingCompleted =
        dunesDone(state) && v.speakingCompleted === true;
    }
  }
  if (n === 0 && dunesDone(state) && v.dialogue)
    state.dialogue = parseDialogue(v.dialogue);
  return state;
}
export function parseProgress(raw: string | null): Progress {
  try {
    const v = JSON.parse(raw ?? "null");
    if (!v || typeof v !== "object" || ![1, 2, 3, 4].includes(v.version))
      return { ...initialProgress };
    const requested = v.version >= 3 ? index(v.lessonIndex, lessons.length) : 0;
    let state: Progress = { ...initialProgress, records: {} };
    for (let n = 0; n < lessons.length; n++) {
      if (n > 0 && !courseDone(state, n - 1)) break;
      const value =
        n === requested
          ? v
          : v.version >= 3
            ? v.records?.[lessons[n].id]
            : null;
      const clean = sanitize(
        value && typeof value === "object" ? value : {},
        n,
        v.version === 1,
      );
      if (n === requested || value)
        state.records[lessons[n].id] = snapshot(clean);
      if (n === 0) state = { ...state, ...snapshot(clean) };
    }
    const selected = courseUnlocked(state, requested)
      ? requested
      : Math.max(0, currentCourse(state));
    state = {
      ...state,
      ...state.records[lessons[selected].id],
      lessonIndex: selected,
    };
    if (selected !== 0) delete state.dialogue;
    // The active record lives in the top-level fields; archives contain other courses only.
    delete state.records[lessons[selected].id];
    if (v.version < 3 && Object.keys(state.records).length) state.records = {};
    state.volume =
      typeof v.volume === "number" && Number.isFinite(v.volume)
        ? Math.min(1, Math.max(0, v.volume))
        : 0.8;
    state.page = [
      "space",
      "courses",
      "lesson",
      "blending",
      "speaking",
    ].includes(v.page)
      ? v.page
      : "map";
    if (
      (v.version === 1 && v.step === 3 && state.page === "lesson") ||
      selected !== requested ||
      (state.page === "blending" && !forestDone(state)) ||
      (state.page === "speaking" && !dunesDone(state))
    )
      state.page = "map";
    state.space = restoreSpace(v.version === 4 ? v.space : undefined, state);
    return state;
  } catch {
    return { ...initialProgress };
  }
}
export function completeStep(progress: Progress): Progress {
  return {
    ...progress,
    completed: [...new Set([...progress.completed, progress.step])].sort(
      (a, b) => a - b,
    ),
    step: Math.min(
      progress.step + 1,
      lessons[progress.lessonIndex].steps.length - 1,
    ),
  };
}
export function checkBlend(progress: Progress): Progress {
  if (
    !forestDone(progress) ||
    progress.blendDraft.join("") !==
      lessons[progress.lessonIndex].blendRounds[progress.blendRound].word
  )
    return progress;
  return {
    ...progress,
    blendSolved: true,
    blendCompleted: [
      ...new Set([...progress.blendCompleted, progress.blendRound]),
    ].sort((a, b) => a - b),
  };
}
export function openPlanet(progress: Progress, id: PlanetId): Progress {
  if (planetStatus(progress, id) === "locked") return progress;
  const review = reviewForLesson(lessons[progress.lessonIndex].id);
  if (id === "forest")
    return {
      ...progress,
      page: "lesson",
      step: forestDone(progress) ? 0 : progress.step,
      ...(review && forestDone(progress) ? { reviewSounds: [] } : {}),
    };
  if (id === "dunes")
    return dunesDone(progress)
      ? {
          ...progress,
          page: "blending",
          blendRound: 0,
          blendDraft: [],
          blendSolved: false,
          ...(review ? { reviewPlacements: [] } : {}),
        }
      : { ...progress, page: "blending" };
  return {
    ...progress,
    page: "speaking",
    ...(review && progress.speakingCompleted
      ? { reviewDialogueStep: 0 }
      : {}),
  };
}

export function openPlanetForPreview(
  progress: Progress,
  id: PlanetId,
): Progress {
  if (id === "forest")
    return {
      ...progress,
      page: "lesson",
      step: forestDone(progress) ? 0 : progress.step,
    };
  const lesson = lessons[progress.lessonIndex];
  const review = reviewForLesson(lesson.id);
  const completed = lesson.steps.map((_, n) => n);
  if (id === "dunes")
    return {
      ...progress,
      completed,
      reviewSounds: review ? [...completed] : progress.reviewSounds,
      reviewPlacements: review ? [] : progress.reviewPlacements,
      page: "blending",
    };
  return {
    ...progress,
    completed,
    reviewSounds: review ? [...completed] : progress.reviewSounds,
    blendCompleted: lesson.blendRounds.map((_, n) => n),
    reviewPlacements: review
      ? lesson.blendRounds.map((_, n) => n)
      : progress.reviewPlacements,
    reviewDialogueStep: review ? 0 : progress.reviewDialogueStep,
    page: "speaking",
  };
}
