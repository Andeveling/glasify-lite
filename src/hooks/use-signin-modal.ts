"use client";

import { useState } from "react";

/**
 * Hook to manage Sign In modal state
 * Returns modal state and control functions
 */
export const useSignInModal = () => {
	const [isOpen, setIsOpen] = useState(false);

	const open = () => setIsOpen(true);
	const close = () => setIsOpen(false);
	const toggle = () => setIsOpen((prev) => !prev);

	return {
		close,
		isOpen,
		open,
		setIsOpen,
		toggle,
	};
};
