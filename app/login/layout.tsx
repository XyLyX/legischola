import type { Metadata } from "next";

// Sign-in/referral URLs may be shared, but should not appear in search results.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
