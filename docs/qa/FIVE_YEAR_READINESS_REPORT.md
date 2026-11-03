# Five-year readiness — QA baseline (2026-11-03)

## Scope and evidence
Source: DME-provided official student syllabus (as reported by founding tester), 202-page GGSIPU BA LL.B. source. Production curriculum version `8dbddbd0-e8ff-40af-a356-ecf3fb852b79`, verified/published. Database read-only check: 81 paper entries and 297 units/practical entries across ten semesters; expected counts [7,7,6,6,7,6,11,11,18,2] and [28,28,24,24,25,24,37,40,65,2]. Private source PDF bucket verified; SHA of uploaded bytes not independently verified.

## Execution classification
- PASS (read-only): production paper/unit counts for all ten semesters.
- PASS (read-only): RLS enabled on curriculum, student progress, revision and assessment tables. RLS enabled is not proof that policies are correct.
- INSPECTED (code): semester browser, tutor, study assessment, revision, electives and future-semester guards exist.
- NOT TESTED: authenticated production browser flow, real AI responses, legal grading quality, persistent learning improvement, cross-user isolation, concurrent elective limits, Netlify staging deployment, practical-specific Semester 10 workflow.
- KNOWN GAP: full topic-by-skill adaptive examiner work pending (PR #23).
- KNOWN GAP: source Labour II paper code discrepancy preserved for academic review.

## Release blockers
1. Provision isolated Supabase test project and Netlify preview with test-only credentials; never create synthetic accounts in production.
2. Seed 10 synthetic student profiles and run authenticated end-to-end study -> assessment -> revision -> reassessment with persistence and isolation assertions.
3. Verify elective constraints (7, 8, 9) and practical-specific Semester 10 outcomes.
4. Benchmark AI Examiner against independently prepared rubrics; record grader errors.
5. Validate access policies by attempts as two different test users, not merely by inspecting rowsecurity flags.
6. Obtain Jiya's Semester 1 user acceptance after examinations.

## Repeatable structural gate
Run `node scripts/check-five-year-readiness.mjs`. This checks counts and code presence only. It must never be reported as full functional readiness.

## Decision
**Curriculum import ready. Five-year educational platform NOT YET CERTIFIED.** Do not infer functional readiness from static checks.
