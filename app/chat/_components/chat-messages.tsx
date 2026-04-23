"use client";

import type { UIMessage } from "ai";
import { isToolUIPart, isReasoningUIPart } from "ai";
import {
  Attachments,
  Attachment,
  AttachmentPreview,
} from "@/components/ai-elements/attachments";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Chart } from "@/components/ai-elements/foreground-tools/chart-tool";
import { DiagramImage } from "@/components/ai-elements/foreground-tools/diagram-image-tool";
import { Document } from "@/components/ai-elements/foreground-tools/document-tool";
import { AskUserQuestion } from "@/components/ai-elements/foreground-tools/ask-user-question-tool";
import { BackgroundToolsGroup } from "@/components/ai-elements/background-tools";
import { FeedbackDialog } from "@/components/feedback-dialog";
import {
  CopyIcon,
  RefreshCcwIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  DownloadIcon,
  FileTextIcon,
  FileIcon,
  FileDownIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportMessageAsMarkdown,
  exportMessageAsDocx,
  exportMessageAsPdf,
} from "@/lib/export-chat";
import { SourcesChip } from "@/components/sources-dialog";
import { Shimmer } from "@/components/ai-elements/shimmer";
import React, { memo, useCallback, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/** Renders foreground tool parts (charts, diagrams) inline. */
function renderForegroundToolPart(
  part: UIMessage["parts"][number],
  key: string,
  onSubmit: (text: string) => void | Promise<void>,
  disabled: boolean,
  submittedReply?: string | null
) {
  if (!isToolUIPart(part)) return null;

  if (
    part.type === "tool-createChart" ||
    (part.type === "dynamic-tool" && part.toolName === "createChart")
  ) {
    return (
      <Chart
        key={key}
        state={part.state}
        input={part.input as Parameters<typeof Chart>[0]["input"]}
        output={
          part.state === "output-available"
            ? (part.output as Parameters<typeof Chart>[0]["output"])
            : undefined
        }
      />
    );
  }

  if (
    part.type === "tool-getDiagramImageForDocument" ||
    (part.type === "dynamic-tool" && part.toolName === "getDiagramImageForDocument")
  ) {
    return (
      <DiagramImage
        key={key}
        state={part.state}
        input={part.input as Parameters<typeof DiagramImage>[0]["input"]}
        output={
          part.state === "output-available"
            ? (part.output as Parameters<typeof DiagramImage>[0]["output"])
            : undefined
        }
      />
    );
  }

  if (
    part.type === "tool-createDocument" ||
    (part.type === "dynamic-tool" && part.toolName === "createDocument")
  ) {
    return (
      <Document
        key={key}
        state={part.state}
        input={part.input as Parameters<typeof Document>[0]["input"]}
        output={
          part.state === "output-available"
            ? (part.output as Parameters<typeof Document>[0]["output"])
            : undefined
        }
      />
    );
  }

  if (
    part.type === "tool-askUserQuestion" ||
    (part.type === "dynamic-tool" && part.toolName === "askUserQuestion")
  ) {
    return (
      <AskUserQuestion
        key={key}
        state={part.state}
        input={part.input as Parameters<typeof AskUserQuestion>[0]["input"]}
        output={
          part.state === "output-available"
            ? (part.output as Parameters<typeof AskUserQuestion>[0]["output"])
            : undefined
        }
        disabled={disabled}
        submittedReply={submittedReply}
        onSubmit={onSubmit}
      />
    );
  }

  // Fallback for any unrecognized foreground tool
  return (
    <Tool key={key}>
      {part.type === "dynamic-tool" ? (
        <ToolHeader type={part.type} state={part.state} toolName={part.toolName} />
      ) : (
        <ToolHeader type={part.type} state={part.state} />
      )}
      <ToolContent>
        <ToolInput input={part.input} />
        <ToolOutput output={part.output} errorText={part.errorText} />
      </ToolContent>
    </Tool>
  );
}

/** Foreground tools are rendered prominently inline (charts, diagrams). Everything else is background. */
const FOREGROUND_TOOL_NAMES = new Set([
  "createChart",
  "getDiagramImageForDocument",
  "createDocument",
  "askUserQuestion",
]);

function isForegroundTool(part: UIMessage["parts"][number]): boolean {
  if (!isToolUIPart(part)) return false;
  if (
    part.type === "tool-createChart" ||
    part.type === "tool-getDiagramImageForDocument" ||
    part.type === "tool-createDocument" ||
    part.type === "tool-askUserQuestion"
  )
    return true;
  if (part.type === "dynamic-tool" && FOREGROUND_TOOL_NAMES.has(part.toolName))
    return true;
  return false;
}

function isBackgroundToolDone(part: UIMessage["parts"][number]): boolean {
  if (isReasoningUIPart(part)) return part.state === "done" || part.state === undefined;
  if (!isToolUIPart(part)) return false;
  return (
    part.state === "output-available" ||
    part.state === "output-error" ||
    part.state === "output-denied"
  );
}

function getMessageTextContent(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("\n");
}

function getNextUserReply(messages: UIMessage[], startIndex: number): string | null {
  for (let index = startIndex + 1; index < messages.length; index += 1) {
    const message = messages[index];

    if (message.role === "assistant") {
      return null;
    }

    if (message.role !== "user") {
      continue;
    }

    const reply = getMessageTextContent(message).trim();
    if (reply.length > 0) {
      return reply;
    }
  }

  return null;
}

const CopyAction = memo(({ content }: { content: string }) => {
  const handleClick = useCallback(() => {
    navigator.clipboard.writeText(content);
  }, [content]);
  return (
    <MessageAction label="Copy" onClick={handleClick} tooltip="Copy to clipboard">
      <CopyIcon className="size-4" />
    </MessageAction>
  );
});
CopyAction.displayName = "CopyAction";

const ExportMessageAction = memo(({ content }: { content: string }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <MessageAction label="Export" tooltip="Export message">
          <DownloadIcon className="size-4" />
        </MessageAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => exportMessageAsMarkdown(content)}>
          <FileTextIcon className="size-4" />
          Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportMessageAsDocx(content)}>
          <FileIcon className="size-4" />
          Word (.docx)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportMessageAsPdf(content)}>
          <FileDownIcon className="size-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
