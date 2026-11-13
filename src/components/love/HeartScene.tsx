import { useEffect, useRef } from "react";

export type HeartSceneHandle = { burst: () => void };

/**
 * Realistic glossy 3D hearts with Three.js. Loaded only in the browser and paused off-screen.
 * variant "opening": a beating heart with a cloud of small floating hearts and sparkles.
 * variant "finale": one large glowing heart, slowly turning.
 */
export function HeartScene({
  variant = "opening",
  onReady,
  zoomSignal = 0,
}: {
  variant?: "opening" | "finale";
  onReady?: () => void;
  zoomSignal?: number;
}) {
  const mount = useRef<HTMLDivElement>(null);
  const zoomRef = useRef({ target: 0, value: 0 });

  useEffect(() => {
    zoomRef.current.target = zoomSignal;
  }, [zoomSignal]);

  useEffect(() => {
    const el = mount.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;

      const isMobile = window.innerWidth < 768;
      const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      el.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, variant === "finale" ? 9 : 10);

      // Heart geometry
      const shape = new THREE.Shape();
      shape.moveTo(5, 5);
      shape.bezierCurveTo(5, 5, 4, 0, 0, 0);
      shape.bezierCurveTo(-6, 0, -6, 7, -6, 7);
      shape.bezierCurveTo(-6, 11, -3, 15.4, 5, 19);
      shape.bezierCurveTo(12, 15.4, 16, 11, 16, 7);
      shape.bezierCurveTo(16, 7, 16, 0, 10, 0);
      shape.bezierCurveTo(7, 0, 5, 5, 5, 5);
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth: 3.2,
        bevelEnabled: true,
        bevelThickness: 2.4,
        bevelSize: 2,
        bevelSegments: isMobile ? 6 : 10,
        curveSegments: isMobile ? 20 : 32,
      });
      geo.center();
      geo.rotateZ(Math.PI);
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#b5122e"),
        roughness: 0.18,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        sheen: 1,
        sheenColor: new THREE.Color("#ff8fa3"),
        emissive: new THREE.Color("#5a0414"),
        emissiveIntensity: variant === "finale" ? 0.55 : 0.35,
      });
      const main = new THREE.Mesh(geo, mat);
      const baseScale = variant === "finale" ? (isMobile ? 0.11 : 0.13) : isMobile ? 0.085 : 0.1;
      main.scale.setScalar(baseScale);
      scene.add(main);

      // glow sprite
      const gc = document.createElement("canvas");
      gc.width = gc.height = 256;
      const g2 = gc.getContext("2d")!;
      const grad = g2.createRadialGradient(128, 128, 0, 128, 128, 128);
      grad.addColorStop(0, "rgba(255,90,120,0.85)");
      grad.addColorStop(0.35, "rgba(200,20,60,0.35)");
      grad.addColorStop(1, "rgba(120,0,30,0)");
      g2.fillStyle = grad;
      g2.fillRect(0, 0, 256, 256);
      const glowTex = new THREE.CanvasTexture(gc);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      glow.scale.setScalar(variant === "finale" ? 9 : 7);
      glow.position.z = -1.5;
      scene.add(glow);

      // small hearts
      const smallCount = variant === "finale" ? (isMobile ? 10 : 18) : isMobile ? 14 : 26;
      const smallMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#e8466a"),
        roughness: 0.25,
        clearcoat: 1,
        emissive: new THREE.Color("#4a0010"),
        emissiveIntensity: 0.3,
      });
      const smalls = new THREE.InstancedMesh(geo, smallMat, smallCount);
      const seeds = Array.from({ length: smallCount }, (_, i) => ({
        x: (Math.random() - 0.5) * 14,
        y: (Math.random() - 0.5) * 10,
        z: -2 - Math.random() * 6,
        s: 0.012 + Math.random() * 0.022,
        sp: 0.2 + Math.random() * 0.5,
        ph: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI,
        i,
      }));
      scene.add(smalls);

      // sparkles
      const pCount = isMobile ? 160 : 320;
      const pos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 18;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
        pos[i * 3 + 2] = -Math.random() * 8;
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const sparks = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ size: 0.05, color: new THREE.Color("#ffd1b8"), transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      scene.add(sparks);

      // lights
      scene.add(new THREE.AmbientLight(0xffe0e6, 0.25));
      const key = new THREE.PointLight(0xffb3c1, 60, 30);
      key.position.set(4, 4, 6);
      scene.add(key);
      const rim = new THREE.PointLight(0xffc48a, 40, 30);
      rim.position.set(-5, -2, 3);
      scene.add(rim);
      const back = new THREE.PointLight(0xff2a55, 50, 30);
      back.position.set(0, 2, -4);
      scene.add(back);

      const resize = () => {
        const r = el.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / Math.max(1, r.height);
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      const pointer = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = !!e?.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(loop);
      });
      io.observe(el);

      const dummy = new THREE.Object3D();
      const clock = new THREE.Clock();
      let raf = 0;
      let readyFired = false;
      const loop = () => {
        raf = 0;
        if (!visible || document.hidden) return;
        const t = clock.getElapsedTime();
        // heartbeat
        const beat = 1 + Math.max(0, Math.sin(t * 3.2)) ** 6 * 0.08 + Math.max(0, Math.sin(t * 3.2 - 0.9)) ** 8 * 0.05;
        const z = zoomRef.current;
        z.value += (z.target - z.value) * 0.05;
        main.scale.setScalar(baseScale * beat * (1 + z.value * 2.2));
        main.rotation.y = Math.sin(t * 0.5) * 0.5 + pointer.x * 0.3;
        main.rotation.x = Math.sin(t * 0.35) * 0.12 + pointer.y * 0.15;
        main.position.y = Math.sin(t * 0.8) * 0.15;
        glow.material.opacity = 0.7 + Math.sin(t * 3.2) * 0.2 + z.value * 0.3;
        glow.scale.setScalar((variant === "finale" ? 9 : 7) * (1 + z.value * 1.5));

        seeds.forEach((s) => {
          const y = ((s.y + t * s.sp + 6) % 12) - 6;
          dummy.position.set(s.x + Math.sin(t * 0.6 + s.ph) * 0.4, y, s.z);
          dummy.rotation.set(0, t * 0.8 + s.rot, Math.sin(t + s.ph) * 0.3);
          dummy.scale.setScalar(s.s);
          dummy.updateMatrix();
          smalls.setMatrixAt(s.i, dummy.matrix);
        });
        smalls.instanceMatrix.needsUpdate = true;
        sparks.rotation.y = t * 0.02;

        camera.position.x += (pointer.x * 0.6 + Math.sin(t * 0.2) * 0.3 - camera.position.x) * 0.03;
        camera.position.y += (-pointer.y * 0.4 + Math.cos(t * 0.25) * 0.2 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        if (!readyFired) {
          readyFired = true;
          onReady?.();
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      const onVis = () => {
        if (!document.hidden && !raf) raf = requestAnimationFrame(loop);
      };
      document.addEventListener("visibilitychange", onVis);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("visibilitychange", onVis);
        geo.dispose();
        mat.dispose();
        smallMat.dispose();
        pGeo.dispose();
        glowTex.dispose();
        envTex.dispose();
        pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch(() => {
      onReady?.();
    });

    return () => {
      disposed = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  return <div ref={mount} aria-hidden className="pointer-events-none absolute inset-0" />;
}
