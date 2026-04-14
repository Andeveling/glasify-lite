import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

vi.mock("streamdown", () => ({
  Streamdown: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="streamdown">{children}</div>
  ),
}))

vi.mock("@streamdown/cjk", () => ({ cjk: {} }))
vi.mock("@streamdown/code", () => ({ code: {} }))
vi.mock("@streamdown/math", () => ({ math: {} }))
vi.mock("@streamdown/mermaid", () => ({ mermaid: {} }))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, disabled, ...props }: React.ComponentProps<"button">) => (
    <button disabled={disabled} onClick={onClick} type={type} {...props}>
      {children}
    </button>
  ),
}))

vi.mock("@/components/ui/button-group", () => ({
  ButtonGroup: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  ButtonGroupText: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}))

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children?: React.ReactNode; asChild?: boolean }) => (
    <>{children}</>
  ),
  TooltipContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("lucide-react", () => ({
  ChevronLeftIcon: () => <svg data-testid="chevron-left" />,
  ChevronRightIcon: () => <svg data-testid="chevron-right" />,
}))

import { TypingIndicator, ToolCallCard, MessageErrorInline } from "@/components/ai-elements/message"

describe("TypingIndicator", () => {
  it("renders 3 animated dots", () => {
    const { container } = render(<TypingIndicator />)
    const dots = container.querySelectorAll("span.size-2")
    expect(dots).toHaveLength(3)
  })

  it("has role=status for accessibility", () => {
    render(<TypingIndicator />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("has sr-only text in Spanish", () => {
    render(<TypingIndicator />)
    expect(screen.getByText("El asistente está escribiendo...")).toBeInTheDocument()
  })

  it("applies animate-pulse class when isAnimating=true (default)", () => {
    const { container } = render(<TypingIndicator isAnimating />)
    const dots = container.querySelectorAll("span.animate-pulse")
    expect(dots).toHaveLength(3)
  })

  it("does NOT apply animate-pulse when isAnimating=false", () => {
    const { container } = render(<TypingIndicator isAnimating={false} />)
    const animatedDots = container.querySelectorAll("span.animate-pulse")
    expect(animatedDots).toHaveLength(0)
  })

  it("applies staggered animationDelay to each dot when animating", () => {
    const { container } = render(<TypingIndicator isAnimating />)
    const dots = Array.from(container.querySelectorAll("span.size-2")) as HTMLElement[]
    expect(dots[0].style.animationDelay).toBe("0ms")
    expect(dots[1].style.animationDelay).toBe("200ms")
    expect(dots[2].style.animationDelay).toBe("400ms")
  })

  it("clears animationDelay when isAnimating=false", () => {
    const { container } = render(<TypingIndicator isAnimating={false} />)
    const dots = Array.from(container.querySelectorAll("span.size-2")) as HTMLElement[]
    for (const dot of dots) {
      expect(dot.style.animationDelay).toBe("")
    }
  })
})

describe("ToolCallCard", () => {
  it("renders the tool name", () => {
    render(<ToolCallCard state="input-streaming" toolName="create_model" />)
    expect(screen.getByText("create_model")).toBeInTheDocument()
  })

  it("renders tool_call label prefix", () => {
    render(<ToolCallCard state="input-streaming" toolName="create_model" />)
    expect(screen.getByText("tool_call")).toBeInTheDocument()
  })

  it("shows Procesando badge when state=input-streaming", () => {
    render(<ToolCallCard state="input-streaming" toolName="create_model" />)
    expect(screen.getByText("Procesando...")).toBeInTheDocument()
  })

  it("shows Completado badge when state=output-available", () => {
    render(<ToolCallCard state="output-available" toolName="create_model" />)
    expect(screen.getByText("Completado")).toBeInTheDocument()
  })

  it("shows Esperando input badge when state=input-available", () => {
    render(<ToolCallCard state="input-available" toolName="create_model" />)
    expect(screen.getByText("Esperando input")).toBeInTheDocument()
  })

  it("renders input key-value pairs when input provided", () => {
    render(
      <ToolCallCard
        input={{ modelName: "VC Panama", width: 1200 }}
        state="input-available"
        toolName="create_model"
      />,
    )
    expect(screen.getByText("modelName:")).toBeInTheDocument()
    expect(screen.getByText("VC Panama")).toBeInTheDocument()
    expect(screen.getByText("width:")).toBeInTheDocument()
    expect(screen.getByText("1200")).toBeInTheDocument()
  })

  it("renders output key-value pairs when output provided", () => {
    render(
      <ToolCallCard
        output={{ result: "created", id: "model-42" }}
        state="output-available"
        toolName="create_model"
      />,
    )
    expect(screen.getByText("result:")).toBeInTheDocument()
    expect(screen.getByText("created")).toBeInTheDocument()
    expect(screen.getByText("id:")).toBeInTheDocument()
    expect(screen.getByText("model-42")).toBeInTheDocument()
  })

  it("does not render Input section when input is empty", () => {
    render(<ToolCallCard input={{}} state="input-available" toolName="create_model" />)
    expect(screen.queryByText("Input")).not.toBeInTheDocument()
  })

  it("does not render Output section when output is empty", () => {
    render(<ToolCallCard output={{}} state="output-available" toolName="create_model" />)
    expect(screen.queryByText("Output")).not.toBeInTheDocument()
  })

  it("shows dismiss button when onDismiss provided", () => {
    render(<ToolCallCard onDismiss={vi.fn()} state="output-available" toolName="create_model" />)
    expect(screen.getByRole("button", { name: "×" })).toBeInTheDocument()
  })

  it("does not show dismiss button when onDismiss not provided", () => {
    render(<ToolCallCard state="output-available" toolName="create_model" />)
    expect(screen.queryByRole("button", { name: "×" })).not.toBeInTheDocument()
  })

  it("calls onDismiss when dismiss button is clicked", async () => {
    const onDismiss = vi.fn()
    render(<ToolCallCard onDismiss={onDismiss} state="output-available" toolName="create_model" />)
    await userEvent.click(screen.getByRole("button", { name: "×" }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})

describe("MessageErrorInline", () => {
  it("renders default message when no message prop provided", () => {
    render(<MessageErrorInline />)
    expect(screen.getByText("Error desconocido")).toBeInTheDocument()
  })

  it("renders custom message when message prop is provided", () => {
    render(<MessageErrorInline message="No se pudo conectar al servidor" />)
    expect(screen.getByText("No se pudo conectar al servidor")).toBeInTheDocument()
  })

  it("shows Reintentar button when onRetry provided", () => {
    render(<MessageErrorInline onRetry={vi.fn()} />)
    expect(screen.getByRole("button", { name: /reintentar/i })).toBeInTheDocument()
  })

  it("does not show retry button when onRetry not provided", () => {
    render(<MessageErrorInline />)
    expect(screen.queryByRole("button", { name: /reintentar/i })).not.toBeInTheDocument()
  })

  it("calls onRetry when retry button is clicked", async () => {
    const onRetry = vi.fn()
    render(<MessageErrorInline onRetry={onRetry} />)
    await userEvent.click(screen.getByRole("button", { name: /reintentar/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it("renders retry icon SVG inside retry button", () => {
    const { container } = render(<MessageErrorInline onRetry={vi.fn()} />)
    const button = screen.getByRole("button", { name: /reintentar/i })
    expect(button.querySelector("svg")).toBeInTheDocument()
  })
})
