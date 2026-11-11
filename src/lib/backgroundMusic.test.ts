import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { acquireRecordingLock, playAudio, stopAudio, subscribeAudioActivity } from "./audio";
import { BACKGROUND_MUSIC_SRC, createBackgroundMusic } from "./backgroundMusic";

class FakeAudio {
  static created: FakeAudio[] = [];
  static nextPlay: Promise<void> | null = null;
  src: string;
  volume = 1;
  paused = true;
  loop = false;
  preload = "";
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onplaying: (() => void) | null = null;
  onpause: (() => void) | null = null;
  play = vi.fn(() => {
    this.paused = false;
    const promise = FakeAudio.nextPlay ?? Promise.resolve();
    FakeAudio.nextPlay = null;
    return promise;
  });
  pause = vi.fn(() => { this.paused = true; this.onpause?.(); });
  constructor(src: string) { this.src = src; FakeAudio.created.push(this); }
}

const controls: ReturnType<typeof createBackgroundMusic>[] = [];
const releases: (() => void)[] = [];
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
function music(allowed = true, masterVolume = .8) {
  const controller = createBackgroundMusic({ allowed, masterVolume });
  controls.push(controller);
  controller.connect();
  return controller;
}
function capture() {
  const release = acquireRecordingLock()!;
  expect(release).toBeTypeOf("function");
  releases.push(release);
  return release;
}
beforeEach(() => {
  vi.useFakeTimers();
  FakeAudio.created = [];
  FakeAudio.nextPlay = null;
  vi.stubGlobal("Audio", FakeAudio);
});
afterEach(() => {
  controls.splice(0).forEach((controller) => controller.dispose());
  releases.splice(0).forEach((release) => release());
  stopAudio();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("explicit, lower-priority background music", () => {
  it("does not allocate or play on load; explicit start calls play within the gesture and confirms playback", async () => {
    const controller = music();
    vi.runAllTimers();
    expect(FakeAudio.created).toHaveLength(0);
    controller.start();
    const audio = FakeAudio.created[0];
    expect(audio.src).toBe(BACKGROUND_MUSIC_SRC);
    expect(audio.loop).toBe(true);
    expect(audio.volume).toBeCloseTo(.16);
    expect(audio.play).toHaveBeenCalledOnce();
    expect(controller.getSnapshot()).toMatchObject({ intent: true, playing: false, loading: true });
    await flush();
    expect(controller.getSnapshot()).toMatchObject({ intent: true, playing: true, loading: false, error: "" });
  });

  it("lets teaching clips interrupt music and resumes only after the entire sequence is quiet", async () => {
    const controller = music();
    controller.start();
    await flush();
    const background = FakeAudio.created[0];
    const sequence = (async () => { await playAudio("/a.mp3", .8); await playAudio("/t.mp3", .8); })();
    expect(background.paused).toBe(true);
    expect(controller.getSnapshot().playing).toBe(false);
    FakeAudio.created[1].onended?.();
    await flush();
    vi.runAllTimers();
    expect(background.play).toHaveBeenCalledOnce();
    expect(FakeAudio.created[2].src).toBe("/t.mp3");
    FakeAudio.created[2].onended?.();
    await sequence;
    vi.runAllTimers();
    await flush();
    expect(background.play).toHaveBeenCalledTimes(2);
    expect(controller.getSnapshot().playing).toBe(true);
  });

  it("never overlaps an existing microphone request or recording, even if pending play finishes late", async () => {
    const controller = music();
    let resolvePlay!: () => void;
    FakeAudio.nextPlay = new Promise<void>((resolve) => { resolvePlay = resolve; });
    controller.start();
    const background = FakeAudio.created[0];
    const release = capture();
    expect(background.paused).toBe(true);
    resolvePlay();
    await flush();
    expect(background.paused).toBe(true);
    expect(controller.getSnapshot().playing).toBe(false);
    controller.start();
    expect(background.play).toHaveBeenCalledOnce();
    release();
    vi.runAllTimers();
    await flush();
    expect(controller.getSnapshot().playing).toBe(true);
  });

  it("observes a lock acquired before subscription and keeps lessons, hidden pages and mute quiet", async () => {
    const release = capture();
    const controller = music();
    controller.start();
    expect(FakeAudio.created).toHaveLength(0);
    release();
    vi.runAllTimers();
    await flush();
    const background = FakeAudio.created[0];
    controller.setAllowed(false);
    expect(background.paused).toBe(true);
    controller.setAllowed(true);
    vi.runAllTimers();
    await flush();
    expect(controller.getSnapshot().playing).toBe(true);
    controller.setMasterVolume(0);
    expect(background.paused).toBe(true);
    expect(controller.getSnapshot().error).toBe("");
    controller.setMasterVolume(.3);
    vi.runAllTimers();
    await flush();
    expect(background.volume).toBeCloseTo(.06);
    expect(controller.getSnapshot().playing).toBe(true);
  });

  it("supports gesture unmute and respects a user's pause across later eligibility changes", async () => {
    const controller = music(true, 0);
    controller.start(.8);
    expect(FakeAudio.created[0].play).toHaveBeenCalledOnce();
    await flush();
    controller.pause();
    controller.setAllowed(false);
    controller.setAllowed(true);
    controller.setMasterVolume(.7);
    vi.runAllTimers();
    await flush();
    expect(FakeAudio.created[0].play).toHaveBeenCalledOnce();
    expect(controller.getSnapshot()).toMatchObject({ intent: false, playing: false, error: "" });
  });

  it("reports a failed play, retries with a fresh audio element, and clears pending work on cleanup", async () => {
    const controller = music();
    FakeAudio.nextPlay = Promise.reject(new Error("not allowed"));
    controller.start();
    await flush();
    expect(controller.getSnapshot().error).toContain("音乐暂时无法播放");
    controller.setAllowed(false);
    controller.setAllowed(true);
    vi.runAllTimers();
    expect(FakeAudio.created).toHaveLength(1);
    controller.start();
    await flush();
    const latest = FakeAudio.created[1];
    expect(controller.getSnapshot()).toMatchObject({ error: "", playing: true });
    controller.dispose();
    expect(latest.paused).toBe(true);
    expect(latest.src).toBe("");
    expect(latest.onplaying).toBeNull();
    controller.setAllowed(true);
    vi.runAllTimers();
    expect(FakeAudio.created).toHaveLength(2);
  });

  it("does not publish false idle gaps while replacing an example", async () => {
    const activity: boolean[] = [];
    const unsubscribe = subscribeAudioActivity((busy) => activity.push(busy));
    const first = playAudio("/first.mp3", .8).catch(() => {});
    const second = playAudio("/second.mp3", .8);
    expect(activity).toEqual([false, true]);
    FakeAudio.created[1].onended?.();
    await Promise.all([first, second]);
    expect(activity).toEqual([false, true, false]);
    unsubscribe();
  });
});
