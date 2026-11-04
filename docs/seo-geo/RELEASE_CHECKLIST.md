# SEO/GEO release gate

## Automated checks
- [ ] npm ci && npm run build
- [ ] npm run lint
- [ ] npm audit --omit=dev and full npm audit reviewed, especially high/critical findings
- [ ] CI release gate succeeds on final branch SHA
- [ ] Structured data JSON parses and matches visible content
- [ ] Public routes return 200; unknown semester returns 404
- [ ] /sitemap.xml includes all approved public routes
- [ ] /robots.txt disallows private workspace and API routes
- [ ] Canonicals use https://legischola.com
- [ ] Authenticated student routes remain private and are not linked as indexable content

## Manual QA
- [ ] Verify responsive navigation and internal links
- [ ] Verify no unreviewed syllabus claims
- [ ] Verify social image exists and previews render
- [ ] Test registration handoff without altering onboarding
- [ ] Validate production domain and redirects after deployment
- [ ] Confirm Search Console ownership, submit sitemap and monitor indexing
- [ ] Record organic registrations and AI referral traffic with consent-aware analytics

## Release policy
Do not merge while checks are failing or incomplete. Netlify ready state is not proof of successful indexing. Production deployment requires an explicit successful final build.
