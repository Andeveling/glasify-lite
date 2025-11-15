import { env } from "@/env";
import { cn } from "@/lib/utils";
import { BrandingProvider } from "@/providers/branding-provider";
import { SessionProvider } from "@/providers/session-provider";
import { TenantConfigProvider } from "@/providers/tenant-config-provider";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Fira_Code, Geist, Inter, Lora } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { NavigationLoader } from "./_components/navigation-loader";
import { ReactScan } from "./_components/react-scan";

export const metadata: Metadata = {
  description:
    "Cotización inteligente de productos de aluminio y pvc arquitectónico para fabricantes y distribuidores",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  title:
    "Glasify Lite - Cotizador Inteligente de productos de aluminio y pvc arquitectónico",
};

// Remove dynamic rendering - now using build-time env vars instead of DB queries
// This allows static page generation while maintaining tenant-specific config

const geist = Geist({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter-sans",
});

const lora = Lora({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-lora-serif",
});

const firaCode = Fira_Code({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-fira-code-mono",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Use build-time env vars instead of database fetch
  // This allows static generation while keeping tenant config
  const tenantConfig = {
    businessName: env.NEXT_PUBLIC_TENANT_BUSINESS_NAME,
    currency: env.NEXT_PUBLIC_TENANT_CURRENCY,
    locale: env.NEXT_PUBLIC_TENANT_LOCALE,
    quoteValidityDays: env.NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS,
    timezone: env.NEXT_PUBLIC_TENANT_TIMEZONE,
  };

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
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
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
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                disableTransitionOnChange
                enableSystem
              >
                <TRPCReactProvider>{children}</TRPCReactProvider>
                <Toaster expand position="bottom-right" richColors />
              </ThemeProvider>
            </SessionProvider>
          </TenantConfigProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
