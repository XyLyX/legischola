import Link from "next/link";
import { publicPageMetadata } from "../../lib/site-metadata";
export const metadata = publicPageMetadata("Frequently Asked Questions", "Get answers about LegiSchola accounts, syllabus selection, AI Professor, Cornell notes, mock exams, revision and student support.", "/faq");
const groups=[
{title:"Getting started & curriculum",items:[
["What is LegiSchola?","LegiSchola is an AI-assisted study workspace for law students, combining syllabus-organised learning, guided reasoning, notes, practice, research and exam preparation."],
["How do I begin?","Create an account or sign in, open Personalise my studies, select the available institution, programme and semester, then open Semester Study."],
["What if my college or programme is not listed?","Use the Request your institution option if shown in onboarding. You can also contact support. Do not select an unrelated institution merely to obtain a syllabus."],
["Is my syllabus officially verified?","Not necessarily. The current pilot includes provisional curriculum data. Confirm subjects, unit coverage and examination requirements against your institution's latest official syllabus."],
["Why do I see units rather than individual subtopics?","The pilot organises study by curriculum unit headings. Detailed subtopics should be added only after appropriate syllabus verification. AI teaching examples are not automatically official syllabus entries."]]},
{title:"Learning, notes & AI Tutor",items:[
["What is the difference between Semester Study and AI Professor?","Semester Study organises a unit's learning actions, Cornell notes, practice and saved progress. AI Professor provides guided explanations, questions and legal-reasoning exercises."],
["What are Cornell notes?","A structured note-taking method using prompts or cues, explanatory notes and a concise summary. In Semester Study, generate a draft, edit it and select Save progress."],
["Will my notes save automatically?","Do not assume they do. Use Save progress after editing notes or answers, and refresh to verify that they were saved."],
["Can I trust every legal citation or AI answer?","No. AI output can be inaccurate or outdated. Check the actual statute, case, jurisdiction, amendments and official sources before relying on an answer in coursework."],
["Does marking a unit complete mean I have mastered it?","No. Completion records your study activity. Assessment results separately indicate how well you answered particular questions."]]},
{title:"Assessments, revision & mock exams",items:[
["How does a knowledge check work?","Choose a unit in Semester Study, generate an assessment question, write an answer and select Evaluate and save result. You receive an indicative score and feedback."],
["What does a score out of 10 mean?","It is an AI-generated formative score using accuracy, relevance, reasoning and clarity. It is not an official grade or a guarantee of exam performance."],
["How is my next revision date chosen?","Assessment scores determine a spaced revision interval. Lower scores bring revision closer; stronger repeated scores generally lengthen the interval. A new assessment updates the schedule."],
["What does Exam Readiness measure?","It shows assessment coverage, recent unit scores, revision due dates and subject-level performance. Unassessed units are not treated as mastered."],
["How do mock examinations work?","Choose a subject and a 20-, 30- or 45-minute paper. LegiSchola generates questions across selected units, times the attempt and evaluates submitted answers individually."],
["Are mock papers official past university papers?","No. They are AI-generated practice questions based on available curriculum unit headings, not authenticated past papers or official examinations."],
["What if the timer expires?","The mock interface stops accepting edits when the displayed time reaches zero. Submit the answers already entered. The server also records whether the submission arrived after the allotted time."],
["What if grading fails or times out?","Submitted answers may still be saved. Reopen the paper and use Retry grading if offered. If the issue continues, contact support."],
["Will a mock exam affect my revision plan?","Yes. Successfully graded mock answers are saved as unit-level assessment attempts and feed into adaptive revision scheduling."]]},
{title:"Research, account & support",items:[
["What can Research Studio do?","It helps structure research topics, proposals, hypotheses and methodology. Treat research gaps and source suggestions as provisional until independently checked."],
["Can I submit AI-generated work as my own?","Follow your university's academic integrity policy. Use LegiSchola to learn, draft, question and improve your own work, not to misrepresent authorship or fabricate references."],
["Why is a page empty or missing my units?","Check that you are signed in and that the correct programme, semester and curriculum are selected. A provisional or unavailable syllabus may limit what appears."],
["How do I get help?","Email support@legischola.com with the page name, a brief explanation and any non-sensitive error message. Do not send passwords, private access keys or sensitive student records."]]}
];
export default function FAQ(){return <main className="shell" style={{maxWidth:950,paddingTop:28,paddingBottom:64}}><div className="eyebrow">HELP & ANSWERS</div><h1>Frequently asked questions</h1><p className="muted">Select any question to expand its answer. For a full walkthrough, visit the <Link href="/student-guide">interactive student guide</Link>.</p><div style={{display:"flex",gap:10,flexWrap:"wrap",margin:"18px 0 26px"}}><Link className="btn btn-primary" href="/student-guide">Read the student guide →</Link><Link className="btn btn-secondary" href="/study">Go to Semester Study →</Link></div>{groups.map(g=><section key={g.title} style={{marginBottom:25}}><h2>{g.title}</h2><div style={{display:"grid",gap:10}}>{g.items.map(([q,a])=><details key={q} className="card" style={{padding:"14px 18px"}}><summary style={{fontWeight:700,cursor:"pointer"}}>{q}</summary><p style={{lineHeight:1.7,marginBottom:2}}>{a}</p></details>)}</div></section>)}<section className="card"><h2>Still need help?</h2><p>Contact <a href="mailto:support@legischola.com">support@legischola.com</a>. You can also return to the <Link href="/">home page</Link>.</p></section></main>}
