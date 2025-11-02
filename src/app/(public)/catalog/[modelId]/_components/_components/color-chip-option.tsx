"use client";

import { Check } from "lucide-react";
import { motion, type Variants } from "motion/react";
import { ColorChip } from "@/app/(dashboard)/admin/colors/_components/color-chip";
import { Badge } from "@/components/ui/badge";
import { RadioGroupItem } from "@/components/ui/radio-group";

// Constants
const COLOR_NAME_FONT_WEIGHT_SELECTED = 600;
const COLOR_NAME_FONT_WEIGHT_UNSELECTED = 500;
const SURCHARGE_BADGE_SCALE = 1.1;
const COLOR_CHIP_STAGGER_DELAY = 0.05;
const SELECTED_CHECK_STAGGER_DELAY = 0.1;

// Animation variants for selected check icon (consistent with GlassTypeCardSimple)
const selectedCheckVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", damping: 10, stiffness: 200 },
  },
};

type ModelColorData = {
  id: string;
  color: {
    hexCode: string;
    id: string;
    name: string;
    ralCode: string | null;
  };
  surchargePercentage: number;
};

type ColorChipOptionProps = {
  index: number;
  isSelected: boolean;
  modelColor: ModelColorData;
  useGrid: boolean;
};

export function ColorChipOption({
  index,
  isSelected,
  modelColor,
  useGrid,
}: ColorChipOptionProps) {
  const surcharge = modelColor.surchargePercentage;

  return (
    <motion.div
      animate={
        isSelected ? { scale: 1.08, opacity: 1 } : { scale: 1, opacity: 0.7 }
      }
      initial={{ scale: 1, opacity: 0.7 }}
      transition={{
        type: "spring",
        damping: 12,
        stiffness: 300,
        delay: index * COLOR_CHIP_STAGGER_DELAY,
      }}
    >
      <label
        className={`relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all duration-300 has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 ${
          isSelected
            ? "border-primary bg-primary/8 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)] hover:border-primary hover:bg-primary/10"
            : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/30"
        } ${useGrid ? "" : "min-w-[100px]"}`}
        htmlFor={modelColor.id}
      >
        <RadioGroupItem
          className="sr-only"
          id={modelColor.id}
          value={modelColor.color.id}
        />

        {/* Color chip with enhanced styling */}
        <motion.div
          animate={{
            filter: isSelected
              ? "drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.4))"
              : "drop-shadow(0 0 0px rgba(var(--primary-rgb), 0))",
          }}
          transition={{ duration: 0.2 }}
        >
          <ColorChip hexCode={modelColor.color.hexCode} size="lg" />
        </motion.div>

        {/* Text content */}
        <div className="flex flex-col items-center gap-1">
          <motion.span
            animate={{
              color: isSelected ? "rgb(var(--primary-rgb))" : "inherit",
              fontWeight: isSelected
                ? COLOR_NAME_FONT_WEIGHT_SELECTED
                : COLOR_NAME_FONT_WEIGHT_UNSELECTED,
            }}
            className="text-center text-xs transition-colors duration-300"
            transition={{ duration: 0.2 }}
          >
            {modelColor.color.name}
          </motion.span>

          {modelColor.color.ralCode && (
            <span className="text-muted-foreground text-xs">
              {modelColor.color.ralCode}
            </span>
          )}

          {/* Surcharge badge with animation */}
          <motion.div
            animate={{
              scale: isSelected ? SURCHARGE_BADGE_SCALE : 1,
            }}
            transition={{ type: "spring", damping: 12, stiffness: 300 }}
          >
            {surcharge > 0 ? (
              <Badge
                className={`text-xs transition-colors duration-300 ${
                  isSelected
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-secondary-foreground"
                }`}
                variant="secondary"
              >
                +{surcharge}%
              </Badge>
            ) : (
              <Badge className="text-xs" variant="outline">
                Incluido
              </Badge>
            )}
          </motion.div>
        </div>

        {/* Selection indicator with check icon - Enhanced for better visibility */}
        {isSelected && (
          <motion.div
            animate="animate"
            className="-top-2 -right-2 absolute flex size-6 items-center justify-center rounded-full bg-primary shadow-lg"
            initial="initial"
            transition={{ delay: SELECTED_CHECK_STAGGER_DELAY }}
            variants={selectedCheckVariants}
          >
            <Check className="size-4 text-primary-foreground" />
          </motion.div>
        )}
      </label>
    </motion.div>
  );
}
