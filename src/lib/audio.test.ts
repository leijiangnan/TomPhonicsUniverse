import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { acquireRecordingLock, playAudio, stopAudio } from "./audio";

class FakeAudio {
  static created: FakeAudio[] = [];
  src: string;
  volume = 1;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  pause = vi.fn();
  play = vi.fn(() => Promise.resolve());
  constructor(src: string) {
    this.src = src;
    FakeAudio.created.push(this);
  }
}

const releases: (() => void)[] = [];
function capture() {
  const release = acquireRecordingLock();
  expect(release).not.toBeNull();
  releases.push(release!);
  return release!;
}

beforeEach(() => {
  FakeAudio.created = [];
  vi.stubGlobal("Audio", FakeAudio);
});
afterEach(() => {
  releases.splice(0).forEach((release) => release());
  stopAudio();
  vi.unstubAllGlobals();
});

describe("audio playback and microphone ownership", () => {
  it("actually pauses the previous clip and cancels its waiting sequence", async () => {
    const first = playAudio("/first.mp3", .8).catch((error: Error) => error.message);
    const audio = FakeAudio.created[0];
    stopAudio();
    expect(await first).toBe("cancelled");
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.src).toBe("");
    expect(audio.onended).toBeNull();
  });

  it("stops an active example as soon as microphone permission is requested", async () => {
    const example = playAudio("/example.mp3", .8).catch((error: Error) => error.message);
    capture();
    expect(await example).toBe("cancelled");
    expect(FakeAudio.created[0].pause).toHaveBeenCalledOnce();
    await expect(playAudio("/other.mp3", .8)).rejects.toThrow("麦克风使用中");
    expect(FakeAudio.created).toHaveLength(1);
  });

  it("holds one microphone owner until its own release, even after stopping playback", async () => {
    const release = capture();
    expect(acquireRecordingLock()).toBeNull();
    stopAudio();
    await expect(playAudio("/example.mp3", .8)).rejects.toThrow("麦克风使用中");
    release();
    const playback = playAudio("blob:local-recording", .3);
    expect(FakeAudio.created[0].volume).toBe(.3);
    FakeAudio.created[0].onended?.();
    await expect(playback).resolves.toBeUndefined();
  });

  it("ignores a stale or repeated release after another recording has started", async () => {
    const oldRelease = capture();
    oldRelease();
    const newRelease = capture();
    oldRelease();
    await expect(playAudio("/example.mp3", .8)).rejects.toThrow("麦克风使用中");
    newRelease();
    const playback = playAudio("/example.mp3", .8);
    FakeAudio.created[0].onended?.();
    await playback;
  });

  it("still respects mute after microphone cleanup", async () => {
    capture()();
    await expect(playAudio("/example.mp3", 0)).rejects.toThrow("声音已关闭");
    expect(FakeAudio.created).toHaveLength(0);
  });
});
