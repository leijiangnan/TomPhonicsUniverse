import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, ArrowRight, Check, Fuel, Rocket, Volume2 } from "lucide-react";
import { Badge } from "../components/space/SpaceArt";
import { FlightScene } from "../components/space/FlightScene";
import { RevisitPicker } from "../components/space/RevisitPicker";
import { routeNode, travelNodes } from "../data/space/route";
import { UniverseOverview } from "../components/space/UniverseOverview";
import { Robot, Cube } from "../components/Art";
import { MissionMapArt } from "../components/MissionBrief";
import {
  fuel,
  nextDestination,
  travelStatus,
  visitedNodes,
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
  animateFlights = atmosphereRunning,
}: {
  progress: Progress;
  onTravel: (id: SpaceNodeId) => Promise<boolean>;
  onLearn: () => void;
  onConfirm: (step: number) => Promise<boolean>;
  onPlay: (src: string) => void;
  onPractice?: () => void;
  atmosphereRunning: boolean;
  animateFlights?: boolean;
}) {
  const [regionIndex, setRegionIndex] = useState(0);
  const [flight, setFlight] = useState<{ from: SpaceNodeId; to: SpaceNodeId } | null>(null);
  const flying = flight !== null;
  const [busy, setBusy] = useState(false);
  const [visit, setVisit] = useState(false);
  const [revisitsOpen, setRevisitsOpen] = useState(false);
  const [travelError, setTravelError] = useState("");
  const pending = useRef(false);
  const page = useRef<HTMLElement>(null);
  const s = progress.space;
  const balance = fuel(s);
  const currentNode = routeNode(s.current);
  const nextNode = nextDestination(s);
  const destination = nextNode ?? routeNode(s.current === "earth" ? "station" : "earth");
  const status = travelStatus(s, destination.id);
  const count = visitedNodes(s).length;
  useEffect(() => {
    if (!flight) return;
    const timer = setTimeout(() => setFlight(null), 4000);
    return () => clearTimeout(timer);
  }, [flight]);
  useEffect(() => { setVisit(false); setRevisitsOpen(false); setTravelError(""); }, [s.current]);
  async function go(target: SpaceNodeId): Promise<boolean> {
    if (pending.current || flying) return false;
    pending.current = true;
    setBusy(true);
    setTravelError("");
    const from = s.current;
    try {
      if (await onTravel(target)) {
        setVisit(false);
        setRevisitsOpen(false);
        if (animateFlights) setFlight({ from, to: target });
        window.scrollTo(0, 0);
        page.current?.closest<HTMLElement>(".app-shell")?.scrollTo(0, 0);
        return true;
      }
      setTravelError("本次航行未提交，请检查保存提示后重试。");
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  const line = stationLines[Math.min(s.stationStep, 2)];
  return (
    <main className="voyage-page" ref={page}>
      <div className="activity-heading voyage-heading">
        <div>
          <h1>我的星际航行</h1>
          <p>
            {flying
              ? `飞船正在前往${routeNode(flight.to).name}。`
              : <>当前位置：{currentNode.name}<span className="voyage-count"> · 已到达 {count} / {travelNodes.length}</span></>}
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
              <span className="eyebrow">{nextNode ? "继续探索地月空间" : "地月空间已全部到达"}</span>
              <div className="voyage-action" aria-live="polite">
                {flight ? <p className="flight-status"><Rocket size={24} />正在前往{routeNode(flight.to).name}…</p> : <>
                  <div>
                    <h2>{nextNode ? "下一个新航点：" : "免费回访："}{destination.name}</h2>
                    <p>{status.kind === "free" ? "已到达的地点免费回访，不消耗燃料。"
                      : status.shortfall > 0 ? `首次需要 ${status.cost} 燃料，还差 ${status.shortfall}。`
                      : `首次需要 ${status.cost} 燃料，准备好就出发。`}</p>
                  </div>
                  <button className="button primary" disabled={busy}
                    onClick={() => status.kind === "fuel" ? onLearn() : void go(destination.id)}>
                    {busy ? "正在保存…" : status.kind === "fuel" ? "去学习，补充燃料"
                      : status.kind === "free" ? destination.id === "earth" ? "免费返回地球" : `免费回访${destination.name}`
                      : `前往${destination.name}`}<Rocket size={22} />
                  </button>
                </>}
              </div>
              {!flying && status.cost > 0 && <div className="console-budget" aria-label="下一站燃料">
                <span>首次航行 {status.cost} 燃料</span>
                <progress aria-label="下一站燃料储备" value={Math.min(balance, status.cost)} max={status.cost} />
                <strong>{status.shortfall > 0 ? `还差 ${status.shortfall}` : "已经备好"}</strong>
              </div>}
              {!flying && <div className="voyage-controls console-utilities">
                {count > 1 && <button className="button secondary" disabled={busy} onClick={() => { setTravelError(""); setRevisitsOpen(true); }}>免费回访<ArrowLeftRight size={20} /></button>}
                {s.current !== "earth" && destination.id !== "earth" && <button className="button secondary" disabled={busy} onClick={() => void go("earth")}>免费返回地球</button>}
                {s.current === "station" && <button className="button secondary" disabled={busy} onClick={() => setVisit(true)}>{s.badge ? "查看补给收藏卡" : "进入补给站"}<ArrowRight size={20} /></button>}
                {s.current === "station" && s.badge && onPractice && <button className="button secondary" onClick={onPractice}>复习一下<ArrowRight size={20} /></button>}
              </div>}
              {travelError && <p className="voyage-error" role="alert">{travelError}</p>}
              {!flying && <p className="future-destination">{nextNode ? count > 1 ? "新航点按顺序探索；已到达的地点可随时免费回访。" : "点下方星图可查看各个航点。" : "地月空间 9 个航点都已到达！可以随时免费回访。其他星域仍在筹备。"}</p>}
              {courseDone(progress, 2) && <div className="console-navigation"><MissionMapArt pieces={3} installed /><span>第 3 课的探险地图，已装进驾驶舱</span></div>}
            </div>
            <div className="console-ship">
              <FlightScene from={flight?.from ?? s.current} destination={flight?.to ?? destination.id} flying={flying} running={atmosphereRunning} />
              <div className="console-route" aria-hidden="true"><span>{routeNode(flight?.from ?? s.current).name}</span><ArrowLeftRight size={16} /><span>{routeNode(flight?.to ?? destination.id).name}</span></div>
              <span className="console-location">{flight ? "正在航行" : `停靠${currentNode.name}`}</span>
            </div>
          </section>
          <UniverseOverview space={s} regionIndex={regionIndex} setRegionIndex={setRegionIndex} flying={flying} busy={busy} onTravel={go} onLearn={onLearn} />
          <div className="voyage-bottom">
            <span>游戏航点与观测位置 · 非真实比例或真实登陆 · 补给站等游戏设施为虚构</span>
          </div>
        </>
      )}
      {revisitsOpen && <RevisitPicker space={s} busy={busy || flying} error={travelError} onTravel={go} onClose={() => setRevisitsOpen(false)} />}
    </main>
  );
}
