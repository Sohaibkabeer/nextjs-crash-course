<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the DevEvent Next.js App Router project. Here is a summary of all changes made:

- **`instrumentation-client.ts`** (new file): Initializes PostHog client-side using the recommended Next.js 15.3+ approach. Configured with a reverse proxy (`/ingest`), automatic exception capture (`capture_exceptions: true`), and debug mode in development.
- **`next.config.ts`**: Added reverse proxy rewrites for `/ingest/static/*` and `/ingest/*` to route PostHog requests through Next.js, reducing interception by tracking blockers. Also set `skipTrailingSlashRedirect: true`.
- **`.env.local`**: Created with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables (covered by `.gitignore`).
- **`components/ExploreBtn.tsx`**: Added `posthog.capture('explore_clicked')` to the button's click handler. Converted inline `onClick` to a named handler.
- **`components/EventCard.tsx`**: Added `'use client'` directive and `posthog.capture('event_card_clicked', { event_title, event_slug, event_location, event_date })` on the Link click, capturing rich event metadata.
- **`components/Navbar.tsx`**: Added `'use client'` directive and `posthog.capture('nav_link_clicked', { label })` to all navigation links, tracking which section users navigate to.

## Events instrumented

| Event Name | Description | File |
|---|---|---|
| `explore_clicked` | User clicks the Explore button to scroll to the featured events section | `components/ExploreBtn.tsx` |
| `event_card_clicked` | User clicks on an event card; captures title, slug, location, and date | `components/EventCard.tsx` |
| `nav_link_clicked` | User clicks a navigation link in the top navbar; captures the link label | `components/Navbar.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/331153/dashboard/1329782
  - [Explore Button Clicks (Daily)](https://us.posthog.com/project/331153/insights/1imrNkzD) — trend of explore button engagement over time
  - [Event Card Clicks (Daily)](https://us.posthog.com/project/331153/insights/iTXu4pIl) — trend of event card clicks over time
  - [Most Clicked Events](https://us.posthog.com/project/331153/insights/mgOtwl41) — bar chart breakdown of which events get the most clicks
  - [Nav Link Clicks by Label](https://us.posthog.com/project/331153/insights/8hzOpuIR) — bar chart showing most used navigation links
  - [Explore to Event Card Conversion Funnel](https://us.posthog.com/project/331153/insights/Rl8hKs70) — funnel tracking users from Explore click to event card click

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
