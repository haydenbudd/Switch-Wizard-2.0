# Design System Rules — Switch Wizard 2.0

## Stack

- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4 (inline `@theme` — no config file)
- **Animations:** `motion/react` (NOT framer-motion)
- **Components:** shadcn/ui (Radix primitives + CVA variants)
- **Icons:** lucide-react
- **Fonts:** Outfit (display) + DM Sans (body) via Google Fonts `<link>` tag
- **Build:** Vite 6 + @tailwindcss/vite
- **CSS Scoping:** postcss-prefix-selector → `#lm-product-finder`

---

## Design Tokens

Defined in `src/styles/theme.css` as CSS custom properties on `:root` / `.dark`.

### Colors

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--primary` | #1e40af | #3b82f6 | Buttons, links, active states |
| `--primary-foreground` | #ffffff | #ffffff | Text on primary |
| `--background` | #f0f1f5 | #020617 | Page background |
| `--foreground` | #0f172a | #e2e8f0 | Body text |
| `--card` | rgba(255,255,255,0.72) | rgba(15,23,42,0.72) | Card backgrounds |
| `--muted-foreground` | #64748b | #94a3b8 | Secondary text |
| `--border` | rgba(15,23,42,0.08) | rgba(226,232,240,0.08) | Borders |
| `--destructive` | #dc2626 | #ef4444 | Error states |
| `--accent-warm` | #d97706 | #f59e0b | Industrial accent |

### Glass Tokens

| Token | Light | Dark |
|---|---|---|
| `--glass-bg` | rgba(255,255,255,0.62) | rgba(15,23,42,0.55) |
| `--glass-border` | rgba(255,255,255,0.55) | rgba(226,232,240,0.07) |
| `--glass-blur` | 20px | 24px |
| `--glass-bg-hover` | rgba(255,255,255,0.82) | rgba(30,41,59,0.72) |

### Radius

| Token | Value |
|---|---|
| `--radius` | 1rem (16px) |
| `--radius-sm` | 12px |
| `--radius-md` | 14px |
| `--radius-lg` | 16px |
| `--radius-xl` | 20px |

### Typography

| Font | Family | Usage |
|---|---|---|
| Display | `Outfit` | h1–h6, large text, titles |
| Body | `DM Sans` | Body text, inputs, labels |

| Weight Token | Value |
|---|---|
| `--font-weight-medium` | 600 |
| `--font-weight-normal` | 400 |

Headings use tight letter-spacing: h1 `-0.03em`, h2 `-0.025em`, h3 `-0.02em`.

---

## Component Patterns

### GlassCard (`src/app/components/GlassCard.tsx`)

Primary visual container. Uses `.glass-card` CSS class for backdrop blur + border + shadow.

```tsx
<GlassCard hoverEffect interactive onClick={handleClick}>
  <Icon className="w-7 h-7" />
  <h3>Label</h3>
</GlassCard>
```

Props: `hoverEffect` (shine sweep), `interactive` (cursor + scale), `className`, `style`, `onClick`.

**Do NOT** wrap children in a block div — breaks flex layout for icon centering.

### OptionCard (`src/app/components/OptionCard.tsx`)

Wizard selection card built on GlassCard. Handles selected state, product count badge, staggered animation.

```tsx
<OptionCard
  label="Electrical"
  icon={Zap}
  description="Traditional wired switches"
  selected={selected === 'electrical'}
  onClick={() => select('electrical')}
  count={42}
  index={0}
/>
```

### Button Variants (shadcn)

```tsx
import { Button } from '@/app/components/ui/button';

