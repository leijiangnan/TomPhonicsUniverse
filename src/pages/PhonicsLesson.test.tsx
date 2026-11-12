import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PhonicsLesson } from "./PhonicsLesson";
import { initialProgress, phonicsCardIds, visitPhonicsCard, completeStep, type Progress } from "../lib/progress";
import { lessons } from "../data/lesson";

const render = (progress: Progress) => renderToStaticMarkup(<PhonicsLesson progress={progress} onStep={() => {}} onComplete={async () => {}} onPlay={() => {}} onVisit={() => {}} playingSrc={null} />);
const action = (progress: Progress) => render(progress).match(/<button[^>]*class="button primary"[^>]*>/)![0];
const tapAll = (p: Progress) => phonicsCardIds(p).reduce(visitPhonicsCard, p);
const fresh: Progress = { ...initialProgress, page: "lesson" };

describe("phonics card prerequisites", () => {
  it("explains the tap requirement and disables continuing until the letter and all word cards are visited", () => {
    expect(render(fresh)).toContain("点完大字母和三张图片，再继续");
    expect(action(fresh)).toContain("disabled");
    const wordsOnly = lessons[0].steps[0].words.reduce((p, word) => visitPhonicsCard(p, word.word), fresh);
    expect(action(wordsOnly)).toContain("disabled");
    const all = visitPhonicsCard(wordsOnly, "sound");
    expect(action(all)).not.toContain("disabled");
    expect(action(all)).toContain('aria-describedby="phonics-card-status"');
    expect(render(all).match(/class="card-visit-mark"/g)).toHaveLength(phonicsCardIds(all).length);
    expect(render(all)).toContain("播放字母音 /s/，已点过");
  });

  it("requires the next letter's own cards and keeps the final light-up action gated", () => {
    const next = completeStep(tapAll(fresh));
    expect(action(next)).toContain("disabled");
    const last = completeStep(tapAll(next));
    expect(render(last)).toContain("学好了，点亮星球");
    expect(action(last)).toContain("disabled");
    expect(action(tapAll(last))).not.toContain("disabled");
  });
});
