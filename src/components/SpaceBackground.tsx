import type { CSSProperties } from "react";

// Fixed positions keep decorative stars stable when learning progress changes.
const stars = [
  [4, 10], [93, 13], [8, 38], [96, 46], [3, 72], [91, 83],
  [17, 91], [77, 95], [24, 8], [82, 6], [13, 62], [87, 66],
  [32, 19], [69, 15], [6, 91], [96, 94], [43, 88], [63, 97],
  [21, 75], [79, 31], [36, 60], [65, 73], [47, 6], [58, 38],
] as const;

export function SpaceBackground({ active, enabled }: { active: boolean; enabled: boolean }) {
  return (
    <div
      className="space-background"
      data-motion={active && enabled ? "running" : "paused"}
      aria-hidden="true"
    >
      <div className="space-nebula near" />
      <div className="space-nebula far" />
      <div className="space-nebula ribbon" />
      {stars.map(([left, top], index) => (
        <span
          className={`space-star${index % 7 === 0 ? " large" : ""}`}
          key={index}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            "--star-duration": `${6 + index % 6}s`,
            "--star-delay": `${-index * 0.73}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
