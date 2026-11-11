import { describe, expect, it } from "vitest";
import { advanceAtlasClock } from "./atlasMotion";

describe("atlas animation clock", () => {
  it("advances while visible and resumes from the same pose after a pause", () => {
    let clock = { elapsed: 0, previous: null as number | null };
    clock = advanceAtlasClock(clock, 1000, true);
    clock = advanceAtlasClock(clock, 1050, true);
    expect(clock.elapsed).toBe(50);
    clock = advanceAtlasClock(clock, 1100, false);
    clock = advanceAtlasClock(clock, 10000, false);
    expect(clock.elapsed).toBe(50);
    clock = advanceAtlasClock(clock, 15000, true);
    expect(clock.elapsed).toBe(50);
    clock = advanceAtlasClock(clock, 15050, true);
    expect(clock.elapsed).toBe(100);
  });

  it("limits a stalled frame and never moves backwards", () => {
    expect(advanceAtlasClock({ elapsed: 200, previous: 1000 }, 4000, true).elapsed).toBe(300);
    expect(advanceAtlasClock({ elapsed: 200, previous: 1000 }, 900, true).elapsed).toBe(200);
  });
});
