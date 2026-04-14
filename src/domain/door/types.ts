export type DoorOpeningType =
  | "left_interior"
  | "right_interior"
  | "left_exterior"
  | "right_exterior"

export type TraverseStyle = "horizontal" | "vertical" | "grid"

export type HandleStyle = "lever" | "knob" | "pull"

export interface DoorFrameConfig {
  thickness: number
  profileStyle: "simple" | "double" | "premium"
  profileColor?: string
}

export interface DoorTemplateConfig {
  id: string
  name: string
  openingType: DoorOpeningType
  traverseCount: number
  traverseStyle: TraverseStyle
  frameConfig: DoorFrameConfig
  frameColor: string
  glassColor: string
  handleStyle: HandleStyle
  showLock: boolean
}

export interface DoorRenderProps {
  template: DoorTemplateConfig
  frameColor?: string
  glassColor?: string
  size?: { width: number; height: number }
  showOpeningArc?: boolean
  className?: string
}
