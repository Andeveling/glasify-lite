/**
 * Logo upload hook
 * Manages logo file selection, preview, and validation
 */

import { useState } from "react";
import { validateLogoFile } from "../_utils/branding-form.utils";

export function useLogoUpload(initialLogoUrl: string | null) {
	const [logoPreview, setLogoPreview] = useState<string | null>(
		initialLogoUrl || null,
	);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		if (!validateLogoFile(file)) {
			return;
		}

		setSelectedFile(file);
		setLogoPreview(URL.createObjectURL(file));
	};

	const handleRemoveLogo = () => {
		setSelectedFile(null);
		setLogoPreview(null);
	};

	return {
		handleLogoSelect,
		handleRemoveLogo,
		logoPreview,
		selectedFile,
	};
}
