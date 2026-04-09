'use client'

import { useState, useCallback, useRef } from 'react'
import {
  type ChatMessage,
  type AITab,
  AI_TABS,
  sendChatMessage,
} from '@/lib/api/ai'

function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

interface UseAIChatReturn {
  /** Messages cho tab hiện tại */
  messages: ChatMessage[]
  /** Tab đang active */
  activeTab: AITab
  /** Đang chờ AI response */
  isLoading: boolean
  /** Đổi tab */
  setActiveTab: (tab: AITab) => void
  /** Gửi message */
  sendMessage: (content: string) => void
  /** Xóa history của tab hiện tại */
  clearHistory: () => void
}

export function useAIChat(): UseAIChatReturn {
  const [activeTab, setActiveTab] = useState<AITab>('qa')
  const [isLoading, setIsLoading] = useState(false)

  // Mỗi tab có message history riêng, lưu trong Map
  const [historyMap, setHistoryMap] = useState<Map<AITab, ChatMessage[]>>(() => {
    const map = new Map<AITab, ChatMessage[]>()
    for (const tab of AI_TABS) {
      map.set(tab.id, [
        {
          id: generateId(),
          role: 'assistant',
          content: tab.welcomeMessage,
          timestamp: new Date(),
          tab: tab.id,
        },
      ])
    }
    return map
  })

  // Ref để auto-scroll
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const scrollToBottom = useCallback(() => {
    // Delay nhỏ để đợi DOM cập nhật
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [])

  const messages = historyMap.get(activeTab) ?? []

  const handleSetActiveTab = useCallback(
    (tab: AITab) => {
      setActiveTab(tab)
    },
    []
  )

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      // Thêm user message
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
        tab: activeTab,
      }

      setHistoryMap((prev) => {
        const next = new Map(prev)
        next.set(activeTab, [...(next.get(activeTab) ?? []), userMessage])
        return next
      })

      setIsLoading(true)
      scrollToBottom()

      // Gọi mock API
      sendChatMessage(activeTab, trimmed)
        .then((response) => {
          const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: response.message,
            timestamp: new Date(),
            tab: activeTab,
          }

          setHistoryMap((prev) => {
            const next = new Map(prev)
            next.set(activeTab, [
              ...(next.get(activeTab) ?? []),
              assistantMessage,
            ])
            return next
          })
        })
        .finally(() => {
          setIsLoading(false)
          scrollToBottom()
        })
    },
    [activeTab, isLoading, scrollToBottom]
  )

  const clearHistory = useCallback(() => {
    const tabConfig = AI_TABS.find((t) => t.id === activeTab)
    setHistoryMap((prev) => {
      const next = new Map(prev)
      next.set(activeTab, [
        {
          id: generateId(),
          role: 'assistant',
          content: tabConfig?.welcomeMessage ?? '',
          timestamp: new Date(),
          tab: activeTab,
        },
      ])
      return next
    })
  }, [activeTab])

  return {
    messages,
    activeTab,
    isLoading,
    setActiveTab: handleSetActiveTab,
    sendMessage,
    clearHistory,
  }
}
