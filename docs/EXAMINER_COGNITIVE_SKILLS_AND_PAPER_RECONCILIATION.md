# Examiner cognitive-skill expansion (beta)

## Reference reconciliation (3 November 2026)

The user reports **six student-shared internal papers**. The repository currently has **four merged catalogue records**: Legal Method, Law of Contract I, English I, History I. Sociology I (BA LLB 109) is the fifth catalogue entry on **PR #22**, still unmerged at the time this change was prepared. **The sixth source is not identifiable from accessible prior records**. Do not invent its subject or claim six indexed papers. Obtain the missing paper's original subject and transcription, de-identify, and register it separately.

PR #22 has a faint-print transcription caveat. Verify unclear text against the original before treating its exact wording as authoritative. The archive is assessment-style evidence, not an approved syllabus.

## Cognitive skills

- `recall`: accurate definitions and explanations.
- `comparison`: contrasts, commonalities, and distinctions between theories or rules.
- `critical_analysis`: arguments, assumptions, limitations, counterarguments and justified conclusions.
- `application`: apply concepts to a new factual scenario.
- `legal_reasoning`: issue identification, legal rules, application and conclusion, where the verified subject warrants legal analysis.
- `mixed`: a formative blend; **not** evidence of mastery in each individual skill.

The Examiner UI and API now accept comparison and critical analysis as independently selectable skills. A chosen skill is saved in the generated question metadata, subject to the same existing syllabus/semester and per-user restrictions. The existing per-unit score planner is unchanged.

## Not yet implemented / acceptance gates

1. For mixed papers, assign and persist **each question's actual cognitive skill**, not the umbrella `mixed` label. Validate model output and reject invalid or unbalanced skill allocation.
2. Record skill-specific rubric criteria and marks on each graded question, distinguishing theory accuracy from reasoning/application quality.
3. Aggregate attempts by **(student, curriculum unit, cognitive skill)** and evidence confidence. Never infer analytical mastery from recall marks.
4. Use skill-specific weakness, retention and overdue revision in the planner; add spaced retests and baseline/returning student tests.
5. Ensure DME-style 4+4 generation balances cognitive demands without changing the existing 3-of-4 / 3-of-4, 30-mark, 90-minute pattern.
6. Verify actual Supabase persistence, grading, revision handoff, CI and live student behaviour before release.

This is a scoped first increment, **not** a claim that full topic-by-skill adaptation has shipped.
