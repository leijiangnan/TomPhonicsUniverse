import { reconcileRewards } from "./space";
import { lessons, courseUnits } from "../data/lesson";
import { unitOneArtWords } from "../components/UnitOneWordArt";
const audioFiles = import.meta.glob("../../public/audio/*.mp3", {
  query: "?url",
  import: "default",
  eager: true,
});
const hasAudioFile = (path: string) => `../../${path}` in audioFiles;
import { describe, expect, it } from "vitest";
import {
  courseDone,
  courseUnlocked,
  currentCourse,
  selectCourse,
  checkBlend,
  completeStep,
  dunesDone,
  forestDone,
  initialProgress,
  litCount,
  openPlanet,
  openPlanetForPreview,
  parseProgress,
  planetStatus,
  selectCourseForPreview,
  type Progress,
} from "./progress";
function finishForest(): Progress {
  let state = { ...initialProgress };
  for (let i = 0; i < 3; i++) state = completeStep(state);
  return state;
}
describe("saved progress and planet route", () => {
  it("recovers from missing, corrupt and unsupported versions", () => {
    for (const raw of [
      null,
      "{broken",
      "null",
      "42",
      '{"version":99}',
      '{"version":"2"}',
      '{"page":"lesson"}',
    ])
      expect(parseProgress(raw)).toEqual(initialProgress);
  });
  it("preserves a completed v1 forest and unlocks dunes without granting game completion", () => {
    const state = parseProgress(
      JSON.stringify({
        version: 1,
        step: 3,
        completed: [0, 1, 2, 3],
        volume: 0.4,
        page: "lesson",
      }),
    );
    expect(state.version).toBe(4);
    expect(state.completed).toEqual([0, 1, 2]);
    expect(state.volume).toBe(0.4);
    expect(state.page).toBe("map");
    expect(planetStatus(state, "forest")).toBe("completed");
    expect(planetStatus(state, "dunes")).toBe("current");
    expect(planetStatus(state, "crystal")).toBe("locked");
    expect(litCount(state)).toBe(1);
    expect(openPlanet(state, "dunes").page).toBe("blending");
  });
  it("resumes partially completed old lessons", () => {
    const state = parseProgress(
      '{"version":1,"step":1,"completed":[0],"page":"lesson","volume":0}',
    );
    expect(state.step).toBe(1);
    expect(state.completed).toEqual([0]);
    expect(state.page).toBe("lesson");
    expect(state.volume).toBe(0);
    expect(planetStatus(state, "dunes")).toBe("locked");
  });
  it("does not open a locked planet", () => {
    expect(openPlanet(initialProgress, "dunes")).toBe(initialProgress);
    expect(openPlanet(initialProgress, "crystal")).toBe(initialProgress);
  });
  it("lights a forest once and retains its completion when replaying", () => {
    const state = finishForest();
    expect(forestDone(state)).toBe(true);
    expect(litCount(state)).toBe(1);
    const replay = openPlanet(state, "forest");
    expect(replay.step).toBe(0);
    expect(completeStep(replay).completed).toEqual([0, 1, 2]);
    expect(litCount(replay)).toBe(1);
  });
  it("requires correct letter order in each dunes exercise", () => {
    const wrong = { ...finishForest(), blendDraft: ["t", "a"] };
    expect(checkBlend(wrong)).toBe(wrong);
    const first = checkBlend({ ...wrong, blendDraft: ["a", "t"] });
    expect(first.blendSolved).toBe(true);
    expect(dunesDone(first)).toBe(false);
    const last = checkBlend({
      ...first,
      blendRound: 1,
      blendDraft: ["s", "a", "t"],
      blendSolved: false,
    });
    expect(dunesDone(last)).toBe(true);
    expect(litCount(last)).toBe(2);
    expect(planetStatus(last, "crystal")).toBe("current");
    expect(checkBlend(last).blendCompleted).toEqual([0, 1]);
  });
  it("restores a game draft and guards invalid solved flags", () => {
    const saved = {
      ...finishForest(),
      page: "blending" as const,
      blendDraft: ["a"],
    };
    expect(parseProgress(JSON.stringify(saved))).toEqual(
      reconcileRewards(saved),
    );
    const invalid = {
      ...saved,
      blendDraft: ["x", "a", "a", "t"],
      blendSolved: true,
    };
    const restored = parseProgress(JSON.stringify(invalid));
    expect(restored.blendDraft).toEqual(["a", "t"]);
    expect(restored.blendSolved).toBe(false);
  });
  it("does not restore downstream completion without prerequisites", () => {
    const state = parseProgress(
      JSON.stringify({
        ...initialProgress,
        page: "speaking",
        blendCompleted: [0, 1],
        speakingCompleted: true,
      }),
    );
    expect(state.page).toBe("map");
    expect(litCount(state)).toBe(0);
    expect(state.speakingCompleted).toBe(false);
  });
  it("keeps all three planets lit when a completed game is replayed", () => {
    const done = {
      ...finishForest(),
      blendRound: 1,
      blendDraft: ["s", "a", "t"],
      blendSolved: true,
      blendCompleted: [0, 1],
      speakingCompleted: true,
    };
    expect(litCount(done)).toBe(3);
    const replay = openPlanet(done, "dunes");
    expect(replay.blendRound).toBe(0);
    expect(replay.blendDraft).toEqual([]);
    expect(replay.blendSolved).toBe(false);
    expect(litCount(replay)).toBe(3);
    expect(parseProgress(JSON.stringify(done))).toEqual(reconcileRewards(done));
  });
});

