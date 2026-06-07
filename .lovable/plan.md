## Breadcrumb — Plan (v2)

A cozy, dark-forest habit tracker for ADHD brains. Three screens, real auth via Lovable Cloud, crumbs stored per-user, Gemini-powered parsing & insights via Lovable AI Gateway.

### Changes from v1
- **Real auth**: Lovable Cloud (email/password + Continue with Google).
- **AI model**: Gemini (`google/gemini-3-flash-preview`) via Lovable AI Gateway — your exact system prompts, no API key management.
- **Storage**: Still localStorage for crumbs (per your spec), but namespaced by `user.id` so crumbs don't bleed across accounts on a shared device. Tell me if you'd rather sync crumbs to the cloud DB.

### Routes
- `/` — Welcome / Login (atmospheric). Email+password fields, "Continue with Google" button. Redirects signed-in users straight to `/journal`.
- `/_authenticated/journal` — Daily entry. Textarea + "Drop a crumb" → parsed cards below.
- `/_authenticated/trail` — Trail history + "What does my trail look like?" insight card.
- Auth-gated subtree managed by Lovable's integration layout. Shared bottom nav (Journal · Trail) + a sign-out link tucked in a quiet corner. Tiny 🐾 in the footer.

### Auth setup
- Enable Lovable Cloud.
- Enable Google provider via the Supabase social-auth tool (no extra config from you).
- Login form: email/password via `supabase.auth.signInWithPassword` with a small "Create account" toggle for `signUp`. Google via the Lovable broker (`lovable.auth.signInWithOAuth("google", ...)`).
- No profiles table needed — we don't store extra user metadata for this app.

### Visual system (src/styles.css)
- Deep warm charcoal background (`oklch` near-black, warm hue), layered radial gradients for "light through leaves" glow, subtle CSS noise overlay.
- Amber/gold accent tokens, soft warm card surface slightly lifted from bg, rounded-2xl, gentle diffuse shadows.
- **Fraunces** (display) + **Inter** (body), loaded via `<link>` in `__root.tsx`, registered in `@theme`.
- Status palette: done = soft amber glow, partial = muted gold, unsure = dim sage, missed = quiet gray. No reds, no streak counters.
- Login screen gets the strongest vignette + ambient glow.

### Data model (localStorage, keyed by user)
```ts
// key: `breadcrumb:crumbs:${user.id}`
type Crumb = {
  id: string;
  created_at: string;
  raw_text: string;
  events: Array<{
    habit: string;
    status: 'done' | 'partial' | 'unsure' | 'missed';
    confidence: number;
    time_of_day: 'morning' | 'afternoon' | 'evening' | 'unknown';
    notes: string;
  }>;
};
```

### Server functions (`src/lib/breadcrumb.functions.ts`)
Both gated with `requireSupabaseAuth` and call Gemini via Lovable AI Gateway:
1. `parseCrumb({ text })` — your exact parser prompt; uses `Output.object` with Zod to guarantee a valid events array.
2. `readTrail({ crumbs })` — your exact pattern-spotter prompt; returns prose (no bullets, instructed in prompt).

Both surface friendly errors: 429 → "the forest is busy — try again in a moment"; 402 → credits prompt; anything else → "lost in the woods for a moment — try again".

### Micro-copy (wired exactly)
- Loading: "following the crumbs..."
- Journal empty: "you haven't dropped any crumbs today"
- Trail empty: "the trail is just beginning — keep dropping crumbs"
- Insight header: "what the forest is telling you"
- Error: "lost in the woods for a moment — try again"
- Journal placeholder: "Just type what happened — messy is fine."

### Files to create/edit
- Enable Lovable Cloud + configure Google social auth
- `src/styles.css` — forest palette + font tokens
- `src/routes/__root.tsx` — font `<link>`, Breadcrumb meta, auth state listener
- `src/routes/index.tsx` — Welcome/Login (redirects to /journal if signed in)
- `src/routes/_authenticated/journal.tsx` — Journal screen
- `src/routes/_authenticated/trail.tsx` — Trail screen
- `src/components/ForestBackdrop.tsx` — ambient gradient/noise layer
- `src/components/BottomNav.tsx` — shared nav + sign out
- `src/components/CrumbCard.tsx` — parsed habit event card
- `src/hooks/use-crumbs.ts` — per-user localStorage hook
- `src/lib/breadcrumb.functions.ts` — `parseCrumb` + `readTrail`
- `src/lib/ai-gateway.server.ts` — Gemini provider helper

### Out of scope (ask if you want these)
- Cloud sync of crumbs across devices (currently per-device localStorage)
- Editing/deleting past crumbs
- Password reset flow (can add quickly — needs a `/reset-password` route)

Ready to build on your go-ahead.