# Code Style and Conventions

## Language Rules
- **Code, comments, commit messages**: English only
- **UI text, error messages**: Spanish (es-LA) only
- **Example**: Code has `calculatePrice()` function, UI shows "Calcular Precio"

## Naming Conventions
- **Files**: kebab-case (`quote-calculator.ts`, `glass-type-selector.tsx`)
- **Components**: PascalCase (`QuoteForm`, `GlassTypeSelector`)  
- **Variables/Functions**: camelCase (`calculatePrice`, `glassType`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GLASS_THICKNESS`, `DEFAULT_MARGIN`)
- **Database entities**: PascalCase (`Manufacturer`, `QuoteItem`)
- **tRPC procedures**: kebab-case (`quote.calculate-item`, `catalog.list-models`)

## Domain Language (Spanish for UI)
- "Cotización" not "Quote"
- "Vidrio" not "Glass"  
- "Modelo" not "Model"
- "Fabricante" not "Manufacturer"
- "Presupuesto" not "Budget"

## Code Quality Tools
- **Primary**: Ultracite (extends Biome configuration)
- **Formatter**: Biome with 2-space indentation, 120 line width
- **Linting**: Comprehensive Biome rules with accessibility, complexity, and style checks
- **Pre-commit**: Lefthook runs Ultracite fix on staged files
- **Commit Messages**: Conventional commits includes body description (English) with commitlint

## TypeScript Configuration
- Strict mode enabled
- No `any` type usage (warn level)
- Prefer `as const` over literal types
- Use `export type` and `import type` for types
- No TypeScript enums (use const objects or unions instead)