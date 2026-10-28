import type { Metadata } from "next";
import Link from "next/link";
import AuthNav from "../components/AuthNav";
import "./globals.css";
export const metadata: Metadata = { title: "LegiSchola | Your AI Law School Companion", description: "Learn law with a tutor tailored to your university and curriculum." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><header className="site-header"><div className="shell header-inner"><Link href="/" className="wordmark" aria-label="LegiSchola home">Legi<span>Schola</span></Link><AuthNav /></div></header>{children}<footer className="footer"><div className="shell">© {new Date().getFullYear()} LegiSchola · Built for thoughtful legal learning · <Link href="/student-guide">Student Guide</Link> · <Link href="/faq">FAQ</Link> · <a href="mailto:support@legischola.com">Support</a></div></footer></body></html>; }