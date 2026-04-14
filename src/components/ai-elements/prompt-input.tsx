"use client"

import { ArrowUpIcon, SquareIcon } from "lucide-react"
import type { ComponentProps, FormEvent, ReactNode } from "react"
import { createContext, useCallback, useContext, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type PromptInputMessage = {
  text: string
  files?: File[]
}

type PromptInputContextValue = {
  input: string
  setInput: (value: string) => void
}

const PromptInputContext = createContext<PromptInputContextValue | null>(null)

function usePromptInputContext() {
  const context = useContext(PromptInputContext)
  if (!context) {
    throw new Error("usePromptInputContext must be used within PromptInput")
  }
  return context
}

export type PromptInputProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onSubmit: (message: PromptInputMessage, event: FormEvent) => void
  value?: string
  defaultValue?: string
}

export function PromptInput({
  onSubmit,
  children,
  className,
  value,
  defaultValue,
  ...props
}: PromptInputProps) {
  const [internalInput, setInternalInput] = useState(defaultValue ?? "")
  const input = value ?? internalInput

  const setInput = (nextValue: string) => {
    if (value === undefined) {
      setInternalInput(nextValue)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ text: input }, e)
  }

  return (
    <PromptInputContext.Provider value={{ input, setInput }}>
      <form onSubmit={handleSubmit} className={cn("relative", className)} {...props}>
        {children}
      </form>
    </PromptInputContext.Provider>
  )
}

export type PromptInputBodyProps = ComponentProps<"div">

export function PromptInputBody({ children, className, ...props }: PromptInputBodyProps) {
  return (
    <div className={cn("p-4", className)} {...props}>
      {children}
    </div>
  )
}

export type PromptInputFooterProps = ComponentProps<"div">

export function PromptInputFooter({ children, className, ...props }: PromptInputFooterProps) {
  return (
    <div className={cn("flex items-center gap-2 p-2 border-t", className)} {...props}>
      {children}
    </div>
  )
}

export type PromptInputTextareaProps = ComponentProps<typeof Textarea> & {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  minRows?: number
  maxRows?: number
}

export function PromptInputTextarea({
  className,
  value,
  onChange,
  minRows = 1,
  maxRows = 6,
  ...props
}: PromptInputTextareaProps) {
  const context = usePromptInputContext()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const internalValue = value ?? context.input
  const internalOnChange =
    onChange ?? ((e: React.ChangeEvent<HTMLTextAreaElement>) => context.setInput(e.target.value))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.closest("form")
      form?.requestSubmit()
    }
  }

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    const scrollHeight = textarea.scrollHeight
    const computedStyle = getComputedStyle(textarea)
    const paddingTop = parseFloat(computedStyle.paddingTop)
    const paddingBottom = parseFloat(computedStyle.paddingBottom)
    const borderTop = parseFloat(computedStyle.borderTopWidth)
    const borderBottom = parseFloat(computedStyle.borderBottomWidth)
    const lineHeight = parseFloat(computedStyle.lineHeight)
    const maxPixels =
      (maxRows ?? 6) * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom

    textarea.style.height = `${Math.min(scrollHeight, maxPixels)}px`
    textarea.style.overflowY = scrollHeight > maxPixels ? "auto" : "hidden"
  }, [maxRows])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    internalOnChange(e)
    autoResize()
  }

  return (
    <Textarea
      ref={textareaRef}
      value={internalValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={cn(
        "min-h-10 resize-none rounded-lg border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  )
}

export type PromptInputSubmitProps = ComponentProps<typeof Button> & {
  status: "ready" | "streaming" | "submitted" | "error"
  disabled?: boolean
}

export function PromptInputSubmit({
  status,
  disabled,
  className,
  ...props
}: PromptInputSubmitProps) {
  return (
    <Button
      size="icon"
      disabled={disabled}
      className={cn(
        "size-8 rounded-full",
        status === "streaming" && "bg-destructive hover:bg-destructive/90",
        className,
      )}
      {...props}
    >
      {status === "streaming" ? (
        <SquareIcon className="size-4" />
      ) : (
        <ArrowUpIcon className="size-4" />
      )}
    </Button>
  )
}

export type PromptInputToolsProps = ComponentProps<"div">

export function PromptInputTools({ children, className, ...props }: PromptInputToolsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  )
}

export type PromptInputButtonProps = ComponentProps<typeof Button> & {
  tooltip?: string | { content: ReactNode; shortcut?: string }
}

export function PromptInputButton({
  children,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: PromptInputButtonProps) {
  return (
    <Button variant={variant} size={size} className={cn("size-8", className)} {...props}>
      {children}
    </Button>
  )
}

export type AttachmentFile = {
  id: string
  name: string
  type: string
  url: string
}

export function usePromptInputAttachments() {
  const [files, setFiles] = useState<AttachmentFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const add = useCallback((newFiles: File[]) => {
    const mapped = newFiles.map((f, i) => ({
      id: `file_${Date.now()}_${i}`,
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
    }))
    setFiles((prev) => [...prev, ...mapped])
  }, [])

  const remove = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.url)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clear = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.url))
      return []
    })
  }, [])

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? [])
      if (selectedFiles.length > 0) {
        add(selectedFiles)
      }
      e.target.value = ""
    },
    [add],
  )

  return {
    files,
    add,
    remove,
    clear,
    openFileDialog,
    inputRef,
    handleFileChange,
  }
}

export type AttachmentPreviewProps = ComponentProps<"div"> & {
  files: AttachmentFile[]
  onRemove: (id: string) => void
}

export function AttachmentPreview({
  files,
  onRemove,
  className,
  ...props
}: AttachmentPreviewProps) {
  if (files.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2 px-4 py-2", className)} {...props}>
      {files.map((file) => (
        <div
          key={file.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="max-w-[100px] truncate">{file.name}</span>
          <button
            className="ml-1 hover:text-foreground"
            onClick={() => onRemove(file.id)}
            type="button"
          >
            <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export function Attachment() {
  return null
}

export function Attachments({ children }: { children?: ReactNode }) {
  return <>{children}</>
}
