import Scene from "@/components/Scene";
import ScrubVideo from "@/components/ScrubVideo";
import SectionRail from "@/components/SectionRail";
import { projects } from "@/lib/projects";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: "JIMINGS",
    url: "https://www.jimings.com",
    email: "support@jimings.com",
    jobTitle: "Indie maker",
    description:
      "앱과 웹 서비스를 만들어 직접 배포하는 메이커. 슥슥, HuDy, 쿵치따치, oh-my-harness.",
    makesOffer: projects.map((p) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "SoftwareApplication",
        name: p.name,
        description: p.tagline,
      },
    })),
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Scene />
      <div className="grain" aria-hidden="true" />

      <header className="siteHeader">
        <a href="#top" className="wordmark">
          JIMINGS
        </a>
        <nav>
          <a href={`#${projects[0].id}`}>제품</a>
          <a href="#contact">연락</a>
        </nav>
      </header>

      <SectionRail />

      <main className="content" id="top">
        <section className="panel hero">
          <p className="eyebrow">Indie maker · Shipping log</p>
          <h1>JIMINGS</h1>
          <p className="lede">
            앱과 웹 서비스를 만들어 직접 배포합니다. 아래는 지금까지 세상에
            내보낸 제품 {projects.length}개입니다.
          </p>
          <p className="scrollHint">SCROLL ↓</p>
        </section>

        {projects.map((p, i) => (
          <section
            key={p.id}
            id={p.id}
            className={`panel project${i % 2 === 0 ? "" : " flip"}`}
          >
            <article className="projectCard">
              <p className="cardIndex">
                {String(i + 1).padStart(2, "0")}
                <span>/{String(projects.length).padStart(2, "0")}</span>
              </p>
              <h2>{p.name}</h2>
              <p className="tagline">{p.tagline}</p>
              <p className="desc">{p.description}</p>

              <dl className="spec">
                <div>
                  <dt>상태</dt>
                  <dd className="live">{p.status}</dd>
                </div>
                <div>
                  <dt>기술</dt>
                  <dd>{p.stack.join(" · ")}</dd>
                </div>
              </dl>

              {p.href && (
                <a
                  className="visit"
                  href={p.href}
                  target={p.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  제품 보러 가기 <span aria-hidden="true">→</span>
                </a>
              )}
            </article>
          </section>
        ))}

        <section className="panel showcase">
          <ScrubVideo
            src="/media/jimings-blue-flow-scrub.mp4"
            poster="/media/jimings-blue-flow-poster.jpg"
            className="showcaseVideo"
          />
          <p className="showcaseLine">
            아이디어는 배포되어야
            <br />
            제품이 됩니다.
          </p>
        </section>

        <section className="panel contact" id="contact">
          <p className="eyebrow">Contact</p>
          <h2>
            함께 만들 것이 있다면,
            <br />
            언제든지.
          </h2>
          <a className="email" href="mailto:support@jimings.com">
            support@jimings.com
          </a>
          <p className="note">새 제품은 이 페이지에 계속 추가됩니다.</p>
          {/* 푸터는 컨택트 패널 안에 절대배치 — 문서 높이를 늘리면
              스크롤 진행도가 카메라 스테이션과 어긋난다. */}
          <footer className="siteFooter">© 2026 JIMINGS</footer>
        </section>
      </main>
    </>
  );
}
