import { describe, expect, it, vi } from "vitest";
import { ProgressController } from "./progressController";
import { ProgressConflict, ProgressRequestError } from "./progressApi";
import { parseProgress } from "./progress";
const snapshot = (revision = 1, volume = 0.8) => ({ revision, progress: { ...parseProgress(null), volume } });
function setup(legacy: string | null = null) {
  const api = { load: vi.fn().mockResolvedValue(snapshot()), save: vi.fn().mockImplementation(async (p, revision) => ({ progress: p, revision: revision + 1 })),
    migrate: vi.fn().mockResolvedValue(snapshot(2)) };
  return { api, controller: new ProgressController(api, () => {}, legacy) };
}
describe("shared progress lifecycle", () => {
  it("loads the backend before accepting edits, without uploading an initial empty state", async () => {
    const { controller, api } = setup();
    expect(await controller.change((p) => ({ ...p, volume: 0.2 }))).toBe(false);
    await controller.refresh();
    expect(controller.view.ready).toBe(true);
    expect(api.save).not.toHaveBeenCalled();
    expect(api.migrate).not.toHaveBeenCalled();
  });
  it("migrates old browser data before allowing learning and does not migrate on each poll", async () => {
    const legacy = JSON.stringify(parseProgress(null));
    const { controller, api } = setup(legacy);
    await controller.refresh(); await controller.refresh();
    expect(api.migrate).toHaveBeenCalledExactlyOnceWith(legacy);
    expect(controller.view.ready).toBe(true);
  });
  it("does not upload corrupt legacy data or overwrite the backend", async () => {
    const { controller, api } = setup("not json"); await controller.refresh();
    expect(api.migrate).not.toHaveBeenCalled(); expect(api.save).not.toHaveBeenCalled();
    expect(controller.view.saveError).toContain("无法自动迁移");
  });
  it("blocks startup if the backend cannot be read and recovers on retry", async () => {
    const { controller, api } = setup(); api.load.mockRejectedValueOnce(new TypeError("offline"));
    expect(await controller.refresh()).toBe(false); expect(controller.view.ready).toBe(false);
    expect(api.save).not.toHaveBeenCalled();
    await controller.refresh(); expect(controller.view.ready).toBe(true);
  });
  it("serializes fast edits and uses the latest acknowledged revision", async () => {
    const { controller, api } = setup(); await controller.refresh();
    await Promise.all([controller.change((p) => ({ ...p, volume: p.volume / 2 })), controller.change((p) => ({ ...p, volume: p.volume / 2 }))]);
    expect(controller.view.progress.volume).toBe(0.2);
    expect(api.save.mock.calls.map((call) => call[1])).toEqual([1, 2]);
  });
  it("loads a remote change on refresh without writing a local stale snapshot", async () => {
    const { controller, api } = setup(); await controller.refresh(); api.load.mockResolvedValue(snapshot(8, 0.3));
    await controller.refresh(); expect(controller.view.progress.volume).toBe(0.3); expect(api.save).not.toHaveBeenCalled();
  });
  it("loads the latest state on a version conflict and requires the action to be retried", async () => {
    const { controller, api } = setup(); await controller.refresh();
    api.save.mockRejectedValueOnce(new ProgressConflict(snapshot(9, 0.1)));
    expect(await controller.change((p) => ({ ...p, volume: 0.5 }))).toBe(false);
    expect(controller.view.progress.volume).toBe(0.1); expect(controller.view.saveError).toContain("另一台设备");
    await controller.change((p) => ({ ...p, volume: 0.4 })); expect(api.save.mock.lastCall![1]).toBe(9);
  });
  it("keeps failed learning only in memory, exports confirmed data and retries when connected", async () => {
    const { controller, api } = setup(); await controller.refresh(); api.save.mockRejectedValueOnce(new TypeError("offline"));
    expect(await controller.change((p) => ({ ...p, volume: 0.2 }))).toBe(false);
    expect(controller.view.progress.volume).toBe(0.2); expect(controller.view.confirmedProgress.volume).toBe(0.8);
    expect(controller.view.saveError).toContain("尚未保存");
    await controller.refresh(); expect(controller.view.confirmedProgress.volume).toBe(0.2); expect(controller.view.saveError).toBe("");
  });
  it("does not commit failed durable travel or invalid input, including after a later retry", async () => {
    const { controller, api } = setup(); await controller.refresh(); api.save.mockRejectedValueOnce(new TypeError("offline"));
    await controller.change((p) => ({ ...p, page: "space" }), true);
    expect(controller.view.progress.page).toBe("map");
    await controller.refresh(); expect(api.save).toHaveBeenCalledTimes(1);
    api.save.mockRejectedValueOnce(new ProgressRequestError(400, "invalid"));
    await controller.change((p) => ({ ...p, volume: 0.5 })); expect(controller.view.progress.volume).toBe(0.8);
  });
  it("coalesces overlapping polls instead of building a request backlog", async () => {
    const { controller, api } = setup(); await Promise.all([controller.refresh(), controller.refresh(), controller.refresh()]);
    expect(api.load).toHaveBeenCalledTimes(1);
  });
});
