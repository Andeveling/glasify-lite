import { WhatsAppButtonWrapper } from "@/app/_components/whatsapp/whatsapp-button-wrapper";
import PublicFooter from "./_components/_layout/public-footer";
import PublicHeader from "./_components/_layout/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <WhatsAppButtonWrapper
        message="Hola, estoy interesado en sus productos de vidrio"
        variant="floating"
      />
    </div>
  );
}
