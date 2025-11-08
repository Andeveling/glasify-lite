/**
 * Gallery Service - Business Logic Layer
 *
 * Centralized logic for gallery image discovery and validation.
 * No database required - operates on filesystem.
 */

import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_EXTENSIONS = [".svg", ".png", ".jpg", ".jpeg", ".webp"] as const;
const PUBLIC_URL_BASE = "/models/designs" as const;
const DESIGNS_DIR_RELATIVE = "public/models/designs" as const;
const FILENAME_SEPARATOR = "-" as const;
const FILE_EXTENSION_REGEX = /\.[^/.]+$/;

export type GalleryImage = {
  filename: string;
  name: string;
  url: string;
};

type GalleryError = {
  code: "DIR_NOT_FOUND" | "READ_ERROR";
  message: string;
  details?: Record<string, unknown>;
};

function formatImageName(filename: string): string {
  const nameWithoutExt = filename.replace(FILE_EXTENSION_REGEX, "");
  return nameWithoutExt
    .split(FILENAME_SEPARATOR)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function isAllowedExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(
    ext as (typeof ALLOWED_EXTENSIONS)[number]
  );
}

async function getGalleryImages(): Promise<GalleryImage[] | GalleryError> {
  try {
    const designsDir = path.join(process.cwd(), DESIGNS_DIR_RELATIVE);

    let files: string[];
    try {
      files = await fs.readdir(designsDir);
    } catch (error) {
      const errorCode = (error as NodeJS.ErrnoException).code;
      if (errorCode === "ENOENT") {
        return {
          code: "DIR_NOT_FOUND",
          details: { path: designsDir },
          message: `Designs directory not found at ${designsDir}`,
        };
      }
      if (errorCode === "EACCES") {
        return {
          code: "READ_ERROR",
          details: { errno: errorCode, path: designsDir },
          message: `Permission denied reading directory: ${designsDir}`,
        };
      }
      throw error;
    }

    const validFiles = files.filter(isAllowedExtension);

    if (validFiles.length === 0) {
      return [];
    }

    const images: GalleryImage[] = validFiles
      .map((filename) => ({
        filename,
        name: formatImageName(filename),
        url: `${PUBLIC_URL_BASE}/${filename}`,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return images;
  } catch (error) {
    return {
      code: "READ_ERROR",
      details: { error },
      message: `Failed to read gallery images: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

export async function listGalleryImages(): Promise<GalleryImage[]> {
  const result = await getGalleryImages();

  if ("code" in result && result.code !== undefined) {
    return [];
  }

  // Type assertion: we've checked for error, so this is GalleryImage[]
  return result as GalleryImage[];
}
export function isValidGalleryImageUrl(imageUrl: string): boolean {
  if (!imageUrl.startsWith(PUBLIC_URL_BASE)) {
    return false;
  }

  const filename = `${imageUrl}`.replace(`${PUBLIC_URL_BASE}/`, "");

  if (filename.includes("..") || filename.includes("/")) {
    return false;
  }

  return isAllowedExtension(filename);
}
