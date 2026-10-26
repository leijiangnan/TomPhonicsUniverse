import { useState } from "react";
import { ExternalLink, ImageOff, Ruler, Telescope } from "lucide-react";
import type { CatalogNode } from "../../data/space/catalog";
import { nodeScience } from "../../data/space/science";
import { getNodeImage } from "../../data/space/images";
import { NodeArt } from "./NodeArt";

export function NodeDetails({ node }: { node: CatalogNode }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = getNodeImage(node.number);
  const science = nodeScience[node.number];
  const fictional = node.id === "station" || science?.category === "虚构设施";
  return <div className="node-details">
    {image && !imageFailed ? <figure className="node-photo">
      <img src={image.src} alt={`${node.name}：${image.caption}`} onError={() => setImageFailed(true)} />
      <figcaption><strong>{image.kind}</strong><span>{image.caption}</span></figcaption>
    </figure> : <div className="node-detail-art">
      <NodeArt node={node} />
      <p><ImageOff size={20} />{imageFailed ? "图片暂时无法显示，先看示意插图。" : fictional ? "虚构游戏设施，没有真实照片。" : "暂无对应的真实照片，先看示意插图。"}</p>
    </div>}
    {science ? <>
      <dl className="node-facts">
        <div><dt><Telescope size={20} />离地球多远</dt><dd>{science.distance}</dd></div>
        <div><dt><Ruler size={20} />有多大</dt><dd>{science.size}</dd></div>
      </dl>
      <p className="node-description">{science.description}</p>
      <p className="science-source"><a href={science.source} target="_blank" rel="noreferrer">查看科普资料<ExternalLink size={15} /></a>{image && <span>图片：{image.credit} · <a href={image.source} target="_blank" rel="noreferrer">来源与许可<ExternalLink size={15} /></a></span>}</p>
    </> : <div className="fiction-facts">
      <p><strong>虚构游戏设施</strong></p>
      <p>与地球的距离和大小由游戏设定决定，不能与国际空间站混为一谈。</p>
      <p>这里是领取补给和交流的地方，没有真实照片。</p>
    </div>}
  </div>;
}
