# LegiSchola Beta — Adaptive Semester Revision Contract
Status: implementation PR #6; verify preview, merge and Jiya's consent-based live beta before claiming complete.
## Product contract
- Every semester 1–10 has an independent revision workspace; a student may revise earlier semesters without changing the active semester.
- Revision Agent is a dedicated, server-side, evidence-based planner. It consumes saved Examiner attempts, weak concepts and due progress. It must not fabricate student weaknesses.
- Structured chain: user_id → semester → subject_code → curriculum_unit_id → source_attempt_id → inference → task → reassessment → resolution.
- New students establish baseline with a diagnostic assessed question. Returning students use actual saved history; no history means no invented personalisation.
- An Examiner score >=8/10 resolves prior unit weaknesses; pending activities become superseded, not falsely completed.
- Revision activities: concept review, IRAC application, recall, reassessment; priorities based on actual evidence. Student selects daily minutes and exam date.
- Student data is private. New revision tables use RLS, students read only their own rows, server writes only after verifying authenticated identity and ownership.
- No payment gateway, checkout, paid subscriptions, paid-credit enforcement or referral payout processing in beta.
## Existing implementation
- Database migration: revision_inferences, revision_tasks, revision_preferences and RLS; task supersession.
- API: POST /api/revision refresh, complete and material; /api/study-assessment supports prior-semester assessed practice within the student's assigned curriculum.
- UI: /revision includes semester/subject selection, personalised tasks, Examiner findings, diagnostic question, reassessment and preferences.
- Links: global navigation and homepage revision card.
## Verification gates
1. Netlify preview build and TypeScript checks succeed.
2. New account: no history displays no fabricated weaknesses; diagnostic saves assessment and generates inference and tasks.
3. Returning account: older assessments inform priorities; repeated refresh does not duplicate records.
4. High-score reassessment resolves old inference and supersedes stale pending tasks.
5. Cross-account reads/writes are denied by RLS; invalid JWT denied; prior semester allowed, future semester denied.
6. Mobile revision view usable.
7. Jiya Founding Tester #001 performs natural live testing. Existing LegiSchola Beta Intelligence automation monitors available telemetry with individual monitoring only after consent and reliable mapping.
## Known constraints / not launch-complete
- The database currently contains 28 provisional Semester 1 curriculum units only; the sole curriculum version is unverified and unpublished, and the existing student profile has no assigned curriculum. Do not invent or silently certify curricula for Semesters 1–10. Verified assignment is a launch blocker for personalised tutoring/revision.
- The Revision Agent uses deterministic, evidence-based priority orchestration and on-demand Anthropic generation of student-specific revision packs (concept notes, flashcards, IRAC practice and self-check), cached per task. No continuously running background LLM agent or automatic notifications.
- New revision tasks use saved daily study minutes and exam date for bounded scheduling; rescheduling existing tasks when preferences change is not yet implemented.
- End-to-end authenticated browser testing and AI provider success have not yet been verified.
- Guardian monthly report has separate November 1 verification automation.
