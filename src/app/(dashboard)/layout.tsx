import { FileText, Home, LogOut, Package, Settings } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { auth, signOut } from '@/server/auth';

const sidebarNavItems = [
  {
    href: '/dashboard',
    icon: Home,
    title: 'Panel Principal',
  },
  {
    href: '/dashboard/models',
    icon: Package,
    title: 'Modelos',
  },
  {
    href: '/dashboard/quotes',
    icon: FileText,
    title: 'Cotizaciones',
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    title: 'Configuración',
  },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <SidebarProvider>
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
                    <p className="font-medium text-sm leading-none">{session.user.name ?? session.user.email}</p>
                    <p className="text-muted-foreground text-xs leading-none">Administrador</p>
                  </div>
                </div>
                <Separator className="my-2" />
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/catalog' });
                  }}
                >
                  <Button className="w-full justify-start" size="sm" type="submit" variant="ghost">
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </Button>
                </form>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <div className="flex items-center space-x-2">
            <span className="font-bold">Dashboard</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-muted-foreground text-sm">{session.user.name ?? session.user.email}</span>
          </div>
        </header>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
