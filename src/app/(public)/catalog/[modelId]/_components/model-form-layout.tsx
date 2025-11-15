/**
 * Model Form Layout Container
 *
 * Shared layout component for ModelFormSkeleton and ModelFormWrapper
 * Ensures consistent grid distribution and spacing
 *
 * Layout structure:
 * - Mobile: Single column (full width)
 * - Tablet: Two columns
 * - Desktop: Left sidebar (model info) + Right main (form)
 */

type ModelFormLayoutProps = {
  sidebar: React.ReactNode;
  main: React.ReactNode;
};

export function ModelFormLayout({ sidebar, main }: ModelFormLayoutProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Sidebar - Left column (1/3 width on desktop) */}
      <div className="lg:col-span-1">{sidebar}</div>

      {/* Main content - Right column (2/3 width on desktop) */}
      <div className="space-y-6 lg:col-span-2">{main}</div>
    </div>
  );
}
