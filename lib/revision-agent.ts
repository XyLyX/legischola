export type RevisionEvidence={score:number;concept:string;subject:string;unit:string;attemptCount:number;due:boolean};
export type RevisionActivity={type:"concept_review"|"application_practice"|"recall"|"reassessment";title:string;instructions:string;priority:1|2|3;delayDays:number};
export function revisionAgent(e:RevisionEvidence):RevisionActivity[]{
 const priority:1|2|3=e.score<=4||e.attemptCount>=3?3:e.score<=7||e.due?2:1;
 const focus=e.concept==="General unit review"?e.unit:e.concept;
 const items:RevisionActivity[]=[
 {type:"concept_review",title:"Revisit: "+focus,instructions:"Re-read "+e.unit+" in "+e.subject+". Explain "+focus+" in your own words, list the applicable legal principles, and check uncertain claims against your course materials.",priority,delayDays:0},
 {type:"application_practice",title:"Apply: "+focus,instructions:"Open Study for this unit. Work through a fresh fact pattern and structure the response using Issue, Rule, Application and Conclusion. Compare with Examiner feedback.",priority,delayDays:1},
 {type:"recall",title:"Recall: "+focus,instructions:"Without notes, write the key rules, exceptions and relevant verified cases for "+focus+". Review any omissions.",priority,delayDays:3},
 {type:"reassessment",title:"Reassess: "+focus,instructions:"Take a fresh assessed question for this unit in Study. Your new Examiner score will automatically update this revision priority when you refresh your plan.",priority,delayDays:7}
 ];
 return items;
}
