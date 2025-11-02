/**
 * Room location constants for quote wizard
 * Predefined options for window location selection
 */

export const ROOM_LOCATIONS = [
	"Alcoba principal",
	"Alcoba secundaria",
	"Sala / Comedor",
	"Cocina",
	"Baño principal",
	"Baño secundario",
	"Oficina / Estudio",
	"Balcón / Terraza",
	"Escalera / Pasillo",
] as const;

export type RoomLocationOption = (typeof ROOM_LOCATIONS)[number];

/**
 * Option for custom room location input
 */
export const CUSTOM_LOCATION_OPTION = "Otro" as const;
