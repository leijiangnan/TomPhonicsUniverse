import { useState } from "react";
import { Check, Lock, MapPin } from "lucide-react";
import { explorationRegions, nextExplorationNode, supplyStation, type CatalogNode } from "../../data/space/catalog";
import { type SpaceProgress, stationFound, fuel, STATION_COST } from "../../lib/space";
import { RouteArrows } from "./RouteArrows";
import { NodeArt } from "./NodeArt";
import { Ship } from "./SpaceArt";
import { Dialog } from "../Dialog";
import { NodeDetails } from "./NodeDetails";
import { nodeScience } from "../../data/space/science";

export function UniverseOverview({ space, regionIndex, setRegionIndex, flying }: { space: SpaceProgress; regionIndex: number; setRegionIndex: (index: number) => void; flying: boolean }) {
  const [selected, setSelected] = useState<CatalogNode | null>(null);
  const region = explorationRegions[regionIndex];
  const nodes = region.nodes;
  const found = stationFound(space);
  const reached = (id: string) => id === "earth" || (id === "station" && found);
  const nextNode = nextExplorationNode(found);
  const status = (id: string) => id === space.current ? "你在这里" : reached(id) ? "已到达" : id === nextNode.id ? (id === "station" ? "下一站" : "下一站 · 筹备中") : "筹备中";
  const cost = selected?.id === "station" ? STATION_COST : selected?.id === "moon" ? 100 : selected?.id === "mars" ? 120 : null;
  return <section id="universe-overview" className="universe-overview" aria-label="全宇宙概览">
    <div className="universe-heading">
      <div><h2>全宇宙概览</h2><p>当前位置：{space.current === "earth" ? "地球" : "补给空间站"}</p></div>
      <button className="button secondary" onClick={() => { setRegionIndex(0); setSelected(space.current === "earth" ? explorationRegions[0].nodes[0] : supplyStation); }}><MapPin size={20} />我的位置</button>
    </div>
    <div className="region-picker" role="group" aria-label="选择星域">
      {explorationRegions.map((item, i) => <button key={item.id} aria-pressed={i === regionIndex} onClick={() => setRegionIndex(i)}><span>{item.id}</span>{item.name}<small>{item.nodes.length} 个地点</small></button>)}
    </div>
    <h3 className="region-title">{region.name}<span>{regionIndex === 0 ? `已到达 ${found ? 2 : 1} / 9` : `已到达 0 / ${nodes.length}`}</span></h3>
    <div className="universe-nodes">
      <RouteArrows regionId={region.id} />
      {nodes.map((node, index) => {
        const current = node.id === space.current;
        return <button key={node.id} className={`universe-node ${current ? "current" : ""}`} onClick={() => setSelected(node)} aria-current={current ? "location" : undefined} aria-label={`${node.name}，${status(node.id)}，查看详情`}>
          <div className="universe-body"><NodeArt node={node} />{current && <div className={`universe-ship ${flying ? "landing" : ""}`}><Ship /></div>}</div>
          <strong>{index + 1}. {node.name}</strong>
          <span>{current ? <MapPin size={16} /> : reached(node.id) ? <Check size={16} /> : <Lock size={16} />}{status(node.id)}</span>
        </button>;
      })}
    </div>
    <p className="map-art-note">原创示意插图 · 非真实比例与位置 · 未知表面为想象示意</p>
    {selected && <Dialog title={selected.name} onClose={() => setSelected(null)}>
      <p className="node-status">{selected.id === "station" ? "虚构设施" : nodeScience[selected.number]?.category ?? selected.kind} · {status(selected.id)}</p>
      <NodeDetails key={selected.id} node={selected} />
      {selected.note && <p>{selected.note}</p>}
      <div className="node-travel-status">{reached(selected.id) ? selected.id === space.current ? "飞船现在停在这里。" : "已发现，可从下方航线免费回访。" : selected.id === "station" ? "可从下方航线前往补给空间站。" : "地点互动与航行尚未开放，可以先看看未来的探索目标。"}
      {!reached(selected.id) && <p>{cost !== null ? `${selected.id === "station" ? "首次" : "计划"}需要 ${cost} 燃料，现有 ${fuel(space)}，还差 ${Math.max(0, cost - fuel(space))}。` : "燃料费用与开放条件待设计。"}</p>}</div>
      <button className="button primary" onClick={() => setSelected(null)}>回到全景</button>
    </Dialog>}
  </section>;
}
