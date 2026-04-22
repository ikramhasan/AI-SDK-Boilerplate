"use client";

import { useState, useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Cancel01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";

interface ShareChatDialogProps {
  chatId: string;
  isShared: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareChatDialog({
  chatId,
  isShared,
  open,
  onOpenChange,
}: ShareChatDialogProps) {
  const shareChat = useMutation(api.chats.share);
  const [shared, setShared] = useState(isShared);
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${chatId}`
      : "";

  const handleShare = useCallback(async () => {
    await shareChat({ chatId: chatId as Id<"chats"> });
    setShared(true);
  }, [shareChat, chatId]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareLink]);

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmail();
    }
    if (e.key === "Backspace" && emailInput === "" && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const addEmail = () => {
    const trimmed = emailInput.trim().replace(/[,\s]+$/, "");
    if (trimmed && trimmed.includes("@") && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
    }
    setEmailInput("");
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setShared(isShared);
      setCopied(false);
      setEmailInput("");
      setEmails([]);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share chat</DialogTitle>
          <DialogDescription>
            {shared
              ? "Anyone with the link can view this chat."
              : "Make this chat publicly viewable via a link."}
          </DialogDescription>
        </DialogHeader>

        {!shared ? (
          <DialogFooter>
            <Button onClick={handleShare}>Create share link</Button>
          </DialogFooter>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={shareLink}
                className="flex-1 text-xs"
                onFocus={(e) => e.target.select()}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label="Copy link"
              >
                <HugeiconsIcon
                  icon={copied ? Tick01Icon : Copy01Icon}
                  size={16}
                />
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground">
                Share via email (optional)
              </label>
              <div
                className="flex min-h-9 flex-wrap items-center gap-1 rounded-3xl border border-transparent bg-input/50 px-2 py-1 transition-[color,box-shadow,background-color] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30 cursor-text"
                onClick={() => inputRef.current?.focus()}
              >
                {emails.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1 shrink-0">
                    {email}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeEmail(email);
                      }}
                      className="ml-0.5 rounded-full hover:bg-foreground/10"
                      aria-label={`Remove ${email}`}
                    >
                      <HugeiconsIcon icon={Cancel01Icon} size={12} />
                    </button>
                  </Badge>
                ))}
                <input
                  ref={inputRef}
                  type="text"
                  className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder={emails.length === 0 ? "Add people by email" : ""}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleEmailKeyDown}
                  onBlur={addEmail}
                />
              </div>
              {emails.length > 0 && (
                <Button className="self-end" size="sm" disabled>
                  Share
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Email sending is not yet available.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
