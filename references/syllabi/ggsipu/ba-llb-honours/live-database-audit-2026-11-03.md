# Live Supabase curriculum audit — 2026-11-03

Read-only inspection of the connected LegiSchola Supabase project. No database mutations performed.

## Observed state

| Admission year | Version | Status in DB | Unit rows |
| --- | --- | --- | ---: |
| 2021 | DME/GGSIPU BA LL.B. (Hons) 2021–2026 — provisional starter | unverified | 28 |
| 2026 | GGSIPU 2024-25 revisions / BA LLB five-year 2026 batch / source SHA 2f86f7ec | **verified** | **297** |

Total: 2 curriculum versions, 325 curriculum unit rows, 1 curriculum source row.

The 2026 version has one source row with `source_type=derived_from_uploaded_pdf`, linking to the structured JSON in GitHub, and a description containing the full source SHA-256. **Its `storage_path` is NULL**, so the original 202-page PDF has not been demonstrated to be stored in private Supabase Storage.

The **live database is already populated** with the same 297 source-mapped unit/practical entries that the repository validator expects. Do not rerun a destructive staging import or duplicate the version.

## Verification nuance

The database flag `verification_status=verified` is a factual observed value; it must not be confused with proof that DME independently confirmed all 2026–31 cohort choices. Institution sign-off was **not** evidenced by this read-only inspection. Keep that gap explicit and review whether the existing verified flag meets the project's academic approval standard before using it as an institutional certification.

## Still to validate

1. Review student-facing API and enrolled-student curriculum selection against the 2026 version.
2. Obtain institutional confirmation of adopted 2026–31 syllabus, electives, and known Labour II source-code discrepancy.
3. Save original PDF in private document storage and attach its exact path to the existing source record; verify SHA-256 before storage.
4. Execute automated regression scripts and production UI tests; GitHub document commits alone do not prove these pass.
5. Resolve missing sixth exam-paper source if it exists; do not create a phantom paper.

**Scope:** Database inspection only; no schema, RLS, or curriculum content modified.
