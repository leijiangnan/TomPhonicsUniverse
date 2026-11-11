import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { wordLifeSample, wordLifeWords } from "../../lib/wordLife";
import { wordLifeBuilders, type WordLifeKit } from "./builders";

function triangles(root: THREE.Object3D) {
  let count = 0;
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const index = object.geometry.getIndex();
    const positions = object.geometry.getAttribute("position");
    count += index ? index.count / 3 : positions.count / 3;
  });
  return count;
}

describe("word life builders", () => {
  it("registers exactly the reward words and keeps each model low poly", () => {
    expect(Object.keys(wordLifeBuilders).sort()).toEqual([...wordLifeWords].sort());
    const materials = new Map<string, THREE.MeshStandardMaterial>();
    const kit: WordLifeKit = {
      T: THREE,
      mat: (color, extras = {}) => {
        const key = `${color}:${extras.emissive ?? 0}`;
        let material = materials.get(key);
        if (!material) {
          material = new THREE.MeshStandardMaterial({ color, flatShading: true, ...extras });
          materials.set(key, material);
        }
        return material;
      },
    };
    const resting = wordLifeSample(2600);
    for (const word of wordLifeWords) {
      const model = wordLifeBuilders[word](kit);
      let meshes = 0;
      model.root.traverse((object) => { if (object instanceof THREE.Mesh) meshes += 1; });
      expect(meshes).toBeGreaterThan(8);
      expect(triangles(model.root)).toBeLessThan(1000);
      expect(() => model.pose(resting)).not.toThrow();
      expect(() => model.pose(wordLifeSample(0))).not.toThrow();
    }
  });
});
