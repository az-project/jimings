// 스크롤·포인터 상태를 프레임 루프와 공유하는 모듈 스코프 저장소.
// React 상태로 두면 프레임마다 리렌더가 발생하므로 mutable ref처럼 쓴다.
export const pointerState = { x: 0, y: 0 };
export const scrollState = { progress: 0 };

export function bindInteraction(): () => void {
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollState.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  };
  const onPointer = (e: PointerEvent) => {
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
