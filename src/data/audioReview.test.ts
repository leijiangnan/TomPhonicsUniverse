import { describe, expect, it } from "vitest";
import { audioReviewRows } from "./audioReview";
import { practiceItems } from "../lib/practice";

const files = import.meta.glob("../../public/audio/**/*.mp3", { query: "?url", import: "default", eager: true });
describe("audio review inventory", () => {
  it("lists existing unique assets and leaves manual verification pending", () => {
    const rows = audioReviewRows();
    expect(new Set(rows.map((row) => row.audio)).size).toBe(rows.length);
    for (const row of rows) {
      expect(`../../public${row.audio}` in files).toBe(true);
      expect(row.status).toBe("待人工校对");
      expect(row.target.length).toBeGreaterThan(0);
    }
    const paths = new Set(rows.map((row) => row.audio));
    for (const item of practiceItems) for (const audio of item.audio) expect(paths.has(audio)).toBe(true);
  });
});
