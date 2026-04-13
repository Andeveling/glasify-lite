export { SummaryCard as RunningSummary } from "./components/summary-card"

export { SummaryRow } from "./components/summary-row"
export { useRunningSummaryData } from "./hooks/use-running-summary-data"
export type {
  ColorData,
  GlassTypeData,
  ModelData,
  PriceBreakdown,
  ServiceData,
  UseRunningSummaryDataReturn,
  WatchedFields,
} from "./types"
export {
  calculateAreaM2,
  calculatePriceBreakdown,
  calculateSubtotalPerUnit,
  calculateTotal,
} from "./utils/price-calculations"
