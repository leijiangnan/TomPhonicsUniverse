import { withSaveLock } from "./saveLock";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  initialProgress,
  parseProgress,
  STORAGE_KEY,
  type Progress,
} from "./progress";
import { reconcileRewards } from "./space";
type Change = Progress | ((p: Progress) => Progress);
export function useProgress() {
  const [progress, render] = useState<Progress>(() => {
    try {
      return parseProgress(localStorage.getItem(STORAGE_KEY));
    } catch {
      return { ...initialProgress };
    }
  });
  const state = useRef(progress);
  const expected = useRef<string | null>(null);
  const initialized = useRef(false);
  if (!initialized.current) {
    try {
      expected.current = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* learning remains usable */
    }
    initialized.current = true;
  }
  const [saveError, setSaveError] = useState("");
  const queue = useRef(Promise.resolve(true));
  const setProgress = useCallback(
    (change: Change, durable = false): Promise<boolean> => {
      const execute = async () => {
        const commit = () => {
          let next = state.current;
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw !== expected.current) {
              expected.current = raw;
              state.current = parseProgress(raw);
              render(state.current);
              setSaveError("另一页更新了进度，已载入最新记录，请再点一次。");
              return false;
            }
            next = reconcileRewards(
              typeof change === "function" ? change(state.current) : change,
            );
            const encoded = JSON.stringify(next);
            localStorage.setItem(STORAGE_KEY, encoded);
            expected.current = encoded;
            state.current = next;
            render(next);
            setSaveError("");
            return true;
          } catch {
            if (!durable) {
              next = reconcileRewards(
                typeof change === "function" ? change(state.current) : change,
              );
              state.current = next;
              render(next);
            }
            setSaveError(
              durable
                ? "进度未能保存，本次航行或领取未提交。请重试。"
                : "浏览器暂时无法保存进度，关闭后可能丢失。航行需保存成功后才能进行。",
            );
            return false;
          }
        };
        try {
          return await withSaveLock(commit);
        } catch {
          if (!durable) {
            const next = reconcileRewards(
              typeof change === "function" ? change(state.current) : change,
            );
            state.current = next;
            render(next);
          }
          setSaveError(
            "浏览器暂时无法安全保存。学习可暂时继续，航行和领取请稍后重试。",
          );
          return false;
        }
      };
      const job = queue.current.then(execute, execute);
      queue.current = job;
      return job;
    },
    [],
  );
  useEffect(() => {
    void setProgress((p) => p);
  }, [setProgress]);
  return { progress, setProgress, saveError };
}
