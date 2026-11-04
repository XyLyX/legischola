import Link from "next/link";
import { publicPageMetadata } from "../../lib/site-metadata";

export const metadata = publicPageMetadata(
  "AI Law Tutor for University Students",
  "Explore how LegiSchola supports legal reasoning, semester-based learning, Cornell notes and formative exam practice.",
  "/ai-law-tutor"
);

export default function AILawTutorPage() {
  return (
    <main className="shell" style={{ paddingTop: 48, paddingBottom: 72 }}>
      <h1>AI law tutor for university students</h1>
      <p>LegiSchola is a public-beta study companion for law students. It combines syllabus-organised learning with guided explanations, legal reasoning exercises, notes, practice assessments and revision planning.</p>
      <h2>Learn by university semester</h2>
      <p>Choose an available institution, programme and semester. Curriculum coverage is subject to academic verification; always confirm the current official university syllabus.</p>
      <h2>Practise legal reasoning</h2>
      <p>Work through legal issues, identify applicable rules, consider counterarguments and practise applying verified authorities to hypothetical facts.</p>
      <h2>Prepare and revise</h2>
      <p>Use Cornell-style notes, formative mock exams, feedback and spaced revision to identify topics needing further work. AI-generated scores are not official examination grades.</p>
      <p>AI-generated legal content may contain errors. Verify legislation, case law, jurisdiction and amendments against authoritative sources.</p>
      <p><Link href="/onboarding">Get started with LegiSchola</Link> · <Link href="/faq">Read frequently asked questions</Link></p>
    </main>
  );
}
