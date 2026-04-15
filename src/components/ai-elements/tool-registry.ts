import type { ReactNode } from "react"

// Renderer function type — receives raw tool output, returns React
export type ToolRenderer = (output: unknown) => ReactNode

// Registry interface — supports dynamic registration
export interface ToolRendererRegistry {
  register(name: string, renderer: ToolRenderer): void
  get(name: string): ToolRenderer | undefined
  has(name: string): boolean
}

// Factory function
export function createToolRendererRegistry(): ToolRendererRegistry {
  const registry = new Map<string, ToolRenderer>()

  return {
    register(name: string, renderer: ToolRenderer) {
      registry.set(name, renderer)
    },
    get(name: string) {
      return registry.get(name)
    },
    has(name: string) {
      return registry.has(name)
    },
  }
}

// Global singleton — survives HMR via globalThis
declare global {
  var __toolRendererRegistry: ToolRendererRegistry | undefined
}

export const toolRendererRegistry: ToolRendererRegistry =
  globalThis.__toolRendererRegistry ??= createToolRendererRegistry()