function finishCourse(state: Progress) {
  for (let i = 0; i < lessons[state.lessonIndex].steps.length; i++)
    state = completeStep(state);
  for (const [i, round] of lessons[state.lessonIndex].blendRounds.entries())
    state = checkBlend({
      ...state,
      blendRound: i,
      blendDraft: [...round.word],
    });
  return { ...state, speakingCompleted: true };
}
describe("sequential courses", () => {
  it("requires all three stages before the next course and never opens unimplemented courses", () => {
    expect(selectCourse(initialProgress, 1)).toBe(initialProgress);
    expect(courseUnlocked(finishForest(), 1)).toBe(false);
    let state = initialProgress;
    for (const n of lessons.keys()) {
      expect(courseUnlocked(state, n)).toBe(true);
      if (n + 1 < lessons.length)
        expect(courseUnlocked(state, n + 1)).toBe(false);
      state = finishCourse(state);
      expect(courseDone(state, n)).toBe(true);
      if (n + 1 < lessons.length) state = selectCourse(state, n + 1);
    }
    expect(currentCourse(state)).toBe(-1);
    expect(courseUnlocked(state, lessons.length)).toBe(false);
    expect(parseProgress(JSON.stringify(state))).toEqual(
      reconcileRewards(state),
    );
  });
  it("preserves per-course drafts, completion and volume when reviewing old lessons", () => {
    let state = selectCourse(finishCourse(initialProgress), 1);
    for (let i = 0; i < 3; i++) state = completeStep(state);
    state = { ...state, page: "blending", volume: 0.3, blendDraft: ["p"] };
    const review = selectCourse(state, 0);
    expect(courseDone(review, 0)).toBe(true);
    const resumed = selectCourse(parseProgress(JSON.stringify(review)), 1);
    expect(resumed.blendDraft).toEqual(["p"]);
    expect(resumed.volume).toBe(0.3);
    expect(currentCourse(resumed)).toBe(1);
  });
  it("previews implemented courses and stages without changing formal unlocks", () => {
    const eighth = selectCourseForPreview(initialProgress, 7);
    expect(eighth.lessonIndex).toBe(7);
    expect(eighth.page).toBe("map");
    expect(courseUnlocked(eighth, 1)).toBe(false);
    expect(selectCourseForPreview(eighth, 8)).toBe(eighth);

    const dunes = openPlanetForPreview(eighth, "dunes");
    expect(dunes.page).toBe("blending");
    expect(forestDone(dunes)).toBe(true);
    expect(dunesDone(dunes)).toBe(false);

    const crystal = openPlanetForPreview(eighth, "crystal");
    expect(crystal.page).toBe("speaking");
    expect(dunesDone(crystal)).toBe(true);
    expect(crystal.speakingCompleted).toBe(false);
    expect(courseUnlocked(crystal, 1)).toBe(false);
  });
  it("migrates a completed v2 lesson without granting other courses completion", () => {
    const state = parseProgress(
      JSON.stringify({ ...finishCourse(initialProgress), version: 2 }),
    );
    expect(courseDone(state, 0)).toBe(true);
    expect(courseUnlocked(state, 1)).toBe(true);
    expect(courseDone(state, 1)).toBe(false);
  });
  it("rejects forged downstream progress without prior course completion", () => {
    const bad = {
      ...finishCourse(selectCourse(finishCourse(initialProgress), 1)),
      records: {},
      page: "speaking",
    };
    const restored = parseProgress(JSON.stringify(bad));
    expect(restored.lessonIndex).toBe(0);
    expect(restored.page).toBe("map");
    expect(courseUnlocked(restored, 1)).toBe(false);
  });
  it("has 48 planned lessons, eight implemented lessons, three examples per sound and complete local audio", () => {
    expect(courseUnits.flatMap((u) => u.topics)).toHaveLength(48);
    expect(lessons).toHaveLength(8);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(8);
    expect(lessons[3].review).toBe(true);
    expect(lessons[3].steps).toHaveLength(8);
    expect(lessons[7].review).toBe(true);
    expect(lessons[7].steps).toHaveLength(17);
    const taught = new Set<string>();
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        taught.add(step.id);
        expect(step.words).toHaveLength(3);
        expect(hasAudioFile(`public${step.audio}`)).toBe(true);
        for (const word of step.words) {
          expect(word.usageType).toBe("oral_only");
          expect(hasAudioFile(`public${word.audio}`)).toBe(true);
          if ("ockehrbgu".includes(step.id))
            expect(unitOneArtWords).toContain(word.word);
        }
      }
      for (const round of lesson.blendRounds) {
        expect(round.usageType).toBe("decodable");
        expect(round.meaning.trim().length).toBeGreaterThan(0);
        expect(round.requires.every((r) => taught.has(r))).toBe(true);
        expect([...round.word].sort()).toEqual([...round.letters].sort());
        expect(hasAudioFile(`public${round.audio}`)).toBe(true);
      }
      expect(hasAudioFile(`public${lesson.speakingTask.questionAudio}`)).toBe(
        true,
      );
      expect(hasAudioFile(`public${lesson.speakingTask.answerAudio}`)).toBe(
        true,
      );
    }
  });
});
