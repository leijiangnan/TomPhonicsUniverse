import source from "../../../docs/Toms_Phonics_Universe_Space_Exploration_Design_V1.md?raw";
import { expect, it } from "vitest";
import { spaceRegions, supplyStation } from "./catalog";
it("includes every source node in its documented region without merging the fictional station", () => {
  const section = source.split("### 星域 1：")[1].split("## 7.")[0];
  const names = [...section.matchAll(/^\d+\. ([^\n（]+)/gm)].map(match => match[1]);
  const nodes = spaceRegions.flatMap(region => region.nodes);
  expect(nodes.map(node => node.name)).toEqual(names);
  expect(spaceRegions.map(region => region.nodes.length)).toEqual([8, 10, 13, 10, 10, 11]);
  expect(new Set([...nodes, supplyStation].map(node => node.id)).size).toBe(nodes.length + 1);
  expect(nodes.find(node => node.name === "国际空间站")?.id).not.toBe(supplyStation.id);
});

import { explorationRegions, nextExplorationNode } from "./catalog";
it("uses the atlas order for the full stage route and next discovery", () => {
  expect(explorationRegions[0].nodes.map(node => node.name)).toEqual([
    "地球", "补给空间站", "国际空间站", "月球", "月球背面", "地月 L2 点", "月球轨道空间站", "太阳观测站", "金星",
  ]);
  expect(nextExplorationNode(false).id).toBe("station");
  expect(nextExplorationNode(true).name).toBe("国际空间站");
  expect(explorationRegions.slice(1).map(region => region.nodes)).toEqual(spaceRegions.slice(1).map(region => region.nodes));
});
