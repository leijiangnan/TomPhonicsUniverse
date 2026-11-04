import { Check, Map as MapIcon } from "lucide-react";
import { dunesDone, forestDone, type Progress } from "../lib/progress";

export function MissionMapArt({ pieces = 0, installed = false }: { pieces?: number; installed?: boolean }) {
  return <svg viewBox="0 0 240 140" role="img" aria-label={installed ? "已经装上驾驶舱的探险地图" : `找到 ${pieces} 份地图线索`}>
    {installed && <rect x="5" y="9" width="230" height="124" rx="18" fill="#243b49" stroke="#78b7b2" strokeWidth="4" />}
    {[0, 1, 2].map((i) => <g key={i} opacity={pieces > i ? 1 : 0.2}>
      <path d={`M${27 + i * 62} ${i === 1 ? 35 : 24}l62 ${i === 1 ? -11 : 11}v82l-62 ${i === 1 ? 11 : -11}z`} fill={i === 1 ? "#f5dc9a" : "#e8c780"} stroke="#ad8751" strokeWidth="2" />
      {i === 0 && <path d="m40 56 13-8 16 16 12-5M46 84l11-8 11 5" stroke="#7faaa0" strokeWidth="7" fill="none" />}
      {i === 1 && <path d="m98 82 10-17 13 3 15-16" stroke="#b9915b" strokeWidth="4" strokeDasharray="5 5" fill="none" />}
      {i === 2 && <><path d="m164 45 15 15m0-15-15 15" stroke="#c66e56" strokeWidth="5" /><path d="m159 89 14-9 18 8" stroke="#7faaa0" strokeWidth="7" fill="none" /></>}
    </g>)}
    {installed && <circle cx="215" cy="24" r="6" fill="#c1e5a0" />}
  </svg>;
}

export function MissionBrief({ progress }: { progress: Progress }) {
  if (progress.lessonIndex !== 2) return null;
  const forest = forestDone(progress), dunes = dunesDone(progress);
  const mapFound = progress.blendCompleted.includes(0);
  const installed = dunes && progress.speakingCompleted;
  const pieces = mapFound ? 3 : forest ? 2 : Math.min(progress.completed.length, 1);
  const text = installed ? "地图已装进驾驶舱，随时可以再来练习。" :
    progress.page === "speaking" ? "把找到的地图介绍给机器人。" :
    progress.page === "blending" ? mapFound ? "地图找回来了，继续完成拼读任务。" : "把 map 拼出来，找回完整地图。" :
    forest ? "声音线索找到了，接着拼出地图。" : "找到声音线索，一起找回探险地图。";
  return <div className={`mission-brief ${installed ? "installed" : ""}`} aria-label="本课地图任务">
    <MissionMapArt pieces={pieces} installed={installed} />
    <div><span>{installed ? <Check size={17} /> : <MapIcon size={17} />}{installed ? "驾驶舱地图已装好" : mapFound ? "地图已找回" : forest ? "声音线索已找到" : "寻找地图线索"}</span><p>{text}</p></div>
  </div>;
}
