"use client";

/**
 * Cart Item Image Component
 *
 * Displays model image with optimized loading and fallback placeholder.
 * Uses Next.js Image for automatic optimization.
 */

import Image from "next/image";
import {
  CART_ITEM_IMAGE_SIZE,
  DEFAULT_MODEL_PLACEHOLDER,
} from "../_constants/cart-item.constants";

type CartItemImageProps = {
  /**
   * Model image URL (null/undefined shows placeholder)
   */
  modelImageUrl: string | null | undefined;
  /**
   * Model name for alt text accessibility
   */
  modelName: string;
};

/**
 * Cart item image with fallback placeholder
 *
 * Displays model thumbnail at 80x80px with rounded corners and border.
 * Falls back to placeholder image when modelImageUrl is missing or empty.
 */
export function CartItemImage({
  modelImageUrl,
  modelName,
}: CartItemImageProps) {
  // Handle null, undefined, and empty strings
  const imageSrc =
    modelImageUrl && modelImageUrl.trim() !== ""
      ? modelImageUrl
      : DEFAULT_MODEL_PLACEHOLDER;
  const altText = `Imagen de ${modelName}`;

  return (
    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
      <Image
        alt={altText}
        className="h-full w-full object-cover"
        height={CART_ITEM_IMAGE_SIZE}
        priority={false}
        src={imageSrc}
        width={CART_ITEM_IMAGE_SIZE}
      />
    </div>
  );
}
