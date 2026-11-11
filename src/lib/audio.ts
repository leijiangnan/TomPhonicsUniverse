let current: HTMLAudioElement | null = null;
let cancelPending: (() => void) | null = null;
let recordingOwner: symbol | null = null;
const activityListeners = new Set<(busy: boolean) => void>();
let publishedBusy = false;
let suppressActivity = 0;

export function isAudioBusy() {
  return current !== null || recordingOwner !== null;
}

function publishActivity() {
  if (suppressActivity) return;
  const busy = isAudioBusy();
  if (busy === publishedBusy) return;
  publishedBusy = busy;
  activityListeners.forEach((listener) => listener(busy));
}

export function subscribeAudioActivity(listener: (busy: boolean) => void) {
  activityListeners.add(listener);
  listener(isAudioBusy());
  return () => { activityListeners.delete(listener); };
}

/** Hold playback while requesting or using the microphone. Release only this capture. */
export function acquireRecordingLock(): (() => void) | null {
  if (recordingOwner) return null;
  const owner = Symbol("recording");
  recordingOwner = owner;
  stopAudio();
  return () => {
    if (recordingOwner === owner) {
      recordingOwner = null;
      publishActivity();
    }
  };
}

function stopCurrentAudio(notify: boolean) {
  const audio = current;
  suppressActivity++;
  try {
    cancelPending?.();
    cancelPending = null;
    current = null;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
  } finally {
    suppressActivity--;
    if (notify) publishActivity();
  }
}
export function stopAudio() {
  stopCurrentAudio(true);
}
export function playAudio(src: string, volume: number): Promise<void> {
  if (recordingOwner)
    return Promise.reject(new Error("麦克风使用中，示范已暂停。请结束录音后再播放。"));
  // Replacing an example must not publish a brief idle gap to background music.
  stopCurrentAudio(false);
  if (volume === 0) {
    publishActivity();
    return Promise.reject(new Error("声音已关闭，请先开启声音。"));
  }
  return new Promise((resolve, reject) => {
    let audio: HTMLAudioElement;
    try { audio = new Audio(src); }
    catch {
      publishActivity();
      reject(new Error("声音暂时无法播放，请重试，或由家长领读。"));
      return;
    }
    current = audio;
    publishActivity();
    audio.volume = volume;
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      audio.onended = null;
      audio.onerror = null;
      if (current === audio) {
        current = null;
        cancelPending = null;
        publishActivity();
      }
      if (error) reject(error);
      else resolve();
    };
    cancelPending = () => finish(new Error("cancelled"));
    audio.onended = () => finish();
    audio.onerror = () =>
      finish(new Error("声音暂时无法播放，请重试，或由家长领读。"));
    audio
      .play()
      .catch(() =>
        finish(new Error("声音暂时无法播放，请重试，或由家长领读。")),
      );
  });
}
