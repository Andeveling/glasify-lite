'use client';

import { ModelForm } from './_components/form/model-form';
import { ModelSidebar } from './_components/model-sidebar';
import { MOCK_MODEL } from './_utils/constants';

export default function Page() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          <ModelSidebar model={MOCK_MODEL} />
          <ModelForm model={MOCK_MODEL} />
        </div>
      </div>
    </div>
  );
}
