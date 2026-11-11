import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlendingChallenge } from "./BlendingChallenge";
import {
  checkBlend,
  completeStep,
  initialProgress,
  openPlanet,
  parseProgress,
  updateBlendDraft,
  type Progress,
} from "../lib/progress";

function renderChallenge(progress: Progress) {
  return renderToStaticMarkup(
    <BlendingChallenge
      progress={progress}
      onPlay={() => {}}
      onPlaySequence={() => {}}
      playingSrc={null}
      onDraft={() => {}}
      onCheck={async () => true}
      onNext={() => {}}
      feedback=""
    />,
  );
}

function solvedFirstRound() {
  let state = { ...initialProgress };
  for (let index = 0; index < 3; index++) state = completeStep(state);
  state = openPlanet(state, "dunes");
  state = updateBlendDraft(state, ["a", "t"]);
  return checkBlend(state);
}

describe("first-lesson reading transfer", () => {
  it("derives the large-word reading step from a restored solved round", () => {
    const restored = parseProgress(JSON.stringify(solvedFirstRound()));
    const html = renderChallenge(restored);
    expect(html).toContain("看单词，自己读");
    expect(html).toContain("看词 at");
    expect(html).toContain("读过了，下一个");
    expect(html).toContain("一起合音");
    expect(html).not.toContain("letter-bank");
    expect(html).not.toContain("word-ipa");
  });

  it("keeps the spelling task before the word is solved", () => {
    const state = openPlanet(solvedFirstRound(), "dunes");
    const html = renderChallenge({ ...state, blendCompleted: [], blendDraft: [], blendSolved: false });
    expect(html).toContain("听声音，拼单词");
    expect(html).toContain("拼好了");
    expect(html).not.toContain("reading-board");
  });

  it("does not change the other lessons before the pilot is validated", () => {
    const html = renderChallenge({
      ...solvedFirstRound(),
      lessonIndex: 1,
      blendRound: 0,
      blendCompleted: [0],
      blendSolved: true,
    });
    expect(html).toContain("听声音，拼单词");
    expect(html).toContain("solved-feedback");
    expect(html).not.toContain("reading-board");
  });
});
