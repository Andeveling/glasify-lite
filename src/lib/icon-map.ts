/**
 * Icon Mapping Utility
 * 
 * Maps icon names (strings) to Lucide React components.
 * Used in solution pages to render the correct icon based on the icon name stored in the database.
 */

import {
  Home,
  Snowflake,
  Shield,
  Sun,
  Zap,
  Volume2,
  Eye,
  Wind,
  Droplets,
  Layers,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon name to component mapping
 * Database stores icon names (strings), this map converts them to React components
 */
export const iconMap: Record<string, LucideIcon> = {
  Home,
  Snowflake,
  Shield,
  Sun,
  Zap,
  Volume2,
  Eye,
  Wind,
  Droplets,
  Layers,
};

/**
 * Get icon component by name
 * Returns the icon component or a fallback if not found
 */
export function getIconComponent(iconName: string | null): LucideIcon {
  if (!iconName) return Home;
  return iconMap[iconName] || Home;
}
