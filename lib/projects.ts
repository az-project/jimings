export type ArtifactKind = "sign" | "calendar" | "snare" | "cage" | "prism";

export interface ProjectMedia {
  /** 스크럽용(전 프레임 키프레임) mp4 경로 */
  src: string;
  poster: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: string;
  stack: string[];
  href?: string;
  artifact: ArtifactKind;
  /** 섹션 배경에 스크롤 스크럽으로 재생되는 시네마틱 영상 (선택) */
  media?: ProjectMedia;
}

// 여기에 제품을 추가하면 섹션·3D 아티팩트·스크롤 스테이션이 자동으로 늘어난다.
// artifact 종류: sign(문서+서명) · calendar(공휴일 그리드) · snare(스네어+스틱) · cage(가드레일 케이지) · prism(기본)
export const projects: Project[] = [
  {
    id: "seukseuk",
    name: "슥슥",
    tagline: "계약을 웹에서 끝내는 전자서명",
    description:
      "문서 업로드부터 발행, 서명, 완료까지. 종이와 도장 없이 슥슥 긋는 것으로 계약이 끝나는 전자서명 서비스.",
    status: "운영 중 · WEB",
    stack: ["Next.js", "Supabase", "R2"],
    href: "https://www.seuk-seuk.com",
    artifact: "sign",
    media: {
      src: "/media/seukseuk-pen-signing-scrub.mp4",
      poster: "/media/seukseuk-pen-signing-poster.jpg",
    },
  },
  {
    id: "hudy",
    name: "HuDy",
    tagline: "대한민국 공휴일을 다루는 API와 앱",
    description:
      "법정·대체·임시공휴일과 영업일 계산을 제공하는 공휴일 API, 그리고 다음 휴일까지 D-day를 세어주는 iOS 앱.",
    status: "운영 중 · WEB · iOS",
    stack: ["공휴일 API", "SDK", "iOS"],
    href: "https://www.hudy.co.kr",
    artifact: "calendar",
  },
  {
    id: "kungchiddachi",
    name: "쿵치따치",
    tagline: "드러머의 박자를 측정하는 연습 앱",
    description:
      "연주를 녹음하면 박자가 얼마나 흔들렸는지 분석해준다. 감이 아니라 데이터로 확인하는 드럼 연습.",
    status: "iOS 출시 · ANDROID 준비 중",
    stack: ["iOS", "Android", "Audio DSP"],
    href: "https://apps.apple.com/kr/app/%EC%BF%B5%EC%B9%98%EB%94%B0%EC%B9%98/id6788377128",
    artifact: "snare",
    media: {
      src: "/media/kungchi-snare-slowmo-scrub.mp4",
      poster: "/media/kungchi-snare-slowmo-poster.jpg",
    },
  },
  {
    id: "oh-my-harness",
    name: "oh-my-harness",
    tagline: "AI 코딩 에이전트의 안전벨트",
    description:
      "자연어로 훅과 가드레일을 생성해, AI 코딩 에이전트가 프로젝트 규칙 밖으로 벗어나지 않게 묶어두는 CLI.",
    status: "npm 배포 중 · OSS",
    stack: ["TypeScript", "Node.js"],
    href: "https://github.com/kyu1204/oh-my-harness",
    artifact: "cage",
  },
];
