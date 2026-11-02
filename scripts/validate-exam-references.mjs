import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const folder=path.join(root,"references","exam-papers");
const index=JSON.parse(fs.readFileSync(path.join(folder,"index.json"),"utf8"));

assert.equal(index.schema_version,1);
assert(index.papers.length>=4,"Four initial historical papers must be archived");
const ids=new Set(),locations=new Set();
for(const paper of index.papers){
 assert(!ids.has(paper.reference_id),"Duplicate paper reference ID");
 ids.add(paper.reference_id);
 assert(!locations.has(paper.path),"Duplicate paper location");
 locations.add(paper.path);
 assert(/^[a-z0-9-]+\/[0-9]{4}\/semester-[0-9]{2}\/[a-z0-9-]+\.md$/.test(paper.path),"Unsafe or nonstandard paper path");
 const file=path.resolve(folder,paper.path);
 assert(file.startsWith(folder+path.sep),"Paper escaped reference directory");
 assert(fs.existsSync(file),"Missing paper transcription: "+paper.path);
 const md=fs.readFileSync(file,"utf8");
 assert(md.startsWith("---\n"),"Source frontmatter required");
 for(const key of ["reference_id","institution","programme","semester","subject","paper_code","exam_window","exam_type","set","duration_minutes","maximum_marks","verification","syllabus_mapping","photo_original","pii_redaction"])
  assert(md.includes(key+": "),"Missing metadata field "+key+" in "+paper.path);
 assert(md.includes("reference_id: "+paper.reference_id),"Metadata ID mismatch");
 assert(md.includes("paper_code: "+paper.paper_code),"Paper code mismatch");
 assert(md.includes("photo_original: private_not_committed"),"Never commit source photos here");
 assert(md.includes("pii_redaction: enrolment_number_excluded"),"PII redaction must be explicit");
 assert(md.includes("## Section A")&&md.includes("## Section B"),"Both paper sections required");
 const shortQuestions=md.match(/^\- \*\*[A-D]\.\*\*/gm)||[];
 const longQuestions=md.match(/^\- \*\*Q[1-4]\.\*\*/gm)||[];
 assert.equal(shortQuestions.length,4,"Need all four short-answer options "+paper.path);
 assert.equal(longQuestions.length,4,"Need all four long-answer options "+paper.path);
 assert(!/\b[0-9]{10,}\b/.test(md),"Potential long student ID in public transcription");
 assert(paper.topic_signals.length>=3&&paper.subject_aliases.length>=1,"Topic and matching metadata needed");
 assert(paper.duration_minutes===90&&paper.max_marks===30,"Unexpected assessment format");
 assert(paper.syllabus_mapping_status!=="verified","Do not certify syllabus linkage from photographs alone");
}
for(const p of index.patterns){
 assert.equal(p.sections.length,2);
 const [a,b]=p.sections;
 assert(a.question_count===4&&a.attempt_count===3&&a.marks_per_answer===3);
 assert(b.question_count===4&&b.attempt_count===3&&b.marks_per_answer===7);
 assert.equal(a.attempt_count*a.marks_per_answer+b.attempt_count*b.marks_per_answer,p.max_marks);
 assert.equal(p.duration_minutes,90);
}
const english=index.papers.find(p=>p.paper_code==="LLB 105");
assert(english?.notes?.includes("does not state a 200-word maximum"),"Do not invent an English long-answer word cap");
const readme=fs.readFileSync(path.join(folder,"README.md"),"utf8");
assert(readme.includes("public")&&readme.includes("enrolment"),"Public PII warning required");
for(const guide of ["INTAKE.md","TEMPLATE.md",".gitignore"])assert(fs.existsSync(path.join(folder,guide)));
console.log("De-identified exam library validated: "+index.papers.length+" papers, original mock pattern, future intake and privacy gates.");
