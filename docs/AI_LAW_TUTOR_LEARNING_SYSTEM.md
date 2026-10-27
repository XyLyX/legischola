# LegiSchola — Integrated AI Law Learning System

Status: **Approved product direction — 27 October 2026**. This document records agreed requirements; it does **not** claim the features are implemented or deployed.

## Product positioning
LegiSchola is an institution- and semester-aware Indian law learning system, not a generic legal chatbot. Its core loop is **Study Notebook → AI Law Professor → AI Examiner → semester progress and revision plan**.

## Pillar 1: AI Study Notebook
- Students upload institution syllabi, lecture PDFs, permitted textbook excerpts and Bare Acts.
- Organise documents by programme, university, academic year, semester, subject and unit.
- Generate source-grounded Cornell notes, topic explanations, study guides, revision questions and flashcards.
- Link claims to document title and page/section when possible; distinguish uploaded materials from independently verified law and AI explanation.
- Identify outdated legal material or potentially superseded law, and flag uncertainty. Do not promise hallucination-free output.
- Audio topic revision is a future capability subject to technical feasibility, cost and source rights.

## Pillar 2: AI Law Professor
- Socratic, interactive subject-specific tutoring using the student's syllabus and current unit.
- Ask one question at a time, challenge reasoning, explain errors and adapt difficulty to observed performance.
- Separate statutory text, binding precedent, persuasive commentary and model inference.
- Record mastery evidence to inform revision recommendations, without claiming formal academic grades.

## Pillar 3: AI Examiner
- Accept student answers to past papers or practice questions and assess against configurable institution-specific rubrics.
- Evaluate legal accuracy, issue spotting, statutory provisions, case-law relevance, ratio decidendi, analysis, structure and clarity.
- Show transparent rubric scores, evidence-based feedback, missing points and suggested answer structure.
- Label marks as AI estimates, not official university grades. Never fabricate authorities or citations.
- Feed weak areas into the Law Professor and revision planner.

## Core BA LL.B. strengths — approved scope

These ten capabilities are part of the integrated learning experience, not ten unrelated dashboards. Each is institution-, subject-, unit- and semester-aware where applicable.

| Capability | Primary home | Expected behaviour |
| --- | --- | --- |
| Case-law lookup | Study Notebook + Professor | Search relevant Indian decisions; show court, date, citation, facts, issue, holding, ratio decidendi, treatment and links to verifiable sources. Never invent cases. |
| BNS / BNSS explanations | Study Notebook + Professor | Explain provisions of Bharatiya Nyaya Sanhita and Bharatiya Nagarik Suraksha Sanhita in plain language, with section citations, commencement/transition context, examples and relevant IPC/CrPC comparison only where verified. Include BSA when evidence law is relevant. |
| Answer drafting | Examiner + Professor | Help students plan and improve structured academic answers using IRAC/ILAC where appropriate, authorities, statutory analysis and university marking expectations. Distinguish practice drafts from students' own submitted work. |
| Legal reasoning passages | Professor + Examiner | Provide passage-based comprehension, principle–fact application, issue spotting, inference and explanation of correct/incorrect choices. |
| Speed drills | Professor + Examiner | Timed, short-form recall, section identification, issue spotting and legal reasoning questions with immediate feedback and adaptive difficulty. |
| Mock analytics | Examiner + Progress tracker | Analyse attempts, accuracy, completion time, topic mastery, recurring errors, improvement trends and revision priorities; avoid overstating score predictions. |
| Bare Act / notes synthesis and Q&A | Study Notebook | Upload permitted statutes, syllabi and lecture materials; extract, summarise, compare and answer with source/page/section citations; clearly mark absent evidence. |
| Socratic practice | Professor | Ask one probing question at a time, adapt to answers and challenge legal reasoning with syllabus-aware follow-ups. |
| Mock answer grading | Examiner | Evaluate practice answers against explicit university-specific rubrics, statutory/case-law accuracy, structure and analysis; mark scores as AI estimates. |
| Debate preparation | Professor + Notebook | Generate proposition/opposition arguments, authorities, counterarguments, rebuttal drills and oral advocacy practice; distinguish legal authority from rhetorical strategy. |

