---
description: "UX/UI design principles to ensure intuitive and user-friendly interfaces."
applyTo: "**/*.{ts,js,tsx,jsx}"
---

# UX/UI Principles: Don't Make Me Think

## Core Philosophy

Follow Steve Krug's "Don't Make Me Think" principles: interfaces should be self-evident, requiring minimal cognitive load. Every question mark users have adds to cognitive burden and reduces usability.

## Implementation Guidelines

### Clarity Over Cleverness

- **Self-explanatory interfaces**: Elements should be obvious without explanation
- **Clear labels**: Use familiar, descriptive terms (not clever or branded terms)
- **Obvious clickability**: Make interactive elements look interactive
- **Immediate feedback**: Actions should have clear, immediate consequences

### Navigation & Information Architecture

- **Persistent navigation**: Keep navigation consistent and visible
- **Clear hierarchy**: Use visual hierarchy (size, color, position) to show importance
- **Breadcrumbs**: Help users understand their location in the site
- **Search prominence**: Make search easily accessible when needed

### Visual Design Principles

- **Format for scanning**: Users scan, they don't read
  - Clear visual hierarchy
  - Conventional layout patterns
  - Break pages into clearly defined areas
  - Use headings effectively
  - Keep paragraphs short
  - Use bullet points and lists

### Reduce Cognitive Load

- **Minimize choices**: Eliminate unnecessary options
- **Progressive disclosure**: Show only what's needed at each step
- **Smart defaults**: Pre-select the most common options
- **Clear CTAs**: Make primary actions obvious and distinctive

## Usability Testing Mindset

- Test with real users early and often
- Watch for moments of hesitation or confusion
- Ask "Can users figure out what to do without instructions?"
- Fix top usability issues before adding features

## Practical Application Checklist

- Can users identify what's clickable instantly?
- Is the main navigation always visible?
- Are form labels clear and adjacent to inputs?
- Do buttons clearly indicate their action?
- Is the visual hierarchy obvious?
- Are error messages helpful and actionable?
- Can users complete tasks without external help?
- Is loading state clearly communicated?

## Integration with shadcn/ui

shadcn/ui components are built with these principles in mind:

- Clear visual states (hover, active, disabled)
- Accessible by default (ARIA labels, keyboard navigation)
- Conventional patterns users recognize
- Consistent behavior across components
