# New Examination Paper — Intake & Review SOP

1. **Receive under consent.** Accept college/paper, date, subject, semester, section and duration details. Do not solicit submitted student answer sheets, enrolment numbers, signatures or personal identifiers.
2. **Privacy screen before storage.** If a supplied photo has an ID or other personal marks, redact the original in a private working copy. Do not place the raw asset in this public repository. Remove photo EXIF and hidden metadata from any future permitted asset.
3. **Transcribe source, don't invent details.** Create one Markdown file using `TEMPLATE.md`. Preserve printed question wording when legible; mark unreadable passages `[unclear on source image]`. The college's actual print instructions prevail over assumed limits.
4. **Record provenance.** Institution, programme, campus, semester, subject and local course code, exam type (first/second internal, midterm or semester), term/year, set, printed marks, duration, photo/transcription review level and copyright/access status.
5. **Separate observations from inference.** Printed sections/questions are **observed**. Topic tags, Bloom/IRAC skills, likely duration, suggested word limits and future mock coverage are **inferred** and should be reviewed.
6. **Curriculum cross-check.** Map each question to verified curriculum units of that institution/programme/semester, or leave `syllabus_mapping_status: pending`. Reject unrelated subject data from mock generation. Don't promote a DME paper to a universal GGSIPU policy without corroboration.
7. **Peer review.** Check transcription against the private source; explicitly record reviewer/approval process in an internal system without putting names or private files in public GitHub. Resolve questionable law or case citations with source evidence.
8. **Index.** Add the paper to `index.json`, with unique reference ID, correct source Markdown path, source type, exact printed structure and independently labelled practice targets.
9. **Test.** `node scripts/validate-exam-references.mjs`, academic guards, TypeScript and Netlify preview. Submit a PR. No direct unreviewed imports to live teaching.
10. **Use.** Formative exam generator may read approved **format and topic signals**, subject to verified syllabus. Generate fresh questions and mark student responses locally in LegiSchola's private assessment system. Log revision inferences from their actual practice answers only.

### Proposed next stage (not implied complete)
Provide an admin-only upload/review interface backed by a **private** Supabase storage bucket and audit records. AI-assisted transcription can be suggested, but human academic approval must gate public reference promotion. Staff should be able to supersede incorrect metadata without rewriting prior assessments.
