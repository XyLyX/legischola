// Proposed beta commercial configuration. Checkout remains disabled until payment verification and cost controls are live.
export type PlanId = "free" | "founding" | "plus" | "pro";
export const plans = [
  {id:"free",name:"Free",monthlyINR:0,annualINR:0,monthlyCredits:20,bonusPercent:0,description:"Core study tools and limited AI support."},
  {id:"founding",name:"Founding Student",monthlyINR:149,annualINR:1349,monthlyCredits:150,bonusPercent:5,description:"Early supporter access to regular tutoring and limited assessments."},
  {id:"plus",name:"Plus",monthlyINR:299,annualINR:2699,monthlyCredits:400,bonusPercent:10,description:"More tutoring, practice, research and revision."},
  {id:"pro",name:"Pro",monthlyINR:499,annualINR:4499,monthlyCredits:900,bonusPercent:15,description:"Higher AI allowances and advanced study support."}
] as const;
export const packs=[{id:"quick",name:"Quick Boost",inr:49,credits:50},{id:"study",name:"Study Pack",inr:99,credits:120},{id:"exam",name:"Exam Booster",inr:199,credits:270},{id:"power",name:"Power Study",inr:399,credits:600}] as const;
export const trial={days:7,totalCredits:100,dailyCreditLimit:25,cardRequired:false} as const;
export const creditCosts={tutor:1,deep_reasoning:3,document_analysis:5,mock_evaluation:10} as const;
export const policy={purchasedCreditValidityMonths:12,subscriptionRollover:false,autoTopUp:false} as const;
