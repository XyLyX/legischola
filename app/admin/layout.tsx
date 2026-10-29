import type {Metadata} from "next";
export const metadata:Metadata={title:"Operations Dashboard",robots:{index:false,follow:false}};
export default function RestrictedAdminLayout({children}:{children:React.ReactNode}){return children}
