"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type ChartConfig = Record<string, {
  label?: string
  color?: string
}>

interface ChartContextType {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextType | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig
  }
>(({ className, config, children, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    cursor?: boolean
    content?: React.ComponentType<any>
  }
>(({ className, cursor: _cursor, content: _content, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("", className)} {...props}>
      {/* Recharts will handle this */}
    </div>
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideLabel?: boolean
  }
>(({ className, hideLabel: _hideLabel, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
      {...props}
    />
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
  type ChartConfig,
} 