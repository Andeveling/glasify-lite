import { cn } from "@/lib/utils";
import { BrandingProvider } from "@/providers/branding-provider";
import { SessionProvider } from "@/providers/session-provider";
import { TenantConfigProvider } from "@/providers/tenant-config-provider";
import { getTenantConfig } from "@/server/utils/tenant";
import "@/styles/globals.css";
import { TRPCReactProvider } from "@/trpc/react";
import { body, html } from "framer-motion/client";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { NavigationLoader } from "./_components/navigation-loader";
import { ReactScan } from "./_components/react-scan";
import { Geist, Inter, Lora, Fira_Code } from "next/font/google";

export const metadata: Metadata = {
  description:
    "Cotización inteligente de productos de aluminio y pvc arquitectónico para fabricantes y distribuidores",
  icons: [ { rel: "icon", url: "/favicon.ico" } ],
  title: "Glasify Lite - Cotizador Inteligente de productos de aluminio y pvc arquitectónico",
};

const geist = Geist({
  display: "swap",
  subsets: [ "latin" ],
  variable: "--font-geist-sans",
});

const inter = Inter({
  display: "swap",
  subsets: [ "latin" ],
  variable: "--font-inter-sans",
});

const lora = Lora({
  display: "swap",
  subsets: [ "latin" ],
  variable: "--font-lora-serif",
});

const firaCode = Fira_Code({
  display: "swap",
  subsets: [ "latin" ],
  variable: "--font-fira-code-mono",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Fetch tenant config once at root level (Server Component)
  // This makes currency, locale, timezone available to all Client Components
  const tenantConfig = await getTenantConfig();

  return (
    <html
      className={cn(
        geist.variable,
        inter.variable,
        lora.variable,
        firaCode.variable
      )}
      lang="es"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <NavigationLoader />
        <ReactScan />
        <BrandingProvider
          config={{
            businessName: tenantConfig.businessName,
            logoUrl: "/favicon.ico",
            primaryColor: "#3b82f6",
            secondaryColor: "#1e40af",
          }}
        >
          <TenantConfigProvider
            config={{
              currency: tenantConfig.currency,
              locale: tenantConfig.locale,
              quoteValidityDays: tenantConfig.quoteValidityDays,
              timezone: tenantConfig.timezone,
            }}
          >
            <SessionProvider>
              <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
                <TRPCReactProvider>{children}</TRPCReactProvider>
                <Toaster expand position="bottom-right" richColors />
              </ThemeProvider>
            </SessionProvider>
          </TenantConfigProvider>
        </BrandingProvider>
      </body >
    </html >
  );
}
