import { useRef, useState } from "react";
import { Check, Lock, MapPin, Rocket } from "lucide-react";
import { explorationRegions, type CatalogNode } from "../../data/space/catalog";
import { isSpaceNode, routeNode, travelNodes, type SpaceNodeId } from "../../data/space/route";
import { type SpaceProgress, nodeVisited, visitedNodes, travelStatus, fuel } from "../../lib/space";
import { RouteArrows } from "./RouteArrows";
import { NodeArt } from "./NodeArt";
import { Ship } from "./SpaceArt";
import { Dialog } from "../Dialog";
import { NodeDetails } from "./NodeDetails";
import { nodeScience } from "../../data/space/science";
import { Atlas3D } from "./Atlas3D";
import "./Atlas3D.css";

type TravelActions = { onTravel: (id: SpaceNodeId) => Promise<boolean>; onLearn: () => void; busy: boolean; flying: boolean };
export function DestinationActions({ node, space, onTravel, onLearn, onClose, busy, flying }: TravelActions & {
  node: CatalogNode; space: SpaceProgress; onClose: () => void;
}) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const status = travelStatus(space, node.id);
  const canTravel = status.kind === "ready" || status.kind === "free";
  return <div className="node-travel-actions">
    <p>{status.kind === "unavailable" ? "这个星域的航行尚未开放，目前可探索地月空间的全部 9 个航点。"
      : flying ? "正在航行，抵达后可继续选择目的地。"
      : status.kind === "current" ? "飞船现在停靠在这里。"
      : status.kind === "locked" ? `先到达${routeNode(status.previous!).name}，再来探索这里。`
      : status.kind === "free" ? "已到达，回访免费。"
      : `首次需要 ${status.cost} 燃料，现有 ${fuel(space)}${status.shortfall ? `，还差 ${status.shortfall}` : "，燃料已备好"}。`}</p>
    {canTravel && <button className="button primary" disabled={busy || sending || flying} onClick={async () => {
      if (pending.current || !isSpaceNode(node.id)) return;
      pending.current = true; setSending(true); setError("");
      try {
        if (await onTravel(node.id)) onClose();
        else setError("航行未提交，请检查保存提示后重试。");
      } finally { pending.current = false; setSending(false); }
    }}>{sending ? "正在保存…" : status.kind === "free" ? `免费回访${node.name}` : `前往${node.name}`}<Rocket size={21} /></button>}
    {status.kind === "fuel" && <button className="button primary" disabled={busy || flying} onClick={() => { onClose(); onLearn(); }}>去学习，补充燃料</button>}
    {status.kind === "locked" && <button className="button secondary" disabled>先到达{routeNode(status.previous!).name}</button>}
    {error && <p className="voyage-error" role="alert">{error}</p>}
  </div>;
}

export function UniverseOverview({ space, regionIndex, setRegionIndex, flying, busy, onTravel, onLearn }: TravelActions & {
  space: SpaceProgress; regionIndex: number; setRegionIndex: (index: number) => void;
}) {
  const [selected, setSelected] = useState<CatalogNode | null>(null);
  const [atlasReady, setAtlasReady] = useState(false);
  const region = explorationRegions[regionIndex];
  const nodes = region.nodes;
  const status = (id: string) => {
    const state = travelStatus(space, id);
    return state.kind === "current" ? flying ? "航行目的地" : "你在这里"
      : state.kind === "free" ? "已到达 · 免费回访"
      : state.kind === "ready" ? `可航行 · ${state.cost} 燃料`
      : state.kind === "fuel" ? `还差 ${state.shortfall} 燃料`
      : state.kind === "locked" ? `先到达${routeNode(state.previous!).name}` : "筹备中";
  };
  return <section id="universe-overview" className="universe-overview" aria-label="全宇宙概览">
    <div className="universe-heading">
      <div><h2>全宇宙概览</h2><p>{flying ? "正在前往" : "当前位置"}：{routeNode(space.current).name}</p></div>
      <button className="button secondary" onClick={() => { setRegionIndex(0); setSelected(routeNode(space.current)); }}><MapPin size={20} />{flying ? "查看目的地" : "我的位置"}</button>
    </div>
    <div className="region-picker" role="group" aria-label="选择星域">
      {explorationRegions.map((item, i) => <button key={item.id} aria-pressed={i === regionIndex} onClick={() => setRegionIndex(i)}><span>{item.id}</span>{item.name}<small>{item.nodes.length} 个地点</small></button>)}
    </div>
    <h3 className="region-title">{region.name}<span>{flying ? "航行中" : regionIndex === 0 ? `已到达 ${visitedNodes(space).length} / ${travelNodes.length}` : `已到达 0 / ${nodes.length}`}</span></h3>
    <div className={`universe-nodes${atlasReady ? " atlas-3d-ready" : ""}`}>
      <Atlas3D key={region.id} nodes={nodes} onReady={setAtlasReady} />
      <RouteArrows regionId={region.id} />
      {nodes.map((node, index) => {
        const current = node.id === space.current;
        const state = travelStatus(space, node.id);
        return <button key={node.id} className={`universe-node ${current ? "current" : ""}`} onClick={() => setSelected(node)} aria-current={current && !flying ? "location" : undefined} aria-label={`${node.name}，${status(node.id)}，查看详情`}>
          <div className="universe-body"><NodeArt node={node} />{current && <div className={`universe-ship ${flying ? "landing" : ""}`}><Ship /></div>}</div>
          <strong>{index + 1}. {node.name}</strong>
          <span>{current ? <MapPin size={16} /> : nodeVisited(space, node.id) ? <Check size={16} /> : state.kind === "ready" ? <Rocket size={16} /> : <Lock size={16} />}{status(node.id)}</span>
        </button>;
      })}
    </div>
    <p className="map-art-note">原创示意插图 · 非真实比例与位置 · 未知表面为想象示意</p>
    {selected && <Dialog title={selected.name} onClose={() => setSelected(null)}>
      <p className="node-status">{selected.id === "station" ? "虚构设施" : nodeScience[selected.number]?.category ?? selected.kind} · {status(selected.id)}</p>
      <DestinationActions key={selected.id} node={selected} space={space} onTravel={onTravel} onLearn={onLearn} busy={busy} flying={flying} onClose={() => setSelected(null)} />
      <NodeDetails key={selected.id} node={selected} />
      {selected.note && <p>{selected.note}</p>}
      <button className="button secondary" onClick={() => setSelected(null)}>回到星图</button>
    </Dialog>}
  </section>;
}
