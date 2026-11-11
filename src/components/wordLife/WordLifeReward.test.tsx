import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WordLifeReward } from "./WordLifeReward";
import { WordLifeStill } from "./WordLifeStill";

describe("word life still art", () => {
  it("shows a hen, a bug, and the existing box drawing without starting a canvas", () => {
    expect(renderToStaticMarkup(<WordLifeStill word="hen" />)).toContain("母鸡");
    expect(renderToStaticMarkup(<WordLifeStill word="bug" />)).toContain("小虫");
    expect(renderToStaticMarkup(<WordLifeStill word="box" />)).toContain("盒子");
    const reward = renderToStaticMarkup(
      <WordLifeReward word="bug" ambientMotion={false} reducedMotion={false} onDismiss={() => {}} />,
    );
    expect(reward).toContain("data-word-life=\"bug\"");
    expect(reward).toContain("小虫活过来啦");
    expect(reward).toContain("跳过");
    expect(reward).toContain("aria-modal=\"false\"");
    expect(reward).not.toContain("<canvas");
  });

  it("stays on the picture when motion is reduced", () => {
    const reward = renderToStaticMarkup(
      <WordLifeReward word="hen" ambientMotion reducedMotion onDismiss={() => {}} />,
    );
    expect(reward).toContain("母鸡");
    expect(reward).not.toContain("word-life-canvas");
  });
});
