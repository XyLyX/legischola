import type {Metadata} from "next";
export const metadata:Metadata={
 title:"Account Security",
 description:"LegiSchola secure sign-in, recovery and password management.",
 robots:{index:false,follow:false},
};
export default function AccountLayout({children}:{children:React.ReactNode}){return children;}
