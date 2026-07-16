export type ArtifactKind = "ribbon" | "rhythm" | "cage" | "prism";

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: string;
  stack: string[];
  href?: string;
  artifact: ArtifactKind;
}

// 여기에 제품을 추가하면 섹션과 3D 아티팩트가 자동으로 늘어난다.
// artifact 종류: ribbon(궤적 리본) · rhythm(박동 링) · cage(가드레일 케이지) · prism(기본)
export const projects: Project[] = [
  {
    id: "seukseuk",
    name: "슥슥",
    tagline: "계약을 웹에서 끝내는 전자서명",
    description:
      "문서 업로드부터 발행, 서명, 완료까지. 종이와 도장 없이 슥슥 긋는 것으로 계약이 끝나는 전자서명 서비스.",
    status: "운영 중 · WEB",
    stack: ["Next.js", "Supabase", "R2"],
    href: "#", // TODO: 슥슥 서비스 URL
    artifact: "ribbon",
  },
  {
    id: "kungchiddachi",
    name: "쿵치따치",
    tagline: "드러머의 박자를 측정하는 연습 앱",
    description:
      "연주를 녹음하면 박자가 얼마나 흔들렸는지 분석해준다. 감이 아니라 데이터로 확인하는 드럼 연습.",
    status: "iOS 출시 · ANDROID 준비 중",
    stack: ["iOS", "Android", "Audio DSP"],
    href: "#", // TODO: 앱스토어 URL
    artifact: "rhythm",
  },
  {
    id: "oh-my-harness",
    name: "oh-my-harness",
    tagline: "AI 코딩 에이전트의 안전벨트",
    description:
      "자연어로 훅과 가드레일을 생성해, AI 코딩 에이전트가 프로젝트 규칙 밖으로 벗어나지 않게 묶어두는 CLI.",
    status: "npm 배포 중 · OSS",
    stack: ["TypeScript", "Node.js"],
    href: "#", // TODO: npm 또는 GitHub URL
    artifact: "cage",
  },
];
