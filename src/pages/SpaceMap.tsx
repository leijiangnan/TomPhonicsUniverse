import { useEffect, useState } from "react";
import { ArrowLeftRight, ArrowRight, Check, Fuel, Rocket, Volume2 } from "lucide-react";
import { Badge } from "../components/space/SpaceArt";
import { FlightScene } from "../components/space/FlightScene";
import { nextExplorationNode } from "../data/space/catalog";
import { UniverseOverview } from "../components/space/UniverseOverview";
import { Robot, Cube } from "../components/Art";
import { MissionMapArt } from "../components/MissionBrief";
import {
  fuel,
  stationFound,
  STATION_COST,
  type SpaceNodeId,
} from "../lib/space";
import { stationLines } from "../data/space/station";
import { courseDone, type Progress } from "../lib/progress";
export function SpaceMap({
  progress,
  onTravel,
  onLearn,
  onConfirm,
  onPlay,
  onPractice,
  atmosphereRunning,
}: {
  progress: Progress;
  onTravel: (id: SpaceNodeId) => Promise<boolean>;
  onLearn: () => void;
  onConfirm: (step: number) => Promise<boolean>;
  onPlay: (src: string) => void;
  onPractice?: () => void;
  atmosphereRunning: boolean;
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
    const timer = setTimeout(() => setFlying(false), 4000);
    return () => clearTimeout(timer);
  }, [flying]);
  async function go(target: SpaceNodeId) {
    if (busy || flying) return;
    setBusy(true);
    try {
      if (await onTravel(target)) {
        setVisit(false);
        if (atmosphereRunning) setFlying(true);
      }
    } finally {
      setBusy(false);
    }
  }
  const line = stationLines[Math.min(s.stationStep, 2)];
  return (
    <main className="voyage-page">
      <div className="activity-heading voyage-heading">
        <div>
          <h1>我的星际航行</h1>
          <p>
            {flying
              ? `飞船正在前往${s.current === "earth" ? "地球" : "补给空间站"}。`
              : s.current === "earth"
              ? "从地球出发，去空间站看看。"
              : "已抵达补给空间站！"}
          </p>
        </div>
        <div className="fuel-meter" aria-label={`探索燃料 ${balance}`}>
          <div className="fuel-meter-icon" aria-hidden="true"><Fuel size={23} /></div>
          <div className="fuel-meter-reading"><span>探索燃料</span><strong>{balance}</strong></div>
          <div className="fuel-meter-grille" aria-hidden="true"><i /><i /><i /><i /></div>
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
          <section className="flight-console" aria-label="航行控制台">
            <div className="console-rim" aria-hidden="true"><i /><i /><i /><b /></div>
            <div className="console-task">
              <span className="eyebrow">{s.current === "earth" ? found ? "免费回访" : "第一段旅程" : s.badge ? "你的探索收藏" : "抵达后的任务"}</span>
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
                      ? "开始航行"
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
                <div className="voyage-controls">
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() => setVisit(true)}
                  >
                    {s.badge ? "查看收藏卡" : "进入补给站"}
                    <ArrowRight size={22} />
                  </button>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => void go("earth")}
                  >
                    免费返回地球 <Rocket size={22} />
                  </button>
                </div>
              </>
            )}
          </div>
              {!found && <div className="console-budget" aria-label="下一站燃料">
                <span>首次航行 {STATION_COST} 燃料</span><progress aria-label="下一站燃料储备" value={Math.min(balance, STATION_COST)} max={STATION_COST} /><strong>{balance >= STATION_COST ? "已经备好" : `还差 ${STATION_COST - balance}`}</strong>
              </div>}
              {found && !flying && <p className="future-destination">目前仅开放地球与补给空间站。{nextNode.name}等后续地点筹备中，燃料会保留。</p>}
              {s.current === "station" && s.badge && onPractice && <button className="button secondary console-practice" onClick={onPractice}>出发前，复习一下 <ArrowRight size={20} /></button>}
              {courseDone(progress, 2) && <div className="console-navigation"><MissionMapArt pieces={3} installed /><span>第 3 课的探险地图，已装进驾驶舱</span></div>}
            </div>
            <div className="console-ship">
              <FlightScene destination={s.current} flying={flying} running={atmosphereRunning} />
              <div className="console-route" aria-hidden="true"><span>地球</span><ArrowLeftRight size={16} /><span>补给空间站</span></div>
              <span className="console-location">{flying ? "正在航行" : s.current === "earth" ? "停靠地球" : "停靠补给空间站"}</span>
            </div>
          </section>
          <UniverseOverview space={s} regionIndex={regionIndex} setRegionIndex={setRegionIndex} flying={flying} />
          <div className="voyage-bottom">
            <span>游戏航线 · 非真实比例 · 补给空间站为虚构设施</span>
          </div>
        </>
      )}
    </main>
  );
}
