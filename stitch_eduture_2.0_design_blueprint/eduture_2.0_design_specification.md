# EDUTURE 2.0 — Design Specification & UX Guidelines
## Adaptive Learning System — Interface Design Blueprint
---
## 1. Design Philosophy & Principles
### Core UX Vision
> *"An intelligent learning companion that feels personal, responsive, and empowering — adapting to each learner without them noticing the complexity behind it."*
### Design Principles
| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Cognitive Fluidity** | Reduce mental load at every step. Never make the learner think about *how* to use the system. | Progressive disclosure, contextual help, predictive UI |
| **Adaptive Transparency** | The system adapts, but the learner feels in control. Never say "The AI chose this for you." Instead: "Based on your progress..." | Human-centric copy, visible reasoning, override options |
| **Mastery Progression** | Every interaction should make the learner feel more capable than before. | Clear progress indicators, celebratory micro-moments, skill trees |
| **Frictionless Assessment** | Testing shouldn't feel like testing. It should feel like validation of knowledge. | Embedded assessments, immediate feedback, low-stakes environment |
| **Calm Authority** | The interface should feel trustworthy, academic, yet modern. Never clinical or cold. | Warm neutrals, confident typography, purposeful whitespace |
---
## 2. User Personas & Contexts
### Primary: The Learner (Alex)
- **Context**: Studying ICDL modules, possibly after work, often on a laptop/tablet
- **Goal**: Pass certification efficiently, feel confident in skills
- **Frustration**: Boring e-learning, rigid sequences, not knowing what to do next
- **Tech comfort**: Moderate — uses web apps daily but isn't technical
**Emotional Journey Map:**
1. **Discovery**: Curious but skeptical ("Another learning platform?")
2. **Onboarding**: Wants quick setup, hates long forms ("Just let me start!")
3. **Learning**: Needs focus, minimal distractions ("Help me stay in flow")
4. **Assessment**: Anxious about failure ("What if I fail?")
5. **Completion**: Proud, wants to share/verify achievement ("I did it!")
### Secondary: The Admin/Researcher (Dr. Chen)
- **Context**: Monitoring A/B test results, learner progress, system health
- **Goal**: Clear data visualization, actionable insights, easy export
- **Frustration**: Cluttered dashboards, statistical ambiguity
- **Tech comfort**: High — needs raw data access
---
## 3. Design System
### 3.1 Color Palette
**Primary Colors**
```css
--color-primary-50:  #eff6ff;   /* Hover backgrounds */
--color-primary-100: #dbeafe;   /* Light accents */
--color-primary-500: #3b82f6;   /* Primary actions, links */
--color-primary-600: #2563eb;   /* Button hover, active states */
--color-primary-700: #1d4ed8;   /* Headings emphasis */
--color-primary-900: #1e3a8a;   /* Deep brand moments */
```
**Semantic Colors**
```css
--color-success: #10b981;       /* Completion, correct answers, progress */
--color-warning: #f59e0b;       /* Caution, time running low */
--color-error: #ef4444;         /* Errors, incorrect answers */
--color-info: #06b6d4;          /* Hints, tips, adaptive notices */
/* Semantic backgrounds (low saturation for calmness) */
--color-success-bg: #ecfdf5;
--color-warning-bg: #fffbeb;
--color-error-bg: #fef2f2;
--color-info-bg: #ecfeff;
```
**Neutral Scale (Warm Greys)**
```css
--color-white: #ffffff;
--color-gray-50: #fafaf9;       /* Page backgrounds */
--color-gray-100: #f5f5f4;      /* Card backgrounds */
--color-gray-200: #e7e5e4;      /* Borders, dividers */
--color-gray-400: #a8a29e;      /* Placeholder text */
--color-gray-600: #57534e;      /* Body text */
--color-gray-800: #292524;      /* Headings */
--color-gray-900: #1c1917;      /* Maximum contrast text */
```
**Learning Style Accent Colors** (Used subtly in profile/badges)
```css
--style-activist: #f97316;      /* Energetic orange */
--style-reflector: #8b5cf6;     /* Thoughtful purple */
--style-theorist: #0ea5e9;      /* Analytical blue */
--style-pragmatist: #10b981;    /* Practical green */
```
### 3.2 Typography
```css
/* Font Stack */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
/* Scale (Major Third - 1.25) */
--text-xs: 0.75rem;     /* 12px - Captions, timestamps */
--text-sm: 0.875rem;    /* 14px - Secondary text, labels */
--text-base: 1rem;      /* 16px - Body text */
--text-lg: 1.125rem;    /* 18px - Lead paragraphs */
--text-xl: 1.25rem;     /* 20px - Small headings */
--text-2xl: 1.5rem;     /* 24px - Section headings */
--text-3xl: 1.875rem;   /* 30px - Page titles */
--text-4xl: 2.25rem;    /* 36px - Hero moments */
/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
/* Line Heights */
--leading-tight: 1.25;  /* Headings */
--leading-normal: 1.5;  /* Body */
--leading-relaxed: 1.625; /* Long reading content */
```
**Typography Rules:**
- **Headings**: Tight line height, semibold, gray-800
- **Body**: Relaxed line height for reading content (>60 characters)
- **Maximum line length**: 65ch for reading content (optimal reading)
- **Labels/Buttons**: Uppercase tracking-wide only for tiny labels (10-11px), never for buttons
---
## 13. Design Deliverables Checklist
For the designer to provide:
### High-Fidelity Mockups
- [ ] **Landing Page** (Desktop + Mobile)
- [ ] **Authentication** (Login/Register)
- [ ] **Questionnaire Flow** (Question card, progress, results)
- [ ] **Dashboard** (Learner home, all states)
- [ ] **Module Browser** (Grid, detail view)
- [ ] **Learning Experience** (All 4 content types: Theory, Example, Activity, Exercise)
- [ ] **Assessment** (Question view, review mode, results)
- [ ] **Progress Page** (Stats, charts, activity feed)
- [ ] **Admin Dashboard** (Analytics, tables, exports)