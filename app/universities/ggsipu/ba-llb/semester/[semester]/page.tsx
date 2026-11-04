import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicPageMetadata } from "../../../../../../lib/site-metadata";
import { breadcrumbSchema } from "../../../../../../lib/seo-schema";

type Params = Promise<{ semester: string }>;
const valid = new Set(Array.from({ length: 10 }, (_, i) => String(i + 1)));

export function generateStaticParams() {
  return Array.from(valid, (semester) => ({ semester }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { semester } = await params;
  if (!valid.has(semester)) return { robots: { index: false, follow: false } };
  return publicPageMetadata(
    `GGSIPU BA LLB Semester ${semester} Study Guide`,
    `Explore AI-assisted study and exam preparation for GGSIPU BA LLB semester ${semester}. Check the official syllabus for your academic year.`,
    `/universities/ggsipu/ba-llb/semester/${semester}`
  );
}

export default async function Page({ params }: { params: Params }) {
  const { semester } = await params;
  if (!valid.has(semester)) notFound();
  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "GGSIPU BA LLB", path: "/universities/ggsipu/ba-llb" },
    { name: `Semester ${semester}`, path: `/universities/ggsipu/ba-llb/semester/${semester}` },
  ]);
  return (
    <main className="shell" style={{ paddingTop: 48, paddingBottom: 72 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs).replace(/</g, "\\u003c") }} />
      <h1>GGSIPU BA LLB — Semester {semester}</h1>
      <p>Use LegiSchola to organise your semester study, practise legal reasoning, create Cornell notes and plan revision.</p>
      <h2>Verify your semester subjects</h2>
      <p>The subjects and units for your batch must be checked against the applicable official GGSIPU syllabus before they are presented as verified curriculum. This page does not claim an official university endorsement.</p>
      <h2>Study and practise</h2>
      <p>After selecting your institution, programme and semester, the student workspace shows the curriculum currently available for your cohort. AI-generated questions and assessments are practice materials, not official university exam papers.</p>
      <p><Link href="/onboarding">Set up semester {semester} study</Link> · <Link href="/law-exam-preparation">Exam preparation guide</Link> · <Link href="/universities/ggsipu/ba-llb">All semesters</Link></p>
    </main>
  );
}
