/**
 * LegiSchola Examiner Agent — evidence-driven examination planning.
 * Pure, deterministic rules; no AI access, no student PII and no inferred marks
 * for topics without assessment evidence.
 */
export type ExaminerPurpose="diagnostic"|"improve_weaknesses"|"exam_readiness";
export type ExaminerLevel="adaptive"|"foundation"|"standard"|"challenge";
export type ExaminerSkill="mixed"|"recall"|"comparison"|"critical_analysis"|"application"|"legal_reasoning";
export type EvidenceUnit={id:string;unit_title:string;subject_name:string;subject_code:string};
export type EvidenceAttempt={curriculum_unit_id:string;score:number;created_at:string;weak_concepts:string[]|null};
export type EvidenceProgress={curriculum_unit_id:string;review_due_at:string|null;status:string|null};
export type EvidenceInference={curriculum_unit_id:string;concept:string;status:string;priority:number};
export type UnitReadiness={
 unitId:string;unitTitle:string;attempts:number;latestScore:number|null;
 previousScore:number|null;trend:number|null;due:boolean;weakConcepts:string[];
 openFindings:number;priority:number;recommendedLevel:"foundation"|"standard"|"challenge";
 evidence:"unassessed"|"limited"|"repeated";
};
export type ExaminerPlan={
 baseline:"first_diagnostic"|"existing_evidence";
 purpose:ExaminerPurpose;coverage:{assessed:number;total:number};
 averageLatest:number|null;trendOnRepeatedUnits:number|null;
 units:UnitReadiness[];recommendedUnitId:string|null;notice:string;
};
const finiteScore=(v:number)=>Number.isFinite(v)&&v>=0&&v<=10;
const safeConcept=(s:unknown)=>typeof s==="string"?s.trim().slice(0,90):"";

export function makeExaminerPlan(input:{
 units:EvidenceUnit[];attempts:EvidenceAttempt[];progress:EvidenceProgress[];
 inferences:EvidenceInference[];purpose:ExaminerPurpose;now?:number;
}):ExaminerPlan{
 const {units,attempts,progress,inferences,purpose}=input;
 const timestamp=input.now??Date.now();
 const byUnit=new Map<string,EvidenceAttempt[]>();
 for(const a of attempts){
  if(!finiteScore(a.score)||!units.some(u=>u.id===a.curriculum_unit_id))continue;
  const list=byUnit.get(a.curriculum_unit_id)||[];
  list.push(a);byUnit.set(a.curriculum_unit_id,list);
 }
 const scores=units.map(u=>{
  const history=(byUnit.get(u.id)||[]).sort((a,b)=>b.created_at.localeCompare(a.created_at));
  const latest=history[0]?.score??null;
  const previous=history[1]?.score??null;
  const p=progress.find(v=>v.curriculum_unit_id===u.id);
  const due=Boolean(p?.review_due_at&&new Date(p.review_due_at).getTime()<=timestamp);
  const findings=inferences.filter(i=>i.curriculum_unit_id===u.id&&i.status!=="resolved");
  const issues=history[0]?.weak_concepts||[];
  const weakConcepts=[...new Set([...issues,...findings.map(i=>i.concept)]
    .map(safeConcept).filter(Boolean))].slice(0,4);
  const recommendedLevel:UnitReadiness["recommendedLevel"]=
   latest===null?"standard":latest<=4?"foundation":
   latest>=8&&history.length>=2?"challenge":"standard";
  // Rank is explicitly a heuristic about *practice selection*, not student mastery.
  const priority=purpose==="diagnostic"
    ?(latest===null?110:latest<=4?85:latest<=7?60:30)
    :purpose==="improve_weaknesses"
      ?(latest===null?65:latest<=4?110:latest<=7?90:latest<=8?50:20)
      :(latest===null?95:latest<=4?100:latest<=7?80:latest<=8?60:35);
  const score=priority+(due?17:0)+Math.min(15,findings.length*5)+
   (latest!==null&&previous!==null&&latest<previous?12:0);
  return {
   unitId:u.id,unitTitle:u.unit_title,attempts:history.length,
   latestScore:latest,previousScore:previous,
   trend:latest===null||previous===null?null:latest-previous,
   due,weakConcepts,openFindings:findings.length,priority:score,
   recommendedLevel,evidence:history.length===0?"unassessed":
    history.length<3?"limited":"repeated"
  } satisfies UnitReadiness;
 }).sort((a,b)=>b.priority-a.priority||a.unitTitle.localeCompare(b.unitTitle));
 const assessed=scores.filter(s=>s.latestScore!==null);
 const repeated=scores.filter(s=>s.trend!==null);
 const averageLatest=assessed.length
  ?Math.round(10*assessed.reduce((n,u)=>n+(u.latestScore||0),0)/assessed.length)/10:null;
 const trendOnRepeatedUnits=repeated.length
  ?Math.round(10*repeated.reduce((n,u)=>n+(u.trend||0),0)/repeated.length)/10:null;
 const first=assessed.length===0;
 return {
  baseline:first?"first_diagnostic":"existing_evidence",purpose,
  coverage:{assessed:assessed.length,total:units.length},
  averageLatest,trendOnRepeatedUnits,units:scores,
  recommendedUnitId:scores[0]?.unitId||null,
  notice:first
   ?"No previous Examiner scores: this test will establish a diagnostic baseline, not assume a skill level."
   :"Topic selection uses your recorded answers and revision due dates. Scores and trends are formative estimates; unassessed topics remain unknown."
 };
}
export function allocateExaminerUnits(plan:ExaminerPlan,count:number,focusUnitId?:string|null):UnitReadiness[]{
 if(!plan.units.length||!Number.isInteger(count)||count<1||count>8)return [];
 const pool=focusUnitId?plan.units.filter(u=>u.unitId===focusUnitId):plan.units;
 if(!pool.length)return [];
 // Repeat a focused unit for distinct questions; otherwise mix unassessed,
 // weak and strong areas without repeating the same slot consecutively.
 return Array.from({length:count},(_,i)=>pool[i%pool.length]);
}
export function resolvedDifficulty(level:ExaminerLevel,unit:UnitReadiness){
 return level==="adaptive"?unit.recommendedLevel:level;
}
