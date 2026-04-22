import { tool } from "ai";
import { z } from "zod";

const dataPointSchema = z.record(z.string(), z.union([z.string(), z.number()]));

const dataSeriesSchema = z.object({
  dataKey: z.string().describe("The key in the data that this series maps to"),
  name: z.string().optional().describe("Display name for the series in legend/tooltip"),
  color: z
    .string()
    .optional()
    .describe("Color for this series (hex, hsl, oklch). Defaults to chart theme colors."),
  stackId: z
    .string()
    .optional()
    .describe("Stack ID to group stacked bars/areas together"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCreateChartTool(): Record<string, any> {
  return {
    createChart: tool({
      description:
        "Create a chart to visualize data. Supports bar, line, area, pie, and radar chart types. " +
        "Provide the chart type, data array, series configuration, and optional axis/label settings. " +
        "Use this when the user asks to visualize, plot, graph, or chart any data.",
      inputSchema: z.object({
        chartType: z
          .enum(["bar", "line", "area", "pie", "radar"])
          .describe("The type of chart to render"),
        title: z.string().optional().describe("Chart title"),
        description: z.string().optional().describe("Chart description or subtitle"),
        data: z
          .array(dataPointSchema)
          .describe(
            "Array of data points. Each object should have a category/label key and one or more numeric value keys."
          ),
        series: z
          .array(dataSeriesSchema)
          .describe(
            "Array of data series to plot. Each series references a dataKey from the data objects."
          ),
        categoryKey: z
          .string()
          .optional()
          .describe(
            "The key in data used for the x-axis labels (bar/line/area) or slice labels (pie). Defaults to the first non-numeric key."
          ),
        stacked: z
          .boolean()
          .optional()
          .describe("Whether bars/areas should be stacked. Defaults to false."),
        horizontal: z
          .boolean()
          .optional()
          .describe("Whether to render a horizontal bar chart. Only applies to bar charts."),
        showGrid: z.boolean().optional().describe("Show grid lines. Defaults to true."),
        showLegend: z.boolean().optional().describe("Show legend. Defaults to true."),
        showTooltip: z.boolean().optional().describe("Show tooltip on hover. Defaults to true."),
      }),
      execute: async (input) => {
        // The tool just passes through the config — rendering happens client-side
        return {
          chartType: input.chartType,
          title: input.title,
          description: input.description,
          data: input.data,
          series: input.series,
          categoryKey: input.categoryKey,
          stacked: input.stacked ?? false,
          horizontal: input.horizontal ?? false,
          showGrid: input.showGrid ?? true,
          showLegend: input.showLegend ?? true,
          showTooltip: input.showTooltip ?? true,
        };
      },
    }),
  };
}
