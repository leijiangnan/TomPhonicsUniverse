import { Dialog } from "../Dialog";
import { NodeArt } from "./NodeArt";
import { visitedNodes, type SpaceNodeId, type SpaceProgress } from "../../lib/space";

export function RevisitPicker({ space, busy, error, onTravel, onClose }: {
  space: SpaceProgress;
  busy: boolean;
  error: string;
  onTravel: (id: SpaceNodeId) => Promise<boolean>;
  onClose: () => void;
}) {
  const destinations = visitedNodes(space).filter((node) => node.id !== space.current);
  return <Dialog title="选择免费回访地点" onClose={onClose}>
    <div className="revisit-picker">
      <p>这些地点都已到达，回访不消耗燃料。</p>
      <div className="revisit-grid">
        {destinations.map((node) => <button key={node.id} disabled={busy}
          aria-label={`免费回访${node.name}`} onClick={() => void onTravel(node.id)}>
          <span aria-hidden="true"><NodeArt node={node} /></span>
          <strong>{node.name}</strong>
          <span>免费回访</span>
        </button>)}
      </div>
      {!destinations.length && <p>还没有其他已到达地点，可以先探索新的航点。</p>}
      {error && <p className="voyage-error" role="alert">{error}</p>}
    </div>
  </Dialog>;
}
