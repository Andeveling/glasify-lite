'use client'

interface ConfirmSummaryRowProps {
  label: string
  value: string
}

function ConfirmSummaryRow({ label, value }: ConfirmSummaryRowProps) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  )
}

export { ConfirmSummaryRow }
