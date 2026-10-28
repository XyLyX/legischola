# LegiSchola beta brand and launch notes — 29 October 2026

## Status and intent
- Use the current visual concepts for the Netlify **public beta** only; refine or replace when custom domain `legischola.com` goes live.
- The domain remains pending Porkbun DNS propagation/configuration; **do not modify DNS** as part of this beta deployment.
- Beta preview URL: https://legischola.netlify.app.
- Maintain clear provisional-syllabus and AI-output disclaimers. Do not suggest institutional endorsement, official past papers or official grading.
- Beta design is provisional, and early student feedback informs refinement.

## Identity
- Name: **LegiSchola** (exact capitalisation).
- Differentiate clearly from competitor **LégiSchool**.
- Do not use literal graduation caps, school buildings or generic school iconography as primary brand marks.
- Preferred motifs: open law book + classical pillar, shield/book mark, abstract reasoning tree, AI nodes and lines, justice balance motifs.

## Consistent art direction
- Deep navy `#0F172A`, warm gold `#D97706`, tech teal `#0D9488`, soft slate.
- Flat vector illustration, minimalist, premium, modern legal-academia, geometric, no embedded text, no humanoid robots.
- User-generated six conceptual visuals: hero open book/pillar, student + abstract AI, geometric logo, low-opacity dashboard background, institution-first campus network, legal reasoning tree. They are reference concepts. Beta website currently uses lightweight SVG vector **adaptations** to ensure the assets can be committed as text and load quickly; these are not pixel-identical copies of the generated raster images.
- The original rendered images are retained in the current conversation; replacing adaptations with original/compressed assets remains an option for the domain launch.
- Keep dashboard background subtle and accessible. Maintain text contrast and mobile responsiveness.

## Launch content
- About Us page `/about`.
- Founder's Note `/founders-note`, first-person message attributed to Navin Bhalla; review copy before wide external promotion.
- Student Guide `/student-guide`; FAQ `/faq`.
- 30–45-second marketing reel, vertical 9:16, brand awareness rather than a misleading product demonstration. Present features as beta capabilities, with provisional syllabus and AI assessment caveats in end card/caption.
- Social meta image and canonical metadata currently point to Netlify until Porkbun DNS is connected.

## Release checklist
1. Check GitHub build / Netlify production commit and deployment status.
2. Verify home, about, founder note, guide, FAQ, onboarding, dashboard, tutor, study, exam-readiness, mock-exam and research-studio routes.
3. Validate authenticated learning flows with a consenting test student account before calling them production-verified.
4. Check social preview metadata, mobile layout, accessibility and image alt text.
5. Do not change DNS, database migrations, payments or student records without separate need.
