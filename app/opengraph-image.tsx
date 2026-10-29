import {ImageResponse} from "next/og";
export const runtime="nodejs";
export const alt="LegiSchola — Learn the law. Learn to think legally. Public beta.";
export const size={width:1200,height:630};
export const contentType="image/png";
export default function Image(){return new ImageResponse(
<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"64px 72px",background:"linear-gradient(125deg,#0d203a 0%,#193a59 65%,#1b4b53 100%)",color:"#fff",fontFamily:"Arial,sans-serif"}}>
<div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"baseline",fontSize:47,fontWeight:800,letterSpacing:"-2px"}}>Legi<span style={{color:"#8dd8bc"}}>Schola</span></div><div style={{fontSize:19,border:"2px solid #8dd8bc",color:"#c6f3e0",padding:"12px 20px",borderRadius:24,letterSpacing:2,fontWeight:700}}>PUBLIC BETA</div></div>
<div style={{display:"flex",flexDirection:"column",gap:20}}><div style={{display:"flex",flexDirection:"column",fontSize:75,fontWeight:800,lineHeight:1.12,letterSpacing:"-2px"}}><div style={{display:"flex"}}>Learn the law.</div><div style={{display:"flex"}}>Learn to <span style={{color:"#8dd8bc",marginLeft:18}}>think legally.</span></div></div><div style={{fontSize:27,color:"#d7e7ef"}}>One connected study companion for law school.</div></div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:21,color:"#d9e7ee"}}><span>AI Professor · Cornell Notes · Mock Exams · Revision</span><span style={{color:"#a7e7d1"}}>legischola.com</span></div>
</div>,{...size})}
