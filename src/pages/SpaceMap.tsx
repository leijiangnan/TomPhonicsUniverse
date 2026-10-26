import { useEffect, useState } from "react";
import { ArrowRight, Check, Fuel, Rocket, Volume2 } from "lucide-react";
import { Badge } from "../components/space/SpaceArt";
import { nextExplorationNode } from "../data/space/catalog";
import { UniverseOverview } from "../components/space/UniverseOverview";
import { Robot, Cube } from "../components/Art";
import {
  fuel,
  stationFound,
  STATION_COST,
  type SpaceNodeId,
} from "../lib/space";
import { stationLines } from "../data/space/station";
import type { Progress } from "../lib/progress";
export function SpaceMap({
  progress,
  onTravel,
  onLearn,
  onConfirm,
  onPlay,
}: {
  progress: Progress;
  onTravel: (id: SpaceNodeId) => Promise<boolean>;
  onLearn: () => void;
  onConfirm: (step: number) => Promise<boolean>;
  onPlay: (src: string) => void;
}) {
  const [regionIndex, setRegionIndex] = useState(0);
  const [flying, setFlying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [visit, setVisit] = useState(false);
  const s = progress.space;
  const balance = fuel(s),
    found = stationFound(s);
  const nextNode = nextExplorationNode(found);
  useEffect(() => {
    if (!flying) return;
    const timer = setTimeout(() => setFlying(false), 1200);
    return () => clearTimeout(timer);
  }, [flying]);
  async function go(target: SpaceNodeId) {
    if (busy || flying) return;
    setBusy(true);
    try {
      if (await onTravel(target)) {
        setVisit(false);
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
          setFlying(true);
      }
    } finally {
      setBusy(false);
    }
  }
  const line = stationLines[Math.min(s.stationStep, 2)];
  return (
    <main className="voyage-page">
      <div className="activity-heading">
        <div>
          <h1>我的星际航行</h1>
          <p>
            {s.current === "earth"
              ? "从地球出发，去空间站看看。"
              : "已抵达补给空间站！"}
          </p>
        </div>
        <div className="fuel-meter" aria-label={`探索燃料 ${balance}`}>
          <Fuel size={28} />
          <strong>{balance}</strong>
          <span>燃料</span>
        </div>
      </div>
      {visit && s.current === "station" ? (
        <section className="station-visit">
          {s.badge ? (
            <div className="station-reward">
              <Badge />
              <div>
                <h2>补给先锋</h2>
                <p>第一张探索收藏卡，点亮啦！</p>
                <p>已发现：补给空间站</p>
                <span className="fiction-label">游戏中的虚构设施</span>
                <button
                  className="button primary"
                  onClick={() => setVisit(false)}
                >
                  回到航线 <ArrowRight size={20} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="station-dialogue">
                <Robot />
                <div>
                  <h2>{line.title}</h2>
                  <button
                    className="station-speech"
                    onClick={() => onPlay(line.npcAudio)}
                  >
                    <Volume2 size={23} />
                    {line.npc}
                  </button>
                </div>
                <svg
                  className="fuel-cell"
                  viewBox="0 0 90 100"
                  role="img"
                  aria-label="游戏补给方块"
                >
                  <Cube x={12} y={30} size={30} />
                </svg>
              </div>
              <div className="station-reply">
                <button onClick={() => onPlay(line.replyAudio)}>
                  <Volume2 size={23} />
                  {line.reply}
                </button>
                <p>一起说一说，再请家长确认。</p>
              </div>
              <footer className="activity-controls">
                <button
                  className="button secondary"
                  onClick={() => setVisit(false)}
                >
                  稍后继续
                </button>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await onConfirm(s.stationStep);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {s.stationStep === 2
                    ? "家长确认，领取收藏卡"
                    : "家长确认，继续"}
                  <Check size={20} />
                </button>
              </footer>
            </>
          )}
        </section>
      ) : (
        <>
          <UniverseOverview space={s} regionIndex={regionIndex} setRegionIndex={setRegionIndex} flying={flying} />
          <section className="next-fuel" aria-label="下一站燃料" aria-live="polite">
            <div><span>{found ? "下一探索目标 · 筹备中" : "下一站"}</span><h2>{nextNode.name}</h2></div>
            <div className="fuel-budget">
              <div><span>现有燃料</span><strong>{balance}</strong></div>
              <div><span>首次需要</span><strong>{found ? "待定" : STATION_COST}</strong></div>
              <div><span>还差</span><strong>{found ? "待定" : Math.max(0, STATION_COST - balance)}</strong></div>
              {!found && <progress aria-label="下一站燃料储备" value={Math.min(balance, STATION_COST)} max={STATION_COST} />}
            </div>
            <p>{found ? "国际空间站尚未开放，燃料费用与开放条件待设计。" : balance >= STATION_COST ? "燃料已备好，可以起飞！" : "完成学习任务，获得燃料。"}</p>
          </section>
          <div className="voyage-action" aria-live="polite">
            {flying ? (
              <p className="flight-status">
                <Rocket size={24} />
                正在航行，即将抵达…
              </p>
            ) : s.current === "earth" ? (
              <>
                <div>
                  <h2>{found ? "再去空间站看看" : "第一站：补给空间站"}</h2>
                  <p>{found ? "往返免费，不消耗燃料。" : "准备好就出发吧。"}</p>
                </div>
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() =>
                    found || balance >= STATION_COST ? void go("station") : onLearn()
                  }
                >
                  {found
                    ? "免费回访"
                    : balance >= STATION_COST
                      ? "准备起飞"
                      : "去学习，获得燃料"}
                  <Rocket size={22} />
                </button>
              </>
            ) : (
              <>
                <div>
                  <h2>机器人在等你</h2>
                  <p>
                    {s.badge
                      ? "补给先锋已收集，可以随时查看。"
                      : "打个招呼，领取你的第一张收藏卡。"}
                  </p>
                </div>
                <button
                  className="button primary"
                  onClick={() => setVisit(true)}
                >
                  {s.badge ? "查看收藏卡" : "进入补给站"}
                  <ArrowRight size={22} />
                </button>
              </>
            )}
          </div>
          <div className="voyage-bottom">
            <span>游戏航线 · 非真实比例 · 补给空间站为虚构设施</span>
            {s.current === "station" && (
              <button
                className="button secondary"
                disabled={busy || flying}
                onClick={() => void go("earth")}
              >
                免费返回地球
              </button>
            )}
          </div>
        </>
      )}
    </main>
  );
}