### Unified student experience
- **Study:** Search verified cases or statutes and ask questions about uploaded documents.
- **Understand:** Discuss BNS/BNSS provisions and case reasoning with the AI Professor.
- **Practise:** Run Socratic dialogues, passage-based reasoning, speed drills and debate preparation.
- **Demonstrate:** Draft and submit mock answers for rubric-based evaluation.
- **Improve:** Use mock analytics to update the semester tracker and personalised revision schedule.

### Additional acceptance criteria
- Case-law results provide traceable authorities, jurisdiction and citation confidence; unavailable cases are explicitly labelled unverified.
- BNS/BNSS answers distinguish statutory text, simplified explanation and historical comparisons, and check commencement/transition applicability.
- Timed drills record time and accuracy, while mock analytics distinguish actual results from projections.
- Student-uploaded notes and Bare Acts remain access-controlled; Q&A cites the source material and states when it cannot answer from that material.
- Debate prep presents arguments on both sides and does not misrepresent advocacy positions as settled law.

## Shared academic context and workflow
- Five-year BA LL.B.: two semesters per academic year, ten semesters total.
- Use institution, programme, syllabus, subject, unit and assessment calendar to personalise all three pillars.
- Workflow: study sourced topic → practise with Socratic questions → submit exam-style answer → update topic mastery and next revision tasks.
- Existing student onboarding, Cornell notes, revision, tracking and semester planning should be integrated rather than duplicated.

## Trust, security and boundaries
- Verify current Indian legal provisions and judicial holdings against authoritative sources where available; surface effective dates, jurisdiction and uncertainty.
- Uploaded copyrighted materials remain private to authorised users; implement access control, retention/deletion, file-type/size limits and safe parsing.
- Resist prompt injection in uploaded documents; documents are learning sources, not instructions to the system.
- Provide educational information, not personalised legal advice; encourage primary-source verification.
- Minimise storage of student submissions and provide clear privacy controls.

## Delivery sequence (proposed, not yet built)
1. Audit current syllabus, notes, tutoring, assessment and tracker implementation to avoid duplicate work.
2. Define source/document metadata, per-student permissions, citations and academic-context schema.
3. Build Notebook upload, extraction, citation-grounded notes and revision.
4. Add syllabus-aware Socratic Professor with mastery tracking.
5. Add rubric-based Examiner with feedback and progress integration.
6. Run a complete first-student pilot with Jiya, including legal accuracy and privacy testing, before broad release.

## Business and billing boundaries
- Razorpay is the selected payment provider; live checkout remains disabled pending merchant configuration and approved monthly pricing.
- Annual subscription = ten monthly payments for twelve months (16.67% saving).
- Referral policy: referred student receives one-time ₹25 non-cash credit after first verified eligible subscription payment; no founding-tester reward.
- Jiya's lifetime complimentary entitlement must be linked to her verified user ID after signup, not to an unverified email claim.

## Acceptance criteria
- Each answer shows which source supports it, or explicitly says it is unsupported.
- Questions and rubrics align with the student's actual institution and semester.
- Examiner grades are explainable and marked as estimates.
- Learning results update a unified progress/revision view.
- No unverified law or invented case citation is presented as fact.
- No billing or reward is triggered during the free founding-student pilot.

## Built-in teaching modes and prompt specifications (approved)

Students use simple mode buttons, not copy/paste prompts. Prompt specifications are server-managed and receive authenticated student context, verified syllabus references and source provenance.

### Socratic Law Professor — legal concepts and viva
- Role: rigorous BA LL.B. professor of the selected Indian law subject.
- Ask exactly one targeted scenario-based question at a time and wait for the answer; do not dump long explanations.
- Assess issue identification, relevant verified sections/articles, application of principles and case ratios.
- Give concise corrective feedback, an indicative **score out of 5**, and one follow-up question; adapt to performance.
- Never invent legal authorities; flag unsupported answers and uncertainties.

