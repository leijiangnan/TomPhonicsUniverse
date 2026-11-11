import { useEffect, useRef } from "react";
import type { CatalogNode } from "../../data/space/catalog";
import { advanceAtlasClock, type AtlasClock } from "../../lib/atlasMotion";

type Three = typeof import("three");
type Group = import("three").Group;
type Material = import("three").Material;

// The atlas is an illustration. Its shapes are not scientific surface maps or distances.
function makeObject(T: Three, node: CatalogNode, material: (color: number, glow?: boolean) => Material) {
  const root = new T.Group();
  const n = node.number;
  const facility = node.id === "station" || [2, 6, 7, 39].includes(n);
  const region = [5, 10, 15, 37, 40, 41].includes(n);
  const star = n >= 42 && n <= 53 && n !== 43;
  const galaxy = [58, 60, 61, 62].includes(n);
  const nebula = [54, 55, 57].includes(n);
  const planet = !facility && !region && !star && !galaxy && !nebula && n !== 56 && n !== 59;
  const body = new T.Group();
  root.add(body);
  let orbit: Group | undefined;
  let accentRing: import("three").Mesh | undefined;
  const sphere = (r: number, color: number, x = 0, y = 0, z = 0, glow = false) => {
    const m = new T.Mesh(new T.SphereGeometry(r, 24, 16), material(color, glow));
    m.position.set(x, y, z); body.add(m); return m;
  };
  const box = (w: number, h: number, d: number, color: number, x: number, y: number, z = 0) => {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), material(color));
    m.position.set(x, y, z); body.add(m); return m;
  };
  const ring = (radius: number, thickness: number, color: number, rx = 0.9, rz = -0.25) => {
    const m = new T.Mesh(new T.TorusGeometry(radius, thickness, 8, 64), material(color, true));
    m.rotation.set(rx, 0.1, rz); (planet ? root : body).add(m); return m;
  };
  const colors: Record<number, number> = {1:0x319dcf,3:0x9ca9b5,4:0x939ba6,8:0xe6ba7e,9:0x9c9390,11:0xd8815f,12:0x9b8e7d,13:0x9f8e7e,14:0x978879,17:0x9b9287,18:0xada395,19:0xe1b98a,20:0xdac065,21:0xd4cec0,22:0xaaa69a,23:0x867d70,24:0xe0c99c,25:0xc8dfe1,26:0xd6a75f,27:0xc0b8a5,28:0x9ed2d6,29:0xb2c6cd,30:0x5683e3,31:0xc8d4d4,32:0xc6b09a,33:0xa5a5a7,34:0xd8dedb,35:0xb59381,36:0xe3ded9,38:0xac6d52,43:0xa99988};
  if (facility) {
    // Space facilities are stylised models, not real-world replicas.
    if (n === 2) {
      // ISS: a long truss with four pairs of warm solar arrays.
      box(2.9, .09, .12, 0xe0e9e6, 0, 0);
      box(.65, .34, .38, 0xe4eee9, 0, 0);
      box(.17, .80, .25, 0xbacdd0, 0, 0);
      for (const x of [-1.15, -.76, .76, 1.15]) {
        box(.28, 1.06, .08, 0xa97747, x, 0);
        for (const y of [-.28, 0, .28]) box(.25, .018, .1, 0xf1c586, x, y, .01);
      }
      root.rotation.set(-.18, -.12, .10);
    } else if (n === 6) {
      // Fictional lunar orbital facility: round hub and two angled wings.
      const hub = sphere(.48, 0xd3e8e2); hub.scale.set(1, .75, .75);
      ring(.62, .085, 0x8bcfc6, .15, 0);
      box(.30, .18, .07, 0x69c9d8, 0, .02, .43);
      for (const side of [-1, 1]) {
        box(.50, .11, .10, 0xdbe9e4, side * .68, 0);
        const wing = box(.72, .50, .08, 0x4e79a0, side * 1.16, side * .12);
        wing.rotation.z = side * .22;
      }
      box(.05, .50, .05, 0xe5f0e9, 0, .64); sphere(.09, 0xead8a0, 0, .93, 0, true);
      root.rotation.y = -.2;
    } else if (n === 7) {
      // Fictional solar observatory: instrument dish aimed toward the sun.
      sphere(.37, 0xffcf68, -1.12, .55, -.2, true);
      box(.70, .45, .42, 0xdae9e4, .18, -.18);
      box(.20, .12, .08, 0x68cad0, .18, -.18, .23);
      const dish = new T.Mesh(new T.ConeGeometry(.52, .30, 24, 1, true), material(0xece4c9));
      dish.rotation.z = Math.PI / 2; dish.position.set(-.48, .10, 0); root.add(dish);
      box(.45, .08, .08, 0xd8e7e3, .72, -.18);
      box(.55, .56, .08, 0x456f9a, 1.18, -.18);
      box(.50, .02, .10, 0x98d9ce, 1.18, -.18, .01);
      root.rotation.set(-.08, -.22, -.14);
    } else if (n === 39) {
      // A distant observatory, with a long body and flared antenna.
      box(1.25, .30, .32, 0xcfdedc, 0, -.1);
      box(.32, .57, .12, 0x4f7ca1, -.64, -.1);
      const dish = new T.Mesh(new T.ConeGeometry(.45, .22, 24, 1, true), material(0xeadbb7));
      dish.rotation.z = -Math.PI / 2; dish.position.set(.88, .15, 0); root.add(dish);
      root.rotation.set(-.14, -.18, .35);
    } else {
      // Fictional supply station uses a compact cylindrical hub.
      const hull = new T.Mesh(new T.CylinderGeometry(.42, .42, 1.20, 12), material(0xddeee8));
      hull.rotation.z = Math.PI / 2; root.add(hull);
      box(.10, .82, .12, 0x63c5ba, -.45, 0); box(.10, .82, .12, 0x63c5ba, .45, 0);
      box(.40, .27, .07, 0x78d8db, 0, .02, .42);
      for (const side of [-1, 1]) {
        box(.35, .1, .1, 0xdce9e2, side * .75, 0);
        box(.75, .62, .09, 0x3c709c, side * 1.20, 0);
        for (const y of [-.16, .16]) box(.70, .018, .11, 0x92d7cf, side * 1.20, y, .01);
        box(.018, .58, .11, 0x92d7cf, side * 1.20, 0, .01);
      }
      box(.045, .48, .05, 0xe6f0e8, .08, .65); sphere(.09, 0xffd275, .08, .92, 0, true);
      root.rotation.set(-.14, -.25, -.10);
    }
  } else if (region) {
    sphere(.31, n === 5 ? 0x5cb4dd : 0xf8d37e, 0, 0, 0, true);
    ring(.85, .018, 0x7bbdd6, .9, .25); ring(1.25, .012, 0x99b9d7, .95, -.2);
    orbit = new T.Group();
    body.add(orbit);
    const satellite = sphere(.14, 0xb8d6e9, .86, .08, .2);
    body.remove(satellite); orbit.add(satellite);
    if (n === 5) { box(.04, .35, .04, 0xffdf8f, 1.25, .3); box(.35, .04, .04, 0xffdf8f, 1.25, .3); }
  } else if (n === 59) {
    sphere(.48, 0x080d20); ring(.81, .085, 0xf2a569, 1.10, -.4); ring(1.02, .028, 0xffd990, 1.10, -.4);
  } else if (galaxy || nebula || n === 56) {
    // Layered point clouds describe distant light, not an imagined solid surface.
    const points: number[] = [];
    for (let i = 0; i < 125; i++) {
      const angle = i * 2.399 + n; const radius = .08 + Math.sqrt(i / 125) * 1.4;
      points.push(Math.cos(angle) * radius, Math.sin(angle) * radius * (galaxy ? .40 : .65), (i % 7 - 3) * .06);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(points, 3));
    body.add(new T.Points(geometry, new T.PointsMaterial({ color: nebula ? 0xe3b7ed : 0xc7e6ff, size: .055, transparent: true, opacity: .9 })));
    if (galaxy) { sphere(.18, 0xffe0aa, 0, 0, 0, true); ring(.9, .03, 0xa48cda, .9, -.45); }
    if (nebula) { sphere(.38, 0x8a77c3, -.38, .06, -.2, true); sphere(.32, 0x587cb8, .25, -.12, -.2, true); }
    root.rotation.z = -.25;
  } else if (star) {
    const c = [42,46,47,48,51,53].includes(n) ? 0xf38b60 : [49,50,52].includes(n) ? 0xb6dcff : 0xffd17a;
    sphere(n === 50 ? .57 : 1, c, 0, 0, 0, true);
    accentRing = ring(1.22, .025, c, .8, -.3);
  } else if (n === 38) {
    const a = sphere(.62, 0xb07962, -.43, -.05); a.scale.set(1, .8, .9);
    const b = sphere(.47, 0xca927a, .38, .26); b.scale.set(1, .85, .85);
  } else {
    const color = colors[n] ?? 0xa9afbf;
    const ball = sphere(1, color);
    if (node.id === "earth") {
      // Land is an invented pattern, not geographic imagery.
      for (const [x,y,s] of [[-.42,.35,.22],[.06,.53,.16],[.42,.08,.20],[-.10,-.28,.22],[.37,-.45,.15]]) {
        const patch = sphere(s, 0x8cd29c, x, y, Math.sqrt(Math.max(.1,1-x*x-y*y)));
        patch.scale.set(1.45, .65, .18);
      }
      ring(1.16, .018, 0x86dbe7, 1.1, -.25);
    } else if (n === 26) {
      // Titan's hazy orange atmosphere is an illustrative shell, not a surface map.
      const haze = new T.Mesh(new T.SphereGeometry(1.10, 24, 16), new T.MeshBasicMaterial({ color: 0xf7bd77, transparent: true, opacity: .18, side: T.BackSide, depthWrite: false }));
      body.add(haze);
    } else if (n === 27) {
      // Iapetus is shown with contrasting light and dark hemispheres.
      const darkSide = new T.Mesh(new T.SphereGeometry(1.005, 24, 16, -Math.PI / 2, Math.PI), material(0x625850));
      body.add(darkSide);
    } else if ([19,24,28,30].includes(n)) {
      for (const y of [-.55,-.25,.08,.38,.60]) {
        const band = new T.Mesh(new T.TorusGeometry(Math.sqrt(1-y*y) * 1.004, .035, 6, 48), material(n===30 ? 0x9ac3ff : 0xc79068));
        band.rotation.x = Math.PI / 2; band.position.y = y; body.add(band);
      }
      ball.rotation.z = -.12;
    } else if (n !== 8) {
      const spots = n === 4
        ? [[-.55,.48,.08],[-.23,.55,.08],[.15,.54,.13],[.52,.35,.07],[-.48,.05,.13],[-.02,.13,.11],[.38,-.03,.08],[-.47,-.36,.08],[-.10,-.40,.15],[.35,-.42,.10]]
        : [[-.34,.35,.13],[.32,.42,.10],[.42,-.22,.15],[-.21,-.38,.09]];
      for (const [x,y,s] of spots) {
        const spot = sphere(s, n === 11 ? 0xa95340 : 0x697785, x, y, Math.sqrt(Math.max(.1,1-x*x-y*y)));
        spot.scale.z = .12;
      }
    }
    if ([24, 28].includes(n)) ring(1.40, .10, n===24 ? 0xe7d1a2 : 0x9bc8d7, 1.08, -.35);

    // Extra illustrative markings continue around the hidden hemisphere, so
    // a rotating globe never turns into a blank, visually motionless ball.
    // They are stylised, not maps of real terrain or cloud positions.
    if (n !== 27) {
      const markColor = node.id === "earth" ? 0x8cd29c : n === 26 ? 0xeab27c : n === 8 ? 0xf5ddac :
        [19, 24, 28, 30].includes(n) ? (n === 30 ? 0xa7c8f1 : 0xb17b60) : n === 11 ? 0xa95340 : 0x697785;
      for (let i = 0; i < 9; i++) {
        const longitude = Math.PI * 2 * i / 9 + .35;
        const latitude = [-.43, .12, .48][i % 3];
        const normal = new T.Vector3(Math.cos(latitude) * Math.sin(longitude), Math.sin(latitude), Math.cos(latitude) * Math.cos(longitude));
        const mark = sphere(.10 + (i % 3) * .025, markColor);
        mark.position.copy(normal).multiplyScalar(1.01);
        mark.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), normal);
        mark.scale.set(node.id === "earth" ? 1.4 : 1.15, .75, .12);
      }
    }
  }
  const animate = (elapsed: number) => {
    // These are gentle visual cues, not real astronomical rotation speeds.
    if (planet) body.rotation.y = elapsed * Math.PI * 2 / 26000;
    if (facility) root.position.y = Math.sin(elapsed / 1500 + n) * .07;
    if (orbit) orbit.rotation.z = elapsed * Math.PI * 2 / 16000;
    if (galaxy || nebula || n === 56 || n === 59) body.rotation.z = elapsed * Math.PI * 2 / 36000;
    if (accentRing) accentRing.rotation.z = -.3 + elapsed * Math.PI * 2 / 24000;
  };
  return { root, animate };
}

