---
name: ui-header-footer-adjuster
description: |
  Adjust headers, navigation bars, and footer layouts across the Jambo Apparels site
  so they display clearly and consistently (size, spacing, alignment and responsiveness).
  Use this skill whenever a user asks to make site header/footer elements consistent,
  reduce visual clutter, or move small UI pieces (e.g., "Hide filters", "All Entries",
  Linah Makembu photo & "Message from the heart") slightly down/up for visual balance.
compatibility: React + Vite project (TSX), Tailwind/CSS
---

# UI Header / Footer Adjuster

Purpose
- Provide a repeatable set of instructions and small CSS/TSX edits to make header,
  top-navigation, and footer elements consistent in size and spacing across pages.
- Make small positional adjustments (nudge down/up) for items such as the left
  sidebar buttons (`Hide filters`), collection filters (`All Pieces` / `All Entries`),
  and the author block (Linah Makembu photo + "Message from the heart").

When to use (trigger)
- The user explicitly requests consistent headers/footers or mentions "header",
  "navigation", "footer", "spacing", "hide filters", "all entries", or asks to
  adjust Linah's photo/message positioning.

Expected outputs
- A short patch/recipe of edits: target file(s), CSS/Tailwind changes or small TSX tweaks,
  and suggested values (font sizes, paddings, margins). Example: a CSS diff or code
  snippet to drop into `styles/*.css` or `tailwind.config.js` and a small suggested
  change to the corresponding component.

Files to check in this repo (likely targets)
- components/Layout.tsx
- components/Navbar.tsx
- components/AdminLayout.tsx
- pages/* (Shop, Blog, About — where layout differs)
- styles/copilot.css or index.css
- tailwind.config.js (if using Tailwind tokens)

Guidance for the model (how to produce the patch)
1. Inspect the components listed above for header/footer markup and class names.
2. Prefer small, additive CSS rules scoped to specific component classes (avoid global resets).
3. Use responsive units (rem, %) and Tailwind tokens if project uses Tailwind.
4. For nudges: provide a recommended `margin-top` or `transform: translateY(...)` with
   small values (e.g., 6–20px) and a mobile-specific override (smaller on mobile).
5. Provide a one-file patch (or snippet) and a short rationale (why this value).
6. If multiple pages differ, recommend a shared CSS class (e.g., `.site-header-compact`) and
   show how to add it to the TSX markup.

Example CSS snippets (copy-paste ready)

/* header consistency: unify logo height and nav padding */
.site-header {
  --header-height: 3.5rem; /* 56px */
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding-left: 1rem;
  padding-right: 1rem;
}
.site-header .logo img { height: calc(var(--header-height) - 12px); }

/* compact nav links */
.site-nav a { padding: 0.5rem 0.75rem; font-size: .95rem; }

/* nudge left sidebar controls down 12px for visual balance */
.left-collection-controls { margin-top: 12px; }

/* author block: slightly lower the photo and keep text aligned */
.author-block { display:flex; gap: 1rem; align-items: center; }
.author-block .photo { width: 92px; height:92px; border-radius: 8px; object-fit:cover; }
.author-block .meta { margin-top: 4px; }

/* footer: consistent padding */
.site-footer { padding: 2rem 1rem; font-size: .95rem; }

Responsive: reduce nudges on small screens
@media (max-width: 640px) {
  .left-collection-controls { margin-top: 6px; }
  .site-header { --header-height: 3rem; }
  .author-block .photo { width: 72px; height: 72px; }
}

Test prompts (use these to run or ask the model to perform the change)
1) "Make the site header and nav consistent across Shop, Blog and About pages: unify logo height, reduce nav link padding slightly, and ensure header height is 56px desktop / 48px mobile. Also make footer padding consistent. Show me the edits (CSS and component class changes)."

2) "Nudge the left sidebar controls (Hide filters button, All Pieces filter) down by 12px on desktop and 6px on mobile. Keep existing spacing elsewhere unchanged. Provide the CSS snippet and where to add it."

3) "Lower Linah Makembu's author photo and 'Message from the heart' block by 10–14px on the About page and make the photo 92px square on desktop and 72px on mobile. Provide the TSX tweak and CSS patch."

Saving test prompts
- Save these prompts to `evals/evals.json` (prompts only) when preparing manual runs. Example entry structure is provided in the skill-creator docs.

How to use this skill (quick steps)
- Step 1: Pick a test prompt above (or write your own) and ask the model to produce the patch.
- Step 2: Inspect suggested edits — the skill should output target file names and copy/paste-ready CSS/TSX snippets.
- Step 3: Apply patches to the codebase (create small commits). Example files to edit: `components/Layout.tsx`, `styles/index.css`, or `styles/copilot.css`.
- Step 4: Run dev server: `npm run dev` and verify the visual changes across pages and screen sizes.
- Step 5: If adjustments are needed, iterate: choose smaller/larger margin values or tweak mobile breakpoints.

Notes and best practices
- Prefer adding a single small CSS file `styles/ui-adjustments.css` and import it in `App.tsx` so changes are easy to remove if needed.
- Use CSS custom properties for shared sizes (e.g., `--header-height`) and update `tailwind.config.js` if you prefer tokens.
- For accessibility, ensure header/nav font sizes remain readable at lower zoom levels.

Outputs you should produce when invoked
- A short patch/diff (which files to modify and exact lines) or a standalone CSS file content and the minimal TSX change to apply the shared class.
- A one-paragraph rationale and a short testing checklist (pages to open and sizes to verify).

Example expected partial output format
- Files: `styles/ui-adjustments.css` (with content), `components/Layout.tsx` (one-line class addition)
- Rationale: "unifies header height to 56px for consistent alignment with hero images and ensures mobile reduces to 48px. Reduces visual jitter between pages."
- Test checklist: "Open /shop, /blog, /about at 1280px, 1024px, 640px"

If you want, I can now:
- produce a ready-to-apply patch for one of the three test prompts, or
- add the suggested CSS file into the repo and make the minimal TSX changes for you to review.

---
