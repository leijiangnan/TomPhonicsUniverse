import { useEffect, useState } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

export function useAtmosphere({ active, enabled }: { active: boolean; enabled: boolean }) {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia(reducedMotionQuery).matches,
  );
  const [visible, setVisible] = useState(() => !document.hidden);
  const [dialogOpen, setDialogOpen] = useState(
    () => Boolean(document.querySelector("dialog[open]")),
  );

  useEffect(() => {
    const media = window.matchMedia(reducedMotionQuery);
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    // Node details have their own dialogs, outside App's modal state.
    const updateDialogs = () => setDialogOpen(Boolean(document.querySelector("dialog[open]")));
    const observer = new MutationObserver(updateDialogs);
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    updateMotion();
    updateVisibility();
    updateDialogs();
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
    };
  }, []);

  return { running: active && enabled && visible && !reducedMotion && !dialogOpen, reducedMotion };
}