<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Icon /></Button>
```

### Card Composition (shadcn)

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

---

## Icon System

**Library:** `lucide-react`

**Sizing convention:**
- `w-3.5 h-3.5` — Inline indicators
- `w-4 h-4` — Toolbar buttons, small UI
- `w-5 h-5` — Badges, medium content
- `w-7 h-7` — Option cards
- `w-8 h-8` — Category cards, hero icons

**Color convention:** Use semantic Tailwind classes: `text-muted-foreground`, `text-primary`, `text-blue-600 dark:text-blue-400`.

```tsx
import { Zap, Wind, Wifi } from 'lucide-react';
<Zap className="w-5 h-5 text-yellow-500" />
```

---

## Animation Patterns

### motion/react (NOT framer-motion)

**Standard easing:** `[0.16, 1, 0.3, 1]`

**Hero entrance:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
/>
```

**Staggered grid:**
```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
  />
))}
```

**Step transitions:**
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={step}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
  />
</AnimatePresence>
```

### CSS Animations (theme.css)

| Class | Effect | Duration |
|---|---|---|
| `.animate-glass-appear` | Fade up + scale | 0.5s |
| `.animate-card-enter` | Fade up + scale (stagger via `animationDelay`) | 0.5s |
| `.animate-float-glow` | Pulsing box-shadow | 3s infinite |
| `.animate-shimmer` | Background shimmer sweep | 3s infinite |
| `.animate-pulse-ring` | Expanding ring (replaces animate-ping) | 2s infinite |

---

## Responsive Breakpoints

Uses Tailwind defaults: `sm` (640px), `md` (768px), `lg` (1024px).

**Common grid patterns:**
- 1→3 columns: `grid-cols-1 md:grid-cols-3`
- 1→2→3 columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- 1→2 columns: `grid-cols-1 sm:grid-cols-2`

**Typography scaling:** `text-2xl sm:text-3xl`, `text-4xl md:text-6xl`

---

## Dark Mode

Triggered via `.lm-dark` class on `#lm-product-finder` container (NOT `.dark` on `<html>`).

**Tailwind custom variant:** `@custom-variant dark (&:is(.lm-dark *));`

**In components:** Use standard Tailwind `dark:` prefix — it maps to `.lm-dark` via the custom variant.

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
```

---

## CSS Scoping (WordPress Embed)

All CSS selectors are prefixed with `#lm-product-finder` via `postcss-prefix-selector`. This isolates styles when embedded in external sites.

**HTML structure:**
```html
<div id="lm-product-finder">
  <div id="root"></div>
</div>
```

---

## File Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # 48 shadcn components (Radix + CVA)
│   │   ├── wizard/          # StandardSteps, MedicalFlow, ResultsPage
│   │   ├── admin/           # AdminDashboard, DataAudit, SeriesManager, etc.
│   │   ├── GlassCard.tsx    # Core glass morphism component
│   │   ├── OptionCard.tsx   # Wizard selection card
│   │   └── Header.tsx       # Top toolbar
│   ├── hooks/               # useWizardState, useProductData
│   ├── lib/                 # API, Supabase client, transformProduct
│   ├── utils/               # analytics, generatePDF
│   └── data/                # Static options, products fallback
├── styles/
│   ├── index.css            # Entry: imports theme + fonts + tailwind
│   ├── theme.css            # Tokens, glass utilities, animations
│   ├── fonts.css            # Font family assignments
│   └── tailwind.css         # @import "tailwindcss"
└── main.tsx                 # React entry point
```

---

## Key Rules

1. **Always import from `motion/react`** — never `framer-motion` (crashes the page)
2. **Font loading via `<link>` tag** in `index.html` — CSS `@import` causes PostCSS errors
3. **GlassCard children must not be wrapped** in block divs — breaks flex centering
4. **Use `cn()` utility** from `@/app/lib/utils` for className merging (clsx + tailwind-merge)
5. **Admin panel is lazy-loaded** — `AdminContainer.tsx` uses dynamic import
6. **Stable build filenames** — Vite outputs `assets/app.js` for predictable deploy URLs
7. **Dark mode class is `.lm-dark`** on `#lm-product-finder`, not `.dark` on `<html>`
