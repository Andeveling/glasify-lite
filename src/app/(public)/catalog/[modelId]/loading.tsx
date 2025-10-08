import { ModelFormSkeleton } from './_components/model-form-skeleton';
import { ModelSidebarSkeleton } from './_components/model-sidebar-skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <ModelSidebarSkeleton />
          <ModelFormSkeleton />
        </div>
      </div>
    </div>
  );
}
