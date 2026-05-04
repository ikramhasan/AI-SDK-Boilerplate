import type { UIMessage } from "ai"

export type PersistedToolRun = {
  partIndex: number
  type: string
  state: string
  toolCallId?: string
  toolName?: string
  errorText?: string
  input?: unknown
  output?: unknown
}

export type PersistedMessagePart =
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string; state?: string }
  | { type: "file"; url: string; mediaType: string; filename?: string }
  | { type: "step-start" }
  | { type: "tool-run-ref"; partIndex: number }

export type PersistedChatMessage = {
  role: string
  parts: PersistedMessagePart[]
  toolRuns: PersistedToolRun[]
  metadata?: Record<string, unknown>
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined
}

function getNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined
}

function getArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined
}

function isToolPart(part: unknown): part is UnknownRecord & {
  type: string
  state?: string
  toolName?: string
  toolCallId?: string
  errorText?: string
  input?: unknown
  output?: unknown
} {
  if (!isRecord(part)) return false
  const type = getString(part.type)
  return type === "dynamic-tool" || type?.startsWith("tool-") === true
}

function isToolRunRefPart(part: unknown): part is { type: "tool-run-ref"; partIndex: number } {
  return (
    isRecord(part) &&
    part.type === "tool-run-ref" &&
    typeof part.partIndex === "number"
  )
}

function toolNameForPart(part: {
  type: string
  toolName?: string
}): string {
  return part.type === "dynamic-tool"
    ? part.toolName ?? ""
    : part.type.replace(/^tool-/, "")
}

function compactCreateChartInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    chartType: getString(record.chartType),
    title: getString(record.title),
    description: getString(record.description),
  }
}

function compactCreateChartOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  const rawSeries = getArray(record.series) ?? []
  const rawData = getArray(record.data) ?? []

  return {
    chartType: getString(record.chartType),
    title: getString(record.title),
    description: getString(record.description),
    data: rawData.filter(isRecord).map((row) => ({ ...row })),
    series: rawSeries
      .filter(isRecord)
      .map((series) => ({
        dataKey: getString(series.dataKey),
        name: getString(series.name),
        color: getString(series.color),
        stackId: getString(series.stackId),
      }))
      .filter((series) => typeof series.dataKey === "string"),
    categoryKey: getString(record.categoryKey),
    stacked: getBoolean(record.stacked),
    horizontal: getBoolean(record.horizontal),
    showGrid: getBoolean(record.showGrid),
    showLegend: getBoolean(record.showLegend),
    showTooltip: getBoolean(record.showTooltip),
    error: getString(record.error),
  }
}

function compactDiagramInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    title: getString(record.title),
  }
}

function compactDiagramOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  return {
    url: getString(record.url),
    title: getString(record.title),
    error: getString(record.error),
  }
}

function compactDocumentInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    title: getString(record.title),
    content: getString(record.content),
  }
}

function compactDocumentOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  return {
    title: getString(record.title),
    content: getString(record.content),
    error: getString(record.error),
  }
}

function compactAskUserQuestionInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  const rawOptions = getArray(record.options) ?? []

  return {
    question: getString(record.question),
    options: rawOptions
      .filter(isRecord)
      .map((option) => ({
        label: getString(option.label),
        description: getString(option.description),
      }))
      .filter(
        (option) =>
          typeof option.label === "string" &&
          typeof option.description === "string"
      ),
    freeformPlaceholder: getString(record.freeformPlaceholder),
  }
}

function compactAskUserQuestionOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  return {
    ...compactAskUserQuestionInput(output),
    error: getString(record.error),
  }
}

function compactChartImageInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    title: getString(record.title),
    chartType: getString(record.chartType),
  }
}

function compactChartImageOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  return {
    url: getString(record.url),
    title: getString(record.title),
    error: getString(record.error),
  }
}

function compactFetchImagesInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    query: getString(record.query),
  }
}

function compactFetchImagesOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  const results = getArray(record.results) ?? []

  return {
    results: results
      .filter(isRecord)
      .map((result) => ({
        url: getString(result.url),
        thumbnailUrl: getString(result.thumbnailUrl),
        title: getString(result.title),
      }))
      .filter((result) => typeof result.url === "string"),
  }
}

function compactCalculatorInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    expression: getString(record.expression),
  }
}

function compactCalculatorOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  return {
    result: getNumber(record.result),
  }
}

function compactComposioSearchOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  const data = isRecord(record.data) ? record.data : {}
  const results = getArray(data.results) ?? []
  const first = isRecord(results[0]) ? results[0] : {}
  const toolkitStatuses = getArray(data.toolkit_connection_statuses) ?? []

  return {
    data: {
      results: [
        {
          use_case: getString(first.use_case),
          primary_tool_slugs: (getArray(first.primary_tool_slugs) ?? []).filter(
            (value): value is string => typeof value === "string"
          ),
        },
      ],
      toolkit_connection_statuses: toolkitStatuses
        .filter(isRecord)
        .map((status) => ({
          toolkit: getString(status.toolkit),
          has_active_connection: getBoolean(status.has_active_connection),
        }))
        .filter((status) => typeof status.toolkit === "string"),
    },
  }
}

function compactComposioMultiExecuteInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  const tools = getArray(record.tools) ?? []

  return {
    tools: tools
      .filter(isRecord)
      .map((tool) => ({
        tool_slug: getString(tool.tool_slug),
      }))
      .filter((tool) => typeof tool.tool_slug === "string"),
  }
}

function compactUnknownValue(value: unknown, depth = 0): unknown {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    return value
  }

  if (typeof value === "string") {
    return value.length > 500 ? `${value.slice(0, 500).trimEnd()}...` : value
  }

  if (Array.isArray(value)) {
    const items = value
      .slice(0, 4)
      .map((item) => compactUnknownValue(item, depth + 1))
      .filter((item) => item !== undefined)

    if (value.length > 4) {
      items.push(`... +${value.length - 4} more`)
    }

    return items
  }

  if (!isRecord(value)) return undefined
  if (depth >= 2) return Object.keys(value)

  const compactedEntries = Object.entries(value)
    .slice(0, 8)
    .map(([key, entryValue]) => [key, compactUnknownValue(entryValue, depth + 1)] as const)
    .filter(([, entryValue]) => entryValue !== undefined)

  const compacted = Object.fromEntries(compactedEntries)

  if (Object.keys(value).length > 8) {
    compacted._summary = `+${Object.keys(value).length - 8} more fields`
  }

  return compacted
}

function compactComposioRemoteWorkbenchInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    code_to_execute: getString(record.code_to_execute),
    thought: getString(record.thought),
    session_id: getString(record.session_id),
    current_step: getString(record.current_step),
    current_step_metric: getString(record.current_step_metric),
  }
}

function compactComposioRemoteWorkbenchOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  return {
    successful: getBoolean(record.successful),
    error: getString(record.error),
    data: compactUnknownValue(record.data),
  }
}

function compactComposioRemoteBashInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    command: getString(record.command),
    session_id: getString(record.session_id),
  }
}

function compactComposioRemoteBashOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  return {
    successful: getBoolean(record.successful),
    error: getString(record.error),
    data: compactUnknownValue(record.data),
  }
}

function compactTavilySearchInput(input: unknown) {
  const record = isRecord(input) ? input : {}
  return {
    query: getString(record.query),
  }
}

function compactTavilySearchOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  const results = getArray(record.results) ?? []

  return {
    results: results
      .filter(isRecord)
      .map((result) => ({
        title: getString(result.title),
        url: getString(result.url),
        content: getString(result.content),
      }))
      .filter((result) => typeof result.url === "string"),
  }
}

function compactTavilyExtractOutput(output: unknown) {
  const record = isRecord(output) ? output : {}
  const results = getArray(record.results) ?? []

  return {
    results: results
      .filter(isRecord)
      .map((result) => ({
        url: getString(result.url),
        rawContent: getString(result.rawContent),
      }))
      .filter((result) => typeof result.url === "string"),
  }
}

function compactToolInput(toolName: string, input: unknown): unknown {
  switch (toolName) {
    case "createChart":
      return compactCreateChartInput(input)
    case "getDiagramImageForDocument":
      return compactDiagramInput(input)
    case "createDocument":
      return compactDocumentInput(input)
    case "askUserQuestion":
      return compactAskUserQuestionInput(input)
    case "getChartImageForDocument":
      return compactChartImageInput(input)
    case "fetchImages":
      return compactFetchImagesInput(input)
    case "calculator":
      return compactCalculatorInput(input)
    case "COMPOSIO_MULTI_EXECUTE_TOOL":
      return compactComposioMultiExecuteInput(input)
    case "COMPOSIO_REMOTE_WORKBENCH":
      return compactComposioRemoteWorkbenchInput(input)
    case "COMPOSIO_REMOTE_BASH_TOOL":
      return compactComposioRemoteBashInput(input)
    case "tavilySearch":
      return compactTavilySearchInput(input)
    default:
      return undefined
  }
}

