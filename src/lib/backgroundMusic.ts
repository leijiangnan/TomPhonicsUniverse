import { isAudioBusy, subscribeAudioActivity } from "./audio";

export const BACKGROUND_MUSIC_SRC = "/audio/space-ambience.mp3";
export type MusicState = {
  intent: boolean;
  playing: boolean;
  paused: boolean;
  loading: boolean;
  error: string;
};

const musicVolume = (value: number) => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * .2;

/** Music is lower priority than every teaching clip and microphone request. */
export function createBackgroundMusic(options: { allowed: boolean; masterVolume: number }) {
  let allowed = options.allowed;
  let volume = musicVolume(options.masterVolume);
  let audio: HTMLAudioElement | null = null;
  let connected = false;
  let unsubscribeActivity: (() => void) | null = null;
  let resumeTimer: ReturnType<typeof setTimeout> | null = null;
  let request = 0;
  let pending = false;
  let state: MusicState = { intent: false, playing: false, paused: false, loading: false, error: "" };
  const listeners = new Set<() => void>();

  function update(change: Partial<MusicState>) {
    const next = { ...state, ...change };
    next.paused = next.intent && !next.playing;
    if (Object.keys(next).every((key) => next[key as keyof MusicState] === state[key as keyof MusicState])) return;
    state = next;
    listeners.forEach((listener) => listener());
  }
  const canPlay = () => connected && state.intent && allowed && volume > 0 && !isAudioBusy();
  function cancelResume() {
    if (resumeTimer !== null) clearTimeout(resumeTimer);
    resumeTimer = null;
  }
  function pausePlayback() {
    cancelResume();
    request++;
    const wasPending = pending;
    pending = false;
    if (audio && (!audio.paused || wasPending)) audio.pause();
    update({ playing: false, loading: false });
  }
  function fail() {
    pausePlayback();
    update({ error: "音乐暂时无法播放，请再点一次播放。" });
  }
  function releaseAudio() {
    if (!audio) return;
    audio.onplaying = null;
    audio.onpause = null;
    audio.onerror = null;
    audio.src = "";
    audio = null;
  }
  function play() {
    if (!canPlay()) { pausePlayback(); return; }
    if (state.error || state.playing || pending) return;
    if (!audio) {
      try { audio = new Audio(BACKGROUND_MUSIC_SRC); }
      catch { fail(); return; }
      audio.loop = true;
      audio.preload = "none";
      audio.onplaying = () => {
        if (!audio || !canPlay()) { pausePlayback(); return; }
        if (!audio.paused) update({ playing: true, loading: false });
      };
      audio.onpause = () => {
        if (audio?.paused) update({ playing: false });
      };
      audio.onerror = fail;
    }
    const target = audio;
    target.volume = volume;
    const currentRequest = ++request;
    pending = true;
    update({ loading: true });
    // This call remains synchronous for a button gesture, including unmuting.
    try {
      void target.play().then(() => {
        if (currentRequest !== request) {
          if (!canPlay()) target.pause();
          return;
        }
        pending = false;
        if (!canPlay()) { pausePlayback(); return; }
        update({ playing: !target.paused, loading: false });
      }).catch(() => {
        if (currentRequest === request) fail();
      });
    } catch {
      if (currentRequest === request) fail();
    }
  }
  function scheduleResume() {
    cancelResume();
    if (!canPlay() || state.error || state.playing || pending) return;
    // Allow an entire phoneme sequence's microtasks to select the next clip.
    resumeTimer = setTimeout(() => { resumeTimer = null; play(); }, 0);
  }

  return {
    getSnapshot: () => state,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    connect() {
      if (connected) return;
      connected = true;
      unsubscribeActivity = subscribeAudioActivity((busy) => {
        if (busy) pausePlayback();
        else scheduleResume();
      });
      scheduleResume();
    },
    setAllowed(value: boolean) {
      allowed = value;
      if (!canPlay()) pausePlayback();
      else scheduleResume();
    },
    setMasterVolume(value: number) {
      volume = musicVolume(value);
      if (audio) audio.volume = volume;
      if (!canPlay()) pausePlayback();
      else scheduleResume();
    },
    start(volumeOverride?: number) {
      if (volumeOverride !== undefined) volume = musicVolume(volumeOverride);
      cancelResume();
      if (state.error) {
        pausePlayback();
        releaseAudio();
      }
      update({ intent: true, error: "" });
      play();
    },
    pause() {
      update({ intent: false, error: "" });
      pausePlayback();
    },
    dispose() {
      connected = false;
      unsubscribeActivity?.();
      unsubscribeActivity = null;
      pausePlayback();
      releaseAudio();
      update({ intent: false, playing: false, loading: false, error: "" });
    },
  };
}
