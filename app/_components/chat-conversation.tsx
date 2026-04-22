"use client"

import type { UIMessage } from "ai"
import { PromptInputProvider } from "@/components/ai-elements/prompt-input"
import { ChatInput } from "./chat-input"
import { ChatMessages } from "./chat-messages"
import { ChatScreenFrame } from "./chat-shell"
import { SuggestionList } from "./suggestion-list"
import type { ChatStatus, ChatSubmissionFile } from "./chat-utils"

type ChatConversationProps = {
  messages: UIMessage[]
  status: ChatStatus
  stop: () => void
  onSubmit: (text: string, files: ChatSubmissionFile[]) => void
  chatId?: string
  reload?: () => void
  showSuggestions?: boolean
  emptyTitle?: string
  autoFocus?: boolean
}

export function ChatConversation({
  messages,
  status,
  stop,
  onSubmit,
  chatId,
  reload,
  showSuggestions = false,
  emptyTitle = "What can I help you with?",
  autoFocus = false,
}: ChatConversationProps) {
  const hasMessages = messages.length > 0

  return (
    <PromptInputProvider>
      <ChatScreenFrame>
        {hasMessages ? (
          <ChatMessages
            messages={messages}
            status={status}
            reload={reload}
            chatId={chatId}
            onSubmit={(text) => onSubmit(text, [])}
          />
        ) : (
          <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
            <h2 className="text-lg font-medium text-muted-foreground">
              {emptyTitle}
            </h2>
            {showSuggestions ? (
              <SuggestionList onSuggestion={(text) => onSubmit(text, [])} />
            ) : null}
          </main>
        )}

        <ChatInput
          autoFocus={autoFocus}
          onSubmit={onSubmit}
          status={status}
          stop={stop}
        />
      </ChatScreenFrame>
    </PromptInputProvider>
  )
}
