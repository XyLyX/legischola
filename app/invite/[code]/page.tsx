import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {isReferralCode} from "../../../lib/referral-policy";
import InvitationRedirect from "./InvitationRedirect";

type Props={params:Promise<{code:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {code:raw}=await params;
 const code=raw.toUpperCase();
 if(!isReferralCode(code))return {title:"Invalid invitation | LegiSchola",robots:{index:false,follow:false}};
 const url="https://legischola.com/invite/"+encodeURIComponent(code);
 const title="Join LegiSchola — A law student invited you";
 const description="Explore semester-based legal learning, AI Professor, Cornell notes, practice exams and revision. Use your classmate's invitation code when joining.";
 return {
  title,
  description,
  alternates:{canonical:url},
  robots:{index:false,follow:true},
  openGraph:{
   type:"website",url,siteName:"LegiSchola",title,description,
   images:[{url:"https://legischola.com/og-legischola-2026.png",width:1200,height:630,alt:"LegiSchola: illuminated law book and classical pillars. Learn the law. Think legally."}],
  },
  twitter:{card:"summary_large_image",title,description,images:["https://legischola.com/og-legischola-2026.png"]},
 };
}
export default async function InvitationPage({params}:Props){
 const {code:raw}=await params;
 const code=raw.toUpperCase();
 if(!isReferralCode(code))notFound();
 const url="/login?ref="+encodeURIComponent(code);
 return <main className="shell" style={{maxWidth:700,paddingTop:52,paddingBottom:80}}>
  <div className="eyebrow">A PERSONAL STUDENT INVITATION</div>
  <h1>Welcome to LegiSchola</h1>
  <p>A fellow student invited you to explore the LegiSchola law-school learning companion.</p>
  <section className="card" style={{margin:"22px 0"}}>
   <p>Your invitation code</p><h2 style={{letterSpacing:".06em"}}>{code}</h2>
   <p>Open signup with this code already filled in. Registration and invitation attribution are free during beta; rewards require eligible verified subscription payment at a later stage.</p>
   <Link className="btn btn-primary" href={url}>Accept invitation →</Link>
  </section>
  <InvitationRedirect href={url}/>
 </main>;
}
