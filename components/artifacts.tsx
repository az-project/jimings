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
const paperMat = { color: "#f4f4f1", roughness: 0.68, metalness: 0.0 };

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

/** 슥슥: 문서 위에 서명이 슥슥 그어지는 종이 — 펜촉(액센트 점)이 서명선을 따라 움직인다. */
function SignPaper({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pen = useRef<THREE.Group>(null);
  // 종이 앞면(z+) 위에 놓이는 서명선. 종이 로컬 좌표계 기준.
  // 빈 종이 한가운데를 가로지르는 서명.
  const sig = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.58, -0.12, 0.045),
        new THREE.Vector3(-0.28, 0.14, 0.045),
        new THREE.Vector3(-0.02, -0.2, 0.045),
        new THREE.Vector3(0.24, 0.12, 0.045),
        new THREE.Vector3(0.46, -0.16, 0.045),
        new THREE.Vector3(0.62, 0.0, 0.045),
      ]),
    []
  );
  useFrame((state) => {
    const g = group.current;
    if (!g || reducedMotion) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = -0.32 + Math.sin(t * 0.4) * 0.12;
    g.position.y = Math.sin(t * 0.7) * 0.05;
    if (pen.current) {
      const p = sig.getPointAt((t * 0.18) % 1);
      pen.current.position.set(p.x, p.y + 0.02, p.z + 0.03);
    }
  });
  return (
    <group ref={group} rotation={[-0.1, -0.32, 0.04]}>
      <RoundedBox args={[1.4, 1.9, 0.06]} radius={0.05} smoothness={3}>
        <meshStandardMaterial {...paperMat} />
      </RoundedBox>
      <mesh>
        <tubeGeometry args={[sig, 96, 0.024, 8, false]} />
        <meshStandardMaterial {...accentMat} />
      </mesh>
      {/* 서명선을 따라 슥슥 그어지는 펜 */}
      <group ref={pen} rotation={[0.4, 0, -0.72]}>
        {/* 펜촉 */}
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.05, 0.2, 20]} />
          <meshStandardMaterial {...inkMat} />
        </mesh>
        {/* 배럴 */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 1.3, 24]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
        {/* 상단 캡 */}
        <mesh position={[0, 1.58, 0]}>
          <cylinderGeometry args={[0.065, 0.065, 0.16, 24]} />
          <meshStandardMaterial {...inkMat} />
        </mesh>
        {/* 클립 */}
        <mesh position={[0.075, 1.42, 0]}>
          <boxGeometry args={[0.022, 0.3, 0.05]} />
          <meshStandardMaterial {...inkMat} />
        </mesh>
      </group>
    </group>
  );
}

/** HuDy: 공휴일 캘린더 그리드 — 휴일 셀은 액센트, 다음 휴일 한 칸은 D-day처럼 박동한다. */
function Calendar({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const COLS = 5;
  const ROWS = 4;
  const GAP = 0.44;
  const CELL = 0.32;
  // 휴일 셀 인덱스와, 그중 박동하는 "다음 휴일" 한 칸.
  const holidays = useMemo(() => new Set([2, 7, 13, 18]), []);
  const nextHoliday = 7;
  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reducedMotion) {
      g.rotation.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.4) * 0.18;
      g.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.06;
    }
    const t = state.clock.elapsedTime;
    g.children.forEach((child, idx) => {
      const mesh = child as THREE.Mesh;
      let targetZ = holidays.has(idx) ? 0.18 : 0;
      let targetScale = 1;
      if (idx === nextHoliday && !reducedMotion) {
        const pulse = (Math.sin(t * 2.2) + 1) / 2;
        targetZ = 0.24 + pulse * 0.22;
        targetScale = 1 + pulse * 0.25;
      }
      mesh.position.z = THREE.MathUtils.damp(mesh.position.z, targetZ, 6, delta);
      const s = THREE.MathUtils.damp(mesh.scale.x, targetScale, 6, delta);
      mesh.scale.setScalar(s);
    });
  });
  return (
    <group ref={group} rotation={[-0.32, -0.5, 0]}>
      {Array.from({ length: COLS * ROWS }, (_, i) => {
        const c = i % COLS;
        const r = Math.floor(i / COLS);
        const x = (c - (COLS - 1) / 2) * GAP;
        const y = ((ROWS - 1) / 2 - r) * GAP;
        const isHoliday = holidays.has(i);
        return (
          <RoundedBox
            key={i}
            args={[CELL, CELL, 0.12]}
            radius={0.045}
            smoothness={3}
            position={[x, y, 0]}
          >
            <meshStandardMaterial {...(isHoliday ? accentMat : inkMat)} />
          </RoundedBox>
        );
      })}
    </group>
  );
}

