import { useEffect, useState, useSyncExternalStore } from "react";
import { createBackgroundMusic } from "./backgroundMusic";

export function useBackgroundMusic({ allowed, masterVolume }: { allowed: boolean; masterVolume: number }) {
  const [music] = useState(() => createBackgroundMusic({ allowed: allowed && !document.hidden, masterVolume }));
  const snapshot = useSyncExternalStore(music.subscribe, music.getSnapshot, music.getSnapshot);

  useEffect(() => {
    music.connect();
    return () => music.dispose();
  }, [music]);
  useEffect(() => {
    const updateVisibility = () => music.setAllowed(allowed && !document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, [allowed, music]);
  useEffect(() => { music.setMasterVolume(masterVolume); }, [masterVolume, music]);

  return { ...snapshot, start: music.start, pause: music.pause };
}
