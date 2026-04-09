'use client'

import type { ChatMessage } from '@/lib/api/ai'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'

interface AIMessageBubbleProps {
  message: ChatMessage
}

/** Hiển thị single message trong chat */
export function AIMessageBubble({ message }: AIMessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-card border border-border text-card-foreground rounded-bl-sm'
        )}
      >
        {/* Basic markdown: bold + line breaks */}
        <div className="whitespace-pre-wrap">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-1' : ''}>
              {renderInlineMarkdown(line)}
            </p>
          ))}
        </div>

        {/* Timestamp */}
        <p
          className={cn(
            'text-[10px] mt-1',
            isUser
              ? 'text-primary-foreground/60'
              : 'text-muted-foreground'
          )}
        >
          {message.timestamp.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

/** Typing indicator - 3 dots animation */
export function AITypingIndicator() {
  return (
    <div className="flex gap-2 animate-in fade-in-0 duration-200">
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="bg-card border border-border rounded-xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Basic inline markdown: **bold** */
function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}
