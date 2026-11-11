import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CoursePath } from "./CoursePath";
import { initialProgress } from "../lib/progress";

describe("course path progressive disclosure", () => {
  it("expands only the current unit while keeping every unit available", () => {
    const html = renderToStaticMarkup(
      <CoursePath progress={initialProgress} previewEnabled={false} onSelect={() => {}} />,
    );
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(5);
    expect(html).toContain('id="course-unit-panel-0"');
    expect(html).not.toContain('id="course-unit-panel-1"');
    expect(html).toContain("展开全部 48 课");
    expect(html).toContain("字母启航");
    expect(html).toContain("银河空间站");
  });

  it("does not render repeated future lesson cards before their unit is opened", () => {
    const html = renderToStaticMarkup(
      <CoursePath progress={initialProgress} previewEnabled={true} onSelect={() => {}} />,
    );
    expect(html).not.toContain("第 17 课，");
    expect(html).not.toContain("第 48 课，");
    expect(html).toContain("规划中");
    expect(html).toContain("家长预览已开启");
  });
});
