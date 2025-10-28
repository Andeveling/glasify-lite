"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  LayoutGrid,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AddedToCartActionsProps = {
  modelName: string;
  onConfigureAnotherAction: () => void;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * Post-Add Actions Component
 *
 * Displays clear action options after successfully adding an item to cart.
 * Follows "Don't Make Me Think" principle with explicit, actionable choices.
 * Accepts ref prop for auto-scroll functionality.
 * Uses Framer Motion for smooth entrance animation.
 *
 * @component
 */
export function AddedToCartActions({
  modelName,
  onConfigureAnotherAction,
  ref,
}: AddedToCartActionsProps) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      ref={ref}
      transition={{
        duration: 0.4,
        ease: "easeOut",
        y: { damping: 15, stiffness: 100, type: "spring" },
      }}
    >
      <Card className="border-2 border-success/50 bg-success/5 p-6">
        <div className="flex flex-col gap-6">
          {/* Success Message */}
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-success">
                ¡Agregado exitosamente!
              </h3>
              <p className="mt-1 text-muted-foreground text-sm">
                <strong>{modelName}</strong> ha sido agregado a tu carrito
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Primary Action: Configure Another */}
            <Button
              className="flex-1 justify-start gap-2"
              onClick={onConfigureAnotherAction}
              size="lg"
              variant="default"
            >
              <RotateCcw className="size-5" />
              <span>Configurar otro {modelName}</span>
            </Button>

            {/* Secondary Actions */}
            <div className="flex gap-3 sm:flex-row">
              <Button
                asChild
                className="flex-1 justify-start gap-2 sm:flex-initial"
                size="lg"
                variant="outline"
              >
                <Link href="/catalog" prefetch>
                  <LayoutGrid className="size-5" />
                  <span className="sm:hidden">Explorar catálogo</span>
                  <span className="hidden sm:inline">Catálogo</span>
                </Link>
              </Button>

              <Button
                asChild
                className="flex-1 justify-start gap-2 sm:flex-initial"
                size="lg"
                variant="outline"
              >
                <Link href="/cart" prefetch>
                  <ShoppingCart className="size-5" />
                  <span className="sm:hidden">Ver carrito</span>
                  <span className="hidden sm:inline">Carrito</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-center text-muted-foreground text-xs sm:text-left">
            Puedes continuar agregando items o proceder a generar tu cotización
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