/** 쿵치따치: 귀여운 스네어 드럼 한 대와 스틱 — 스틱이 박자에 맞춰 번갈아 두드리고 드럼이 통통 튄다. */
function SnareDrum({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const lstick = useRef<THREE.Group>(null);
  const rstick = useRef<THREE.Group>(null);
  const BPM = 120;
  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.elapsedTime;
    const beat = (t * BPM) / 60;
    const phase = beat - Math.floor(beat);
    const hit = Math.max(0, 1 - phase * 5); // 박 시작에 순간적으로 1, 곧 0
    const leftTurn = Math.floor(beat) % 2 === 0;
    const g = group.current;
    if (g) {
      g.rotation.y = -0.35 + Math.sin(t * 0.3) * 0.16;
      g.position.y = Math.sin(t * 0.9) * 0.05;
    }
    if (body.current) {
      body.current.scale.y = 1 - hit * 0.1;
      body.current.scale.x = 1 + hit * 0.05;
      body.current.scale.z = 1 + hit * 0.05;
    }
    if (lstick.current) lstick.current.rotation.x = 0.55 + (leftTurn ? hit : 0) * 0.55;
    if (rstick.current) rstick.current.rotation.x = 0.55 + (!leftTurn ? hit : 0) * 0.55;
  });
  return (
    <group ref={group} rotation={[0.32, -0.35, 0]} scale={0.95}>
      <group ref={body}>
        {/* 셸 */}
        <mesh>
          <cylinderGeometry args={[0.82, 0.82, 0.58, 48]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
        {/* 위·아래 드럼 헤드 */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.06, 48]} />
          <meshStandardMaterial {...paperMat} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.9, 0.9, 0.06, 48]} />
          <meshStandardMaterial {...paperMat} />
        </mesh>
        {/* 테(rim) */}
        <mesh position={[0, 0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.05, 12, 48]} />
          <meshStandardMaterial {...inkMat} />
        </mesh>
        <mesh position={[0, -0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.9, 0.05, 12, 48]} />
          <meshStandardMaterial {...inkMat} />
        </mesh>
        {/* 텐션 러그 */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.86, 0, Math.sin(a) * 0.86]}>
              <boxGeometry args={[0.1, 0.34, 0.08]} />
              <meshStandardMaterial {...inkMat} />
            </mesh>
          );
        })}
      </group>
      {/* 스틱 두 자루 (손잡이 쪽을 피벗으로) */}
      <group ref={lstick} position={[-0.42, 1.12, 0.15]} rotation={[0.55, 0, 0.3]}>
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.045, 0.03, 1.1, 16]} />
          <meshStandardMaterial {...inkMat} />
        </mesh>
        <mesh position={[0, -1.12, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
      </group>
      <group ref={rstick} position={[0.42, 1.12, 0.15]} rotation={[0.55, 0, -0.3]}>
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.045, 0.03, 1.1, 16]} />
          <meshStandardMaterial {...inkMat} />
        </mesh>
        <mesh position={[0, -1.12, 0]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
      </group>
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
    case "sign":
      return <SignPaper reducedMotion={reducedMotion} />;
    case "calendar":
      return <Calendar reducedMotion={reducedMotion} />;
    case "snare":
      return <SnareDrum reducedMotion={reducedMotion} />;
    case "cage":
      return <Cage reducedMotion={reducedMotion} />;
    default:
      return <Prism reducedMotion={reducedMotion} />;
  }
}
