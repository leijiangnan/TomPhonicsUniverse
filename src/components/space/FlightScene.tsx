import { useEffect, useRef, useState } from "react";
import { Ship } from "./SpaceArt";
import { NodeArt } from "./NodeArt";
import { makeObject } from "./Atlas3D";
import { routeNode } from "../../data/space/route";
import type { SpaceNodeId } from "../../lib/space";

type FlightState = { from: SpaceNodeId; destination: SpaceNodeId; flying: boolean; running: boolean };
type SceneController = { update: (state: FlightState) => void; dispose: () => void };

/** The scene is decorative; flight controls and the saved location stay in HTML. */
export function FlightScene({ from, destination, flying, running }: FlightState) {
  const container = useRef<HTMLDivElement>(null);
  const controller = useRef<SceneController | null>(null);
  const state = useRef({ from, destination, flying, running });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    state.current = { from, destination, flying, running };
    controller.current?.update(state.current);
  }, [from, destination, flying, running]);

  useEffect(() => {
    let cancelled = false;
    let instance: SceneController | undefined;
    const host = container.current;
    if (!host) return;

    void import("three").then((T) => {
      if (cancelled) return;
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch {
        return;
      }
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-5, 5, 2, -2, 0.1, 100);
      camera.position.set(0, 0.35, 18);
      scene.add(new T.HemisphereLight(0xdff8ff, 0x273657, 2.2));
      const sunlight = new T.DirectionalLight(0xffedc7, 2.8);
      sunlight.position.set(-5, 7, 8);
      scene.add(sunlight);
      const mat = (color: number, extras: import("three").MeshStandardMaterialParameters = {}) =>
        new T.MeshStandardMaterial({ color, roughness: 0.78, ...extras });
      const cream = mat(0xfff1ce), coral = mat(0xef8662), gold = mat(0xf7c966),
        dark = mat(0x263d5c), glass = mat(0x80e5e5, { metalness: 0.2, roughness: 0.24, emissive: 0x14535e, emissiveIntensity: 0.3 });
      const addBox = (group: import("three").Group, w: number, h: number, d: number, material: import("three").Material, x: number, y: number, z = 0) => {
        const mesh = new T.Mesh(new T.BoxGeometry(w, h, d), material);
        mesh.position.set(x, y, z);
        group.add(mesh);
        return mesh;
      };
      const addCylinder = (group: import("three").Group, radiusTop: number, radiusBottom: number, length: number, material: import("three").Material, x: number, y: number, z = 0) => {
        const mesh = new T.Mesh(new T.CylinderGeometry(radiusTop, radiusBottom, length, 12), material);
        mesh.rotation.z = -Math.PI / 2;
        mesh.position.set(x, y, z);
        group.add(mesh);
        return mesh;
      };

      const release = (object: import("three").Object3D) => {
        const geometries = new Set<import("three").BufferGeometry>();
        const materials = new Set<import("three").Material>();
        object.traverse((child) => {
          if (child instanceof T.Mesh || child instanceof T.Points) {
            geometries.add(child.geometry);
            (Array.isArray(child.material) ? child.material : [child.material]).forEach((item) => materials.add(item));
          }
        });
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
      };
      const holders = [new T.Group(), new T.Group()];
      holders[0].position.set(-3.1, -.35, -1.2);
      holders[1].position.set(3.05, .35, -1.2);
      scene.add(...holders);
      const endpoints: ReturnType<typeof makeObject>[] = [];
      const replaceEndpoints = (source: SpaceNodeId, target: SpaceNodeId) => {
        for (const [index, id] of [source, target].entries()) {
          const old = endpoints[index];
          if (old) { holders[index].remove(old.root); release(old.root); }
          const node = routeNode(id);
          const model = makeObject(T, node, (color, glow = false) => mat(color,
            glow ? { emissive: color, emissiveIntensity: .38 } : {}));
          holders[index].scale.setScalar(node.kind.includes("设施") || node.kind.includes("空间站") ? 1.1 : 1.45);
          holders[index].add(model.root);
          endpoints[index] = model;
        }
      };
      replaceEndpoints(state.current.from, state.current.destination);

      // A small explorer's rocket, built from solids instead of a flat sprite.
      const rocket = new T.Group();
      addCylinder(rocket, .34, .30, 1.32, cream, -.04, 0);
      addCylinder(rocket, .28, .36, .25, coral, -.77, 0);
      const nose = new T.Mesh(new T.ConeGeometry(.34, .58, 12), coral);
      nose.rotation.z = -Math.PI / 2;
      nose.position.x = .91;
      rocket.add(nose);
      const windowRim = new T.Mesh(new T.SphereGeometry(.225, 16, 12), gold);
      windowRim.scale.set(1, 1, .28); windowRim.position.set(.10, .03, .33);
      const windowGlass = new T.Mesh(new T.SphereGeometry(.16, 16, 12), glass);
      windowGlass.scale.set(1, 1, .28); windowGlass.position.set(.10, .03, .39);
      rocket.add(windowRim, windowGlass);
      for (const side of [-1, 1]) {
        const fin = addBox(rocket, .48, .32, .10, coral, -.52, side * .33, 0);
        fin.rotation.z = side * .30;
        addBox(rocket, .18, .07, .04, gold, -.50, side * .46, .08);
      }
      addCylinder(rocket, .16, .22, .22, dark, -.95, 0);
      const flame = new T.Group();
      const flameOuter = new T.Mesh(new T.ConeGeometry(.22, .65, 10), new T.MeshBasicMaterial({ color: 0xffa85c, transparent: true, opacity: .8 }));
      flameOuter.rotation.z = Math.PI / 2; flameOuter.position.x = -1.30;
      const flameInner = new T.Mesh(new T.ConeGeometry(.11, .42, 10), new T.MeshBasicMaterial({ color: 0xffe89c }));
      flameInner.rotation.z = Math.PI / 2; flameInner.position.x = -1.24;
      flame.add(flameOuter, flameInner); rocket.add(flame);
      scene.add(rocket);

      // Stable star field: fixed, seeded positions with no runtime random movement.
      let seed = 4381;
      const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
      const starPositions: number[] = [];
      for (let i = 0; i < 140; i++) starPositions.push((random() - .5) * 16, (random() - .5) * 9, -4 - random() * 4);
      const starGeometry = new T.BufferGeometry();
      starGeometry.setAttribute("position", new T.Float32BufferAttribute(starPositions, 3));
      const starPoints = new T.Points(starGeometry, new T.PointsMaterial({ color: 0xd7f5f4, size: 2, transparent: true, opacity: .8, sizeAttenuation: false }));
      scene.add(starPoints);
      for (const [x, y, size] of [[-1.95,1.25,.09],[-.8,-1.25,.06],[1.25,1.10,.08],[4.6,-1.18,.08]]) {
        const star = new T.Mesh(new T.OctahedronGeometry(size), new T.MeshBasicMaterial({ color: 0xffdf95 }));
        star.position.set(x, y, -2); scene.add(star);
      }
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      let frame = 0, elapsed = 0, last = 0, flyingStarted = 0;
      let contextLost = false;
      let latest = state.current;
      let aspect = 2;
      const draw = (now: number) => {
        if (contextLost) return;
        if (latest.running && last) elapsed += Math.min(now - last, 50);
        last = latest.running ? now : 0;
        const progress = latest.flying ? Math.min((elapsed - flyingStarted) / 4000, 1) : 1;
        const smooth = progress * progress * (3 - 2 * progress);
        const flyX = latest.flying ? -1.7 + 3.4 * smooth : -1.7;
        const float = Math.sin(elapsed / 1100) * .055;
        endpoints.forEach((endpoint) => endpoint.animate(elapsed));
        rocket.position.set(flyX, -.22 + Math.sin(smooth * Math.PI) * .62 + float, 1.2);
        rocket.rotation.set(0, -.14, .08);
        rocket.scale.setScalar((aspect < 1.8 ? 1.04 : .82) + (latest.flying ? Math.sin(progress * Math.PI) * .27 : 0));
        flame.visible = latest.flying;
        flame.scale.x = .8 + .2 * Math.sin(elapsed / 85);
        // A restrained camera move follows the journey without hiding either destination.
        const cameraX = latest.flying ? -.18 + .36 * smooth : 0;
        const halfWidth = aspect < 1.8 ? 4.75 : 5.15;
        const halfHeight = halfWidth / aspect;
        const zoom = latest.flying ? 1 - Math.sin(progress * Math.PI) * .08 : 1;
        camera.left = -halfWidth * zoom; camera.right = halfWidth * zoom;
        camera.top = halfHeight * zoom; camera.bottom = -halfHeight * zoom;
        camera.position.x = cameraX;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
        if (latest.running) frame = requestAnimationFrame(draw);
        else frame = 0;
      };
      const render = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0; last = 0;
        if (!contextLost) draw(performance.now());
      };
      const resize = () => {
        if (contextLost) return;
        const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
        aspect = width / height;
        renderer.setSize(width, height, false);
        render();
      };
      const observer = new ResizeObserver(resize);
      const lost = (event: Event) => {
        event.preventDefault(); contextLost = true;
        if (frame) cancelAnimationFrame(frame);
        frame = 0; setReady(false);
      };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      observer.observe(host);
      instance = {
        update(next) {
          if (next.from !== latest.from || next.destination !== latest.destination) replaceEndpoints(next.from, next.destination);
          if (next.flying && !latest.flying) flyingStarted = elapsed;
          latest = next; render();
        },
        dispose() {
          if (frame) cancelAnimationFrame(frame);
          observer.disconnect();
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          release(scene);
          renderer.dispose(); renderer.domElement.remove();
        },
      };
      controller.current = instance;
      resize(); setReady(true);
    }).catch(() => { /* Keep the SVG fallback if the module cannot load. */ });
    return () => {
      cancelled = true; controller.current = null; instance?.dispose();
    };
  }, []);

  return <div className={`flight-scene${ready ? " is-ready" : ""}`} aria-hidden="true">
    <div className="flight-scene-canvas" ref={container} />
    {!ready && <div className="flight-scene-fallback flight-route-fallback"><NodeArt node={routeNode(from)} /><Ship /><NodeArt node={routeNode(destination)} /></div>}
  </div>;
}
