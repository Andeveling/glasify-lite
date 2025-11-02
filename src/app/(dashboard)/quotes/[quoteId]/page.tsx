/**
 * Quote Detail Page
 *
 * Server Component that fetches a single quote by ID and displays its full details.
 * Handles 404 errors if quote doesn't exist or user doesn't have access.
 *
 * @module app/(dashboard)/quotes/[quoteId]/page
 */

import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import { api } from "@/trpc/server-client";
import { QuoteDetailView } from "./_components/quote-detail-view";

type QuoteDetailPageProps = {
	params: Promise<{
		quoteId: string;
	}>;
};

export default async function QuoteDetailPage({
	params,
}: QuoteDetailPageProps) {
	const { quoteId } = await params;

	try {
		const quote = await api.quote["get-by-id"]({ id: quoteId });

		return (
			<div className="container mx-auto max-w-7xl py-8">
				<QuoteDetailView quote={quote} />
			</div>
		);
	} catch (error) {
		// If quote not found or access denied, show 404
		if (error instanceof TRPCError && error.code === "NOT_FOUND") {
			notFound();
		}

		// Re-throw other errors
		throw error;
	}
}
