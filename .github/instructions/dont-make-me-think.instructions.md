---
description: 'UX/UI Design and Frontend Interaction Guidelines — based on "Don’t Make Me Think" and UX Laws'
applyTo: '**/*.{tsx,jsx,ts,js}'
---

# UX/UI Design Guidelines

> These rules guide how components, layouts, and interfaces should feel and behave.  
> The goal: **make every interaction effortless, predictable, and human-centered.**

---

## Core Intent

- Design for **clarity, not cleverness** — interfaces should explain themselves.  
- Reduce **cognitive load**: the user should never stop to think, “what now?”.  
- Reuse familiar patterns; innovation is for solving real pain points, not for decoration.  
- Prioritize **consistency, feedback, and simplicity** in every component.

---

## Heuristics of Interaction (Nielsen)

1. **Visibility of System Status** – Always show progress, loading, or results.  
2. **Match Between System and Real World** – Use familiar language and metaphors.  
3. **User Control and Freedom** – Allow undo, cancel, and clear exits.  
4. **Consistency and Standards** – Keep UI behaviors uniform across screens.  
5. **Error Prevention** – Anticipate mistakes before they happen.  
6. **Recognition Over Recall** – Show options rather than forcing memory.  
7. **Flexibility and Efficiency** – Shortcuts for experts, clarity for beginners.  
8. **Aesthetic and Minimalist Design** – Every pixel must justify its existence.  
9. **Help Users Recover from Errors** – Clear, human error messages.  
10. **Help and Documentation** – Offer concise, contextual guidance.

---

## UX Laws & Cognitive Principles

- **Hick’s Law** → Fewer options = faster decisions.  
- **Fitts’ Law** → Make targets large and within easy reach.  
- **Jakob’s Law** → People expect your product to work like others they know.  
- **Miller’s Law** → Keep choices within 7±2 visible elements.  
- **Law of Prägnanz** → Favor simplicity and recognizable shapes.  
- **Peak-End Rule** → Users remember the best moment and the end — design those intentionally.

---

## Layout & Component Design

- Follow **Atomic Design**: atoms → molecules → organisms → templates → pages.  
- Use **consistent spacing, color, and typography tokens** from the Design System.  
- Ensure **visual hierarchy** (contrast, proximity, alignment, repetition).  
- Keep interfaces **accessible (WCAG 2.1)** and responsive.  
- Provide **instant feedback** on any user action (hover, click, submit).  
- Default states must guide; empty states must educate.

---

## Accessibility & Inclusivity (A11y)

- Use semantic HTML elements (`<button>`, `<label>`, `<nav>`).  
- Provide `aria-label` and keyboard focus support.  
- Maintain color contrast ratios (minimum 4.5:1).  
- Never rely on color alone to convey meaning.  
- Test with screen readers or simulated vision modes.

---

## Writing for Interfaces (UX Writing)

- Prefer **plain language** and short sentences.  
- Use verbs for actions (“Guardar”, “Enviar”, “Cancelar”).  
- Error messages: be **human, specific, and helpful**.  
- Labels > placeholders — clarity beats aesthetics.  
- Maintain consistent tone aligned with brand personality.

---

## Motion & Feedback

- Use motion **only to support context**, never as decoration.  
- Duration: 150–300 ms for transitions, 400–500 ms for modal/dialogs.  
- Provide tactile feedback (microinteractions) on success, error, or hover.  
- Keep transitions consistent across the app.

---

## Testing & Validation

- Conduct quick **usability checks** before merge.  
- Validate components in context (not isolated visuals only).  
- Use **Playwright or Testing Library** for interaction and accessibility tests.  
- Gather feedback from real users or QA on clarity and perceived control.

---

## Mindset

> “Good design disappears — the user simply flows.”  
> Design each component as if it’s the first time someone touches a computer.

---
