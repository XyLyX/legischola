import type { Metadata } from "next";
export const metadata: Metadata = { title: "LegiSchola", description: "Your AI law-school companion" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body style={{fontFamily:"system-ui, sans-serif", margin:0, background:"#f8f9fc",color:"#172033"}}>{children}</body></html>; }
