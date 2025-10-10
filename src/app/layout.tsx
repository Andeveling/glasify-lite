import '@/styles/globals.css';

import type { Metadata } from 'next';
import { Fira_Code, Geist, Inter, Lora } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/providers/theme-provider';
import { TRPCReactProvider } from '@/trpc/react';
import { ReactScan } from './_components/react-scan';

export const metadata: Metadata = {
  description: 'Cotización inteligente de productos de vidrio para fabricantes y distribuidores',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  title: 'Glasify Lite - Cotizador Inteligente de Vidrios',
};

const geist = Geist({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const inter = Inter({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-inter-sans',
});

const lora = Lora({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-lora-serif',
});

const firaCode = Fira_Code({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-fira-code-mono',
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={cn(geist.variable, inter.variable, lora.variable, firaCode.variable)}
      lang="es"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <ReactScan />
        <ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster expand position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
