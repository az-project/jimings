"use client";

import { useEffect, useState } from "react";
import { projects } from "@/lib/projects";

/**
 * 좌측 고정 인덱스 레일 — 지금 몇 번째 제품을 보고 있는지 알려주는 내비게이션.
 * 장식용 번호가 아니라 실제 위치 정보다.
 */
export default function SectionRail() {
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const targets = projects
      .map((p) => document.getElementById(p.id))
      .filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(targets.indexOf(entry.target as HTMLElement));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    targets.forEach((t) => io.observe(t));

    // 제품 구간을 벗어나면 레일을 비활성으로 되돌린다.
    const onScroll = () => {
      const first = targets[0].getBoundingClientRect();
      const last = targets[targets.length - 1].getBoundingClientRect();
      if (first.top > window.innerHeight * 0.55 || last.bottom < window.innerHeight * 0.45) {
        setActive(-1);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <nav className="rail" aria-label="제품 목록">
      <ol>
        {projects.map((p, i) => (
          <li key={p.id} className={i === active ? "on" : undefined}>
            <a href={`#${p.id}`}>
              <span className="num">{String(i + 1).padStart(2, "0")}</span>
              <span className="label">{p.name}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
