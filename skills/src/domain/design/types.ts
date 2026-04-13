export type PanelType = 'movable' | 'fixed';

export interface PanelDescriptor {
  index: number;
  type: PanelType;
  ratio: number;
}

export interface FrameConfig {
  thickness: number;
  profileStyle: 'simple' | 'double' | 'premium';
  profileColor?: string;
}

export interface DesignTemplateConfig {
  id: string;
  name: string;
  pattern: string;
  frameConfig: FrameConfig;
  showArrows: boolean;
  showHandles: boolean;
}

export interface DesignRenderProps {
  template: DesignTemplateConfig;
  frameColor?: string;
  glassColor?: string;
  dimensions?: { widthMm: number; heightMm: number };
  size?: { width: number; height: number };
  showDimensions?: boolean;
}
