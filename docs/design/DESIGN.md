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
shadows:
  print-sm: "3px 3px 0 {colors.rule}"
  print-md: "3px 3px 0 {colors.ink}"
  print-lg: "7px 7px 0 {colors.ink}"
  print-accent: "3px 3px 0 {colors.accent}"
motion:
  state-change:
    duration: 160ms
    timingFunction: ease-out
  lift:
    duration: 220ms
    timingFunction: cubic-bezier(0.2, 0.8, 0.2, 1)
  enter:
    duration: 560ms
    timingFunction: cubic-bezier(0.2, 0.8, 0.2, 1)
    stagger: 60ms
  page:
    duration: 280ms
    timingFunction: cubic-bezier(0.2, 0.8, 0.2, 1)
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
    rounded: "{rounded.md}"
    height: 64px
    shadow: "{shadows.print-sm}"
  input-default-focus:
    shadow: "5px 5px 0 {colors.ink}"
  card-tool:
    backgroundColor: "{colors.paper-raised}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: 28px
    border: "1px solid {colors.ink}"
    shadow: "{shadows.print-sm}"
  card-tool-hover:
    transform: "translate(-3px, -3px)"
    shadow: "{shadows.print-lg}"
  icon-tile:
    backgroundColor: "{colors.accent-pale}"
    textColor: "{colors.accent-dark}"
    rounded: "{rounded.md}"
    size: 56px
    border: "1px solid {colors.ink}"
  chip:
    textColor: "{colors.olive}"
    typography: "{typography.metadata}"
    rounded: "{rounded.full}"
    border: "1px solid {colors.olive}"
  segmented-toggle:
    backgroundColor: "{colors.paper-raised}"
    selectedBackgroundColor: "{colors.ink}"
    selectedTextColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
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

## Rounded and shadows

Corners stay nearly square so the system feels printed, not like a pill-based dashboard. Use `md` (4 px) for cards, inputs, icon tiles and toggles, `sm` inside small controls, and `none` for rules and full-width bands. Reserve `full` for chips, circular badges and indicators, never for primary buttons or cards.

Depth comes from print-style offset shadows: a solid block offset down and right, with no blur, like a second plate printed slightly off register. `print-sm` (in `rule`) marks a raised surface at rest; `print-md` and `print-accent` mark a brand mark or a pressed-looking primary action; `print-lg` (in `ink`) is the hover or focus state of a card or the search field. Never use blurred drop shadows.

## Motion

Motion is lively but short, and always tells the reader something: where they are going, what can be clicked, what just changed.

- `state-change`: color, border and underline changes on hover, focus and selection.
- `lift`: hover on cards and buttons. A card moves up-left by 3 px while its shadow grows from `print-sm` to `print-lg`; its icon tilts slightly and its arrow slides right. A pressed button moves into its shadow.
- `enter`: content rises 14 px and fades in when a page opens. Items in a list or grid start one `stagger` after another, at most 6 steps.
- `page`: route changes use the View Transitions API, a short cross-fade with a small rise. Browsers without it change page with no animation.
- Hero decoration: the light halftone stays still; a spot of `ink` dots, about 180 px across, trails the mouse with a soft ease and fades out when the pointer leaves the hero (nothing on touch screens). The stamp turns once every 40 s for 10 turns, then rests.
- Animate only `transform` and `opacity` (and `background-position` for the halftone). No scroll-jacking or bouncing.
- Under `prefers-reduced-motion: reduce` only the page slide is removed (pages cross-fade instead). Entrance, hover, the typing hint, the dot spotlight and the stamp's 10 turns stay on: a product decision, see Phase 6.

## Components

- **Primary button:** Ink background, paper text, square corners, compact uppercase label. Hover to `accent-dark`. Phrase the label as an action, such as “Tìm kiếm” or “Mở công cụ”.
- **Secondary button:** Raised paper background with ink text and a clear border. Keep it visually quieter than the primary action.
- **Text input:** Raised paper surface, thin rule border, generous horizontal padding, and a visible focus treatment using ink or accent. Keep labels and helper text outside the field so they remain readable.
- **Tool card:** `paper-raised` surface, 1 px ink border, `md` corners and a `print-sm` shadow that grows to `print-lg` on hover. Top row: the tool's icon tile on the left and its vault chip on the right; then the title, a short description, and an "Open tool" action with an arrow at the bottom. The whole card is one link. Cards sit in a 3-column grid on desktop and one column on phones.
- **Icon tile:** the tool's icon in `accent-dark` on an `accent-pale` square with an ink border. Tool icons come from the tool's manifest and are painted in `currentColor` through a CSS mask; Host icons are line icons (Lucide, 2 px stroke) in `currentColor`.
- **Chip:** small uppercase metadata in `olive` with a thin `olive` border and `full` corners; used for vault names.
- **Navigation:** a horizontal row of uppercase labels, each with a 16 px icon before it. Mark the current destination with the accent color and a 2 px underline. On phones (640 px and below) the brand sits next to a menu button; the button opens a panel under the masthead with the nav as a full-width list (48 px rows, the current page on `accent-pale`) and the language toggle. The panel grows from zero height with `grid-template-rows` and its items rise in turn; choosing a link or pressing Escape closes it, and a closed panel is out of the tab order. Under reduced motion it only fades.
- **Masthead:** sticky, translucent paper with a background blur, ending in the double rule. Brand mark (an ink square with an accent `print-accent` shadow) and wordmark on the left, nav and language toggle on the right.
- **Language toggle:** a segmented control with `EN` and `VI`; the selected segment is ink with paper text. Each segment is a button with `aria-pressed`.
- **Breadcrumb:** Home › vault › tool in `body-sm`, chevron separators in `rule`, the current page in `ink`.
- **Skeleton:** blocks in `paper-deep` with a slow shimmer, shaped like the content that is loading; the region has `role="status"` and a text label.
- **Dividers:** Prefer 1 px rules in `rule` or `rule-light`. Use a double rule for mastheads, footers and major editorial boundaries only.
- **Search:** a prominent, full-width field with a search icon on the left and a clear button on the right once there is text. Results filter as the user types; there is no submit button. On focus the field takes the `print-lg`-style ink shadow. While the field is empty, an animated placeholder types a search hint letter by letter after a blinking accent caret, holds it, deletes it and moves to the next hint (type about 95 ms per letter, hold 1.6 s, delete about 45 ms per letter). After two rounds it rests on the last hint and the caret goes away; focusing the field stops it at once. The hints come from the Host's i18n strings. The animated text is decoration (`aria-hidden`); the field's visible label names it.
- **Footer:** the double rule, then a row with the wordmark and nav links, then a centered copyright line (`© <current year> Goblin Toolbox`) under a light rule at the very bottom.
- **Hero decoration:** a halftone dot pattern in a slightly darker paper tone, fading in from one side, with a spot of ink dots under the mouse; and a round stamp with the brand line set on a circle. Both are decorative (`aria-hidden`).

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
