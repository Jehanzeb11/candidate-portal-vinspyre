"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"

interface PageHeaderProps {
  title: string
  description?: string
  badge?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, badge, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60 mb-8">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badge && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {children}
        </div>
      )}
    </div>
  )
}
