import { FileText, Home, LogOut, Package, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { auth } from "@/server/auth";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

const sidebarNavItems = [
	{
		href: "/dashboard",
		icon: Home,
		title: "Panel Principal",
	},
	{
		href: "/dashboard/models",
		icon: Package,
		title: "Modelos",
	},
	{
		href: "/dashboard/quotes",
		icon: FileText,
		title: "Cotizaciones",
	},
	{
		href: "/dashboard/settings",
		icon: Settings,
		title: "Configuración",
	},
];

type DashboardSidebarProps = {
	session: Session;
};

export default function DashboardSidebar({ session }: DashboardSidebarProps) {
	return (
		<Sidebar>
			<SidebarHeader>
				<Link className="flex items-center space-x-2 px-2" href="/dashboard">
					<span className="font-bold">Glasify Admin</span>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navegación</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{sidebarNavItems.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton asChild>
										<Link href={item.href}>
											<item.icon className="h-4 w-4" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarGroup>
					<SidebarGroupContent>
						<div className="px-2 py-2">
							<div className="mb-2 flex items-center space-x-4">
								<div className="flex-1">
									<p className="font-medium text-sm leading-none">
										{session?.user?.name ?? session?.user?.email}
									</p>
									<p className="text-muted-foreground text-xs leading-none">
										Administrador
									</p>
								</div>
							</div>
							<Separator className="my-2" />
							<form
								action={async () => {
									"use server";
									const { auth: betterAuth } = await import("@/server/auth");
									const { headers } = await import("next/headers");
									await betterAuth.api.signOut({ headers: await headers() });
								}}
							>
								<Button
									className="w-full justify-start"
									size="sm"
									type="submit"
									variant="ghost"
								>
									<LogOut className="h-4 w-4" />
									<span>Cerrar Sesión</span>
								</Button>
							</form>
						</div>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarFooter>
		</Sidebar>
	);
}
