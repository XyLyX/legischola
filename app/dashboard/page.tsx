"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
type Profile={display_name:string|null;semester:number|null;admission_year:number|null};
export default function Dashboard(){const [profile,setProfile]=useState<Profile|null>(null);const [message,setMessage]=useState("Checking your account…");
 useEffect(()=>{let alive=true;(async()=>{if(!supabase){setMessage("Database connection is not configured.");return;}const {data:{user}}=await supabase.auth.getUser();if(!alive)return;if(!user){setMessage("Please sign in first.");return;}const {data,error}=await supabase.from("student_profiles").select("display_name,semester,admission_year").eq("user_id",user.id).maybeSingle();if(!alive)return;setProfile(data);setMessage(error?.message??(data?"Your academic profile":"Complete your academic profile to continue."));})();return()=>{alive=false}},[]);
 return <main style={{maxWidth:740,margin:"64px auto",padding:24}}><h1>My LegiSchola</h1><p>{message}</p>{profile&&<p>Admission year: {profile.admission_year??"Not set"} · Semester: {profile.semester??"Not set"}</p>}<Link href="/onboarding">Academic onboarding</Link></main>}
