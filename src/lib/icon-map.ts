/**
 * Icon Mapping Utility
 *
 * Maps icon names (strings) to Lucide React components.
 * Used in solution pages to render the correct icon based on the icon name stored in the database.
 */

import {
  Droplets,
  Eye,
  Home,
  Layers,
  type LucideIcon,
  Shield,
  Snowflake,
  Sun,
  Volume2,
  Wind,
  Zap,
} from "lucide-react";

/**
 * Icon name to component mapping
 * Database stores icon names (strings), this map converts them to React components
 */
export const iconMap: Record<string, LucideIcon> = {
  Droplets,
  Eye,
  Home,
  Layers,
  Shield,
  Snowflake,
  Sun,
  Volume2,
  Wind,
  Zap,
};

/**
 * Get icon component by name
 * Returns the icon component or a fallback if not found
 */
export function getIconComponent(iconName: string | null): LucideIcon {
  if (!iconName) {
    return Home;
  }
  return iconMap[iconName] || Home;
}
