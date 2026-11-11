import type { Group, MeshStandardMaterialParameters } from "three";
import type * as THREE from "three";
import type { WordLifeSample, WordLifeWord } from "../../lib/wordLife";

export type WordLifeKit = {
  T: typeof THREE;
  mat: (color: number, extras?: MeshStandardMaterialParameters) => THREE.MeshStandardMaterial;
};

export type WordLifeModel = {
  root: Group;
  pose: (sample: WordLifeSample) => void;
};

const sphere = (
  kit: WordLifeKit,
  parent: Group,
  radius: number,
  color: number,
  x: number,
  y: number,
  z: number,
  sx = 1,
  sy = 1,
  sz = 1,
  extras?: MeshStandardMaterialParameters,
) => {
  const mesh = new kit.T.Mesh(new kit.T.SphereGeometry(radius, 6, 5), kit.mat(color, extras));
  mesh.scale.set(sx, sy, sz);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};

const box = (
  kit: WordLifeKit,
  parent: Group,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
  extras?: MeshStandardMaterialParameters,
) => {
  const mesh = new kit.T.Mesh(new kit.T.BoxGeometry(w, h, d), kit.mat(color, extras));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};

const cyl = (
  kit: WordLifeKit,
  parent: Group,
  radius: number,
  length: number,
  color: number,
  x: number,
  y: number,
  z: number,
) => {
  const mesh = new kit.T.Mesh(new kit.T.CylinderGeometry(radius, radius, length, 5), kit.mat(color));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
};

const energy = (sample: WordLifeSample) => Math.max(0, sample.life - 0.35);

function buildHen(kit: WordLifeKit): WordLifeModel {
  const root = new kit.T.Group();
  const cream = 0xfff3d6;
  const wing = 0xf0d09a;
  const gold = 0xf3ce78;
  const comb = 0xef7b68;
  sphere(kit, root, 0.62, cream, 0, 0.02, 0, 1.08, 0.9, 0.96);
  sphere(kit, root, 0.36, cream, 0.02, 0.7, 0.34);
  sphere(kit, root, 0.1, gold, 0.04, 0.62, 0.66, 1.15, 0.72, 1.25);
  sphere(kit, root, 0.11, 0xfffef8, -0.12, 0.78, 0.56);
  sphere(kit, root, 0.11, 0xfffef8, 0.16, 0.78, 0.56);
  sphere(kit, root, 0.055, 0x2f4a3c, -0.1, 0.76, 0.64);
  sphere(kit, root, 0.055, 0x2f4a3c, 0.18, 0.76, 0.64);
  sphere(kit, root, 0.1, comb, -0.08, 1.04, 0.28);
  sphere(kit, root, 0.12, comb, 0.06, 1.12, 0.3);
  sphere(kit, root, 0.055, comb, 0.02, 0.5, 0.58, 0.9, 1.25, 0.8);
  const leftWing = new kit.T.Group();
  leftWing.position.set(-0.58, 0.08, 0.02);
  sphere(kit, leftWing, 0.28, wing, -0.02, 0, 0, 1.15, 0.82, 0.42);
  root.add(leftWing);
  const rightWing = new kit.T.Group();
  rightWing.position.set(0.58, 0.08, 0.02);
  sphere(kit, rightWing, 0.28, wing, 0.02, 0, 0, 1.15, 0.82, 0.42);
  root.add(rightWing);
  const tail = new kit.T.Group();
  tail.position.set(0, 0.28, -0.5);
  sphere(kit, tail, 0.16, gold, -0.14, 0.12, 0, 0.7, 1.45, 0.5);
  sphere(kit, tail, 0.18, cream, 0.02, 0.22, -0.06, 0.7, 1.6, 0.48);
  root.add(tail);
  cyl(kit, root, 0.045, 0.34, gold, -0.16, -0.5, 0.06);
  cyl(kit, root, 0.045, 0.34, gold, 0.18, -0.5, 0.06);
  box(kit, root, 0.24, 0.05, 0.28, gold, -0.16, -0.68, 0.12);
  box(kit, root, 0.24, 0.05, 0.28, gold, 0.18, -0.68, 0.12);
  return {
    root,
    pose(sample) {
      const flap = Math.sin(sample.progress * Math.PI * 4) * energy(sample);
      leftWing.rotation.z = 0.4 + flap;
      rightWing.rotation.z = -0.4 - flap;
      tail.rotation.x = -0.15 - energy(sample) * 0.45;
    },
  };
}