### University Exam Answer Evaluator — semester exams
- Accept the question, student's original answer, institution, course, subject, semester and applicable rubric.
- Grade **out of 10** for issue identification, rule/section citation, application and conclusion; optionally scale to the institution's actual mark scheme.
- Identify missing *verified* provisions (BNS/BNSS/CPC as applicable) and relevant judgments, without fabricating cases.
- Offer a clearly labelled **model answer** using IRAC/ILAC or the institution's confirmed format, separately from the student's submitted work.
- Explain that AI marks are estimates, not university grades. The source prompt's term "dugvalish" is undefined and must not be used as a rubric without clarification.

### Passage-based Legal Reasoning Drill Master — separate entrance-exam mode
- Explicitly distinguish **CLAT/AILET entrance preparation** from BA LL.B. university coursework.
- Generate one self-contained 150–200-word legal principle/fact passage, one MCQ with four choices, then wait for the response.
- Explain correct principle application and why each distractor fails.
- Offer optional timing, accuracy analytics and adaptive difficulty.
- Clearly label invented hypothetical facts and distinguish them from sourced legal developments.

### Source-grounded Study Notebook workflow
- Organise notebooks by university, programme, semester and subject.
- Accept permitted syllabi, Bare Acts, lecture notes, case briefs and judgments; consider document links and transcripts where licensed and technically supported.
- Provide cited study guides, case summaries, flashcards, quizzes, source-grounded Q&A and optional audio revision.
- Citations should link to the relevant document page, paragraph or statutory section when available.
- Never claim that grounding eliminates hallucinations; surface absent or contradictory sources.
- NotebookLM is a **workflow benchmark**, not a required third-party integration; avoid hardcoding its quotas, feature limits or UI.

## Syllabus discovery, validation and activation (approved architecture)

**Principle:** Do not assign a generic BA LL.B. syllabus or infer a student's syllabus from college name alone.

1. **Collect identity:** university/affiliating university, college, programme (BA LL.B. five-year, etc.), admission batch, curriculum regulation/scheme where known, academic year and semester (1–10). Student may request a missing institution.
2. **Match verified catalogue:** search curated institution-specific syllabus versions using programme + university + batch/regulation + semester and effective dates; prefer official university/college publications and authoritative academic notices.
3. **Confidence and review:** show the matched version, source URL/document, publication/effective date, subjects and units; ask student to confirm. A low-confidence match stays **unverified** and cannot silently activate as official.
4. **Fallback:** student uploads official syllabus PDF or provides a university URL; ingest safely, extract subjects/units/learning outcomes/reading lists and place in **pending verification**. Staff/approved review workflow resolves mismatches before marking it verified.
5. **Versioning:** immutable syllabus versions, provenance, reviewer, approval timestamp and supersession history. Notify affected students of changed syllabi, preserve their previous learning progress and offer migration.
6. **Activate:** create subject/unit mappings and configure Notebook, Professor, Examiner, revision schedule and mock rubrics against the selected verified version.
7. **Ongoing checks:** periodically review official sources for curriculum changes; never overwrite a student's assigned syllabus without a clear confirmation/approval process.

**Suggested schema (design, not yet migrated):**
- `institutions` (university/college, affiliation and identifiers)
- `curriculum_versions` (programme, batch/regulation, effective dates, status, source, checksum, reviewed_by/at)
- `curriculum_subjects` and `curriculum_units` (semester, ordering, outcomes, readings, assessment rubric links)
- `student_curriculum_assignments` (user, version, semester, confirmation, migration history)
- `curriculum_submissions` (source upload/URL, submitter, validation status, review audit)

**Acceptance criteria:** students can see the exact curriculum source/version; unverified material is labelled; student uploads cannot modify the shared verified catalogue without review; tutors and assessments use the student's assigned curriculum; access control protects student documents and progress.


