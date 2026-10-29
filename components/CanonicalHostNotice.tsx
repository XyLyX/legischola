"use client";
import {useEffect,useState} from "react";

/** This is an informational banner, not a session-token migration. */
export default function CanonicalHostNotice(){
 const [legacy,setLegacy]=useState(false);
 useEffect(()=>{
  setLegacy(window.location.hostname==="legischola.netlify.app"||
   window.location.hostname==="main--legischola.netlify.app");
 },[]);
 if(!legacy)return null;
 return <aside role="note" className="card" style={{padding:16,margin:"14px 0 20px",background:"#fff9ed",borderColor:"#e9cb80"}}>
  <strong>Use the official LegiSchola address</strong>
  <p style={{margin:"6px 0"}}>You are browsing the earlier Netlify address. Your sign-in session is
   separate from the one on <strong>legischola.com</strong>; being signed in here will not automatically
   sign you in there. To avoid confusion, use the official domain for future visits.</p>
  <p style={{margin:"8px 0 0"}}><a href="https://legischola.com/login?mode=signin&method=email_link">Open the official login page</a>
   {" · "}If you are already signed in on this address, you can first manage your password here.</p>
 </aside>;
}
