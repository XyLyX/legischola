"use client";
import {useEffect,useState} from "react";
import {supabase} from "../../lib/supabase";
export default function ShareReferral(){
 const [code,setCode]=useState("");const [status,setStatus]=useState("");
 useEffect(()=>{void (async()=>{const {data:{session}}=await supabase!.auth.getSession();if(!session)return;const r=await fetch("/api/referral-code",{headers:{Authorization:"Bearer "+session.access_token}});if(r.ok){const j=await r.json();setCode(j.code||"");}})()},[]);
 const message=code?`I'm using LegiSchola for law-school learning, AI tutoring, revision and practice. Join me at https://legischola.com/login?ref=${encodeURIComponent(code)}\n\nMy referral code: ${code}\n\nReferral rewards are subject to eligibility and verified payment.`:"";
 async function share(){if(!message)return;try{if(navigator.share)await navigator.share({title:"LegiSchola invitation",text:message});else{await navigator.clipboard.writeText(message);setStatus("Message copied.");}}catch{setStatus("Copy the message from the box.");}}
 return <main className="shell" style={{maxWidth:700,paddingTop:48,paddingBottom:70}}><h1>Share LegiSchola with a friend</h1>{code?<><p>Your referral code: <strong>{code}</strong></p><textarea readOnly aria-label="Your referral message" value={message} rows={8} style={{width:"100%",padding:16}}/><p><button className="btn btn-primary" onClick={()=>void share()}>Share or copy message</button></p><p role="status">{status}</p></>:<p>Your code will appear after an eligible verified subscription payment. Founding testers receive a code after verifying their account.</p>}</main>;
}
