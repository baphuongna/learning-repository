'use client'

import { useState } from 'react'
import { AIChatButton } from './AIChatButton'
import { AIChatPanel } from './AIChatPanel'
import { useAIChat } from '@/hooks/useAIChat'

/** Orchestrator - kết hợp FAB button + Chat panel */
export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const {
    messages,
    activeTab,
    isLoading,
    setActiveTab,
    sendMessage,
    clearHistory,
  } = useAIChat()

  return (
    <>
      <AIChatButton
        isOpen={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      />

      <AIChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        activeTab={activeTab}
        isLoading={isLoading}
        onTabChange={setActiveTab}
        onSendMessage={sendMessage}
        onClearHistory={clearHistory}
      />
    </>
  )
}
