import type React from "react";

export type GlassPurpose = "general" | "insulation" | "security" | "decorative";

export type PriceIndicator = "budget" | "standard" | "premium";

export type ServiceType = "area" | "perimeter" | "fixed";

export type MaterialType = "PVC" | "ALUMINUM" | "WOOD" | "MIXED";

export type ProfileSupplier = {
  id: string;
  name: string;
  materialType: MaterialType;
};

export type GlassOption = {
  id: string;
  purpose: GlassPurpose;
  title: string;
  description: string;
  benefits: string[];
  icon: React.ComponentType<{ className?: string }>;
  technicalSpecs?: {
    thickness: string;
    features: string[];
  };
  priceIndicator: PriceIndicator;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  type: ServiceType;
};

export type ModelDimensions = {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
};

export type Model = {
  id: string;
  name: string;
  /** @deprecated Use profileSupplier object instead */
  manufacturer?: string;
  profileSupplier: ProfileSupplier | null;
  description: string;
  basePrice: number;
  currency: string;
  imageUrl: string;
  dimensions: ModelDimensions;
  features: string[];
};

export type QuoteFormData = {
  width: string;
  height: string;
  quantity: string;
  glassType: string;
  additionalServices: string[];
};
