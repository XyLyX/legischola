"use client";
import {useEffect} from "react";
export default function InvitationRedirect({href}:{href:string}){
 useEffect(()=>{
  // Social platforms read the server-rendered OG metadata. Human visitors
  // continue to the existing signup flow without needing a second click.
  const timeout=window.setTimeout(()=>window.location.replace(href),350);
  return()=>window.clearTimeout(timeout);
 },[href]);
 return <p role="status" className="muted">Opening the student registration page…</p>;
}
