import { expect, it } from "vitest";
import { spaceRegions, supplyStation } from "./catalog";
import { nodeScience } from "./science";
import research from "../../../artifacts/science-research/images.json";
import { getNodeImage } from "./images";

const nodes = spaceRegions.flatMap(region => region.nodes);
const imageNumbers = Object.keys(research).map(Number);
const localImages = import.meta.glob("../../../public/space-images/*.jpg", { eager: true, query: "?url", import: "default" });

it("has sourced, plain-language facts for every real-catalog node", () => {
  expect(Object.keys(nodeScience).map(Number).sort((a, b) => a - b)).toEqual(nodes.map(node => node.number));
  for (const node of nodes) {
    const fact = nodeScience[node.number];
    expect(fact.category, node.name).toBeTruthy();
    expect(fact.distance, node.name).toBeTruthy();
    expect(fact.size, node.name).toBeTruthy();
    expect(fact.description, node.name).toBeTruthy();
    expect(fact.source, node.name).toMatch(/^https:\/\//);
  }
  expect(supplyStation.number).toBe(0);
  expect(nodeScience[supplyStation.number]).toBeUndefined();
});

it("uses valid local images and keeps each image's classification and attribution", () => {
  for (const number of imageNumbers) {
    const image = getNodeImage(number);
    expect(localImages[`../../../public${image.src}`], image.src).toBeTypeOf("string");
    expect(image.kind).toBeTruthy();
    expect(image.caption).toBeTruthy();
    expect(image.credit).toBeTruthy();
    expect(image.source).toMatch(/^https:\/\//);
    expect(image.license).toBeTruthy();
    expect(number).toBeGreaterThanOrEqual(1);
    expect(number).toBeLessThanOrEqual(62);
  }
  expect(getNodeImage(18).credit).toContain("CC BY-SA 4.0");
  expect(getNodeImage(19).credit).toContain("Kevin M. Gill");
  expect(getNodeImage(43).kind).toBe("艺术家想象图");
  expect(getNodeImage(47).caption).toContain("无法看清表面");
  expect(getNodeImage(59).caption).toContain("不是黑洞本体照片");
});
