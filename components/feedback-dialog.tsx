"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rating: "like" | "dislike";
  onSubmit: (comment: string) => void;
  onSkip: () => void;
}

export function FeedbackDialog({
  open,
  onOpenChange,
  rating,
  onSubmit,
  onSkip,
}: FeedbackDialogProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(comment);
    setComment("");
  };

  const handleSkip = () => {
    onSkip();
    setComment("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {rating === "like"
              ? "What did you like?"
              : "What could be improved?"}
          </DialogTitle>
          <DialogDescription>
            Your feedback helps us improve. This is optional.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder={
            rating === "like"
              ? "Tell us what was helpful..."
              : "Tell us what went wrong..."
          }
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
