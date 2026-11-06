// 스크롤·포인터 상태를 프레임 루프와 공유하는 모듈 스코프 저장소.
// React 상태로 두면 프레임마다 리렌더가 발생하므로 mutable ref처럼 쓴다.
export const pointerState = { x: 0, y: 0 };
export const scrollState = { progress: 0 };

const clamp1 = (v: number) => Math.max(-1, Math.min(1, v));
let beta0: number | null = null;

/**
 * 폰 기울기를 마우스 위치처럼 pointerState(-1~1)에 넣는다.
 * 좌우는 수평에서 30도면 끝. 앞뒤는 쥐는 각도가 사람마다 달라 천천히 따라오는 기준각에서 25도면 끝.
 * 세로 화면에서만 쓴다(가로로 돌리면 축이 바뀐다).
 */
function onTilt(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return;
  if ((screen.orientation?.angle ?? 0) !== 0) {
    pointerState.x = pointerState.y = 0;
    return;
  }
  beta0 = beta0 == null ? e.beta : beta0 + (e.beta - beta0) * 0.005;
  pointerState.x = clamp1(e.gamma / 30);
  pointerState.y = clamp1((e.beta - beta0) / 25);
}

/**
 * 기울기를 켠다. 켜졌으면 true.
 * 탭 밖에서 부르면 이미 허락된 곳(안드로이드 크롬, 이번에 허락한 아이폰)만 켜지고,
 * 아이폰 사파리 첫 방문은 거절된다. 탭 안에서 다시 부르면 그때 묻는 창이 뜬다
 */
export async function startTilt(): Promise<boolean> {
  const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
  if (!D) return false;
  const on = !D.requestPermission || (await D.requestPermission().catch(() => "denied")) === "granted";
  if (on) window.addEventListener("deviceorientation", onTilt);
  return on;
}

export function bindInteraction(): () => void {
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollState.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === "touch") return; // 폰은 마지막에 짚은 손가락 자리 대신 기울기로 움직인다
    pointerState.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointerState.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  window.addEventListener("pointermove", onPointer, { passive: true });
  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    window.removeEventListener("pointermove", onPointer);
  };
}
