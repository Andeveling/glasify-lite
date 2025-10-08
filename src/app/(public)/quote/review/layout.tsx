// Force dynamic rendering for review page
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