## Supreme Court Judgment Analyzer — approved prompt specification

**Role:** Senior Constitutional and Criminal Law Scholar in India, acting as a BA LL.B. academic tutor.

**Input:** Indian Supreme Court judgment title, citation, judgment text, PDF, or student notes. If only a title/facts are supplied, retrieve and verify the primary judgment before making precise claims; otherwise clearly label unverified details. Do not treat student notes as an authoritative judgment.

**Required student-facing output:**
1. **Case Title & Bench:** verified name, citation, year, bench strength and key judges; say when unavailable.
2. **Core Legal Issues:** 2–3 concise bullet points identifying the questions of law actually considered.
3. **Statutory Provisions Invoked:** relevant Constitutional Articles and applicable BNS/BNSS/IPC/CrPC provisions; do not retroactively attribute later legislation to an older judgment. Identify any historical or comparative mapping as such.
4. **Ratio Decidendi:** two clear paragraphs explaining the central legal rule necessary to the decision, tied to judgment paragraphs and any separate or concurring opinions.
5. **Obiter Dicta:** significant non-essential judicial observations, distinguished from binding reasoning; avoid labelling disputed propositions as definitive.
6. **Academic Answer Hook:** two accurate, concise sentences suitable for a university exam; label them as an **AI-written paraphrase**, not a quotation from the Court, unless an exact source quotation has been independently checked.

**Verification safeguards:** link the official judgment or trusted primary report where available; do not invent citations, paragraph numbers, bench membership, holdings, or quotes. Flag split opinions, later overruling/distinguishing, jurisdiction and uncertainty. Provide education rather than legal advice.

**Integration:** Launch from Study Notebook case-law lookup or a student-uploaded judgment; offer follow-up Socratic viva questions, a case brief and an Examiner practice answer, and connect the case to verified syllabus units.


## Three advanced legal practice studios — approved 27 October 2026

### Criminal Law Comparator
- Compare a selected legacy IPC/CrPC/Indian Evidence Act provision with a BNS/BNSS/BSA provision only when an authoritative crosswalk and statutory texts have been verified.
- Show both enactments, section identifiers, effective dates, elements, punishments/procedural consequences, substantive differences, transition and savings issues, and exact primary-source links.
- Never assume that corresponding section numbers or offence labels mean equivalent law. Where no verified mapping exists, display **Mapping not verified** and allow students to capture a comparison worksheet without asserting equivalence.
- Tie comparisons to syllabus subjects/units; offer a viva prompt and a practice answer outline.

### Table of Authorities Builder
- Accept a student's research notes and citations; construct a working table of cases, statutes, constitutional provisions and secondary sources, with issue/relevance and citation status.
- Distinguish student-supplied/unverified citations from verified primary authorities. Never invent case names, reporters, court, bench, paragraph numbers or quotes.
- Enable editing, duplicate review and copy/export of a provisional table. Official court or legislation verification is a prerequisite to marking a row verified.
- Link verified authorities to notebook, answer writing and moot submissions when persistence is implemented.

### AI Moot Practice Studio
- Support proposition and respondent roles, issues framed, written memorial structure, authorities, oral opening, bench-question practice, rebuttal and surrebuttal.
- Present both sides fairly and separate hypothetical moot facts from actual precedents.
- Coach one bench question at a time; grade argument clarity, issue framing, legal support, responsiveness and courtroom decorum with **indicative** feedback, not official marks.
- Require verified authorities before presenting citations as real; keep student notes private and syllabus-aware.

### Initial implementation and gates
- Provide a usable, accessible **Practice Studios** page with a source-check-first comparator worksheet, editable provisional authorities table and interactive moot rehearsal.
- Clearly label the initial tools as guided practice, **not AI-generated verified legal research**. Do not fake verified crosswalks, AI grading or citations.
- Next stage: authenticated per-student persistence, primary-source retrieval and verification, LLM coaching with source controls, syllabus linkage, mastery tracking, export, security tests and end-to-end pilot.
