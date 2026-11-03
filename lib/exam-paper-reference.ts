import library from "../references/exam-papers/index.json";

/** Approved reference metadata, not verification of any student's academic syllabus. */
export type PaperReference=(typeof library.papers)[number];
export const DME_REFERENCE_PATTERN="dme_reference" as const;
const normalized=(input:string)=>input.toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\s+/g," ").trim();
/** Restrict matching to named subjects or exact paper codes; never promote past papers into curriculum. */
export function findPaperReference(paperCode:string,subjectName:string):PaperReference|null{
 const code=normalized(paperCode);
 const subject=normalized(subjectName);
 return library.papers.find(p=>normalized(p.paper_code)===code ||
  p.subject_aliases.some(alias=>normalized(alias)===subject)||
  normalized(p.subject)===subject)||null;
}
export function referencePattern(){
 return library.patterns.find(p=>p.pattern_id==="DME-2026-IA-30-90")!;
}
export type PracticeQuestion={
 unitId:string;question:string;marks:number;
 section?:"A"|"B";wordLimit?:number;referenceId?:string;
 unitTitle?:string;examinerPurpose?:"diagnostic"|"improve_weaknesses"|"exam_readiness";
 difficulty?:"foundation"|"standard"|"challenge";
 examinerSkill?:"mixed"|"recall"|"comparison"|"critical_analysis"|"application"|"legal_reasoning";
 evidenceBasis?:"first_diagnostic"|"existing_evidence";
};
export function isReferencePatternPaper(questions:PracticeQuestion[]):boolean{
 return questions.length===8&&questions.every((q,i)=>q.section===(i<4?"A":"B") &&
  q.marks===(i<4?3:7) && typeof q.referenceId==="string");
}
export function selectedIndicesValid(selected:unknown,questions:PracticeQuestion[]):selected is number[]{
 if(!isReferencePatternPaper(questions)||!Array.isArray(selected)||selected.length!==6)return false;
 if(new Set(selected).size!==6||selected.some(x=>!Number.isInteger(x)||x<0||x>=8))return false;
 return selected.filter(x=>x<4).length===3&&selected.filter(x=>x>=4).length===3;
}
export function examWordCount(answer:string){return answer.trim()?answer.trim().split(/\s+/u).length:0}
