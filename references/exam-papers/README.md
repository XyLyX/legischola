# LegiSchola — Examination Paper Reference Library

This directory is the **durable source-of-evidence library** for LegiSchola's pre-exam preparation engine. It contains **de-identified educational transcriptions** and structured paper-format metadata, not official predictions or student answer sheets.

## Contents (4 initial references)

| Reference | Institution / semester | Subject | Format |
| --- | --- | --- | --- |
| [LLB 101](dme/2026/semester-01/legal-method-llb101-set-a.md) | DME Noida · S1 · 2026 | Legal Method | 90 min / 30 marks |
| [LLB 103](dme/2026/semester-01/law-of-contract-i-llb103-set-a.md) | DME Noida · S1 · 2026 | Law of Contract I | 90 min / 30 marks |
| [LLB 105](dme/2026/semester-01/english-i-llb105-set-a.md) | DME Noida · S1 · 2026 | English I · **second internal** | 90 min / 30 marks |
| [BA LLB 107](dme/2026/semester-01/history-i-ba-llb107-set-a.md) | DME Noida · S1 · 2026 | History I | 90 min / 30 marks |

**Machine-readable catalogue:** [index.json](index.json). The four papers show four short-answer options (attempt three, three marks each) and four long-answer options (attempt three, seven marks each), for a total of 30 marks. The English I photograph does **not** explicitly show a 200-word cap in Section B; treat that as a practice target when generating a simulator rather than claiming it is printed on that sheet.

## Where future papers go

`references/exam-papers/<institution-slug>/<academic-year>/<semester-XX>/<subject>-<paper-code>-<internal-or-session>-<set>.md`

Example: `references/exam-papers/dme/2027/semester-02/torts-llb204-internal2-set-b.md`

Upload workflow: [INTAKE.md](INTAKE.md). Submit a new **de-identified** transcription using [TEMPLATE.md](TEMPLATE.md); update `index.json`, provide source status and review; run `node scripts/validate-exam-references.mjs` and PR checks.

## Source, trust and privacy policy

- The GitHub repository is **public**. The original photographed sheets contain handwritten enrolment numbers. **Do not commit raw images, PDF scans, student names, signatures, handwritten student IDs, answer scripts or other personal identifiers here.**
- Initial source: photographs supplied for the founding tester's exam-preparation research. Metadata indicates transcription checked against the photo; this is **not independent college authentication**.
- The original source images are retained only in the private originating conversation or a future authenticated private Supabase bucket, subject to retention and access controls. Public GitHub is not raw-image storage.
- Question text and printed factual hypotheticals are **not verified legal authority**. In particular, fictionalised temple/court details in Legal Method must not be copied into case-law entries as authentic holdings.
- University syllabus is the eligibility boundary. **A real paper alone is not permission to teach or assess unverified/out-of-syllabus topics.** Exams should use new original questions matching demonstrated question types and difficulty, not copy old prompts.
- Never present observed topic signals from a few papers as probabilities or guaranteed future questions.
- Future entries remain `syllabus_mapping: pending_manual_review` until mapped to an approved curriculum and reviewed.
- The source's printed pattern, the engine's practice word targets and AI-inferred skills are stored and labelled **separately**.

## Assessment contract

- **Before the real examination:** original timed mock → student writes answers → indicative scoring with explicit mark allocation → missed concepts → revision tasks → focused retest.
- No dependence on answer sheets returned by a college; LegiSchola records its own formative student attempts.
- Three examples do not establish exam frequency; the first release uses **four** papers as institutional pattern evidence, not predictions.
- The Beta payment system remains outside this workflow.
