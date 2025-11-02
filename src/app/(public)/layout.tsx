import { Suspense } from "react";
import { WhatsAppButtonWrapper } from "@/app/_components/whatsapp/whatsapp-button-wrapper";
import PublicFooter from "./_components/_layout/public-footer";
import PublicHeader from "./_components/_layout/public-header";
import { PublicHeaderSkeleton } from "./_components/_layout/public-header-skeleton";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="mx-auto flex min-h-screen flex-col">
			{/* Wrap PublicHeader in Suspense to prevent blocking route */}
			<Suspense fallback={<PublicHeaderSkeleton />}>
				<PublicHeader />
			</Suspense>
			<main className="flex-1">{children}</main>
			<PublicFooter />
			<WhatsAppButtonWrapper
				message="Hola, estoy interesado en sus productos de cristalería. ¿Podrían ayudarme?"
				variant="floating"
			/>
		</div>
	);
}
