/**
 * Cart Page
 *
 * Server Component that renders the cart page.
 * Delegates all client-side interactivity to CartPageContent.
 *
 * Benefits of Server Component:
 * - Better SEO (pre-rendered HTML)
 * - Smaller client bundle (no page-level JavaScript)
 * - Faster initial page load
 *
 * @module app/(public)/cart/page
 */

import type { Metadata } from "next";
import { CartPageContent } from "./_components/cart-page-content";

// ============================================================================
// Route Segment Config
// ============================================================================

// MIGRATED: Removed export const dynamic = 'force-dynamic' (incompatible with Cache Components)
// Note: Cart data is client-side only (sessionStorage) - dynamic by default
// TODO: Consider if static shell with Suspense improves loading after build verification

// ============================================================================
// Metadata
// ============================================================================

export const metadata: Metadata = {
  description:
    "Revisa y ajusta tus configuraciones de ventanas antes de generar una cotización formal",
  title: "Carrito de Presupuesto",
};

// ============================================================================
// Page Component (Server Component)
// ============================================================================

/**
 * Cart page - Server Component
 *
 * Renders the cart page with metadata and delegates interactivity to client component
 */
export default function CartPage() {
  return <CartPageContent />;
}
