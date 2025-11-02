import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import logger from "@/lib/logger";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "tenants");
const MAX_FILE_SIZE = 2_097_152; // 2MB
const LOGO_MAX_WIDTH = 500;
const LOGO_MAX_HEIGHT = 500;
const LOGO_QUALITY = 90;
const ALLOWED_MIMES = [
	"image/png",
	"image/jpeg",
	"image/svg+xml",
	"image/webp",
];

/**
 * File Upload Service
 * Handles logo uploads with optimization for tenant branding
 *
 * US-009: Configurar datos de branding del tenant
 */

/**
 * Upload and optimize tenant logo
 * - Validates file type and size
 * - Optimizes images (except SVG) using Sharp
 * - Resizes to max 500x500px
 * - Compresses to 90% quality
 *
 * @param file - File to upload
 * @param tenantId - Tenant ID for directory organization
 * @returns Public URL path to logo (e.g., "/uploads/tenants/abc123/logo.png")
 * @throws Error if validation fails
 */
export async function uploadLogo(
	file: File,
	tenantId: string,
): Promise<string> {
	// Validate file type
	if (!ALLOWED_MIMES.includes(file.type)) {
		throw new Error(
			"Formato de imagen no permitido. Use PNG, JPEG, SVG o WEBP.",
		);
	}

	// Validate file size
	if (file.size > MAX_FILE_SIZE) {
		throw new Error("El logo debe pesar menos de 2MB.");
	}

	// Create tenant upload directory
	const tenantDir = path.join(UPLOAD_DIR, tenantId);
	await fs.mkdir(tenantDir, { recursive: true });

	// Generate unique filename
	const extension = path.extname(file.name);
	const filename = `logo-${randomUUID()}${extension}`;
	const filePath = path.join(tenantDir, filename);

	// Convert File to Buffer
	const buffer = Buffer.from(await file.arrayBuffer());

	// Optimize image (skip SVG)
	if (file.type !== "image/svg+xml") {
		const optimized = await sharp(buffer)
			.resize(LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT, {
				fit: "inside",
				withoutEnlargement: true,
			})
			.png({ quality: LOGO_QUALITY })
			.toBuffer();

		await fs.writeFile(filePath, optimized);
		logger.info("Logo optimizado y guardado", {
			tenantId,
			size: optimized.length,
		});
	} else {
		await fs.writeFile(filePath, buffer);
		logger.info("Logo SVG guardado", { tenantId });
	}

	// Return public URL
	return `/uploads/tenants/${tenantId}/${filename}`;
}

/**
 * Delete old logo when updating
 *
 * @param logoUrl - Public URL of logo to delete
 */
export async function deleteLogo(logoUrl: string): Promise<void> {
	const filePath = path.join(process.cwd(), "public", logoUrl);
	try {
		await fs.unlink(filePath);
		logger.info("Logo anterior eliminado", { logoUrl });
	} catch (error) {
		logger.warn("No se pudo eliminar logo anterior", { logoUrl, error });
	}
}
