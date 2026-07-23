"use client";

import { useEffect, useRef } from "react";

/**
 * 스크롤 위치에 따라 영상을 재생/되감기하는 배경 비디오.
 * - 데스크톱: 섹션 통과 진행도를 currentTime에 매핑 (rAF 스무딩)
 * - 터치 기기: 그냥 무음 루프 재생 (스크럽은 모바일 사파리에서 불안정)
 * - prefers-reduced-motion: 포스터 프레임 정지
 * 소스는 전 프레임 키프레임(-g 1)으로 인코딩되어 있어야 부드럽다.
 */
export default function ScrubVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (window.matchMedia("(pointer: coarse)").matches) {
      video.muted = true;
      video.loop = true;
      video.play().catch(() => {});
      return;
    }

    let raf = 0;
    let target = 0;
    let active = false;

    const onScroll = () => {
      const r = video.getBoundingClientRect();
      const vh = window.innerHeight;
      target = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    };

    const tick = () => {
      if (video.duration && Number.isFinite(video.duration)) {
        const t = target * video.duration * 0.98;
        const cur = video.currentTime;
        const next = cur + (t - cur) * 0.18;
        if (Math.abs(next - cur) > 0.002) video.currentTime = next;
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !active) {
        active = true;
        onScroll();
        raf = requestAnimationFrame(tick);
      } else if (!entry.isIntersecting && active) {
        active = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(video);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}
