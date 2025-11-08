# Cart Module - Clean Architecture with Drizzle ORM

## Overview

The cart module manages shopping cart operations using a clean architecture pattern with Drizzle ORM. All business logic is separated from presentation layer.

## Architecture

```
cart/
├── index.ts                    # Thin router (composition only)
├── cart.queries.ts             # Read operations (getCart)
├── cart.mutations.ts           # Write operations (add, update, remove, clear)
├── cart.service.ts             # Business logic orchestration
├── cart.schemas.ts             # Zod validation schemas
├── cart.utils.ts               # Price calculation & serialization
├── repositories/
│   └── cart-repository.ts      # Data access layer (Drizzle queries)
└── utils/
    └── cart-logger.ts          # Structured logging utilities
```

## Layer Responsibilities

### 1. Repository Layer (`repositories/cart-repository.ts`)

**Purpose**: Pure data access functions using Drizzle ORM.

**Functions**:
- `findOrCreateCart(db, userId)` - Get or create user's draft cart
- `findDraftCart(db, userId)` - Find existing draft cart
- `createCartItem(db, data)` - Insert new cart item
- `findCartItemById(db, itemId)` - Fetch single item
- `updateCartItem(db, itemId, data)` - Update item fields
- `deleteCartItem(db, itemId)` - Delete single item
- `deleteAllCartItems(db, cartId)` - Clear all items
- `listCartItems(db, cartId)` - Fetch items with joins (model, glassType)
- `findModelById(db, modelId)` - Validate model exists
- `findGlassTypeById(db, glassTypeId)` - Validate glass type exists
- `findColorById(db, colorId)` - Validate color exists

**Rules**:
- No business logic
- No error handling (let errors propagate)
- Only database operations
- Returns raw Drizzle types

### 2. Service Layer (`cart.service.ts`)

**Purpose**: Business logic orchestration.

**Functions**:
- `addItemToCart(db, userId, data)` - Validate, calculate price, create item
- `updateCartItemById(db, itemId, data)` - Update name/quantity, recalculate price
- `removeItemFromCart(db, itemId)` - Delete item
- `clearUserCart(db, userId)` - Delete all user's cart items
- `getUserCartItems(db, userId)` - Fetch and serialize cart items

**Responsibilities**:
- Validation (model, glass type, color existence)
- Price calculations (via utils)
- Error handling (Spanish TRPCError messages)
- Logging (via cart-logger)
- Serialization (convert Drizzle types to API types)

### 3. Utilities Layer

#### Price Calculation (`cart.utils.ts`)

**Functions**:
- `calculateItemSubtotal(model, dimensions, quantity)` - Apply pricing formula
- `calculateUnitPrice(subtotal, quantity)` - Compute per-unit price
- `serializeCartItem(item)` - Convert Drizzle strings to numbers
- `serializeCartItemWithRelations(item)` - Format with joined data

**Pricing Formula**:
```typescript
subtotal = (
  basePrice + 
  (costPerMmHeight * heightMm) + 
  (costPerMmWidth * widthMm)
) * quantity
```

#### Logging (`utils/cart-logger.ts`)

**Purpose**: Structured logging for all cart operations.

**Functions**:
- `logItemAdd*` - Track item additions
- `logItemUpdate*` - Track item updates
- `logItemRemove*` - Track item removals
- `logCartClear*` - Track cart clearing
- `logCartFetch*` - Track cart fetches
- `logModelNotFound`, `logGlassTypeNotFound`, `logColorNotFound` - Validation failures
- `logPriceCalculation` - Price computation details

### 4. tRPC Layer

#### Queries (`cart.queries.ts`)

**Procedures**:
- `getCart` - Fetch all items in user's cart (public)

#### Mutations (`cart.mutations.ts`)

**Procedures**:
- `addItem` - Add item to cart (protected)
- `updateItem` - Update item name/quantity (protected)
- `removeItem` - Remove single item (protected)
- `clearCart` - Clear all items (protected)

**Rules**:
- Thin procedures (no logic)
- Delegate to service layer
- Input validation via schemas
- Output typing via schemas

#### Router (`index.ts`)

**Purpose**: Compose queries and mutations into single router.

```typescript
export const cartRouter = createTRPCRouter({
  ...cartQueries._def.procedures,
  ...cartMutations._def.procedures,
});
```

## Data Model

### Cart = Quote (status="draft")

```typescript
{
  id: string (CUID2)
  userId: string
  status: "draft" | "sent" | "approved" | ...
  createdAt: Date
  updatedAt: Date
}
```

### Cart Item = QuoteItem

