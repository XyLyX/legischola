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
