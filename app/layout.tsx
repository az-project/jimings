import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = "https://www.jimings.com";
const TITLE = "JIMINGS — 만들고, 배포합니다";
const DESCRIPTION =
  "앱과 웹 서비스를 만들어 직접 배포하는 메이커 JIMINGS의 제품 기록. 슥슥, 쿵치따치, oh-my-harness.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — JIMINGS",
  },
  description: DESCRIPTION,
  applicationName: "JIMINGS",
  keywords: [
    "JIMINGS",
    "지밍스",
    "포트폴리오",
    "인디 메이커",
    "개발자 포트폴리오",
    "슥슥",
    "쿵치따치",
    "oh-my-harness",
  ],
  authors: [{ name: "JIMINGS" }],
  creator: "JIMINGS",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "JIMINGS",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f7f5",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${archivo.variable} ${jetbrains.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