```typescript
{
  id: string (CUID2)
  quoteId: string (cart ID)
  modelId: string
  glassTypeId: string
  colorId: string | null
  name: string (user-editable)
  quantity: number (default: 1)
  roomLocation: string | null
  widthMm: number
  heightMm: number
  accessoryApplied: boolean (default: false)
  subtotal: string (NUMERIC - converted to number)
  // Color snapshots (immutability)
  colorSurchargePercentage: string | null (NUMERIC)
  colorHexCode: string | null
  colorName: string | null
  createdAt: Date
  updatedAt: Date
}
```

## Type System

### Type Inference

```typescript
type DbClient = typeof db;
```

**Why**: Drizzle doesn't export a `DrizzleDb` type. Use type inference from the singleton instance.

### Decimal Handling

Drizzle stores PostgreSQL `NUMERIC` as strings. Convert with:

```typescript
const subtotalNum = Number.parseFloat(item.subtotal);
const percentage = item.colorSurchargePercentage 
  ? Number.parseFloat(item.colorSurchargePercentage) 
  : null;
```

### Integer Fields

`heightMm` and `widthMm` are **numbers** (not strings) in Drizzle schema.

## Validation

### Required Validations

1. **Model Exists**: `findModelById(db, modelId)` must return record
2. **Glass Type Exists**: `findGlassTypeById(db, glassTypeId)` must return record
3. **Color Exists** (if provided): `findColorById(db, colorId)` must return record
4. **Dimensions Positive**: `heightMm > 0` and `widthMm > 0`
5. **Quantity Positive**: `quantity > 0`

### Error Messages (Spanish)

```typescript
"Modelo no encontrado"
"Tipo de vidrio no encontrado"
"Color no encontrado"
"El artículo del carrito no fue encontrado"
"No se pudo crear o encontrar el carrito del usuario"
"Ocurrió un error inesperado al agregar el artículo"
```

## Testing Guidelines

### Unit Tests

Test each layer independently:

```typescript
// Repository tests (use test database)
describe("cart-repository", () => {
  it("should create cart item", async () => {
    const item = await createCartItem(db, validData);
    expect(item).toBeDefined();
  });
});

// Service tests (mock repository)
describe("cart-service", () => {
  it("should validate model exists", async () => {
    // Mock findModelById to return null
    await expect(addItemToCart(db, userId, invalidData))
      .rejects.toThrow("Modelo no encontrado");
  });
});
```

### Integration Tests

Test full tRPC procedure flow:

```typescript
describe("cart mutations", () => {
  it("should add item to cart", async () => {
    const caller = appRouter.createCaller({ db, session });
    const item = await caller.cart.addItem(validInput);
    expect(item.subtotal).toBeGreaterThan(0);
  });
});
```

## Migration Notes

### From Prisma to Drizzle

1. **No `DrizzleDb` type**: Use `type DbClient = typeof db`
2. **NUMERIC as strings**: Convert with `Number.parseFloat()`
3. **Integer fields**: Already numbers (no conversion)
4. **No `.include()`**: Use `leftJoin()` instead
5. **Returning values**: Use `.returning()` on inserts/updates

### Breaking Changes

None - API contracts remain the same (Zod schemas unchanged).

## Future Enhancements

1. **Batch Operations**: Add `addMultipleItems` mutation
2. **Cart Persistence**: Merge anonymous carts on login
3. **Price History**: Track price changes over time
4. **Expiration**: Auto-delete old draft carts
5. **Optimistic Locking**: Prevent concurrent modifications

## Troubleshooting

### "Variable shadows another variable"

**Status**: ⚠️ Acceptable warning  
**Reason**: Parameter names (`db`) don't conflict with imported values

### "NUMERIC field is string"

**Fix**: Convert with `Number.parseFloat()`

```typescript
const subtotal = Number.parseFloat(item.subtotal);
```

### "Type 'DrizzleDb' not found"

**Fix**: Use type inference

```typescript
type DbClient = typeof db; // Not: import { DrizzleDb }
```

## Performance Considerations

### Database Indexes

Ensure indexes exist on:
- `quoteItems.quoteId` (cart lookup)
- `quoteItems.modelId` (joins)
- `quoteItems.glassTypeId` (joins)
- `quotes.userId` (user cart lookup)
- `quotes.status` (draft cart filter)

### Query Optimization

- Use `leftJoin()` for optional relations (colors)
- Fetch related data in single query (no N+1)
- Return only required fields from validation queries

## References

- Clean Architecture: [catalog module](../catalog/README.md)
- Drizzle Docs: [drizzle.team/docs](https://orm.drizzle.team/)
- tRPC Best Practices: [trpc.io/docs/best-practices](https://trpc.io/docs/best-practices)
