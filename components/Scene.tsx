"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { projects } from "@/lib/projects";
import { bindInteraction, pointerState, scrollState } from "@/lib/interaction";
import { Artifact, HeroStack } from "@/components/artifacts";
import Studio from "@/components/Studio";

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

/**
 * 스크롤 스테이션 수 = 히어로 + 제품 n개 + 쇼케이스 + 컨택트.
 * 페이지의 패널 수와 반드시 같아야 카메라가 섹션과 어긋나지 않는다.
 */
const STATION_COUNT = projects.length + 3;

/** 아티팩트 i가 화면 중앙에 오는 스크롤 진행도(0~1). */
function centerProgress(i: number): number {
  return (i + 1) / (STATION_COUNT - 1);
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

/**
 * 접지 그림자는 그림자 하나마다 장면을 한 번 더 그리고 네 번 흐린다(프레임당 패스 5번).
 * 카메라 앞 제품 것만 매 프레임 그리고, 나머지는 마지막 모습으로 멈춰 둔다(frames=1은 다시 그려질 때 한 번 더 그리고 멈춘다).
 */
function Shadow({ center, ...props }: { center: number } & React.ComponentProps<typeof ContactShadows>) {
  const [live, setLive] = useState(false);
  const on = useRef(false);
  useFrame(() => {
    const v = Math.abs(scrollState.progress - center) < 0.1;   // 스테이션 간격(1/7)보다 좁게: 멈춰 있을 땐 하나, 넘어가는 동안만 둘
    if (v !== on.current) {
      on.current = v;
      setLive(v);
    }
  });
  return <ContactShadows frames={live ? Infinity : 1} {...props} />;
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
    // 쇼케이스(풀블리드 영상) — 화면은 영상이 덮으므로 카메라는 조용히 전진만 한다.
    pos.push(new THREE.Vector3(0, 1.4, endZ + 15));
    look.push(new THREE.Vector3(0, 0.4, endZ + 7));
    // 컨택트 — 위로 빠지며 코리도어를 내려다본다.
    pos.push(new THREE.Vector3(0, 5.5, endZ + 11));
    look.push(new THREE.Vector3(0.8, -0.4, endZ + 1));
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
      {/* 다음 제품이 멀리서 미리 보이지 않도록 안개를 조인다 */}
      <fog attach="fog" args={[BG, 7, 15.5]} />
      <Studio />
      <ambientLight intensity={0.35} />
      {/* 그림자를 만드는 유일한 광원 — 스튜디오 키라이트 방향과 맞춘다 */}
      <directionalLight position={[3, 7, 4]} intensity={1.1} />

      <group
        position={narrow ? [0, 1.15, 0] : [2.0, 0, 0]}
        scale={scale * 0.62}
      >
        <HeroStack reducedMotion={reducedMotion} />
      </group>
      <Shadow
        center={0}
        position={narrow ? [0, 0.2, 0] : [2.0, -0.95, 0]}
        scale={5 * scale}
        resolution={256}
        opacity={0.38}
        blur={2.4}
        far={2.6}
        color="#1b1d24"
      />
      {projects.map((p, i) => {
        const pos = artifactPosition(i, lateral);
        return (
          <group key={p.id}>
            <RevealGroup
              center={centerProgress(i)}
              position={pos}
              baseScale={scale * 0.85}
              reducedMotion={reducedMotion}
            >
              <Artifact kind={p.artifact} reducedMotion={reducedMotion} />
            </RevealGroup>
            {/* 접지 그림자 — 오브젝트가 공중에 붕 뜨지 않고 무게를 갖는다 */}
            <Shadow
              center={centerProgress(i)}
              position={[pos.x, pos.y - 1.75 * scale, pos.z]}
              scale={7 * scale}
              resolution={256}
              opacity={0.42}
              blur={2.6}
              far={3.2}
              color="#1b1d24"
            />
          </group>
        );
      })}
      <CameraRig lateral={lateral} reducedMotion={reducedMotion} />
    </>
  );
}

export default function Scene() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [maxDpr, setMaxDpr] = useState(2);

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
        dpr={[1, maxDpr]}
        // 안개(7~15.5)가 다 덮은 뒤로는 그리지 않는다. 멀리 있는 제품까지 그리면 폰 GPU가 헛일을 한다
        camera={{ fov: 42, position: [0, 0.35, 5.4], near: 0.1, far: 16 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* 2초 넘게 초당 40프레임을 못 내는 기기(느린 폰·저전력 모드)만 해상도를 1배로 내린다. 잘 도는 기기는 그대로 */}
        <PerformanceMonitor onDecline={() => setMaxDpr(1)} />
        <World reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
