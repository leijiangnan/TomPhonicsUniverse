export type AtlasClock = { elapsed: number; previous: number | null };

// A paused or newly resumed scene keeps its pose; long gaps do not fast-forward it.
export function advanceAtlasClock(clock: AtlasClock, now: number, running: boolean): AtlasClock {
  if (!running) return { elapsed: clock.elapsed, previous: null };
  const delta = clock.previous === null ? 0 : Math.max(0, Math.min(now - clock.previous, 100));
  return { elapsed: clock.elapsed + delta, previous: now };
}
