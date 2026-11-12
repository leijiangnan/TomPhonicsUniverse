import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SpaceMap } from "./SpaceMap";
import { DestinationActions } from "../components/space/UniverseOverview";
import { RevisitPicker } from "../components/space/RevisitPicker";
import { parseProgress, selectCourse } from "../lib/progress";
import { lessons } from "../data/lesson";
import { routeNode } from "../data/space/route";
import { confirmStation, reconcileRewards, travel } from "../lib/space";
function stationWith70() {
  let p = reconcileRewards({ ...parseProgress(null), completed: [0, 1, 2], blendCompleted: [0, 1], speakingCompleted: true });
  p = selectCourse(p, 1);
  p = travel(reconcileRewards({ ...p, completed: lessons[1].steps.map((_, i) => i) }), "station");
  for (let n = 0; n < 3; n++) p = confirmStation(p, n);
  return p;
}
const handlers = { onTravel: async () => true, onLearn: () => {}, onConfirm: async () => true, onPlay: () => {}, atmosphereRunning: false };
describe("navigable Earth-Moon controls", () => {
  it("keeps the next ISS flight primary even after the station collection is complete", () => {
    const html = renderToStaticMarkup(<SpaceMap progress={stationWith70()} {...handlers} />);
    const consoleHtml = html.split('aria-label="航行控制台"')[1].split('id="universe-overview"')[0];
    expect(consoleHtml).toContain("前往国际空间站");
    expect(consoleHtml).toContain("首次航行 50 燃料");
    expect(consoleHtml).toContain("免费返回地球");
    expect(consoleHtml).toContain("查看补给收藏卡");
    expect(consoleHtml).not.toContain("筹备中");
    expect(html).toContain("先到达月球");
  });
  it("provides flight in the node dialog and explains locked and insufficient-fuel states", () => {
    const p = stationWith70();
    const render = (id: Parameters<typeof routeNode>[0], progress = p) => renderToStaticMarkup(<DestinationActions node={routeNode(id)} space={progress.space} {...handlers} busy={false} flying={false} onClose={() => {}} />);
    expect(render("catalog-2")).toContain("前往国际空间站");
    expect(render("moon")).toContain("先到达国际空间站");
    const arrived = travel(p, "catalog-2");
    expect(render("moon", arrived)).toContain("还差 80");
    expect(render("moon", arrived)).toContain("去学习，补充燃料");
    expect(render("station", arrived)).toContain("免费回访补给空间站");
  });
  it("keeps free revisits explicit after returning to Earth with too little fuel for the next new stop", () => {
    const p = travel(travel(stationWith70(), "catalog-2"), "earth");
    const html = renderToStaticMarkup(<SpaceMap progress={p} {...handlers} />);
    const consoleHtml = html.split('aria-label="航行控制台"')[1].split('id="universe-overview"')[0];
    expect(consoleHtml).toContain("下一个新航点：");
    expect(consoleHtml).toContain("月球");
    expect(consoleHtml).toContain("去学习，补充燃料");
    expect(consoleHtml).toContain("免费回访");
    const picker = renderToStaticMarkup(<RevisitPicker space={p.space} busy={false} error="" onTravel={handlers.onTravel} onClose={() => {}} />);
    expect(picker).toContain('aria-label="免费回访补给空间站"');
    expect(picker).toContain('aria-label="免费回访国际空间站"');
    expect(picker).not.toContain('aria-label="免费回访月球"');
    expect(picker).not.toContain('aria-label="免费回访地球"');
  });
});
