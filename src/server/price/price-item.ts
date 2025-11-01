import type { AdjustmentSign, ServiceType, ServiceUnit } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const MILLIMETERS_PER_METER = 1000;
const MILLIMETERS_IN_METER = new Decimal(MILLIMETERS_PER_METER);
const ROUND_SCALE = 2;
const FIXED_QUANTITY_SCALE = 4;
const PERCENTAGE_DIVISOR = 100;

const toDecimal = (value: Decimal | number | string | null | undefined) =>
  value instanceof Decimal ? value : new Decimal(value ?? 0);

const roundHalfUp = (value: Decimal, scale = ROUND_SCALE) =>
  value.toDecimalPlaces(scale, Decimal.ROUND_HALF_UP);

const toRoundedNumber = (value: Decimal, scale = ROUND_SCALE) =>
  Number(roundHalfUp(value, scale).toFixed(scale));

const mmToMeters = (valueMm: number) =>
  new Decimal(valueMm).dividedBy(MILLIMETERS_IN_METER);

const unitQuantity = (
  unit: ServiceUnit,
  dimensions: { widthMeters: Decimal; heightMeters: Decimal }
) => {
  switch (unit) {
    case "sqm": {
      const area = dimensions.widthMeters.mul(dimensions.heightMeters);
      return roundHalfUp(area);
    }
    case "ml": {
      const perimeter = dimensions.widthMeters
        .plus(dimensions.heightMeters)
        .mul(2);
      return roundHalfUp(perimeter);
    }
    default:
      return new Decimal(1);
  }
};

const computeServiceQuantity = (
  service: PriceServiceInput,
  dimensions: { widthMeters: Decimal; heightMeters: Decimal }
) => {
  if (service.type === "fixed") {
    const quantity =
      typeof service.quantityOverride === "number"
        ? new Decimal(service.quantityOverride)
        : new Decimal(1);
    return roundHalfUp(quantity, FIXED_QUANTITY_SCALE);
  }

  const baseQuantity = unitQuantity(service.unit, dimensions);
  if (typeof service.quantityOverride === "number") {
    return roundHalfUp(new Decimal(service.quantityOverride));
  }
  return baseQuantity;
};

const adjustmentQuantity = (
  unit: ServiceUnit,
  dimensions: { widthMeters: Decimal; heightMeters: Decimal }
) => unitQuantity(unit, dimensions);

const signedAmount = (amount: Decimal, sign: AdjustmentSign) =>
  sign === "negative" ? amount.negated() : amount;

const ensurePositiveNumber = (value: number) => (value > 0 ? value : 0);

export type PriceServiceInput = {
  serviceId: string;
  type: ServiceType;
  unit: ServiceUnit;
  rate: Decimal | number | string;
  quantityOverride?: number;
};

export type PriceAdjustmentInput = {
  concept: string;
  unit: ServiceUnit;
  sign: AdjustmentSign;
  value: Decimal | number | string;
};

export type PriceItemCalculationInput = {
  widthMm: number;
  heightMm: number;
  model: {
    basePrice: Decimal | number | string;
    costPerMmWidth: Decimal | number | string;
    costPerMmHeight: Decimal | number | string;
    accessoryPrice?: Decimal | number | string | null;
  };
  /**
   * Configuración opcional de vidrio. Cuando se provee, el cálculo incluye:
   *  - Descuentos fijos por lado para el área facturable del vidrio (en mm)
   *  - Precio adicional por m² de vidrio facturable
   */
  glass?: {
    pricePerSqm: Decimal | number | string;
    discountWidthMm?: number;
    discountHeightMm?: number;
  };
  /**
   * Recargo porcentual por color (0-100)
   * Se aplica SOLO a costos de perfil (basePrice + dimensionCosts + accessoryPrice)
   * NO se aplica a vidrio ni servicios
   */
  colorSurchargePercentage?: number;
  includeAccessory?: boolean;
  services?: PriceServiceInput[];
  adjustments?: PriceAdjustmentInput[];
};

export type PriceItemServiceResult = {
  serviceId: string;
  unit: ServiceUnit;
  quantity: number;
  amount: number;
};

export type PriceItemAdjustmentResult = {
  concept: string;
  amount: number;
};

export type PriceItemCalculationResult = {
  dimPrice: number;
  accPrice: number;
  colorSurchargePercentage?: number;
  colorSurchargeAmount?: number;
  services: PriceItemServiceResult[];
  adjustments: PriceItemAdjustmentResult[];
  subtotal: number;
};

