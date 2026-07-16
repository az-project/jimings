"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { ArtifactKind } from "@/lib/projects";
import { pointerState } from "@/lib/interaction";

export const INK = "#16181d";
export const ACCENT = "#2b3cf0";
export const MUTE = "#9aa0a8";

const inkMat = { color: "#262b34", roughness: 0.32, metalness: 0.1 };
const accentMat = { color: ACCENT, roughness: 0.28, metalness: 0.05 };

/** 히어로: 쌓아 올린 세 장의 슬래브 — 커서를 따라 부채꼴로 기울어진다. */
export function HeroStack({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const tx = 0.12 + (reducedMotion ? 0 : pointerState.y * 0.35);
    const ty = -0.35 + (reducedMotion ? 0 : pointerState.x * 0.55);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 4, delta);
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ty, 4, delta);
    if (!reducedMotion) {
      g.position.y = 0.15 + Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
    g.children.forEach((child, i) => {
      const spread = reducedMotion ? 0 : pointerState.x * (i - 1) * 0.45;
      child.rotation.z = THREE.MathUtils.damp(child.rotation.z, spread * 0.35, 4, delta);
      child.position.x = THREE.MathUtils.damp(child.position.x, spread, 4, delta);
    });
  });
  return (
    <group ref={group} position={[0, 0.15, 0]} rotation={[0.12, -0.35, 0]}>
      <RoundedBox args={[2.1, 0.26, 1.4]} radius={0.07} position={[0, -0.42, 0]}>
        <meshStandardMaterial {...inkMat} />
      </RoundedBox>
      <RoundedBox args={[2.1, 0.26, 1.4]} radius={0.07} position={[0, 0, 0]}>
        <meshStandardMaterial {...accentMat} />
      </RoundedBox>
      <RoundedBox args={[2.1, 0.26, 1.4]} radius={0.07} position={[0, 0.42, 0]}>
        <meshStandardMaterial {...inkMat} />
      </RoundedBox>
    </group>
  );
}

/** 슥슥: 서명 궤적을 따라 흐르는 리본. */
function Ribbon({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const tip = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.7, -0.35, 0),
      new THREE.Vector3(-0.9, 0.55, 0.25),
      new THREE.Vector3(-0.05, -0.55, -0.2),
      new THREE.Vector3(0.75, 0.6, 0.15),
      new THREE.Vector3(1.45, -0.15, -0.1),
      new THREE.Vector3(1.85, 0.35, 0),
    ]);
  }, []);
  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (mesh.current) mesh.current.rotation.y = Math.sin(t * 0.35) * 0.3;
    if (tip.current) {
      const p = curve.getPointAt((t * 0.08) % 1);
      tip.current.position.set(p.x, p.y, p.z);
    }
  });
  return (
    <group>
      <mesh ref={mesh}>
        <tubeGeometry args={[curve, 128, 0.07, 12, false]} />
        <meshStandardMaterial {...inkMat} />
      </mesh>
      <mesh ref={tip}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
    </group>
  );
}

/** 쿵치따치: 비트가 도는 12개 구 링 — 1박은 액센트. */
function Rhythm({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const COUNT = 12;
  const BPM = 100;
  useFrame((state) => {
    const g = group.current;
    if (!g || reducedMotion) return;
    const beat = (state.clock.elapsedTime * BPM) / 60;
    g.rotation.z = Math.sin(state.clock.elapsedTime * 0.25) * 0.15;
    g.children.forEach((child, i) => {
      const phase = ((beat - i / COUNT) % 1 + 1) % 1;
      const pulse = Math.max(0, 1 - phase * 3);
      child.scale.setScalar(1 + pulse * 0.9);
    });
  });
  return (
    <group ref={group} rotation={[0.35, 0, 0]}>
      {Array.from({ length: COUNT }, (_, i) => {
        const a = (i / COUNT) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0]}>
            <sphereGeometry args={[0.14, 20, 20]} />
            <meshStandardMaterial {...(i === 0 ? accentMat : inkMat)} />
          </mesh>
        );
      })}
    </group>
  );
}

/** oh-my-harness: 와이어프레임 케이지 안에서 유영하는 코어. */
function Cage({ reducedMotion }: { reducedMotion: boolean }) {
  const cage = useRef<THREE.LineSegments>(null);
  const core = useRef<THREE.Mesh>(null);
  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(2.1, 2.1, 2.1)),
    []
  );
  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (cage.current) {
      cage.current.rotation.y = t * 0.25;
      cage.current.rotation.x = Math.sin(t * 0.2) * 0.2;
    }
    if (core.current) {
      core.current.position.set(
        Math.sin(t * 0.9) * 0.45,
        Math.cos(t * 0.7) * 0.45,
        Math.sin(t * 0.5) * 0.45
      );
    }
  });
  return (
    <group>
      <lineSegments ref={cage} geometry={edges}>
        <lineBasicMaterial color={MUTE} />
      </lineSegments>
      <mesh ref={core}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
    </group>
  );
}

/** 기본 아티팩트: 새 제품이 아직 형태를 정하지 않았을 때. */
function Prism({ reducedMotion }: { reducedMotion: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (reducedMotion || !mesh.current) return;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.3;
  });
  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.05, 0]} />
      <meshStandardMaterial {...inkMat} flatShading />
    </mesh>
  );
}

export function Artifact({
  kind,
  reducedMotion,
}: {
  kind: ArtifactKind;
  reducedMotion: boolean;
}) {
  switch (kind) {
    case "ribbon":
      return <Ribbon reducedMotion={reducedMotion} />;
    case "rhythm":
      return <Rhythm reducedMotion={reducedMotion} />;
    case "cage":
      return <Cage reducedMotion={reducedMotion} />;
    default:
      return <Prism reducedMotion={reducedMotion} />;
  }
}
