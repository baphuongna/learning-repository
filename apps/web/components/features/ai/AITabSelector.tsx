'use client'

import { AI_TABS, type AITab } from '@/lib/api/ai'
import { cn } from '@/lib/utils'
import { MessageCircle, Search, PenTool, FileText } from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  Search,
  PenTool,
  FileText,
}

interface AITabSelectorProps {
  activeTab: AITab
  onTabChange: (tab: AITab) => void
}

/** Tab selector cho 4 tính năng AI */
export function AITabSelector({ activeTab, onTabChange }: AITabSelectorProps) {
  return (
    <div className="flex border-b border-border bg-muted/30">
      {AI_TABS.map((tab) => {
        const Icon = ICON_MAP[tab.icon]
        const isActive = activeTab === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-medium transition-all duration-200',
              'hover:bg-muted/50',
              isActive
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground border-b-2 border-transparent'
            )}
            title={tab.label}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
