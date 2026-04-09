'use client'

import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface AIChatButtonProps {
  onClick: () => void
  isOpen: boolean
}

/** Floating Action Button cho Trợ lý AI */
export function AIChatButton({ onClick, isOpen }: AIChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group fixed bottom-6 right-6 z-[60]',
        'h-14 w-14 rounded-full',
        'bg-gradient-to-r from-primary to-teal-600',
        'text-white shadow-lg shadow-primary/30',
        'flex items-center justify-center',
        'transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary/40 hover:scale-105',
        'active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isOpen && 'rotate-0'
      )}
      aria-label={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
      title="Trợ lý AI"
    >
      <Sparkles
        className={cn(
          'w-6 h-6 transition-transform duration-300',
          'group-hover:rotate-12',
          isOpen && 'rotate-180'
        )}
      />

      {/* Pulse ring khi đóng */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
      )}
    </button>
  )
}
