import type {Metadata} from "next";
import {publicPageMetadata} from "../../lib/site-metadata";
export const metadata:Metadata=publicPageMetadata(
 "Contact and Support",
 "Get help with your LegiSchola account, syllabus, beta learning tools or partnerships. Send a question to the support team.",
 "/contact"
);
export default function ContactLayout({children}:{children:React.ReactNode}){return children}
