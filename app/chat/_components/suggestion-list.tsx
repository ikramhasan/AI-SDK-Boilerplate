"use client";

import {
  Suggestions,
  Suggestion,
} from "@/components/ai-elements/suggestion";

export function SuggestionList({
  onSuggestion,
}: {
  onSuggestion: (text: string) => void;
}) {
  return (
    <div className="flex justify-center">
      <Suggestions>
        <Suggestion suggestion="Summarize my emails last day and create action items" onClick={onSuggestion} />
        <Suggestion suggestion="Analyze my Stripe revenue data and provide a report" onClick={onSuggestion} />
        <Suggestion suggestion="Draft follow-up emails for yesterday's calls" onClick={onSuggestion} />
      </Suggestions>
    </div>
  );
}