export const calculatePriceItem = (
  input: PriceItemCalculationInput
): PriceItemCalculationResult => {
  const widthMm = ensurePositiveNumber(input.widthMm);
  const heightMm = ensurePositiveNumber(input.heightMm);

  const widthMeters = mmToMeters(widthMm);
  const heightMeters = mmToMeters(heightMm);

  const basePrice = toDecimal(input.model.basePrice);
  const widthCost = toDecimal(input.model.costPerMmWidth).mul(widthMm);
  const heightCost = toDecimal(input.model.costPerMmHeight).mul(heightMm);

  // Profile cost (base + dimensions) BEFORE color surcharge
  const profileCostBeforeColor = basePrice.plus(widthCost).plus(heightCost);

  // Apply color surcharge to profile cost (if provided)
  const colorSurchargePercentage = input.colorSurchargePercentage ?? 0;
  const colorSurchargeMultiplier = new Decimal(1).plus(
    new Decimal(colorSurchargePercentage).dividedBy(PERCENTAGE_DIVISOR)
  );
  const profileCostWithColor = profileCostBeforeColor.mul(
    colorSurchargeMultiplier
  );
  const colorSurchargeAmountDecimal = profileCostWithColor.minus(
    profileCostBeforeColor
  );

  // Cálculo opcional de vidrio (NO affected by color surcharge)
  let glassPriceDecimal = new Decimal(0);
  if (input.glass && toDecimal(input.glass.pricePerSqm).greaterThan(0)) {
    const dW = Math.max(input.glass.discountWidthMm ?? 0, 0);
    const dH = Math.max(input.glass.discountHeightMm ?? 0, 0);
    const effWidthMm = Math.max(widthMm - dW, 0);
    const effHeightMm = Math.max(heightMm - dH, 0);
    const effWidthM = mmToMeters(effWidthMm);
    const effHeightM = mmToMeters(effHeightMm);
    const areaSqm = effWidthM.mul(effHeightM);
    glassPriceDecimal = roundHalfUp(
      toDecimal(input.glass.pricePerSqm).mul(areaSqm)
    );
  }

  const rawDimPrice = profileCostWithColor.plus(glassPriceDecimal);
  const dimPriceDecimal = roundHalfUp(rawDimPrice);

  // Apply color surcharge to accessory price (if enabled)
  const includeAccessory = Boolean(input.includeAccessory);
  const rawAccessoryPrice = includeAccessory
    ? toDecimal(input.model.accessoryPrice)
    : new Decimal(0);
  const accessoryWithColor = rawAccessoryPrice.mul(colorSurchargeMultiplier);
  const accPriceDecimal = roundHalfUp(accessoryWithColor);

  const dimensions = { heightMeters, widthMeters };

  const serviceBreakdown: PriceItemServiceResult[] = [];
  let servicesTotal = new Decimal(0);
  if (input.services) {
    for (const service of input.services) {
      const rate = toDecimal(service.rate);
      const quantityDecimal = computeServiceQuantity(service, dimensions);
      const amountDecimal = roundHalfUp(rate.mul(quantityDecimal));
      servicesTotal = servicesTotal.plus(amountDecimal);
      serviceBreakdown.push({
        amount: toRoundedNumber(amountDecimal),
        quantity: toRoundedNumber(quantityDecimal, ROUND_SCALE),
        serviceId: service.serviceId,
        unit: service.unit,
      });
    }
  }

  const adjustmentBreakdown: PriceItemAdjustmentResult[] = [];
  let adjustmentsTotal = new Decimal(0);
  if (input.adjustments) {
    for (const adjustment of input.adjustments) {
      const quantityDecimal = adjustmentQuantity(adjustment.unit, dimensions);
      const valueDecimal = toDecimal(adjustment.value);
      const amountDecimal = roundHalfUp(
        signedAmount(quantityDecimal.mul(valueDecimal), adjustment.sign)
      );
      adjustmentsTotal = adjustmentsTotal.plus(amountDecimal);
      adjustmentBreakdown.push({
        amount: toRoundedNumber(amountDecimal),
        concept: adjustment.concept,
      });
    }
  }

  const subtotalDecimal = dimPriceDecimal
    .plus(accPriceDecimal)
    .plus(servicesTotal)
    .plus(adjustmentsTotal);

  const result: PriceItemCalculationResult = {
    accPrice: toRoundedNumber(accPriceDecimal),
    adjustments: adjustmentBreakdown,
    dimPrice: toRoundedNumber(dimPriceDecimal),
    services: serviceBreakdown,
    subtotal: toRoundedNumber(subtotalDecimal),
  };

  // Add color surcharge info if applicable
  if (colorSurchargePercentage > 0) {
    result.colorSurchargePercentage = colorSurchargePercentage;
    result.colorSurchargeAmount = toRoundedNumber(colorSurchargeAmountDecimal);
  }

  return result;
};
