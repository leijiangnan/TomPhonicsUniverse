import { useId, useLayoutEffect, useRef, useState } from "react";

/** Decorative connectors follow DOM order; wrap paths stay in row gutters. */
export function RouteArrows({ regionId }: { regionId: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const marker = useId();
  const [paths, setPaths] = useState<string[]>([]);
  useLayoutEffect(() => {
    const grid = ref.current?.parentElement;
    if (!grid) return;
    const measure = () => {
      const origin = grid.getBoundingClientRect();
      const nodes = [...grid.querySelectorAll<HTMLElement>(".universe-node")];
      const boxes = nodes.map(node => {
        const box = node.getBoundingClientRect();
        const art = node.querySelector(".universe-body")!.getBoundingClientRect();
        return { x: box.left - origin.left, y: box.top - origin.top, width: box.width, bottom: box.bottom - origin.top, middle: art.top - origin.top + art.height / 2 };
      });
      setPaths(boxes.slice(0, -1).map((from, i) => {
        const to = boxes[i + 1];
        const start = from.x + from.width * .88;
        const end = to.x + to.width * .12;
        if (Math.abs(to.y - from.y) < 30)
          return `M ${start} ${from.middle} L ${end} ${to.middle}`;
        const gap = (from.bottom + to.y) / 2;
        const right = origin.width - 10;
        const left = 10;
        return `M ${start} ${from.middle} H ${right} V ${gap} H ${left} V ${to.middle} H ${end}`;
      }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    grid.querySelectorAll(".universe-node").forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [regionId]);
  return <svg ref={ref} className="route-arrows" aria-hidden="true" focusable="false">
    <defs><marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="#b7d3df" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></marker></defs>
    {paths.map((d, i) => <g key={i}><path className="route-arrow-base" d={d} markerEnd={`url(#${marker})`} /><path className="route-arrow-flow" d={d} /></g>)}
  </svg>;
}
