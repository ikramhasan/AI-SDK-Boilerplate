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
        <Suggestion suggestion="Diagnose an entitlement failure in my community" onClick={onSuggestion} />
        <Suggestion suggestion="Map underutilized assets for a social initiative" onClick={onSuggestion} />
        <Suggestion suggestion="Stress-test my institutional model for fragility" onClick={onSuggestion} />
      </Suggestions>
    </div>
  );
}
