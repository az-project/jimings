"use client";

import { useEffect, useState } from "react";
import { startTilt } from "@/lib/interaction";

/**
 * 폰을 기울이면 3D가 따라 움직인다(데스크톱의 마우스 자리).
 * 들어오자마자 조용히 켜 보고(안드로이드 크롬은 묻지 않고 허락한다), 안 켜지면
 * "기울여서 보기"를 띄운다. 아이폰 사파리는 탭 안에서만 권한을 물을 수 있다. 한 번 누르면 사라진다.
 */
export default function TiltButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (touch && !still) startTilt().then((on) => setShow(!on));
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      className="tiltHint"
      onClick={() => {
        startTilt();
        setShow(false);
      }}
    >
      기울여서 보기
    </button>
  );
}
