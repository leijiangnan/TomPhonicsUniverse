let current: HTMLAudioElement | null = null;
let cancelPending: (() => void) | null = null;
export function stopAudio() {
  cancelPending?.();
  cancelPending = null;
  if (current) {
    current.pause();
    current.src = "";
    current = null;
  }
}
export function playAudio(src: string, volume: number): Promise<void> {
  stopAudio();
  if (volume === 0)
    return Promise.reject(new Error("声音已关闭，请先开启声音。"));
  return new Promise((resolve, reject) => {
    const audio = new Audio(src);
    current = audio;
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
