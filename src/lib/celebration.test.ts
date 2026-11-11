import { describe, expect, it } from "vitest";
import { celebrationFuelCopy } from "./celebration";

describe("celebration fuel feedback", () => {
  it("explains the current reward and the remaining station cost", () => {
    expect(celebrationFuelCopy({ gain: 30, balance: 30, cost: 50, visited: false, preview: false })).toEqual({
      reward: "本次 +30 燃料",
      destination: "距空间站还差 20 燃料",
    });
    expect(celebrationFuelCopy({ gain: 20, balance: 50, cost: 50, visited: false, preview: false }).destination)
      .toBe("空间站燃料已备好");
    expect(celebrationFuelCopy({ gain: 40, balance: 90, cost: 50, visited: false, preview: false }).reward)
      .toBe("本次 +40 燃料");
  });

  it("does not imply a new reward on replay or in parent preview", () => {
    expect(celebrationFuelCopy({ gain: 0, balance: 90, cost: 50, visited: false, preview: false }).reward)
      .toBe("本次复习不重复发放燃料");
    expect(celebrationFuelCopy({ gain: 0, balance: 90, cost: 50, visited: false, preview: true })).toEqual({
      reward: "家长预览 · 不发放燃料",
      destination: "正式进度和燃料保持不变",
    });
  });

  it("does not guess a reward event when a refresh makes it ambiguous", () => {
    expect(celebrationFuelCopy({ gain: null, balance: 50, cost: 50, visited: false, preview: false })).toEqual({
      reward: "",
      destination: "空间站燃料已备好",
    });
  });

  it("distinguishes a free revisit from the first station goal", () => {
    expect(celebrationFuelCopy({ gain: 0, balance: 40, cost: 50, visited: true, preview: false }).destination)
      .toBe("空间站已解锁，可免费回访");
  });
});
