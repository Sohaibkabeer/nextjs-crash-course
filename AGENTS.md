# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

DevEvent is a Next.js 16.1.6 App Router project for listing developer events (hackathons, meetups, conferences). Built with TypeScript, React 19, Tailwind CSS 4, and integrated with PostHog analytics.

## Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

## Architecture

### Directory Structure
- `app/` - Next.js App Router pages and layouts
  - `layout.tsx` - Root layout with fonts (Schibsted Grotesk, Martian Mono), Navbar, and LightRays background
  - `page.tsx` - Homepage with featured events list
  - `globals.css` - Tailwind configuration and custom utility classes
- `components/` - React components
  - All interactive components are client components (`'use client'`)
  - `EventCard.tsx`, `ExploreBtn.tsx`, `Navbar.tsx` - Instrumented with PostHog analytics
  - `LightRays.tsx` - OGL-based animated background
- `lib/` - Utilities and constants
  - `constants.ts` - Event data array
  - `utils.ts` - cn() utility for Tailwind class merging
- `.claude/skills/posthog-integration-nextjs-app-router/` - PostHog integration reference

### Key Technologies
- **Next.js 16.1.6** with App Router
- **React 19.2.3** - Uses react-jsx transform in tsconfig
- **Tailwind CSS 4** - Uses `@tailwindcss/postcss` plugin, custom utilities defined in globals.css
- **shadcn/ui** - Component library (config in `components.json`)
  - Aliases: `@/components`, `@/lib/utils`, `@/components/ui`, `@/hooks`
- **PostHog** - Analytics initialized in `instrumentation-client.ts` (Next.js 15.3+ pattern)

### PostHog Integration

PostHog is initialized in `instrumentation-client.ts` with:
- Reverse proxy through `/ingest` (configured in `next.config.ts`)
- Automatic exception capture enabled
- Debug mode in development

**Instrumented Events:**
- `explore_clicked` - ExploreBtn component
- `event_card_clicked` - EventCard component (captures event metadata)
- `nav_link_clicked` - Navbar component (captures link label)

When adding new analytics:
- Import posthog-js in client components
- Use `posthog.capture()` in event handlers, NOT in useEffect
- Follow patterns in existing instrumented components
- Refer to `.claude/skills/posthog-integration-nextjs-app-router/SKILL.md` for detailed guidance

### Styling Conventions
- Custom utilities: `flex-center`, `text-gradient`, `glass`, `card-shadow` (defined in globals.css)
- Component-specific styles use `@layer components` with nested CSS
- Color system uses CSS custom properties (--color-* variables)
- Path aliases use `@/` prefix (configured in tsconfig.json)

### Font Configuration
- Schibsted Grotesk (variable: `--font-schibsted-grotesk`) - Primary font
- Martian Mono (variable: `--font-martian-mono`) - Used for headings (h3)

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host URL
