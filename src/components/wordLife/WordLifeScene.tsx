import { useEffect, useRef } from "react";
import { advanceAtlasClock } from "../../lib/atlasMotion";
import { wordLifeBuilders } from "./builders";
import { wordLifeSample, type WordLifeWord } from "../../lib/wordLife";

/** One short-lived, low-power canvas. The loop stops when the hop finishes. */
export function WordLifeScene({
  word,
  onReady,
  onUnavailable,
}: {
  word: WordLifeWord;
  onReady: () => void;
  onUnavailable: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  const unavailable = useRef(onUnavailable);
  ready.current = onReady;
  unavailable.current = onUnavailable;

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let cancelled = false;
    let dispose: (() => void) | undefined;

    void import("three").then((T) => {
      if (cancelled) return;
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      } catch {
        unavailable.current();
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      const scene = new T.Scene();
      const camera = new T.PerspectiveCamera(30, 1, 0.1, 40);
      camera.position.set(0.2, 0.72, 5.35);
      camera.lookAt(0, 0.22, 0);
      scene.add(new T.HemisphereLight(0xfff6e2, 0x1b334c, 2.35));
      const sun = new T.DirectionalLight(0xfff1d2, 2.7);
      sun.position.set(-2.4, 4.2, 5);
      scene.add(sun);
      const fill = new T.DirectionalLight(0x8fd4cf, 0.55);
      fill.position.set(3.2, 1.2, 2.4);
      scene.add(fill);

      const materials = new Map<string, import("three").MeshStandardMaterial>();
      const mat = (color: number, extras: import("three").MeshStandardMaterialParameters = {}) => {
        const key = `${color}:${extras.emissive ?? 0}:${extras.emissiveIntensity ?? 0}`;
        let material = materials.get(key);
        if (!material) {
          material = new T.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...extras });
          materials.set(key, material);
        }
        return material;
      };
      const builder = wordLifeBuilders[word];
      const model = builder({ T, mat });
      scene.add(model.root);
      const shadow = new T.Mesh(
        new T.CircleGeometry(0.95, 18),
        new T.MeshBasicMaterial({ color: 0x071321, transparent: true, opacity: 0.28 }),
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = -0.95;
      scene.add(shadow);
      const stars = new T.Points(
        new T.BufferGeometry().setAttribute("position", new T.Float32BufferAttribute([
          -1.7, 1.15, -1.4, 1.55, 1.2, -1.5, -1.15, 0.35, -1.7, 1.25, 0.15, -1.6,
          -0.2, 1.4, -1.8, 0.55, 0.95, -1.7, 1.85, 0.7, -1.5, -1.85, -0.15, -1.4,
        ], 3)),
        new T.PointsMaterial({ color: 0xfff6d2, size: 0.055, transparent: true, opacity: 0.85 }),
      );
      scene.add(stars);

      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.opacity = "0";
      host.appendChild(renderer.domElement);

      let frame = 0;
      let lost = false;
      let announced = false;
      let clock = { elapsed: 0, previous: null as number | null };
      const paused = () => document.hidden || [...document.querySelectorAll("dialog[open]")].some((node) => !node.classList.contains("word-life-dialog"));
      const draw = (now: number) => {
        frame = 0;
        if (lost || cancelled) return;
        const running = !paused();
        clock = advanceAtlasClock(clock, now, running);
        const sample = wordLifeSample(clock.elapsed);
        model.root.position.y = sample.hop;
        model.root.scale.setScalar(sample.scale);
        // A small three-quarter angle keeps the face readable after the pop turn.
        model.root.rotation.y = sample.spin - 0.45;
        model.pose(sample);
        renderer.render(scene, camera);
        if (!announced) {
          announced = true;
          renderer.domElement.style.opacity = "1";
          ready.current();
        }
        if (!sample.settled && running) frame = requestAnimationFrame(draw);
      };
      const kick = () => {
        if (!frame && !lost && !cancelled) frame = requestAnimationFrame(draw);
      };
      const resize = () => {
        if (lost) return;
        const width = Math.max(1, host.clientWidth);
        const height = Math.max(1, host.clientHeight);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        kick();
      };
      const onLost = (event: Event) => {
        event.preventDefault();
        lost = true;
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        unavailable.current();
      };
      const onPause = () => kick();
      renderer.domElement.addEventListener("webglcontextlost", onLost);
      const observer = new ResizeObserver(resize);
      observer.observe(host);
      document.addEventListener("visibilitychange", onPause);
      const mutations = new MutationObserver(onPause);
      mutations.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["open"] });
      resize();
      let disposed = false;
      dispose = () => {
        if (disposed) return;
        disposed = true;
        if (frame) cancelAnimationFrame(frame);
        observer.disconnect();
        mutations.disconnect();
        document.removeEventListener("visibilitychange", onPause);
        renderer.domElement.removeEventListener("webglcontextlost", onLost);
        const geometries = new Set<import("three").BufferGeometry>();
        const usedMaterials = new Set<import("three").Material>();
        scene.traverse((object) => {
          if (object instanceof T.Mesh || object instanceof T.Points) {
            geometries.add(object.geometry);
            (Array.isArray(object.material) ? object.material : [object.material]).forEach((item) => usedMaterials.add(item));
          }
        });
        geometries.forEach((geometry) => geometry.dispose());
        usedMaterials.forEach((material) => material.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
      if (cancelled) dispose();
    }).catch(() => {
      if (!cancelled) unavailable.current();
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [word]);

  return <div ref={container} className="word-life-canvas" />;
}
