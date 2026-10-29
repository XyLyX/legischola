// Release-gate regression checks. These validate critical source-level guards;
// they complement, but do not replace, authenticated integration tests.
import fs from "node:fs";
import assert from "node:assert/strict";
const file=(p)=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const tutor=file("app/api/tutor/route.ts");
const assessment=file("app/api/study-assessment/route.ts");
const mock=file("app/api/mock-exam/route.ts");
const revision=file("app/api/revision/route.ts");
const context=file("app/api/curriculum/context/route.ts");
const founder=file("app/api/academic-review/founder/route.ts");
const triage=file("app/api/academic-review/triage/route.ts");
const review=file("app/academic-review/page.tsx");

assert.match(tutor,/unit\.semester\s*>\s*profile\.semester/,"Professor must reject future-semester units");
assert.match(tutor,/paper\.paper_type\s*===\s*"elective_option"/,"Professor must gate elective activation");
assert.match(assessment,/unit\.semester\s*>\s*profile\.semester/,"Examiner must reject future-semester units");
assert.match(assessment,/study_assessment_attempts/,"Examiner must save assessed evidence");
assert.match(mock,/eq\("semester",sem\)/,"Mock examinations must select the student's enrolled semester");
assert.match(mock,/paper_type\s*===\s*"elective_option"/,"Mock examiner must verify chosen electives");
assert.match(revision,/semester\s*>\s*\(profile\.semester\s*\|\|\s*1\)/,"Revision must not advance into future semesters");
assert.match(revision,/revision_inferences/,"Revision must link evidence-backed inferences");
assert.match(context,/verification_status\s*!==\s*"verified"/,"Curriculum API must fail closed on unverified sources");
assert.match(context,/activeCodes\.has\(u\.subject_code\)/,"Curriculum API must hide unchosen elective units");
assert.match(founder,/user\.app_metadata\?\.legischola_role\s*!==\s*"founder"/,"Founder privileges must use server-controlled app metadata");
assert.match(triage,/eq\("student_user_id",user\.id\)/,"Student triage must be scoped to their own case");
assert.match(review,/legischola-student-syllabi/,"Academic review must use the private syllabus bucket");
console.log("LegiSchola academic access and agent handoff source guards validated.");