function buildBug(kit: WordLifeKit): WordLifeModel {
  const root = new kit.T.Group();
  const body = new kit.T.Group();
  body.scale.setScalar(1.2);
  root.add(body);
  const shell = 0xef8662;
  const spot = 0xfff6e4;
  const head = 0x6b4f3a;
  sphere(kit, body, 0.56, 0xfff3d8, 0, -0.12, 0.02, 1.08, 0.58, 1.12);
  sphere(kit, body, 0.6, shell, 0, 0.05, -0.02, 1.02, 0.74, 1.02);
  for (const [x, y, z, radius] of [
    [-0.26, 0.32, 0.16, 0.13],
    [0.24, 0.34, 0.1, 0.12],
    [0.02, 0.4, -0.16, 0.11],
  ] as const) sphere(kit, body, radius, spot, x, y, z);
  sphere(kit, body, 0.3, head, 0, -0.02, 0.52);
  sphere(kit, body, 0.11, 0xfffef8, -0.12, 0.06, 0.72);
  sphere(kit, body, 0.11, 0xfffef8, 0.12, 0.06, 0.72);
  sphere(kit, body, 0.055, 0x2f4a3c, -0.1, 0.04, 0.8);
  sphere(kit, body, 0.055, 0x2f4a3c, 0.14, 0.04, 0.8);
  sphere(kit, body, 0.07, 0xf3b6a4, -0.2, -0.08, 0.68);
  sphere(kit, body, 0.07, 0xf3b6a4, 0.2, -0.08, 0.68);
  const smile = new kit.T.Mesh(new kit.T.TorusGeometry(0.09, 0.022, 4, 8, Math.PI), kit.mat(0x3d2c24));
  smile.position.set(0, -0.14, 0.78);
  smile.rotation.z = Math.PI;
  body.add(smile);
  const antennae = [new kit.T.Group(), new kit.T.Group()];
  antennae.forEach((antenna, index) => {
    const side = index === 0 ? -1 : 1;
    antenna.position.set(side * 0.12, 0.18, 0.66);
    cyl(kit, antenna, 0.02, 0.32, head, 0, 0.16, 0);
    sphere(kit, antenna, 0.055, 0xf3ce78, 0, 0.34, 0);
    body.add(antenna);
  });
  for (const side of [-1, 1]) {
    for (const z of [0.12, -0.08, -0.28]) {
      const leg = new kit.T.Group();
      leg.position.set(side * 0.5, -0.32, z);
      leg.rotation.z = side * -0.7;
      cyl(kit, leg, 0.04, 0.22, head, 0, -0.08, 0);
      body.add(leg);
    }
  }
  return {
    root,
    pose(sample) {
      const wiggle = Math.sin(sample.progress * Math.PI * 6) * energy(sample);
      antennae[0].rotation.z = 0.45 + wiggle;
      antennae[1].rotation.z = -0.45 - wiggle;
    },
  };
}

function buildBox(kit: WordLifeKit): WordLifeModel {
  const root = new kit.T.Group();
  const card = 0xd7b07a;
  const lidColor = 0xe7c99a;
  const teal = 0x5fbfb8;
  box(kit, root, 1.28, 1, 1.16, card, 0, 0, 0);
  box(kit, root, 1.32, 0.1, 1.2, teal, 0, -0.28, 0);
  sphere(kit, root, 0.1, 0xfffef8, -0.24, 0.12, 0.6);
  sphere(kit, root, 0.1, 0xfffef8, 0.24, 0.12, 0.6);
  sphere(kit, root, 0.05, 0x2f4a3c, -0.22, 0.1, 0.68);
  sphere(kit, root, 0.05, 0x2f4a3c, 0.26, 0.1, 0.68);
  const smile = new kit.T.Mesh(new kit.T.TorusGeometry(0.16, 0.025, 4, 8, Math.PI), kit.mat(0x6a4b32));
  smile.position.set(0, -0.08, 0.6);
  smile.rotation.z = Math.PI;
  root.add(smile);
  const hinge = new kit.T.Group();
  hinge.position.set(0, 0.5, -0.58);
  box(kit, hinge, 1.36, 0.12, 1.2, lidColor, 0, 0.08, 0.6);
  box(kit, hinge, 0.14, 0.14, 1.22, teal, 0, 0.12, 0.6);
  box(kit, hinge, 1.36, 0.14, 0.14, teal, 0, 0.12, 0.95);
  sphere(kit, hinge, 0.1, teal, -0.12, 0.22, 0.95);
  sphere(kit, hinge, 0.1, teal, 0.12, 0.22, 0.95);
  root.add(hinge);
  const star = new kit.T.Mesh(
    new kit.T.OctahedronGeometry(0.16, 0),
    kit.mat(0xf3ce78, { emissive: 0xf3ce78, emissiveIntensity: 0.45 }),
  );
  root.add(star);
  return {
    root,
    pose(sample) {
      hinge.rotation.x = -(0.4 + energy(sample) * 1.35);
      star.position.set(0, 0.22 + sample.life * 0.85, 0.05);
      star.rotation.y = sample.progress * Math.PI * 2;
    },
  };
}

/** Add a new word by registering one builder; the scene stays shared. */
export const wordLifeBuilders: Record<WordLifeWord, (kit: WordLifeKit) => WordLifeModel> = {
  hen: buildHen,
  bug: buildBug,
  box: buildBox,
};
