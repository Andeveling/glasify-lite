"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { WhatsappIcon } from "./whatsapp-icon";

type WhatsAppButtonProps = {
	phoneNumber: string;
	message: string;
	variant?: "floating" | "inline";
	className?: string;
};

/**
 * WhatsApp Button Component
 *
 * Opens WhatsApp chat with pre-filled message
 * Supports floating (fixed position) and inline variants
 *
 * US-010: Botón de WhatsApp en catálogo y cotización
 *
 * @param phoneNumber - E.164 format phone number (e.g., "+5076123456")
 * @param message - Pre-filled message text
 * @param variant - Display style: 'floating' (bottom-right) or 'inline' (default)
 * @param className - Additional CSS classes
 */
export function WhatsAppButton({
	phoneNumber,
	message,
	variant = "inline",
	className,
}: WhatsAppButtonProps) {
	const handleClick = () => {
		const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
		const encodedMessage = encodeURIComponent(message);
		const url = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
		window.open(url, "_blank", "noopener,noreferrer");
	};

	if (variant === "floating") {
		return (
			<TooltipProvider delayDuration={300}>
				<Tooltip>
					<TooltipTrigger asChild>
						<motion.button
							aria-label="Contactar por WhatsApp"
							className={cn(
								"fixed right-6 bottom-6 z-50",
								"flex h-16 w-16 items-center justify-center",
								"rounded-full bg-[#25D366] text-white shadow-lg",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2",
								className,
							)}
							onClick={handleClick}
							type="button"
							initial={{ scale: 1, opacity: 0.9 }}
							animate={{
								scale: [1, 1.08, 1],
								boxShadow: [
									"0 4px 24px 0 rgba(37, 211, 102, 0.4)",
									"0 8px 32px 0 rgba(37, 211, 102, 0.6)",
									"0 4px 24px 0 rgba(37, 211, 102, 0.4)",
								],
							}}
							transition={{
								duration: 2.2,
								repeat: Infinity,
								repeatType: "loop",
								ease: "easeInOut",
							}}
							whileHover={{
								scale: 1.13,
								boxShadow:
									"0 0 0 6px rgba(37, 211, 102, 0.2), 0 8px 32px 0 rgba(37, 211, 102, 0.6)",
								transition: { duration: 0.3 },
							}}
							whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
						>
							<span className="sr-only">Contactar por WhatsApp</span>
							<WhatsappIcon />
						</motion.button>
					</TooltipTrigger>
					<TooltipContent
						side="left"
						className="bg-[#25D366] text-white font-semibold text-sm px-3 py-2 rounded-lg shadow-xl border-0"
					>
						¿Necesitás ayuda? ¡Chatea por WhatsApp!
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<Button
			aria-label="Contactar por WhatsApp"
			className={cn("bg-[#25D366] hover:bg-[#1EBE57]", "text-white", className)}
			onClick={handleClick}
			type="button"
		>
			<MessageCircle className="mr-2 h-4 w-4" />
			Contactar por WhatsApp
		</Button>
	);
}
