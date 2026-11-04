import Link from "next/link";
import { publicPageMetadata } from "../../lib/site-metadata";

export const metadata = publicPageMetadata(
  "Law Exam Preparation and Adaptive Revision",
  "Learn how LegiSchola combines formative mock exams, topic feedback and spaced revision for law students.",
  "/law-exam-preparation"
);

export default function LawExamPreparationPage() {
  return (
    <main className="shell" style={{ paddingTop: 48, paddingBottom: 72 }}>
      <h1>Law exam preparation and adaptive revision</h1>
      <p>Preparing for law examinations requires more than memorising definitions. Students need to recognise legal issues, state reliable rules, apply them to facts and explain their conclusions.</p>
      <h2>Start with the syllabus</h2>
      <p>Confirm your university, programme and semester. Review each subject's prescribed units before creating a study schedule.</p>
      <h2>Practise under exam conditions</h2>
      <p>LegiSchola provides AI-generated formative mock questions and timed practice. These are not authenticated past university papers.</p>
      <h2>Review weaker areas</h2>
      <p>Indicative assessment feedback can help identify concepts for further study. Spaced revision schedules bring weaker topics back sooner.</p>
      <h2>Check your sources</h2>
      <p>Verify current legal authorities and syllabus requirements independently. AI feedback is not an official grade or prediction of examination results.</p>
      <p><Link href="/onboarding">Start studying</Link> · <Link href="/student-guide">Read the student guide</Link></p>
    </main>
  );
}
