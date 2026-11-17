---
name: design-system-good-market-caf-s-brunch-p-es-artesanais-e-conveni-ncia
description: >
  Apply the Good Market – Cafés, Brunch, Pães Artesanais e Conveniência. design system when building or updating UI.
  Use when creating components, choosing colors or typography,
  or reviewing designs for marketing interfaces.
---

# Good Market – Cafés, Brunch, Pães Artesanais e Conveniência. — Design System Skill

## When to Use

- Building new UI components for Good Market – Cafés, Brunch, Pães Artesanais e Conveniência..
- Reviewing or updating existing component styles.
- Choosing colors, typography, or spacing for marketing pages.
- Checking designs against the extracted token set.

## Context

- **Product:** Good Market – Cafés, Brunch, Pães Artesanais e Conveniência. — https://agoodmarket.com.br/
- **Surface:** marketing
- **Audience:** Business decision-makers and potential customers
- **Character:** Conversion-focused marketing presence with a rich, diverse color palette and 4 typefaces.

## Tokens

### Colors

| Token | Value | Role |
|-------|-------|------|
| --text | `#1C1E1C` | Text Primary |
| --accent | `#D1709C` | Accent |
| --border-color | `#C9CCC4` | Border |
| --border-color | `#D8D8D8` | Border |
| color-3 | `#609778` | Text Secondary |
| color-5 | `#25D366` | Accent |
| color-2 | `#3B4282` | Background Dark |
| color-8 | `#F4F8ED` | Text Light |
| color-9 | `#FFFFFF` | Text Light |

### Typography

**Font stack:** Bricolage Grotesque, -apple-system, icomoon, Times

| Level | Size | Usage |
|-------|------|-------|
| text-xs | 11px | Captions, metadata |
| text-sm | 16px | Labels, secondary text |
| text-base | 18px | Body text (default) |
| text-lg | 24px | Subheadings, emphasis |
| text-xl | 70px | Section headings |

**Weight scale:** 300 · 400 · 500 · 600
**Line heights:** 77px · 24px · 16px · 20px · 26px · 18.4px · 27px · 31px

### Spacing

**Base unit:** 4px

`space-1: 1px` · `space-2: 5px` · `space-3: 8px` · `space-4: 10px` · `space-5: 20px` · `space-6: 22px` · `space-7: 24px` · `space-8: 32px` · `space-9: 60px` · `space-10: 70px` · `space-11: 80px` · `space-12: 100px` · `space-13: 110px` · `space-14: 120px` · `space-15: 140px` · `space-16: 160px` · `space-17: 250px`

### Shapes

**Border radius:** `radius-full: 50%` · `radius-md: 100px`

### Elevation

- **shadow-sm:** `rgba(7, 94, 84, 0.24) 1px 6px 24px 0px`

### Motion

- **duration-fast:** `all`
- **duration-fast:** `none`
- **duration-base:** `background-color 0.2s linear`
- **duration-base:** `0.3s`
- **duration-base:** `background 0.3s, border 0.3s, border-radius 0.3s, box-shadow 0.3s, transform 0.4s`
- **duration-base:** `background 0.3s, border 0.3s, box-shadow 0.3s, transform 0.4s`
- **duration-slow:** `0.75s fadeIn`
- **duration-slow:** `background-color 1s`
- **duration-slow:** `1.25s slideInUp`

## Component Inventory

- **Buttons:** 59 detected
- **Links:** 37 detected
- **Navigation:** 2 elements
- **Lists:** 10 detected
- **Images:** 94 detected

## Constraints

### Always

- Use tokens from the tables above — do not introduce new values.
- Include hover, focus-visible, and disabled states for interactive elements.
- Follow the 4px spacing grid.
- Meet WCAG 2.2 AA contrast minimums.

### Never

- Do not introduce colors outside the extracted palette.
- Do not use arbitrary spacing values — stick to the scale.
- Do not mix border-radius values. Pin to the detected set (50%, 100px).
- Do not use full-uppercase text for body or paragraph content.
- Do not nest interactive elements (e.g. buttons inside links).
- Do not ship components without defining hover, focus-visible, and disabled states.

## Tone

Concise, confident, implementation-focused. Avoid filler preambles.

## Authoring Workflow

When creating or documenting a component for this system:

1. State intent — one sentence on purpose.
2. Map tokens — list every token the component uses.
3. Define anatomy — named parts with token assignments.
4. Specify states — default, hover, focus-visible, active, disabled, loading, error, empty.
5. Describe interactions — keyboard, pointer, touch, edge cases.
6. Add a11y criteria — testable pass/fail checks.
7. List anti-patterns — concrete misuse examples.
8. Close with the Definition of Done checklist.

## Output Structure

Component guidelines must contain, in order:

1. Overview (purpose, when to use, when not to use)
2. Tokens and foundations
3. Anatomy, variants, responsive behavior
4. States and interactions
5. Accessibility (ARIA, contrast, focus, screen reader)
6. Content guidelines (copy rules, tone)
7. Anti-patterns with reasoning

## Component Requirements

- Reference only tokens from the tables above.
- Define all states: default, hover, focus-visible, active, disabled, loading, error.
- Handle edge cases: empty, overflow, truncation, max content.
- Include keyboard navigation behavior.
- Document ARIA roles and labels.

## Definition of Done

- Default state renders (smoke test).
- All states visually verified.
- Zero hardcoded visual values — tokens only.
- Keyboard navigation works without pointer.
- No critical a11y violations.
- Tested at min and max breakpoint.
- At least one anti-pattern documented.
- Purpose, usage, and limitations documented.