function compactToolOutput(toolName: string, output: unknown): unknown {
  switch (toolName) {
    case "createChart":
      return compactCreateChartOutput(output)
    case "getDiagramImageForDocument":
      return compactDiagramOutput(output)
    case "createDocument":
      return compactDocumentOutput(output)
    case "askUserQuestion":
      return compactAskUserQuestionOutput(output)
    case "getChartImageForDocument":
      return compactChartImageOutput(output)
    case "fetchImages":
      return compactFetchImagesOutput(output)
    case "calculator":
      return compactCalculatorOutput(output)
    case "COMPOSIO_SEARCH_TOOLS":
      return compactComposioSearchOutput(output)
    case "COMPOSIO_REMOTE_WORKBENCH":
      return compactComposioRemoteWorkbenchOutput(output)
    case "COMPOSIO_REMOTE_BASH_TOOL":
      return compactComposioRemoteBashOutput(output)
    case "tavilySearch":
      return compactTavilySearchOutput(output)
    case "tavilyExtract":
      return compactTavilyExtractOutput(output)
    default:
      return undefined
  }
}

function serializeToolRun(
  part: UnknownRecord & {
    type: string
    state?: string
    toolCallId?: string
    toolName?: string
    errorText?: string
    input?: unknown
    output?: unknown
  },
  partIndex: number
): PersistedToolRun {
  const toolName = toolNameForPart(part)
  return {
    partIndex,
    type: part.type,
    state: getString(part.state) ?? "input-available",
    toolCallId: getString(part.toolCallId),
    toolName: part.type === "dynamic-tool" ? toolName : undefined,
    errorText: getString(part.errorText),
    input: compactToolInput(toolName, part.input),
    output: compactToolOutput(toolName, part.output),
  }
}

function inflateToolRun(run: PersistedToolRun): UnknownRecord {
  return {
    type: run.type,
    state: run.state,
    ...(run.toolCallId ? { toolCallId: run.toolCallId } : {}),
    ...(run.toolName ? { toolName: run.toolName } : {}),
    ...(run.errorText ? { errorText: run.errorText } : {}),
    ...(run.input !== undefined ? { input: run.input } : {}),
    ...(run.output !== undefined ? { output: run.output } : {}),
  }
}

export function serializeMessageForStorage(message: UIMessage): PersistedChatMessage {
  const toolRuns: PersistedToolRun[] = []
  const parts: PersistedMessagePart[] = []

  message.parts.forEach((part, partIndex) => {
    if (isToolPart(part)) {
      toolRuns.push(serializeToolRun(part, partIndex))
      parts.push({ type: "tool-run-ref", partIndex })
      return
    }

    if (!isRecord(part) || typeof part.type !== "string") {
      return
    }

    if (part.type === "text") {
      parts.push({ type: "text", text: getString(part.text) ?? "" })
      return
    }

    if (part.type === "reasoning") {
      parts.push({
        type: "reasoning",
        text: getString(part.text) ?? "",
        state: getString(part.state),
      })
      return
    }

    if (part.type === "file") {
      const url = getString(part.url)
      const mediaType = getString(part.mediaType)
      if (!url || !mediaType) return
      parts.push({
        type: "file",
        url,
        mediaType,
        filename: getString(part.filename),
      })
      return
    }

    if (part.type === "step-start") {
      parts.push({ type: "step-start" })
    }
  })

  const metadata = (message as UIMessage & { metadata?: Record<string, unknown> }).metadata

  return {
    role: message.role,
    parts,
    toolRuns,
    ...(metadata ? { metadata } : {}),
  }
}

export function serializeMessagesForStorage(messages: UIMessage[]): PersistedChatMessage[] {
  return messages.map(serializeMessageForStorage)
}

export function hydrateStoredMessageParts(
  storedParts: unknown[],
  toolRuns: PersistedToolRun[]
): unknown[] {
  const toolRunByIndex = new Map(toolRuns.map((run) => [run.partIndex, run]))

  return storedParts.flatMap((part) => {
    if (isToolRunRefPart(part)) {
      const run = toolRunByIndex.get(part.partIndex)
      return run ? [inflateToolRun(run)] : []
    }
    return [part]
  })
}
