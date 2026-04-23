"use client";

import { ChainOfThoughtStep } from "@/components/ai-elements/chain-of-thought";
import type { ToolUIPart, ToolConfig } from "./types";
import { getToolName, isPartDone } from "./types";

import { tavilySearchConfig, TavilySearchContent } from "./tavily-search-tool";
import { tavilyExtractConfig, TavilyExtractContent } from "./tavily-extract-tool";
import { calculatorConfig, CalculatorContent } from "./calculator-tool";
import { fetchImagesConfig, FetchImagesContent } from "./fetch-images-tool";
import { getChartImageConfig, GetChartImageContent } from "./get-chart-image-tool";
import { composioSearchConfig, ComposioSearchContent, getComposioSearchLabel } from "./composio-search-tool";
import {
  composioMultiExecuteConfig,
  getMultiExecuteLabel,
  ComposioMultiExecuteContent,
} from "./composio-multi-execute-tool";
import {
  composioRemoteWorkbenchConfig,
  ComposioRemoteWorkbenchContent,
} from "./composio-remote-workbench-tool";
import {
  composioRemoteBashConfig,
  ComposioRemoteBashContent,
} from "./composio-remote-bash-tool";
import { getCurrentDateTimeConfig, GetCurrentDateTimeContent } from "./get-current-date-time-tool";
import { getDefaultConfig, DefaultToolContent } from "./default-tool";

interface ToolRegistry {
  config: ToolConfig;
  Content: React.ComponentType<{ part: ToolUIPart }>;
  /** Override the completed label (e.g. dynamic count for multi-execute) */
  getLabel?: (part: ToolUIPart) => string;
}

const toolRegistry: Record<string, ToolRegistry> = {
  tavilySearch: {
    config: tavilySearchConfig,
    Content: TavilySearchContent,
  },
  tavilyExtract: {
    config: tavilyExtractConfig,
    Content: TavilyExtractContent,
  },
  calculator: {
    config: calculatorConfig,
    Content: CalculatorContent,
  },
  fetchImages: {
    config: fetchImagesConfig,
    Content: FetchImagesContent,
  },
  getCurrentDateTime: {
    config: getCurrentDateTimeConfig,
    Content: GetCurrentDateTimeContent,
  },
  getChartImageForDocument: {
    config: getChartImageConfig,
    Content: GetChartImageContent,
  },
  COMPOSIO_SEARCH_TOOLS: {
    config: composioSearchConfig,
    Content: ComposioSearchContent,
    getLabel: getComposioSearchLabel,
  },
  COMPOSIO_MULTI_EXECUTE_TOOL: {
    config: composioMultiExecuteConfig,
    Content: ComposioMultiExecuteContent,
    getLabel: getMultiExecuteLabel,
  },
  COMPOSIO_REMOTE_WORKBENCH: {
    config: composioRemoteWorkbenchConfig,
    Content: ComposioRemoteWorkbenchContent,
  },
  COMPOSIO_REMOTE_BASH_TOOL: {
    config: composioRemoteBashConfig,
    Content: ComposioRemoteBashContent,
  },
};

function resolveRegistry(part: ToolUIPart): ToolRegistry {
  const name = getToolName(part);

  // Check for multi-execute pattern match
  if (/multi.?execute/i.test(name)) {
    return toolRegistry.COMPOSIO_MULTI_EXECUTE_TOOL;
  }

  if (/remote.*(workbench|toolbench)/i.test(name)) {
    return toolRegistry.COMPOSIO_REMOTE_WORKBENCH;
  }

  if (/remote.*bash/i.test(name)) {
    return toolRegistry.COMPOSIO_REMOTE_BASH_TOOL;
  }

  return (
    toolRegistry[name] ?? {
      config: getDefaultConfig(part),
      Content: DefaultToolContent,
    }
  );
}

export interface ToolStepProps {
  part: ToolUIPart;
  isStreaming: boolean;
}

export function ToolStep({ part, isStreaming }: ToolStepProps) {
  const { config, Content, getLabel } = resolveRegistry(part);
  const done = isPartDone(part);

  const label = done
    ? (getLabel?.(part) ?? config.label)
    : config.activeLabel;

  const status = isStreaming
    ? done ? "complete" : "active"
    : "complete";

  return (
    <ChainOfThoughtStep
      icon={config.icon}
      label={label}
      description={config.getDescription(part)}
      status={status}
    >
      <Content part={part} />
    </ChainOfThoughtStep>
  );
}
