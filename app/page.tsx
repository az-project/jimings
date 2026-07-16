import Scene from "@/components/Scene";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <>
      <Scene />

      <header className="siteHeader">
        <a href="#top" className="wordmark">
          JIMINGS
        </a>
        <nav>
          <a href={`#${projects[0].id}`}>제품</a>
          <a href="#contact">연락</a>
        </nav>
      </header>

      <main className="content" id="top">
        <section className="panel hero">
          <p className="eyebrow">Indie maker · Shipping log</p>
          <h1>JIMINGS</h1>
          <p className="lede">
            앱과 웹 서비스를 만들어 직접 배포합니다. 아래는 지금까지 세상에
            내보낸 제품들입니다.
          </p>
          <p className="scrollHint">SCROLL ↓</p>
        </section>

        {projects.map((p, i) => (
          <section
            key={p.id}
            id={p.id}
            className={`panel project${i % 2 === 0 ? "" : " flip"}`}
          >
            <div className="projectCard">
              <div className="meta">
                <span className="status">{p.status}</span>
                {p.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <h2>{p.name}</h2>
              <p className="tagline">{p.tagline}</p>
              <p className="desc">{p.description}</p>
              {p.href && (
                <a
                  className="visit"
                  href={p.href}
                  target={p.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                >
                  제품 보러 가기 →
                </a>
              )}
            </div>
          </section>
        ))}

        <section className="panel contact" id="contact">
          <p className="eyebrow">Contact</p>
          <h2>
            함께 만들 것이 있다면,
            <br />
            언제든지.
          </h2>
          <a className="email" href="mailto:pb1123love@gmail.com">
            pb1123love@gmail.com
          </a>
          <p className="note">새 제품은 이 페이지에 계속 추가됩니다.</p>
        </section>

        <footer className="siteFooter">© 2026 JIMINGS</footer>
      </main>
    </>
  );
}
