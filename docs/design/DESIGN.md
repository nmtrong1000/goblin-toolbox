---
version: alpha
name: Goblin Gazette
description: A warm, retro editorial design system for Goblin Toolbox, inspired by the rhythm and hierarchy of a printed newspaper.
colors:
  paper: "#f4ebe0"
  paper-raised: "#fbf7f1"
  paper-deep: "#eadcc9"
  ink: "#1d1b18"
  ink-mid: "#34302b"
  ink-soft: "#6f6961"
  rule: "#b8aa98"
  rule-light: "#d8cabb"
  accent: "#a64f35"
  accent-dark: "#78351f"
  accent-pale: "#ead2c1"
  olive: "#59604a"
typography:
  display:
    fontFamily: Quicksand
    fontSize: 4.5rem
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: -0.06em
  headline:
    fontFamily: Quicksand
    fontSize: 3rem
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -0.045em
  title:
    fontFamily: Quicksand
    fontSize: 1.75rem
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.03em
  body:
    fontFamily: Quicksand
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.7
  body-sm:
    fontFamily: Quicksand
    fontSize: 0.8125rem
    fontWeight: 500
    lineHeight: 1.65
  label:
    fontFamily: Quicksand
    fontSize: 0.6875rem
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0.12em
  metadata:
    fontFamily: Quicksand
    fontSize: 0.625rem
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: 0.08em
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 20px
  6: 24px
  8: 32px
  10: 40px
  12: 48px
  16: 64px
rounded:
  none: 0px
  sm: 2px
  md: 4px
  full: 999px
motion:
  state-change:
    duration: 160ms
    timingFunction: ease-out
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: 16px
  button-primary-hover:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: 16px
  input-default:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    height: 64px
  card-tool:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: 28px
---

# Goblin Toolbox Design System

## Overview

Goblin Toolbox should feel like a well-kept independent newspaper translated into a useful digital workshop: warm, curious, a little mischievous, and easy to scan. Use the visual grammar of print—strong mastheads, editorial hierarchy, column-like groupings, fine rules, small folios, and deliberate whitespace—without making the interface feel old-fashioned or difficult to use.

The page is the newspaper; each tool is a useful column within it. Keep the experience calm and direct. Give every screen one clear lead, make actions easy to find, and let typography and rules create structure instead of a stack of rounded cards.

The approved visual reference is `@index.html`.

## Colors

The palette starts with the user's warm paper and ink colors. Use paper for the main canvas, raised paper for inputs or highlighted surfaces, and deep paper for subtle grouping. Keep ink for primary text, mid ink for supporting copy, and soft ink for metadata. The clay accent marks important actions, selected states, and editorial highlights; olive is a restrained secondary accent for future status or category use.

| Role | Token | Value | Use |
|---|---|---|---|
| Main canvas | `paper` | `#f4ebe0` | Default page background |
| Raised surface | `paper-raised` | `#fbf7f1` | Search fields and featured surfaces |
| Soft grouping | `paper-deep` | `#eadcc9` | Search panels and subtle section backgrounds |
| Primary text | `ink` | `#1d1b18` | Headlines, body text, primary controls |
| Supporting text | `ink-mid` | `#34302b` | Introductory or secondary body copy |
| Quiet text | `ink-soft` | `#6f6961` | Captions, metadata, helper text |
| Standard rule | `rule` | `#b8aa98` | Dividers and input borders |
| Soft rule | `rule-light` | `#d8cabb` | Low emphasis separators |
| Editorial accent | `accent` | `#a64f35` | Links, active navigation, small highlights |
| Strong accent | `accent-dark` | `#78351f` | Accent hover and pressed states |
| Accent wash | `accent-pale` | `#ead2c1` | Selected or highlighted backgrounds |
| Secondary accent | `olive` | `#59604a` | Limited category or status use |

Keep large backgrounds neutral. Do not use the clay accent for long passages of text or as a large page background. Use `ink` on `paper` and `paper-raised` for the strongest text contrast. Keep `ink-soft` for short, non-critical supporting labels; use `ink-mid` when supporting text needs more emphasis.

## Typography

