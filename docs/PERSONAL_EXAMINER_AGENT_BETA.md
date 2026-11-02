# LegiSchola Personal Examiner Agent — beta implementation

## Intent
Every student may ask **"Prepare me for an exam"** or **"Test my skills in [topic]"** before their actual law-school exam. LegiSchola is responsible for collecting and evaluating *its own* answers, and **never requires college-returned answer sheets**. The Agent asks for the semester, subject, purpose, optional topic, difficulty, skills and duration. Its recommendations are derived from that student's own saved evidence only.

## Student journey
1. `/mock-exam` presents the **Your AI Examiner** flow. Student chooses a semester **at or before** their verified enrolled semester, a taught subject or enrolled elective, and optional syllabus unit.
2. Purposes: **Diagnostic (find my level)**, **Improve weaknesses**, **Exam readiness**.
3. Difficulty: **Adaptive**, Foundation, Standard or Challenge. Skills: **Mixed**, Recall, Application or Legal Reasoning.
4. Formats: 10/20/30/45-minute personalised topic-wise tests; existing 20/30/45-minute standard mock; if there is an applicable archived source, the optional 90-minute 30-mark DME-inspired examination with choice of 3/4 in each section.
5. A read-only server `mode:"plan"` computes coverage, latest attempt scores, previous attempts per unit, repeated-unit score change, review due flags and open inference counts. Client renders the evidence and suggested topics **before** making an AI call. No assessment result is fabricated if a topic lacks evidence.
6. `mode:"start"` re-reads server-side verified curriculum and live evidence (never trusts a client-provided plan), allocates question slots, and asks the Examiner model for original questions in the exact syllabus topics. The prompt receives aggregate evidence per unit, not raw answers, emails or private notes.
7. Completed answers persist through the existing private mock and `study_assessment_attempts` tables; marks are graded on each question's maximum and normalised to 0–10 for revision. Running `/api/revision` updates the appropriate **exam semester**.
8. On the next test, assessment history is re-read and the suggested question balance updates. The student may choose a particular topic and difficulty rather than accept the recommendations.

## Cold start vs returning
- **No assessed evidence for selected syllabus topic scope:** explicitly say "baseline diagnostic"; show **no average, trend or invented weakness**; offer manageable questions to obtain a first measurement. An account being new/paid/free does not itself establish competence.
- **Existing assessed evidence:** latest recorded assessment per unit, count of attempts, last-to-previous score changes for *repeatedly tested units only*, pending revision markers and weak-concept inference counts. Priority is higher for underperforming, unassessed or overdue topics, weighted by the student's selected purpose. A single high score is **not** considered firm mastery.
- **Trend definition:** average of differences between the newest and immediately preceding assessed score *for units with at least two attempts*; display as observed **indicative score change**, not predicted learning speed or guaranteed trajectory. No trend shown when no topic has repeat evidence.
- **Evidence confidence:** unassessed / limited (1–2 attempts) / repeated (3+ attempts). These are counts, not reliability certificates.
- **Difficulty:** foundation after weak marks, standard for unassessed/intermediate, challenge for repeatedly strong units, or direct user-selected override constrained to verified syllabus. Changing level changes question complexity, not semester or teaching authority.
- **Progress loop:** Test → estimated rubric feedback → weak concepts → Revision Agent → new topic test → updated evidence and trend. Student learning data is not visible to other students.

## Data and access
- Existing `study_assessment_attempts`, `student_topic_progress`, `revision_inferences`, `curriculum_versions`, `curriculum_papers`, `curriculum_units`, `mock_exams`, `revision_tasks` are reused. No new database schema, paid-plan dependency, or student-memory table.
- The authenticated server verifies Supabase Auth user from bearer token. Every evidence query is scoped by that user's ID and only approved unit IDs; future semesters and unchosen electives are blocked.
- A selected topic must match the **exact** registered unit from the student's subject and semester; the server does not permit arbitrary free-text topics outside the curriculum.
- Every generated question contains its assigned unit, evidence-basis flag, purpose, skill and selected difficulty for interpretation in the saved mock.
- Additional question metadata is embedded in the existing JSONB `questions` field, avoiding migrations.
- No original student answer scripts, photograph IDs or confidential data enter the public exam-reference archive.

## Limitations and release acceptance
- **Live database validation:** the Supabase connector denied direct queries while implementing this revision. Code is written to the existing schema checked into GitHub; verify a real student account's end-to-end plan, exam, marks and revision before treating the integration as fully production-proven.
- **Quality:** Scores are indicative AI assessments and should be treated alongside learning coverage. One or two scores do not establish actual mastery. A more robust progress model needs spaced retests and teacher-calibrated rubrics.
- **Not proctored:** draft autosaves and the timer are formative practice, not tamper-proof examination invigilation.
- **Cost:** Examiner plan-preview uses no AI credits. Actual tests use the existing one-generation/one-grading model calls. This beta does not implement payment collection.
- **Curriculum:** Past papers calibrate difficulty/structure only. Verified active university syllabus remains mandatory; no claims about likely future questions.
- **Test requirements:** new student -> zero attempts/zero invented trend; returning student -> weak and overdue topics prioritised; previous-semester exam allowed but future semester blocked; subject/identity isolation; plan refresh after grading; 30-mark structure unchanged; deployed login and exam controls intact.
