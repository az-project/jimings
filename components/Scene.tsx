"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { projects } from "@/lib/projects";
import { bindInteraction, pointerState, scrollState } from "@/lib/interaction";
import { Artifact, HeroStack } from "@/components/artifacts";

const BG = "#f7f7f5";
const SPACING = 10;

/** i번째 제품 아티팩트의 월드 좌표. 좌우로 번갈아 배치한다. */
function artifactPosition(i: number, lateral: number): THREE.Vector3 {
  const side = i % 2 === 0 ? 1 : -1;
  return new THREE.Vector3(side * lateral, 0, -(i + 1) * SPACING);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/** 아티팩트 i가 화면 중앙에 오는 스크롤 진행도(0~1). */
function centerProgress(i: number): number {
  return (i + 1) / (projects.length + 1);
}

/**
 * 스크롤이 해당 아티팩트에 가까워질 때 커지며 떠오르는 진입 연출.
 * 안쪽 그룹만 변형하고 바깥 그룹은 고정 좌표를 유지한다.
 */
function RevealGroup({
  center,
  position,
  baseScale,
  reducedMotion,
  children,
}: {
  center: number;
  position: THREE.Vector3;
  baseScale: number;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  const inner = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const g = inner.current;
    if (!g) return;
    let reveal = 1;
    if (!reducedMotion) {
      const d = Math.abs(scrollState.progress - center);
      reveal = smoothstep(THREE.MathUtils.clamp(1 - d / 0.22, 0, 1));
    }
    const s = THREE.MathUtils.damp(
      g.scale.x,
      baseScale * (0.34 + 0.66 * reveal),
      5,
      delta
    );
    g.scale.setScalar(s);
    g.position.y = THREE.MathUtils.damp(g.position.y, (1 - reveal) * -0.9, 5, delta);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, (1 - reveal) * 0.3, 5, delta);
  });
  return (
    <group position={position}>
      <group ref={inner}>{children}</group>
    </group>
  );
}

function CameraRig({
  lateral,
  reducedMotion,
}: {
  lateral: number;
  reducedMotion: boolean;
}) {
  const camera = useThree((s) => s.camera);
  const lookCurrent = useRef(new THREE.Vector3(0, 0.15, 0));
  const posScratch = useRef(new THREE.Vector3());
  const lookScratch = useRef(new THREE.Vector3());

  const stations = useMemo(() => {
    const pos: THREE.Vector3[] = [new THREE.Vector3(0, 0.35, 5.4)];
    const look: THREE.Vector3[] = [new THREE.Vector3(0, 0.15, 0)];
    projects.forEach((_, i) => {
      const a = artifactPosition(i, lateral);
      pos.push(new THREE.Vector3(a.x * 0.25, 0.35, a.z + 5.4));
      look.push(new THREE.Vector3(a.x * 0.55, 0.05, a.z));
    });
    const endZ = -(projects.length + 1) * SPACING;
    pos.push(new THREE.Vector3(0, 5.5, endZ + 14));
    look.push(new THREE.Vector3(0.8, -0.4, endZ + 4));
    return { pos, look };
  }, [lateral]);

  useFrame((_, delta) => {
    const n = stations.pos.length;
    const s = scrollState.progress * (n - 1);
    const i = Math.min(Math.floor(s), n - 2);
    const f = smoothstep(s - i);

    const targetPos = posScratch.current.lerpVectors(
      stations.pos[i],
      stations.pos[i + 1],
      f
    );
    const targetLook = lookScratch.current.lerpVectors(
      stations.look[i],
      stations.look[i + 1],
      f
    );
    if (!reducedMotion) {
      targetPos.x += pointerState.x * 0.35;
      targetPos.y += -pointerState.y * 0.18;
    }

    const lambda = 4;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.x, lambda, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.y, lambda, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.z, lambda, delta);
    const lc = lookCurrent.current;
    lc.x = THREE.MathUtils.damp(lc.x, targetLook.x, lambda, delta);
    lc.y = THREE.MathUtils.damp(lc.y, targetLook.y, lambda, delta);
    lc.z = THREE.MathUtils.damp(lc.z, targetLook.z, lambda, delta);
    // 커서에 따라 살짝 기우는 뱅킹(roll)으로 이동감을 준다.
    const roll = reducedMotion ? 0 : pointerState.x * 0.04;
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(lc);
  });
  return null;
}

function World({ reducedMotion }: { reducedMotion: boolean }) {
  const { size } = useThree();
  const narrow = size.width / size.height < 0.8;
  const lateral = narrow ? 0.9 : 2.1;
  const scale = narrow ? 0.72 : 1;

  return (
    <>
      <fog attach="fog" args={[BG, 7, 19]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#ffffff", "#c9c9c4", 1.1]} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} />
      <directionalLight position={[-5, 2, -3]} intensity={0.8} />

      <group
        position={narrow ? [0, 1.15, 0] : [2.0, 0, 0]}
        scale={scale * 0.62}
      >
        <HeroStack reducedMotion={reducedMotion} />
      </group>
      {projects.map((p, i) => (
        <RevealGroup
          key={p.id}
          center={centerProgress(i)}
          position={artifactPosition(i, lateral)}
          baseScale={scale * 0.85}
          reducedMotion={reducedMotion}
        >
          <Artifact kind={p.artifact} reducedMotion={reducedMotion} />
        </RevealGroup>
      ))}
      <CameraRig lateral={lateral} reducedMotion={reducedMotion} />
    </>
  );
}

export default function Scene() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const unbind = bindInteraction();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => {
      unbind();
      mq.removeEventListener("change", update);
    };
  }, []);

  return (
    <div className="scene" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 42, position: [0, 0.35, 5.4], near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <World reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