/** One renderer and one canvas for the entire atlas, never a WebGL context per node. */
export function Atlas3D({ nodes, onReady }: { nodes: CatalogNode[]; onReady: (ready: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onReady);
  callback.current = onReady;
  useEffect(() => {
    const host = ref.current, grid = host?.parentElement;
    if (!host || !grid) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;
    callback.current(false);
    void import("three").then((T) => {
      if (cancelled) return;
      let renderer: import("three").WebGLRenderer;
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
      catch { return; }
      const scenes: { scene: import("three").Scene; animate: (elapsed: number) => void; camera: import("three").OrthographicCamera }[] = [];
      const materialCache = new Map<string, Material>();
      const material = (color: number, glow = false) => {
        const key = `${color}-${glow}`;
        let m = materialCache.get(key);
        if (!m) { m = new T.MeshStandardMaterial({ color, roughness: .82, emissive: glow ? color : 0, emissiveIntensity: glow ? .38 : 0 }); materialCache.set(key, m); }
        return m;
      };
      for (const node of nodes) {
        const scene = new T.Scene();
        scene.add(new T.HemisphereLight(0xd7f7ff, 0x263a64, 2));
        const light = new T.DirectionalLight(0xffe5c5, 2.6); light.position.set(-3, 5, 8); scene.add(light);
        const object = makeObject(T, node, material); scene.add(object.root);
        const camera = new T.OrthographicCamera(-2, 2, 1.5, -1.5, .1, 30); camera.position.z = 10;
        scenes.push({ scene, animate: object.animate, camera });
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true"); host.appendChild(renderer.domElement);
      let frame = 0, lastDraw = 0, visible = false, lost = false;
      let clock: AtlasClock = { elapsed: 0, previous: null };
      let width = 1, height = 1;
      const motionAllowed = () => visible && !document.hidden && grid.closest(".app-shell")?.getAttribute("data-ambient-motion") === "running";
      const draw = (now: number) => {
        frame = 0;
        if (lost || cancelled) return;
        const motion = motionAllowed();
        clock = advanceAtlasClock(clock, now, motion);
        if (motion && now - lastDraw < 50) { frame = requestAnimationFrame(draw); return; }
        lastDraw = now;
        const gridRect = grid.getBoundingClientRect();
        renderer.setScissorTest(false); renderer.clear(); renderer.setScissorTest(true);
        const bodies = grid.querySelectorAll<HTMLElement>(".universe-node .universe-body");
        bodies.forEach((body, i) => {
          const item = scenes[i]; if (!item) return;
          const rect = body.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const x = rect.left - gridRect.left, y = gridRect.bottom - rect.bottom;
          const w = rect.width, h = rect.height;
          if (w <= 0 || h <= 0) return;
          const aspect = w / h;
          item.camera.left = -1.7 * aspect; item.camera.right = 1.7 * aspect;
          item.camera.top = 1.7; item.camera.bottom = -1.7; item.camera.updateProjectionMatrix();
          item.animate(clock.elapsed);
          renderer.setViewport(x, y, w, h); renderer.setScissor(x, y, w, h);
          renderer.render(item.scene, item.camera);
        });
        if (motion) frame = requestAnimationFrame(draw);
      };
      const requestDraw = () => { if (!frame && !lost) frame = requestAnimationFrame(draw); };
      const updateMotion = () => {
        // Browsers can suspend animation frames in background tabs; reset the
        // clock immediately so the first frame after resuming cannot jump.
        if (!motionAllowed()) clock = advanceAtlasClock(clock, performance.now(), false);
        requestDraw();
      };
      const resize = () => {
        width = Math.max(1, grid.clientWidth); height = Math.max(1, grid.clientHeight);
        renderer.setSize(width, height, false); requestDraw();
      };
      const lostContext = (event: Event) => { event.preventDefault(); lost = true; if (frame) cancelAnimationFrame(frame); frame = 0; callback.current(false); };
      renderer.domElement.addEventListener("webglcontextlost", lostContext);
      const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(grid);
      const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateMotion(); }); intersection.observe(grid);
      const mutation = new MutationObserver(updateMotion);
      const shell = grid.closest(".app-shell"); if (shell) mutation.observe(shell, { attributes: true, attributeFilter: ["data-ambient-motion"] });
      window.addEventListener("scroll", requestDraw, { passive: true });
      document.addEventListener("visibilitychange", updateMotion);
      resize(); callback.current(true);
      dispose = () => {
        if (frame) cancelAnimationFrame(frame);
        resizeObserver.disconnect(); intersection.disconnect(); mutation.disconnect();
        window.removeEventListener("scroll", requestDraw); document.removeEventListener("visibilitychange", updateMotion);
        renderer.domElement.removeEventListener("webglcontextlost", lostContext);
        const geometries = new Set<import("three").BufferGeometry>();
        scenes.forEach(({ scene }) => scene.traverse((object) => {
          if (object instanceof T.Mesh || object instanceof T.Points) {
            geometries.add(object.geometry);
            (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => materialCache.set(m.uuid, m));
          }
        }));
        geometries.forEach(g => g.dispose()); new Set(materialCache.values()).forEach(m => m.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { /* Existing SVG illustrations remain available. */ });
    return () => { cancelled = true; dispose?.(); };
  }, [nodes]);
  return <div ref={ref} className="atlas-3d-layer" aria-hidden="true" />;
}
