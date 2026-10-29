import "server-only";
import {send,ready,escape} from "./guardian-mail.mjs";

/** Zoho integration already configured for guardian emails. Reuse it for staff replies. */
export const staffMailAvailable=()=>ready();
export async function sendSupportReply(to:string,subject:string,body:string,reference:string){
 if(!ready())throw Error("EMAIL_NOT_CONFIGURED");
 const safeSubject=subject.replace(/[\r\n]/g," ").slice(0,130);
 const html='<div style="font-family:Arial,sans-serif;line-height:1.6">'+
  '<p>Hello,</p><p>'+escape(body).replace(/\n/g,"<br/>")+'</p>'+
  '<p style="color:#64748b;font-size:12px">LegiSchola support enquiry reference: '+escape(reference)+
  '. This is an official reply to your enquiry. If you did not request help, contact support@legischola.com.</p></div>';
 await send(to,"Re: LegiSchola — "+safeSubject,html);
}
