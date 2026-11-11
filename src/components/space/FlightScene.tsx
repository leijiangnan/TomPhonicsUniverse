import { useEffect, useRef, useState } from "react";
import { Ship } from "./SpaceArt";
import type { SpaceNodeId } from "../../lib/space";

type FlightState = { destination: SpaceNodeId; flying: boolean; running: boolean };
type SceneController = { update: (state: FlightState) => void; dispose: () => void };

/** The scene is decorative; flight controls and the saved location stay in HTML. */
export function FlightScene({ destination, flying, running }: FlightState) {
  const container = useRef<HTMLDivElement>(null);
  const controller = useRef<SceneController | null>(null);
  const state = useRef({ destination, flying, running });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    state.current = { destination, flying, running };
    controller.current?.update(state.current);
  }, [destination, flying, running]);

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
      const cream = mat(0xfff1ce), white = mat(0xdcebed), blue = mat(0x315f86),
        teal = mat(0x66c6c2), coral = mat(0xef8662), gold = mat(0xf7c966),
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

      // Earth uses hand-drawn polygonal land, projected onto a low-poly sphere.
      const earth = new T.Group();
      const earthSurface = new T.Group();
      const radius = 1.65;
      earthSurface.add(new T.Mesh(new T.SphereGeometry(radius, 40, 28), mat(0x3b9cce, { roughness: 0.9 })));
      const landMaterial = mat(0x8ad19b);
      const landShapes = [
        [[-1.10,.78],[-.72,1.08],[-.27,.99],[-.1,.75],[-.36,.56],[-.29,.30],[-.61,.15],[-.86,.36],[-1.15,.39]],
        [[-.49,.19],[-.15,.05],[.03,-.2],[-.05,-.54],[-.26,-.99],[-.43,-.92],[-.52,-.55],[-.68,-.22]],
        [[.23,.82],[.63,1.02],[1.06,.76],[1.28,.41],[.96,.29],[.75,.43],[.53,.18],[.24,.28],[.07,.54]],
        [[.40,.12],[.77,.17],[.99,-.15],[.86,-.48],[.62,-.78],[.35,-.62],[.23,-.23]],
        [[1.03,-.69],[1.30,-.55],[1.38,-.81],[1.12,-.99],[.92,-.89]],
      ];
      const addSurfacePatch = (outline: number[][], material: import("three").Material, elevation: number) => {
        const points = outline.map(([x, y]) => new T.Vector2(x, y));
        const triangles = T.ShapeUtils.triangulateShape(points, []);
        const positions: number[] = [];
        const subdivisions = 8;
        const project = (x: number, y: number) => {
          const r = radius + elevation;
          positions.push(x * r / radius, y * r / radius, Math.sqrt(Math.max(.01, radius * radius - x * x - y * y)) * r / radius);
        };
        for (const [ia, ib, ic] of triangles) {
          const a = points[ia], b = points[ib], c = points[ic];
          const vertex = (i: number, j: number) => [a.x + (b.x - a.x) * i / subdivisions + (c.x - a.x) * j / subdivisions,
            a.y + (b.y - a.y) * i / subdivisions + (c.y - a.y) * j / subdivisions];
          const emit = (i: number, j: number) => { const [x, y] = vertex(i, j); project(x, y); };
          for (let i = 0; i < subdivisions; i++) for (let j = 0; j < subdivisions - i; j++) {
            emit(i, j); emit(i + 1, j); emit(i, j + 1);
            if (i + j < subdivisions - 1) { emit(i + 1, j); emit(i + 1, j + 1); emit(i, j + 1); }
          }
        }
        const geometry = new T.BufferGeometry();
        geometry.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();
        earthSurface.add(new T.Mesh(geometry, material));
      };
      landShapes.forEach((outline) => addSurfacePatch(outline, landMaterial, .035));
      const cloudMaterial = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8, side: T.DoubleSide, depthWrite: false });
      for (const cloud of [
        [[-.98,.85],[-.77,.91],[-.60,.88],[-.46,.93],[-.31,.88],[-.39,.81],[-.63,.82],[-.76,.79]],
        [[.30,.94],[.50,1.02],[.69,.98],[.83,1.02],[1.02,.91],[.85,.87],[.60,.90],[.44,.86]],
        [[-.87,-.48],[-.67,-.43],[-.50,-.48],[-.35,-.43],[-.16,-.49],[-.28,-.56],[-.55,-.54],[-.70,-.57]],
        [[.52,-.39],[.75,-.36],[.94,-.40],[1.08,-.37],[1.21,-.44],[1.05,-.49],[.79,-.46]],
      ]) addSurfacePatch(cloud, cloudMaterial, .065);
      // Curved latitude bands and the halo give the horizon a gentle atmosphere.
      const atmosphere = new T.Mesh(new T.SphereGeometry(1.76, 32, 24), new T.MeshBasicMaterial({ color: 0x78dcf0, transparent: true, opacity: 0.12, side: T.BackSide, depthWrite: false }));
      earth.add(atmosphere, earthSurface);
      const orbit = new T.Mesh(new T.TorusGeometry(2.04, .012, 6, 96), new T.MeshBasicMaterial({ color: 0x98e5e2, transparent: true, opacity: .5 }));
      orbit.rotation.set(1.05, .1, -.2);
      earth.add(orbit);
      earth.position.set(-3.65, -1.10, -1.2);
      scene.add(earth);

      // A fictional, friendly supply station: hub, window, solar panels, antenna and beacons.
      const station = new T.Group();
      addCylinder(station, .46, .46, 1.65, white, 0, 0);
      addCylinder(station, .51, .51, .12, teal, -.65, 0);
      addCylinder(station, .51, .51, .12, teal, .65, 0);
      addCylinder(station, .35, .45, .3, cream, 1, 0);
      addBox(station, .55, .34, .08, glass, 0, .02, .48);
      addBox(station, .08, .42, .1, white, 0, .02, .54);
      for (const side of [-1, 1]) {
        addBox(station, .30, .10, .15, white, side * 1.20, 0);
        addBox(station, 1.18, .83, .10, blue, side * 1.92, 0);
        for (const column of [-.32, 0, .32]) addBox(station, .025, .76, .12, teal, side * 1.92 + column, 0, .01);
        for (const row of [-.2, .2]) addBox(station, 1.13, .025, .12, teal, side * 1.92, row, .01);
        addBox(station, .10, .10, .12, gold, side * 2.53, 0);
      }
      addBox(station, .06, .65, .08, white, .15, .65);
      const beacon = new T.Mesh(new T.SphereGeometry(.12, 12, 8), gold);
      beacon.position.set(.15, 1.03, 0);
      station.add(beacon);
      station.position.set(2.2, .48, -1.0);
      station.scale.setScalar(.83);
      station.rotation.set(.08, -.22, -.04);
      scene.add(station);

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
        const direction = latest.destination === "station" ? 1 : -1;
        const flyX = direction * (-1.7 + 3.4 * smooth);
        const float = Math.sin(elapsed / 1100) * .055;
        earthSurface.rotation.y = Math.sin(elapsed / 6500) * .08;
        station.position.y = .48 + Math.sin(elapsed / 1700) * .055;
        rocket.position.set(flyX, -.22 + Math.sin(smooth * Math.PI) * .62 + float, 1.2);
        const heading = latest.flying ? direction : -direction;
        rocket.rotation.set(0, -.14 * heading, heading === 1 ? .08 : Math.PI - .08);
        rocket.scale.setScalar((aspect < 1.8 ? 1.04 : .82) + (latest.flying ? Math.sin(progress * Math.PI) * .27 : 0));
        flame.visible = latest.flying;
        flame.scale.x = .8 + .2 * Math.sin(elapsed / 85);
        // A restrained camera move follows the journey without hiding either destination.
        const cameraX = latest.flying ? direction * (-.18 + .36 * smooth) : 0;
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
          if (next.flying && !latest.flying) flyingStarted = elapsed;
          latest = next; render();
        },
        dispose() {
          if (frame) cancelAnimationFrame(frame);
          observer.disconnect();
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          const geometries = new Set<import("three").BufferGeometry>();
          const materials = new Set<import("three").Material>();
          scene.traverse((object) => {
            if (object instanceof T.Mesh || object instanceof T.Points) {
              geometries.add(object.geometry);
              (Array.isArray(object.material) ? object.material : [object.material]).forEach((item) => materials.add(item));
            }
          });
          geometries.forEach((geometry) => geometry.dispose());
          materials.forEach((material) => material.dispose());
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
    {!ready && <div className="flight-scene-fallback"><Ship /></div>}
  </div>;
}
