'use client';

import type { Model } from '../_types/model.types';
import { ModelDimensionsCard } from './model-dimensions';
import { ModelFeatures } from './model-features';
import { ModelInfo } from './model-info';
import { ModelSpecifications } from './model-specifications';
import { ProfileSupplierCard } from './profile-supplier-card';

type ModelSidebarProps = {
  model: Model;
};

export function ModelSidebar({ model }: ModelSidebarProps) {
  return (
    <div className="space-y-4">
      <ModelInfo model={model} />
      <ModelSpecifications model={model} />
      <ProfileSupplierCard model={model} />
      <ModelDimensionsCard dimensions={model.dimensions} />
      <ModelFeatures features={model.features} />
    </div>
  );
}