ExportMessageAction.displayName = "ExportMessageAction";

export function ChatMessages({
  messages,
  status,
  reload,
  chatId,
  onSubmit,
  allowToolReplies = true,
}: {
  messages: UIMessage[];
  status: string;
  reload?: () => void;
  chatId?: string;
  onSubmit: (text: string) => void | Promise<void>;
  allowToolReplies?: boolean;
}) {
  const submitFeedback = useMutation(api.feedback.submit);
  const removeFeedback = useMutation(api.feedback.remove);
  const existingFeedback = useQuery(
    api.feedback.getForChat,
    chatId ? { chatId: chatId as Id<"chats"> } : "skip"
  );

  // Build a map of messageId -> rating from existing feedback
  const feedbackMap = useMemo(() => {
    const map = new Map<string, "like" | "dislike">();
    if (existingFeedback) {
      for (const fb of existingFeedback) {
        map.set(fb.messageId, fb.rating);
      }
    }
    return map;
  }, [existingFeedback]);

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    messageId: string;
    legacyMessageId?: string;
    rating: "like" | "dislike";
  }>({ open: false, messageId: "", rating: "like" });

  const handleRate = useCallback(
    (
      messageId: string,
      rating: "like" | "dislike",
      legacyMessageId?: string
    ) => {
      const current =
        feedbackMap.get(messageId) ??
        (legacyMessageId ? feedbackMap.get(legacyMessageId) : undefined);

      if (current === rating) {
        // Toggle off
        removeFeedback({
          messageId: feedbackMap.has(messageId)
            ? messageId
            : (legacyMessageId ?? messageId),
        });
      } else {
        // Show dialog for optional comment
        setFeedbackDialog({ open: true, messageId, legacyMessageId, rating });
      }
    },
    [feedbackMap, removeFeedback]
  );

  const handleFeedbackSubmit = useCallback(
    (comment: string) => {
      submitFeedback({
        chatId: chatId as Id<"chats">,
        messageId: feedbackDialog.messageId,
        rating: feedbackDialog.rating,
        comment: comment || undefined,
      });
      setFeedbackDialog((prev) => ({ ...prev, open: false }));
    },
    [chatId, feedbackDialog.messageId, feedbackDialog.rating, submitFeedback]
  );

  const handleFeedbackSkip = useCallback(() => {
    submitFeedback({
      chatId: chatId as Id<"chats">,
      messageId: feedbackDialog.messageId,
      rating: feedbackDialog.rating,
    });
    setFeedbackDialog((prev) => ({ ...prev, open: false }));
  }, [chatId, feedbackDialog.messageId, feedbackDialog.rating, submitFeedback]);

  return (
    <>
      <Conversation>
        <ConversationContent className="mx-auto max-w-2xl pb-24">
          {messages.map((message, index) => {
            const feedbackKey = String(index);
            const msgRating =
              feedbackMap.get(feedbackKey) ?? feedbackMap.get(message.id);
            const nextUserReply = getNextUserReply(messages, index);
            return (
              <Message key={message.id} from={message.role}>
                {(() => {
                  // Collect ALL background parts into a single group so only one
                  // "Chain of Thought" section is rendered per message, even when
                  // foreground tools appear between reasoning/background steps.
                  const allBgParts: { part: UIMessage["parts"][number]; index: number }[] = [];
                  const otherElements: { element: React.ReactNode; order: number }[] = [];

                  // Chain of thought should collapse once text content or foreground tools appear
                  const hasVisibleContent = message.parts.some(
                    (part) =>
                      (part.type === "text" && part.text.length > 0) ||
                      isForegroundTool(part)
                  );

                  message.parts.forEach((part, i) => {
                    const key = `${message.id}-${i}`;

                    // File attachments
                    if (part.type === "file") {
                      otherElements.push({
                        order: i,
                        element: (
                          <Attachments key={key}>
                            <Attachment data={{ ...part, id: key }}>
                              <AttachmentPreview />
                            </Attachment>
                          </Attachments>
                        ),
                      });
                      return;
                    }

                    // Tool invocations
                    if (isToolUIPart(part)) {
                      if (isForegroundTool(part)) {
                        otherElements.push({
                          order: i,
                          element: renderForegroundToolPart(
                            part,
                            part.toolCallId ?? key,
                            onSubmit,
                            status !== "ready" || !allowToolReplies,
                            nextUserReply
                          ),
                        });
                      } else {
                        // Background tools all go into the single group
                        allBgParts.push({ part, index: i });
                      }
                      return;
                    }

                    // Reasoning parts go into the single background group
                    if (isReasoningUIPart(part)) {
                      allBgParts.push({ part, index: i });
                      return;
                    }

                    // Text content
                    if (part.type === "text" && part.text.length > 0) {
                      otherElements.push({
                        order: i,
                        element: (
                          <MessageContent key={key}>
                            <MessageResponse
                              isAnimating={
                                status === "streaming" &&
                                message.role === "assistant" &&
                                i === message.parts.length - 1
                              }
                            >
                              {part.text}
                            </MessageResponse>
                          </MessageContent>
                        ),
                      });
                      return;
                    }
                  });

                  // Build final elements: single background group first, then everything else in order
                  const elements: React.ReactNode[] = [];

                  if (allBgParts.length > 0) {
                    const allDone = allBgParts.every((g) =>
                      isBackgroundToolDone(g.part)
                    );
                    elements.push(
                      <BackgroundToolsGroup
                        key={`bg-group-${message.id}`}
                        parts={allBgParts.map((g) => g.part) as Parameters<typeof BackgroundToolsGroup>[0]["parts"]}
                        isStreaming={!allDone}
                        isResponseStreaming={
                          status === "streaming" &&
                          message.role === "assistant" &&
                          !hasVisibleContent
                        }
                      />
                    );
                  }

                  // Append foreground tools, text, and attachments in their original order
                  otherElements
                    .sort((a, b) => a.order - b.order)
                    .forEach((item) => elements.push(item.element));

                  return elements;
                })()}
                {message.role === "assistant" &&
                  status !== "streaming" &&
                  chatId && (
                    <MessageActions>
                      {index === messages.length - 1 && reload && (
                        <MessageAction
                          label="Regenerate"
                          onClick={reload}
                          tooltip="Regenerate response"
                        >
                          <RefreshCcwIcon className="size-4" />
                        </MessageAction>
                      )}
                      <MessageAction
                        label="Like"
                        onClick={() =>
                          handleRate(feedbackKey, "like", message.id)
                        }
                        tooltip="Like this response"
                      >
                        <ThumbsUpIcon
                          className="size-4"
                          fill={msgRating === "like" ? "currentColor" : "none"}
                        />
                      </MessageAction>
                      <MessageAction
                        label="Dislike"
                        onClick={() =>
                          handleRate(feedbackKey, "dislike", message.id)
                        }
                        tooltip="Dislike this response"
                      >
                        <ThumbsDownIcon
                          className="size-4"
                          fill={msgRating === "dislike" ? "currentColor" : "none"}
                        />
                      </MessageAction>
                      <CopyAction content={getMessageTextContent(message)} />
                      <ExportMessageAction content={getMessageTextContent(message)} />
                      <SourcesChip message={message} />
                    </MessageActions>
                  )}
              </Message>
            );
          })}
          {status === "submitted" && (
            <Message from="assistant">
              <MessageContent>
                <Shimmer className="text-sm">Working...</Shimmer>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <FeedbackDialog
        open={feedbackDialog.open}
        onOpenChange={(open) =>
          setFeedbackDialog((prev) => ({ ...prev, open }))
        }
        rating={feedbackDialog.rating}
        onSubmit={handleFeedbackSubmit}
        onSkip={handleFeedbackSkip}
      />
    </>
  );
}