Use **Quicksand** throughout the interface, including Vietnamese UI text. Its rounded forms give the newspaper layout a friendly, contemporary voice. Establish the editorial feeling through scale, weight, tracking, alignment, and rules rather than switching to a serif face.

- Use `display` sparingly for the wordmark or a single page masthead.
- Use `headline` for the lead message of a page. Keep line lengths short and use a strong size contrast against body text.
- Use `title` for tool names and section titles.
- Use `body` for primary reading copy. Preserve its generous line height, especially for Vietnamese text with stacked diacritics.
- Use `body-sm` for descriptions and compact supporting copy.
- Use `label` for buttons, navigation, section labels, and category names. Uppercase labels may use the token's tracking, but keep them short.
- Use `metadata` for folios, dates, counts, and quiet helper labels.

Use the system sans-serif stack as a fallback if Quicksand cannot load. Avoid decorative scripts, condensed display faces, and all-caps body copy.

## Spacing

Use the 4 px base scale. Keep spacing generous around lead content and between major sections; use tighter spacing only inside compact controls and metadata groups. Newspaper density comes from clear hierarchy and aligned columns, not from crowding.

- Use 8–16 px for related text and compact control internals.
- Use 20–32 px for component padding and related content groups.
- Use 40–64 px between major page sections and around the page introduction.
- On small screens, reduce outer margins and section gaps while retaining comfortable text line height and control padding.

## Rounded

Use square corners by default. The system should feel printed and composed, not like a generic pill-based dashboard. Use the `sm` radius only for a small focus detail when a perfectly square edge harms clarity. Reserve `full` for circular indicators or avatars, never for primary buttons or cards.

## Motion

Motion should be quiet and functional. Use the `state-change` timing for hover, focus, and selected-state transitions. Prefer color and underline changes over movement. Avoid parallax, spring effects, and decorative entrance animations.

## Components

- **Primary button:** Ink background, paper text, square corners, compact uppercase label. Hover to `accent-dark`. Phrase the label as an action, such as “Tìm kiếm” or “Mở công cụ”.
- **Secondary button:** Raised paper background with ink text and a clear border. Keep it visually quieter than the primary action.
- **Text input:** Raised paper surface, thin rule border, generous horizontal padding, and a visible focus treatment using ink or accent. Keep labels and helper text outside the field so they remain readable.
- **Tool card:** Use a fine top or side rule to define the card. The featured tool may use `paper-raised`; standard cards stay on the page background. Avoid heavy shadows. Place category/folio metadata first, then icon, title, short description, and one clear action.
- **Navigation:** Use a simple horizontal row with uppercase labels and generous gaps. Mark the current destination with the accent color and a second cue such as an underline or weight change.
- **Dividers:** Prefer 1 px rules in `rule` or `rule-light`. Use a double rule for mastheads or major editorial boundaries only.
- **Search:** Make search a prominent, full-width editorial control. Keep the input visually dominant and the submit action easy to distinguish.

Interactive controls need clear hover, keyboard focus, disabled, and active states. Focus must remain visible against both paper and raised-paper surfaces. Do not communicate state through color alone.

## Layout

Use a centered page with a readable maximum width and responsive outer margins. On wide screens, organize content into editorial columns with thin vertical rules; on narrow screens, stack those columns in reading order. Align titles, dividers, and card edges to a consistent column grid.

Lead with a masthead or page title, followed by primary navigation and a short status or context line when useful. The main page should then show one strong introduction, its primary action or search, and a clearly titled tool collection. Keep peripheral notes and explanatory content below the main task.

Do not force every tool page into a newspaper front page. Reuse the palette, type scale, rules, and spacing, while letting each tool prioritize its task flow.

## Accessibility

- Maintain readable contrast for all essential text and controls. Prefer `ink` or `ink-mid` for text on paper surfaces.
- Keep body text at a comfortable size and line height; do not apply uppercase tracking to sentences or paragraphs.
- Preserve visible keyboard focus and semantic heading order.
- Give icon-only controls an accessible name, and provide text labels for status changes and validation errors.
- Ensure the layout reflows on narrow screens without horizontal scrolling or loss of content order.
