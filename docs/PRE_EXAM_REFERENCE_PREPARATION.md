# LegiSchola — Real Paper-Informed Pre-Exam Preparation

## Operating principle
**Students do not need to obtain college-submitted answer sheets.** LegiSchola conducts its *own* practice assessments BEFORE college examinations. Past institutional papers supply evidence of structure, typical cognitive demands, question types and marks; the verified curriculum constrains assessable content. Do not use past exams as unsupported predictions.

## Archive linkage
Reference catalogue: `references/exam-papers/index.json`. Initial sources are four de-identified October–November 2026 DME Semester 1 papers, including the newly received Legal Method (LLB101). Each has unique `reference_id`, subject/codes, observed sections, question options, marks, topic signals and source-confidence tags. Future papers can be added via `references/exam-papers/INTAKE.md` and `scripts/validate-exam-references.mjs`.

## Live beta student flow
1. Student signs in and has a *verified, published* curriculum assigned, with an eligible taught subject/elective.
2. Open `/mock-exam` and choose subject. If the reference library has the same code or subject name, choose **DME-inspired 2026 internal format**. This is available as a *practice pattern*, not a claim the student is enrolled at DME. Other subjects continue to offer quick mocks.
3. Exam generation uses actual **verified syllabus units** assigned to that student, with the historic paper's topic signals only where relevant. AI produces **eight new questions**, not copies of old papers or fictional case citations.
4. 90-minute session: **Section A** four options, choose three, 3 marks per answer (100-word target); **Section B** four options, choose three, 7 marks each (200-word practice target). Total six attempted questions, 30 marks. English I's printed Section B did **not** specify a word cap; the 200-word value is a practice target only.
5. Timed in-browser answer entry, a manual Save Draft option, periodic 30-second authenticated server autosave, and signed-in ability to reopen an unfinished attempt from history. On expiry, writing stops but the student may submit. If browser closes before the next autosave, the most recent unsaved keystrokes may be lost; unsupervised timing cannot be treated as a proctored exam.
6. The submitted attempt stores answers and the **six selected indices** under the existing private `mock_exams` row. AI grades **only selected questions**, to the correct 3/7 maxima. Unanswered selected questions receive zero; unselected options do not count.
7. Student sees an indicative paper total **out of 30**, question-specific feedback and weak concepts. Marks are AI estimates, not institutional grades or a prediction of actual exam marks.
8. The existing `study_assessment_attempts` / Revision Agent expects 0–10 unit evidence. For every selected question store `round(10*awarded_marks/question_marks)` (not the raw 3/7 score), preserving the original marks in feedback and the mock exam's `total_score,max_score=30`.
9. Refresh the semester Revision Agent after grading. Weak units produce evidence-linked tasks. Retest with new questions; do not train a student solely to memorise past-paper questions.

## Honest limitations
- Reference papers are not verified university-issued originals; photos were supplied by a student, transcribed and de-identified. No student answer sheet is required or stored.
- Only four initial DME Semester 1 references are available. Do not extrapolate a frequency analysis or promise likely questions from that sample size.
- No exam-paper upload/review interface exists yet; repository intake is reviewed and version controlled. Raw scans belong in future private storage, never public GitHub.
- No institution-wide marking scheme was supplied. AI grading is **indicative**, not standardized against DME faculty's confidential criteria. Instructor-reviewed example answers would improve reliability.
- A subject must have a verified assigned curriculum. A DME reference must never override that gate or approve syllabus evidence automatically.
- Review provider costs and rate limits before large-scale rollout; each new 90-minute exam currently uses one LLM generation call and one grading call. Scheduled autonomous AI generation is not part of this mode.
- No payments or subscription enforcement introduced.
- Beta: autosave every 30 seconds while the session remains open; saving in one tab from multiple devices is not supported, and a 90-minute unproctored timer cannot prevent every form of academic dishonesty. Do not market it as an invigilated final exam.

## Acceptance tests
- Catalog contains all 4 papers with no enrolment numbers; CI checks the new templates and source status.
- Real-paper mode available for a student whose verified subject matches the archive; unknown subjects retain quick tests.
- Subject not enrolled, unchosen elective or unpublished curriculum is blocked.
- Exactly 4 Section A and 4 Section B generated, exactly 3 choices in each required at submit, stored and graded 3+7 without penalising unselected questions.
- Student can save/reopen their own exam; cross-user writes/reads and post-submission draft writes are denied.
- Scores remain valid for 0–10 revision inference, while the paper score shows /30.
- Recover from AI grading interruption by rerunning **only** on the stored submitted exam; prevent duplicates where grading is already saved.
- Validate genuine Anthropic availability and authenticated UI through a consenting test student before claiming full end-to-end success.
