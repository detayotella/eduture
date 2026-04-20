# Design System Specification: Adaptive Learning

## 1. Overview & Creative North Star
**Creative North Star: The Intellectual Atelier**

This design system moves beyond the cold, utilitarian nature of traditional EdTech. It is built to feel like a high-end digital sanctuary for the mind—a space that prioritizes **Cognitive Fluidity** over rigid structures. We reject the "dashboard" aesthetic in favor of an **Editorial Intelligence** approach. 

By leveraging intentional asymmetry, high-contrast typographic scales, and tonal layering, we create a system that feels alive and responsive. The interface does not just "display" data; it curates an atmosphere of **Calm Authority**. Every element is designed to recede into the background until needed, allowing the learner's focus to remain on the mastery of content.

---

## 2. Color & Surface Philosophy

The color strategy is rooted in a warm, sophisticated palette that avoids the sterility of pure whites. We utilize a "Material-Editorial" hybrid model to achieve depth without clutter.

### Surface Hierarchy & The "No-Line" Rule
Traditional UI relies on 1px borders to define sections. **This system prohibits 1px solid borders for sectioning.** 

Instead, boundaries are defined through **Tonal Transitions**:
- **Background (`#fff8f2`)**: The foundational canvas.
- **Surface Container Lowest (`#ffffff`)**: Used for primary interactive cards to create a "lift" from the warm background.
- **Surface Container Low (`#faf2eb`)**: Sub-sections or secondary navigation.
- **Surface Container High (`#eee7e0`)**: Active states or highlighted secondary content.

### The Glass & Gradient Rule
To achieve "Adaptive Transparency," floating elements (modals, dropdowns, floating progress bars) should utilize **Glassmorphism**:
- **Formula:** `surface` color at 70% opacity + `backdrop-filter: blur(20px)`.
- **Signature Textures:** For high-impact CTAs, use a subtle linear gradient from `primary` (`#0051d5`) to `primary_container` (`#316bf3`) at a 135-degree angle. This adds "soul" and prevents the interface from feeling flat and mechanical.

---

## 3. Typography: The Voice of Authority

We use **Inter** for its modern clarity and **JetBrains Mono** for technical/data-driven insights. The hierarchy is aggressive; large displays contrast with tightly controlled body copy to create an editorial feel.

| Role | Token | Size | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Display LG** | `display-lg` | 3.5rem | 1.1 | -0.02em |
| **Headline MD**| `headline-md` | 1.75rem | 1.2 | -0.01em |
| **Title LG**   | `title-lg` | 1.375rem | 1.4 | 0 |
| **Body LG**    | `body-lg` | 1.0rem | 1.625 | 0 |
| **Label MD**   | `label-md` | 0.75rem | 1.5 | +0.05em (Caps) |

**Editorial Note:** For long-form learning content, always use `body-lg` with a maximum line length of 65 characters to ensure "Frictionless Assessment" and reading ease.

---

## 4. Elevation & Depth

We eschew "boxy" design in favor of **Ambient Layering**.

*   **The Layering Principle:** Depth is achieved by stacking surface tiers. A `surface_container_lowest` card sitting on a `surface_container_low` background creates a natural, soft lift.
*   **Ambient Shadows:** When shadows are required (e.g., a floating Mastery Card), use a double-layered shadow:
    *   *Layer 1:* `0 4px 20px rgba(30, 27, 23, 0.04)`
    *   *Layer 2:* `0 2px 8px rgba(30, 27, 23, 0.08)`
*   **The Ghost Border Fallback:** If a container lacks sufficient contrast, use a "Ghost Border": `outline_variant` (`#c2c6d6`) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `md` (0.75rem) radius. Subtle shadow on hover.
*   **Secondary:** `surface_container_highest` background with `on_surface` text. No border.
*   **Tertiary:** Transparent background, `primary` text. Use for low-emphasis actions like "Cancel" or "View Details."

### Adaptive Learning Chips
Used to identify learning styles (Activist, Reflector, etc.). 
*   **Style:** Semi-transparent background (20% opacity of the semantic color) with a solid 2px "dot" indicator of the same color. This mimics "Adaptive Transparency."

### Cards & Lists
*   **The Divider Rule:** Strictly forbid the use of horizontal divider lines. Use **8px/16px/24px Spacing Scale** to create separation through whitespace. 
*   **Mastery Progression Cards:** Use `surface_container_lowest` for the card body. Use a `primary` 4px vertical "accent bar" on the left edge to denote focus, rather than an outline.

### Input Fields
*   **Style:** Minimalist. No background fill—only a `surface_variant` bottom border (2px). Upon focus, the border transitions to `primary` and a subtle `surface_container_low` background fades in.

---

## 6. Do’s and Don’ts

### Do
*   **Do use asymmetrical layouts.** Align a headline to the left but push the body copy 1/3 to the right to create "Cognitive Fluidity."
*   **Do use JetBrains Mono** for progress percentages and time-stamps to provide a "technical/academic" precision.
*   **Do prioritize whitespace.** If a screen feels "busy," increase the vertical spacing between surface containers rather than adding borders.

### Don't
*   **Don't use pure black.** Use `on_surface` (`#1e1b17`) for all text to maintain the "Warm Neutral" professional tone.
*   **Don't use hard corners.** Always apply the `DEFAULT` (0.5rem) or `md` (0.75rem) radius to soften the academic authority.
*   **Don't use standard "Error Red" boxes.** Use the `error_container` (`#ffdad6`) background with `on_error_container` text for a more sophisticated, less alarming "Mastery Progression" feedback loop.

---

## 7. Learning Style Tokens
*   **Activist:** `#f97316` (Energy/Movement)
*   **Reflector:** `#8b5cf6` (Depth/Thought)
*   **Theorist:** `#0ea5e9` (Logic/Structure)
*   **Pragmatist:** `#10b981` (Action/Result)

*Apply these colors as subtle accents (icons, progress pips, or "Ghost Border" tints) only when content is specifically tailored to that style.*