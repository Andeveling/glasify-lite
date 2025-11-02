import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="container relative grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
			{/* Left side - Branding/Info */}
			<div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
				<div className="absolute inset-0 bg-primary" />
				<div className="relative z-20 flex items-center font-medium text-lg">
					<Link className="flex items-center space-x-2" href="/catalog">
						<span className="font-bold">Glasify</span>
					</Link>
				</div>
				<div className="relative z-20 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-lg">
							&ldquo;Cotización inteligente de productos de vidrio para
							fabricantes y distribuidores.&rdquo;
						</p>
						<footer className="text-sm">Glasify Lite</footer>
					</blockquote>
				</div>
			</div>

			{/* Right side - Auth Forms */}
			<div className="lg:p-8">
				<div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
					{/* Mobile branding */}
					<div className="flex flex-col space-y-2 text-center lg:hidden">
						<Link className="mx-auto" href="/catalog">
							<span className="font-bold text-2xl">Glasify</span>
						</Link>
						<p className="text-muted-foreground text-sm">
							Cotizador inteligente de vidrios
						</p>
					</div>

					{/* Auth form content in card */}
					<Card>
						<CardContent className="p-6">{children}</CardContent>
					</Card>

					{/* Back to catalog link */}
					<p className="px-8 text-center text-muted-foreground text-sm">
						<BackLink href="/catalog" icon="none" variant="link">
							Volver al catálogo
						</BackLink>
					</p>
				</div>
			</div>
		</div>
	);
}
