'use client'

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { AI_TABS, type AITab, type ChatMessage } from '@/lib/api/ai'
import { AITabSelector } from './AITabSelector'
import { AIMessageBubble, AITypingIndicator } from './AIMessageBubble'
import { X, Send, Trash2 } from 'lucide-react'

interface AIChatPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: ChatMessage[]
  activeTab: AITab
  isLoading: boolean
  onTabChange: (tab: AITab) => void
  onSendMessage: (content: string) => void
  onClearHistory: () => void
}

/** Chat panel - slide-up với glass morphism */
export function AIChatPanel({
  isOpen,
  onClose,
  messages,
  activeTab,
  isLoading,
  onTabChange,
  onSendMessage,
  onClearHistory,
}: AIChatPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeConfig = AI_TABS.find((t) => t.id === activeTab)

  // Auto-scroll khi có message mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input khi mở panel
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Reset input khi đổi tab
  useEffect(() => {
    setInput('')
  }, [activeTab])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSendMessage(input)
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter gửi, Shift+Enter xuống dòng
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-[60]',
        'w-[400px] max-w-[calc(100vw-2rem)]',
        'flex flex-col',
        'bg-card/95 backdrop-blur-xl border border-border rounded-2xl',
        'shadow-2xl shadow-black/10',
        'transition-all duration-300 origin-bottom-right',
        isOpen
          ? 'scale-100 opacity-100 translate-y-0'
          : 'scale-75 opacity-0 translate-y-4 pointer-events-none'
      )}
      style={{ height: 'min(70vh, 560px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-teal-600 flex items-center justify-center">
            <span className="text-white text-sm">AI</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Trợ lý AI</h3>
            <p className="text-[10px] text-muted-foreground">Beta</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClearHistory}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Xóa lịch sử"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <AITabSelector activeTab={activeTab} onTabChange={onTabChange} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <AIMessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <AITypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activeConfig?.placeholder ?? 'Nhập tin nhắn...'}
            rows={1}
            className={cn(
              'flex-1 resize-none rounded-xl border border-input bg-background',
              'px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              'transition-colors',
              'max-h-24'
            )}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'flex-shrink-0 h-9 w-9 rounded-xl',
              'flex items-center justify-center',
              'transition-all duration-200',
              input.trim() && !isLoading
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'bg-muted text-muted-foreground'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
