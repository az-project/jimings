"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * 절차적 스튜디오 조명 — HDRI를 네트워크에서 받지 않고
 * Lightformer만으로 소프트박스 셋업을 만든다.
 * 반사가 생겨야 3D가 "플라스틱 장난감"이 아니라 제품 렌더로 보인다.
 */
export default function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      {/* 천장 대형 소프트박스 — 넓은 하이라이트 */}
      <Lightformer
        form="rect"
        intensity={3.2}
        position={[0, 5, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[12, 8, 1]}
        color="#ffffff"
      />
      {/* 정면 키라이트 */}
      <Lightformer
        form="rect"
        intensity={1.6}
        position={[2.5, 1.5, 4]}
        rotation={[0, -0.4, 0]}
        scale={[6, 6, 1]}
        color="#ffffff"
      />
      {/* 좌측 필 — 어두운 면이 완전히 죽지 않게 */}
      <Lightformer
        form="rect"
        intensity={0.9}
        position={[-4, 0.5, 2]}
        rotation={[0, 0.9, 0]}
        scale={[5, 5, 1]}
        color="#eef0f4"
      />
      {/* 림라이트 — 실루엣 가장자리를 살린다 */}
      <Lightformer
        form="rect"
        intensity={2.2}
        position={[-1.5, 2, -5]}
        rotation={[0, Math.PI, 0]}
        scale={[8, 4, 1]}
        color="#ffffff"
      />
      {/* 바닥 바운스 */}
      <Lightformer
        form="rect"
        intensity={0.7}
        position={[0, -4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[10, 10, 1]}
        color="#f7f7f5"
      />
    </Environment>
  );
}
