import { useCallback, useEffect, useRef, useState } from "react";
import { parseProgress, STORAGE_KEY } from "./progress";
import { ProgressApi } from "./progressApi";
import { ProgressController, type ProgressChange, type ProgressView } from "./progressController";

export function useProgress() {
  const [view, render] = useState<ProgressView>(() => ({ progress: parseProgress(null), confirmedProgress: parseProgress(null), ready: false, saveError: "" }));
  const controller = useRef<ProgressController | null>(null);
  useEffect(() => {
    let active = true;
    let legacy: string | null = null;
    try { legacy = localStorage.getItem(STORAGE_KEY); } catch { /* Backend saving needs no browser storage. */ }
    const current = new ProgressController(new ProgressApi(), (next) => { if (active) render(next); }, legacy);
    controller.current = current;
    void current.refresh();
    const refresh = () => { if (!document.hidden) void current.refresh(); };
    const interval = setInterval(refresh, 3000);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      document.removeEventListener("visibilitychange", refresh);
      if (controller.current === current) controller.current = null;
    };
  }, []);
  const setProgress = useCallback((change: ProgressChange, durable = false) => controller.current?.change(change, durable) ?? Promise.resolve(false), []);
  const retry = useCallback(() => controller.current?.refresh() ?? Promise.resolve(false), []);
  return { ...view, setProgress, retry };
}
