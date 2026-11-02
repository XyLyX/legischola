import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import vm from "node:vm";

const read=p=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
const js=ts.transpileModule(read("lib/examiner-planner.ts"),{
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}
}).outputText;
const exportsObj={};
vm.runInNewContext(js,{exports:exportsObj,Date,Map,Set,Math,Number},{timeout:2000});
const {makeExaminerPlan,allocateExaminerUnits,resolvedDifficulty}=exportsObj;
assert.equal(typeof makeExaminerPlan,"function");
const units=[
 {id:"u1",unit_title:"Formation of contracts",subject_name:"Contract I",subject_code:"LLB 103"},
 {id:"u2",unit_title:"Contractual capacity",subject_name:"Contract I",subject_code:"LLB 103"},
 {id:"u3",unit_title:"Void agreements",subject_name:"Contract I",subject_code:"LLB 103"},
];
const blank=makeExaminerPlan({units,attempts:[],progress:[],inferences:[],purpose:"exam_readiness",now:Date.parse("2026-11-02")});
assert.equal(blank.baseline,"first_diagnostic");
assert.equal(blank.coverage.assessed,0);
assert.equal(blank.averageLatest,null);
assert.equal(blank.trendOnRepeatedUnits,null);
assert.equal(blank.units[0].evidence,"unassessed");
const populated=makeExaminerPlan({
 units,now:Date.parse("2026-11-02"),
 attempts:[
  {curriculum_unit_id:"u1",score:3,created_at:"2026-11-01T00:00:00Z",weak_concepts:["Consideration"]},
  {curriculum_unit_id:"u1",score:6,created_at:"2026-10-25T00:00:00Z",weak_concepts:[]},
  {curriculum_unit_id:"u2",score:9,created_at:"2026-11-01T00:00:00Z",weak_concepts:[]},
  {curriculum_unit_id:"u2",score:8,created_at:"2026-10-25T00:00:00Z",weak_concepts:[]}
 ],progress:[{curriculum_unit_id:"u1",review_due_at:"2026-11-01T00:00:00Z",status:"review_due"}],
 inferences:[{curriculum_unit_id:"u1",concept:"Capacity",status:"open",priority:3}],
 purpose:"improve_weaknesses"
});
assert.equal(populated.baseline,"existing_evidence");
assert.equal(populated.coverage.assessed,2);
assert.equal(populated.averageLatest,6);
assert.equal(populated.trendOnRepeatedUnits,-1);
assert.equal(populated.units[0].unitId,"u1","Genuinely weak or due topics should come first");
assert.equal(populated.units.find(u=>u.unitId==="u1").trend,-3);
assert.equal(populated.units.find(u=>u.unitId==="u1").recommendedLevel,"foundation");
assert.equal(populated.units.find(u=>u.unitId==="u2").recommendedLevel,"challenge");
assert.equal(populated.units.find(u=>u.unitId==="u3").latestScore,null);
assert.equal(resolvedDifficulty("adaptive",populated.units[0]),"foundation");
assert.equal(resolvedDifficulty("challenge",populated.units[0]),"challenge");
const slots=allocateExaminerUnits(populated,8);
assert.equal(slots.length,8);
assert.equal(allocateExaminerUnits(populated,4,"u2").every(u=>u.unitId==="u2"),true);
assert.equal(allocateExaminerUnits(populated,4,"not-enrolled").length,0);
assert.equal(allocateExaminerUnits(populated,9).length,0);
const diag=makeExaminerPlan({units,attempts:[],progress:[],inferences:[],purpose:"diagnostic"});
assert(diag.units.every(u=>u.latestScore===null),"No false mastery scores for new subscribers");

const context=read("lib/examiner-evidence.ts");
const route=read("app/api/mock-exam/route.ts");
const ui=read("app/mock-exam/page.tsx");
for(const required of [
 'eq("user_id",userId)',"curriculum_version_id","verification_status",
 'registeredPaper.paper_type==="elective_option"', "focusUnitId",
 "Future semester assessments",'"study_assessment_attempts"',
 '"student_topic_progress"','"revision_inferences"',"in(",
])assert(context.includes(required),"Missing per-user curriculum/evidence gate "+required);
assert(context.includes("No exam was generated."),"Do not silently treat DB outages as no evidence");
for(const required of [
 'mode==="plan"','mode==="start"','loadExaminerContext(admin,user.id,semester,subjectCode',
 '"adaptive"', '"diagnostic"','"improve_weaknesses"','"exam_readiness"',
 '"foundation"','"standard"','"challenge"','"legal_reasoning"',
 "first_diagnostic", "allocateExaminerUnits", "resolvedDifficulty",
 "effectivePurpose", "recordedLatestScore", "revisionDue",
 'paper.push({', 'examinerPurpose:effectivePurpose', 'evidenceBasis:baseline',
 'selectedIndicesValid','isReferencePatternPaper',"Math.round(score/max*10)",
])assert(route.includes(required),"Missing Examiner generation/assessment constraint "+required);
for(const required of [
 "Prepare me for an exam","Which semester?","Which subject?",
 "What should Examiner help with?","Topic coverage","Question difficulty",
 "Skill to test","Examination format","Time allowed",
 'mode:"plan"','curriculum/context?semester=',"plan.baseline",
 "plan.coverage.assessed","plan.trendOnRepeatedUnits",
 "DME-inspired 2026 internal format","Generate my personalised test",
 'Link href="/revision"', "setPlanRefresh"
])assert(ui.includes(required),"Missing student-requested Examiner experience "+required);
assert(!route.includes("raw_user_meta_data"),"Never rely on editable user claims");
console.log("Personalised Examiner Agent: cold-start baseline, scored topic prioritisation, learning curve, semester gates, requested levels and revision handoff passed.");
