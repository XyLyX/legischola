import type { Metadata } from "next";

export const SITE_URL = "https://legischola.com";
export const SITE_NAME = "LegiSchola";
export const SOCIAL_IMAGE_URL = "/opengraph-image";
export const SOCIAL_IMAGE_ALT =
  "LegiSchola public beta — Learn the law. Learn to think legally.";
export const HOME_TITLE = "LegiSchola | AI Law School Companion";
export const HOME_DESCRIPTION =
  "Study law by semester with an AI Professor, Cornell notes, mock exams and adaptive revision. Explore the LegiSchola public beta.";

export function publicPageMetadata(
  pageTitle: string,
  description: string,
  pathname: string
): Metadata {
  const canonical = new URL(pathname, SITE_URL).toString();
  const title = pageTitle + " | LegiSchola";
  return {
    title: pageTitle,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: new URL(SOCIAL_IMAGE_URL, SITE_URL).toString(),
          width: 1200,
          height: 630,
          alt: SOCIAL_IMAGE_ALT,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [new URL(SOCIAL_IMAGE_URL, SITE_URL).toString()],
    },
  };
}
