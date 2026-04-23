export type KnowledgeFile = {
  id: string
  name: string
  status: "ready" | "processing" | "error"
}

export type ToolDefinition = {
  toolId: string
  name: string
  description: string
}

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  { toolId: "web-search", name: "Web Search", description: "Search the web for real-time information" },
  { toolId: "calculator", name: "Calculator", description: "Evaluate mathematical expressions" },
  { toolId: "fetch-images", name: "Fetch Images", description: "Search for images on the web" },
  { toolId: "create-chart", name: "Create Chart", description: "Create charts to visualize data" },
  { toolId: "create-document", name: "Create Document", description: "Generate a structured markdown document" },
  { toolId: "ask-user-question", name: "Ask User Question", description: "Present a multiple-choice question with a freeform reply option" },
  { toolId: "get-current-date-time", name: "Current Date & Time", description: "Get the current date and time based on locale and timezone" },
] as const
