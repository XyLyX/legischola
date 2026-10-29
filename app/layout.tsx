import type { Metadata } from "next";
import Link from "next/link";
import AuthNav from "../components/AuthNav";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE_ALT,
  SOCIAL_IMAGE_URL,
} from "../lib/site-metadata";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: HOME_TITLE,
    template: "%s | LegiSchola",
  },
  description: HOME_DESCRIPTION,
  category: "education",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [
      {
        url: SOCIAL_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SOCIAL_IMAGE_ALT,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [SOCIAL_IMAGE_URL],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="shell header-inner">
            <Link href="/" className="wordmark" aria-label="LegiSchola home">
              Legi<span>Schola</span>
            </Link>
            <AuthNav />
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="shell">
            © {new Date().getFullYear()} LegiSchola · Built for thoughtful legal
            learning · <Link href="/about">About Us</Link> ·{" "}
            <Link href="/founders-note">Founder’s Note</Link> ·{" "}
            <Link href="/student-guide">Student Guide</Link> ·{" "}
            <Link href="/faq">FAQ</Link> ·{" "}<Link href="/referral">Refer a Friend</Link> ·{" "}
            <a href="mailto:support@legischola.com">Support</a>
          </div>
        </footer>
      </body>
    </html>
  );
}
