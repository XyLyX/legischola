# Syllabus and exam-paper reconciliation — 2026-11-03

## Source identity and scope

The 202-page `syllballb300924(3).pdf` uploaded 2026-11-03 has SHA-256 `2f86f7eccaa31df437b2f8dba8b18a8aba04c3316aecff7438904b778046a65e`, identical to the PDF fingerprint already stored in `data/ggsipu-ba-llb-2026-curriculum.json` for `syllballb300924(2).pdf`. The new upload is **not** a new syllabus edition. Reimporting it would create duplicate work and potential drift.

The existing extraction has 81 paper entries across ten semesters: 51 taught, 3 elective catalogues, 21 elective options, 5 practical and 1 non-university-evaluative entry; 297 unit/practical entries. Its validation script checks the counts, unit numbering, source-page references, and known Labour II discrepancy. **This is structural validation, not full human academic verification.**

## Semester 1: syllabus vs available DME internal exam references

| Code | GGSIPU syllabus subject | DME October–November 2026 paper in repo | Status |
| --- | --- | --- | --- |
| LLB 101 | Legal Method | Legal Method, Set A | Reference present |
| LLB 103 | Law of Contract-I | Law of Contract I, Set A | Reference present |
| LLB 105 | English I: Language, Law and Literature (Western) | English I, Set A, second internal | Reference present |
| BA LLB 107 | History-I: Ancient and Medieval India | History I, Set A | Reference present |
| BA LLB 109 | Sociology-I: Introduction to Sociology | Sociology I, Set A | Reference present |
| BA LLB 111 | Political Science-I: Introduction to Political Science | Not supplied / not catalogued | Await actual paper |
| BA LLB 113 | Economics-I: Micro Economic Analysis | Not supplied / not catalogued | Await actual paper |

**Counts:** 7 syllabus subjects, 5 distinct supplied examination references, 2 subjects without an archived exam paper. The user's recollection of six previously shared exam papers is **unresolved**; it is not evidence that either Political Science I or Economics I paper was actually supplied. Do not fabricate a sixth reference.

The examination references establish a DME internal pattern of 90 minutes and 30 marks (3 × 3 short answers, 3 × 7 longer answers); individual paper wording and limits take precedence. English I's Section B does not print a 200-word cap. Exams are evidence of assessment format, not a substitute for the syllabus.

## Source version and applicability

The PDF cover states “w.e.f. Batch of 2021–2026”. Several amended subject pages include a footnote that the revised scheme and syllabus was approved by the 32nd Board of Studies (12 June 2024) and Sub-Committee of Academic Council (27 July 2024), and will apply to every batch from academic session 2024–25. This supports 2026 applicability of amended pages, **but it does not prove which electives or institutional variants DME has adopted for the 2026–31 cohort**.

## Required operational follow-through

- Keep the source-mapped JSON and the existing unverified staging import; do not overwrite verified production curriculum without a reviewed diff.
- Obtain DME confirmation of cohort-specific subject list, elective selection and amended-page applicability.
- Independently review each source page and known source conflicts, including Labour II (`LLB406`).
- Store the original PDF in **private** storage with checksum and page count; do not upload it to public GitHub by default.
- Validate live Supabase `curriculum_versions`, `curriculum_units` and `curriculum_sources`, and confirm that student-facing course selection reads the intended version. A repository commit alone is not a database deployment.
- Verify live exam simulator and adaptive Examiner features separately; PR #23 is a distinct change and should not be represented as complete or merged.
