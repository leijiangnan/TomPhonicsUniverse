import { reconcileRewards } from "./space";
import { lessons, courseUnits } from "../data/lesson";
import { reviewForLesson } from "../data/reviews";
import { unitOneArtWords } from "../components/UnitOneWordArt";
import { newArtWords } from "../components/NewWordArt";
import { legacyArtWords } from "../components/Art";
import {
  advanceReviewDialogue,
  completeReviewSound,
  placeReviewWord,
} from "./review";
const audioFiles = import.meta.glob("../../public/audio/**/*.mp3", {
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
  canCompletePhonicsStep,
  phonicsCardIds,
  visitPhonicsCard,
  visitedPhonicsCards,
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
  updateBlendDraft,
} from "./progress";
function finishPhonicsStep(state: Progress): Progress {
  state = { ...state, page: "lesson" };
  for (const card of phonicsCardIds(state)) state = visitPhonicsCard(state, card);
  return completeStep(state);
}
function finishForest(): Progress {
  let state = { ...initialProgress };
  for (let i = 0; i < 3; i++) state = finishPhonicsStep(state);
  return state;
}
describe("required phonics card visits", () => {
  it("requires the large sound card and each distinct example before advancing", () => {
    let state = openPlanet(initialProgress, "forest");
    expect(phonicsCardIds(state)).toEqual(["sound", "sun", "snake", "sock"]);
    expect(completeStep(state)).toBe(state);
    for (const card of ["sun", "snake", "sock"]) state = visitPhonicsCard(state, card);
    expect(visitedPhonicsCards(state)).toHaveLength(3);
    expect(canCompletePhonicsStep(state)).toBe(false);
    expect(completeStep(state)).toBe(state);
    expect(visitPhonicsCard(state, "sun")).toBe(state);
    expect(visitPhonicsCard(state, "not-a-card")).toBe(state);
    state = visitPhonicsCard(state, "sound");
    expect(canCompletePhonicsStep(state)).toBe(true);
    const next = completeStep(state);
    expect(next.step).toBe(1);
    expect(next.completed).toEqual([0]);
    expect(visitedPhonicsCards(next)).toEqual([]);
    expect(completeStep(next)).toBe(next);
    expect(visitedPhonicsCards({ ...next, step: 0 })).toEqual(phonicsCardIds(state));
  });
  it("does not visit or complete a locked, non-lesson or scene-review step", () => {
    const outside = initialProgress;
    expect(visitPhonicsCard(outside, "sound")).toBe(outside);
    expect(completeStep(outside)).toBe(outside);
    const locked = { ...outside, page: "lesson" as const, step: 2 };
    expect(visitPhonicsCard(locked, "sound")).toBe(locked);
    expect(completeStep(locked)).toBe(locked);
    const review = { ...outside, page: "lesson" as const, lessonIndex: 3 };
    expect(phonicsCardIds(review)).toEqual([]);
    expect(visitPhonicsCard(review, "sound")).toBe(review);
    expect(completeStep(review)).toBe(review);
  });
  it("restores partial visits, ignores malformed cards and prevents future-step drafts", () => {
    let state = visitPhonicsCard(openPlanet(initialProgress, "forest"), "sock");
    state = visitPhonicsCard(state, "sound");
    const restored = parseProgress(JSON.stringify(state));
    expect(visitedPhonicsCards(restored)).toEqual(["sound", "sock"]);
    expect(canCompletePhonicsStep(restored)).toBe(false);
    expect(parseProgress(JSON.stringify({ ...state, phonicsCards: {
      s: ["sun", "sun", "sound", "apple", 1], a: ["sound", "apple"], unknown: ["sound"],
    } })).phonicsCards).toEqual({ s: ["sound", "sun"] });
    for (const phonicsCards of [null, false, [], "bad"]) {
      expect(parseProgress(JSON.stringify({ ...state, phonicsCards })).phonicsCards).toEqual({});
    }
  });
  it("preserves old completion but requires fresh visits for a forest replay without new fuel", () => {
    const old = { ...finishForest() };
    delete old.phonicsCards;
    const restored = parseProgress(JSON.stringify(old));
    expect(forestDone(restored)).toBe(true);
    expect(planetStatus(restored, "dunes")).toBe("current");
    const replay = openPlanet(restored, "forest");
    expect(replay.phonicsCards).toEqual({});
    expect(completeStep(replay)).toBe(replay);
    let replayed = replay;
    for (const _ of lessons[0].steps) replayed = finishPhonicsStep(replayed);
    expect(reconcileRewards(replayed).space).toEqual(restored.space);
    expect(litCount(replayed)).toBe(1);
    expect(openPlanet(replayed, "forest").phonicsCards).toEqual({});
  });
  it("keeps visits in their own course when switching, including archives without the field", () => {
    const first = finishCourse(initialProgress);
    const second = selectCourse(first, 1);
    expect(second.phonicsCards).toEqual({});
    let partial = visitPhonicsCard(openPlanet(second, "forest"), "pig");
    partial = visitPhonicsCard(partial, "sound");
    const back = selectCourse(partial, 0);
    expect(back.phonicsCards).toEqual(first.phonicsCards);
    const resumed = selectCourse(parseProgress(JSON.stringify(back)), 1);
    expect(resumed.phonicsCards).toEqual({ p: ["sound", "pig"] });
    const old = { ...back, records: { ...back.records, [lessons[1].id]: { ...back.records[lessons[1].id] } } };
    delete old.records[lessons[1].id].phonicsCards;
    expect(selectCourse(old, 1).phonicsCards).toEqual({});
  });
});
describe("saved progress and planet route", () => {
  it("preserves optional v4 motion preferences and safely ignores malformed or legacy settings", () => {
    expect(parseProgress(JSON.stringify(initialProgress))).not.toHaveProperty("preferences");
    for (const ambientMotion of [true, false]) {
      const state = { ...initialProgress, preferences: { ambientMotion } };
      expect(parseProgress(JSON.stringify(state))).toEqual(state);
    }
    for (const preferences of [null, false, [], {}, { ambientMotion: "false" }, { ambientMotion: 0 }]) {
      const restored = parseProgress(JSON.stringify({ ...initialProgress, completed: [0], preferences }));
      expect(restored).not.toHaveProperty("preferences");
      expect(restored.completed).toEqual([0]);
    }
    expect(parseProgress(JSON.stringify({ ...initialProgress, version: 3, preferences: { ambientMotion: false } })))
      .not.toHaveProperty("preferences");
  });
  it("applies fast consecutive tile choices to the latest draft without exceeding the tile supply", () => {
    let state = openPlanet(finishForest(), "dunes");
    state = updateBlendDraft(state, (draft) => [...draft, "a"]);
    state = updateBlendDraft(state, (draft) => [...draft, "t"]);
    expect(state.blendDraft).toEqual(["a", "t"]);
    expect(checkBlend(state).blendSolved).toBe(true);
    expect(updateBlendDraft(state, (draft) => [...draft, "a"])).toBe(state);
    expect(updateBlendDraft(checkBlend(state), [])).toEqual(checkBlend(state));
    state = updateBlendDraft(state, (draft) => draft.filter((_, index) => index !== 0));
    expect(state.blendDraft).toEqual(["t"]);
    expect(parseProgress(JSON.stringify(state)).blendDraft).toEqual(["t"]);
    expect(updateBlendDraft(initialProgress, ["a"])).toBe(initialProgress);
  });
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
  const lesson = lessons[state.lessonIndex];
  const review = reviewForLesson(lesson.id);
  for (let i = 0; i < lesson.steps.length; i++)
    state = review ? completeReviewSound(state) : finishPhonicsStep(state);
  if (review) {
    for (const i of lesson.blendRounds.keys())
      state = placeReviewWord(state, i);
    for (const _ of review.dialogue) state = advanceReviewDialogue(state);
    return state;
  }
  for (const [i, round] of lesson.blendRounds.entries())
    state = checkBlend({
      ...state,
      blendRound: i,
      blendDraft: round.word.match(/qu|./g) ?? [],
    });
  return { ...state, speakingCompleted: true };
}
describe("sequential courses", () => {
  it("keeps motion preferences global across courses, preview selection and refresh without granting rewards", () => {
    const completed = reconcileRewards({ ...finishCourse(initialProgress), preferences: { ambientMotion: false } });
    const second = selectCourse(completed, 1);
    expect(second.preferences).toEqual({ ambientMotion: false });
    expect(second.space).toEqual(completed.space);
    expect(second.records[lessons[0].id]).not.toHaveProperty("preferences");
    const restored = parseProgress(JSON.stringify(selectCourse(second, 0)));
    expect(selectCourse(restored, 1).preferences).toEqual({ ambientMotion: false });
    const preview = selectCourseForPreview({ ...initialProgress, preferences: { ambientMotion: false } }, 7);
    expect(preview.preferences).toEqual({ ambientMotion: false });
    expect(preview.space).toEqual(initialProgress.space);
    expect(courseUnlocked(preview, 1)).toBe(false);
  });
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
    for (let i = 0; i < 3; i++) state = finishPhonicsStep(state);
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
    expect(selectCourseForPreview(eighth, 8).lessonIndex).toBe(8);
    expect(selectCourseForPreview(eighth, lessons.length)).toBe(eighth);

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
  it("restores a multi-letter grapheme as one tile and checks the whole word", () => {
    let state = initialProgress;
    for (let n = 0; n < 12; n++) {
      state = finishCourse(state);
      if (n < 11) state = selectCourse(state, n + 1);
    }
    state = {
      ...state,
      speakingCompleted: false,
      blendCompleted: [0, 1],
      blendRound: 2,
      blendDraft: ["qu", "i"],
      blendSolved: false,
      page: "blending",
    };
    const restored = parseProgress(JSON.stringify(state));
    expect(restored.blendDraft).toEqual(["qu", "i"]);
    const solved = checkBlend({ ...restored, blendDraft: ["qu", "i", "t"] });
    expect(solved.blendSolved).toBe(true);
    expect(solved.blendCompleted).toEqual([0, 1, 2]);
  });
  it("introduces x and qu as two sounds, with one tile for qu", () => {
    const lesson = lessons[11];
    expect(lesson.steps.find((step) => step.id === "x")?.ipa).toBe("/ks/");
    expect(lesson.steps.find((step) => step.id === "qu")?.ipa).toBe("/kw/");
    const quit = lesson.blendRounds.find((round) => round.word === "quit");
    expect(quit?.requires).toEqual(["qu", "i", "t"]);
    expect(quit?.letters).toEqual(["t", "i", "qu"]);
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
  it("has 48 planned lessons, sixteen implemented lessons, three examples per sound and complete local audio", () => {
    expect(courseUnits.flatMap((u) => u.topics)).toHaveLength(48);
    expect(lessons).toHaveLength(16);
    expect(new Set(lessons.map((lesson) => lesson.id)).size).toBe(16);
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
          if (["o", "c", "k", "e", "h", "r", "b", "g", "u", "f", "l", "w", "j", "v", "z", "x", "y", "qu"].includes(step.id))
            expect(unitOneArtWords).toContain(word.word);
        }
      }
      for (const round of lesson.blendRounds) {
        expect(round.usageType).toBe("decodable");
        expect(round.meaning.trim().length).toBeGreaterThan(0);
        expect(round.requires.every((r) => taught.has(r))).toBe(true);
        expect([...round.letters].sort()).toEqual((round.word.match(/qu|./g) ?? []).sort());
        expect(hasAudioFile(`public${round.audio}`)).toBe(true);
      }
      expect(hasAudioFile(`public${lesson.speakingTask.questionAudio}`)).toBe(
        true,
      );
      expect(hasAudioFile(`public${lesson.speakingTask.answerAudio}`)).toBe(
        true,
      );
      const review = reviewForLesson(lesson.id);
      if (review) {
        for (const batch of review.soundBatches)
          for (const item of batch.items)
            expect(item.meaning.trim().length).toBeGreaterThan(0);
        for (const line of review.dialogue) {
          expect(line.npc.trim().length).toBeGreaterThan(0);
          expect(line.npcMeaning.trim().length).toBeGreaterThan(0);
          expect(line.reply.trim().length).toBeGreaterThan(0);
          expect(line.replyMeaning.trim().length).toBeGreaterThan(0);
          expect(hasAudioFile(`public${line.npcAudio}`)).toBe(true);
          expect(hasAudioFile(`public${line.replyAudio}`)).toBe(true);
        }
        for (const item of review.placementItems) {
          expect(item.meaning.trim().length).toBeGreaterThan(0);
          expect([
            ...unitOneArtWords,
            ...newArtWords,
            ...legacyArtWords,
          ]).toContain(item.word);
          expect(hasAudioFile(`public/audio/${item.word}.mp3`)).toBe(true);
        }
      }
    }
  });
});
