import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";
const root=new URL("../",import.meta.url);
const read=p=>fs.readFileSync(new URL(p,root),"utf8");
const index=JSON.parse(read("references/exam-papers/index.json"));
const code=read("lib/exam-paper-reference.ts");
const compiled=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const exp={};
vm.runInNewContext(compiled,{exports:exp,require:(id)=>{assert(id.includes("index.json"));return index;}},{timeout:1000});
const pattern=exp.referencePattern();
assert.equal(pattern.duration_minutes,90);
assert.equal(pattern.max_marks,30);
assert.equal(exp.findPaperReference("LLB 101","Legal Method").reference_id,"DME-2026-S1-LLB101-IA-SET-A");
assert.equal(exp.findPaperReference("LLB 103","Law of Contract I").reference_id,"DME-2026-S1-LLB103-IA-SET-A");
assert.equal(exp.findPaperReference("LLB 105","English I").reference_id,"DME-2026-S1-LLB105-IA2-SET-A");
assert.equal(exp.findPaperReference("BA LLB 107","History I").reference_id,"DME-2026-S1-BALLB107-IA-SET-A");
assert.equal(exp.findPaperReference("UNKNOWN","Political Science I"),null,"Do not invent an institutional pattern");
const questions=Array.from({length:8},(_,i)=>({
 unitId:"unit-"+i,question:"Original sample question "+i,
 marks:i<4?3:7,section:i<4?"A":"B",wordLimit:i<4?100:200,referenceId:"DME-2026-S1-LLB103-IA-SET-A",
}));
assert.equal(exp.isReferencePatternPaper(questions),true);
assert.equal(exp.selectedIndicesValid([0,1,2,4,5,6],questions),true);
for(const ids of [[0,1,2,3,4,5],[0,0,1,4,5,6],[0,1,2,3,4,5,6],[0,1,2,4,5,8],[]])
 assert.equal(exp.selectedIndicesValid(ids,questions),false,"Invalid section selection should fail");
assert.equal(exp.isReferencePatternPaper(questions.slice(0,7)),false);
assert.equal(exp.examWordCount("One  two\nthree"),3);
const api=read("app/api/mock-exam/route.ts"),page=read("app/mock-exam/page.tsx");
const course=read("lib/examiner-evidence.ts");
for(const gate of ['cv?.verification_status!=="verified"','registeredPaper.paper_type',
 'registeredPaper.paper_type==="elective_option"',"curriculum_version_id",'"user_id",userId']){
 assert(course.includes(gate),"Verified course gate moved to evidence helper: "+gate);
}
for(const condition of [
 "DME_REFERENCE_PATTERN","findPaperReference(subjectCode",
 "Select exactly three questions from Section A and three from Section B",
 "selectedIndicesValid","isReferencePatternPaper","clean._selected",
 "patternExam?30:questions.length*10","Math.round(score/max*10)",
 "Blank answers MUST score zero","mock_exam_id","revision"
]){
 assert(api.includes(condition),"Missing pre-exam API invariant: "+condition);
}
assert(api.includes('if(mode==="save")'),"Authenticated draft save route missing");
assert(api.includes('.eq("user_id",user.id).eq("status","in_progress")'),
 "Save must only target student's own in-progress exam");
assert(api.includes("never")||api.includes("Never copy"),"AI cannot use past paper question text verbatim");
assert(page.includes("DME-inspired 2026 internal format"),"Student must opt into real-paper-inspired practice");
assert(page.includes("Selected:"),"Each section must show the number of chosen questions");
assert(page.includes("Select")||page.includes("Attempt this question"));
assert(page.includes("setInterval"),"Live timer and autosave cadence required");
assert(page.includes("Save draft"));
assert(page.includes('Link href="/revision"'),"Students must reach revision loop");
assert(page.includes("not an official examination"),"Practice marks must not be misrepresented");
console.log("90-minute DME reference mock, selection, 30-mark grading, draft saves and revision wiring validated.");
