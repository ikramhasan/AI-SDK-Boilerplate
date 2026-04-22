import { tool } from "ai";
import { z } from "zod";
import { uploadImageToConvex } from "./upload-asset";

const DEFAULT_COLORS = [
  "rgba(59, 130, 246, 0.8)",  // blue
  "rgba(16, 185, 129, 0.8)",  // green
  "rgba(245, 158, 11, 0.8)",  // amber
  "rgba(239, 68, 68, 0.8)",   // red
  "rgba(139, 92, 246, 0.8)",  // violet
];

const DEFAULT_BORDER_COLORS = [
  "rgb(59, 130, 246)",
  "rgb(16, 185, 129)",
  "rgb(245, 158, 11)",
  "rgb(239, 68, 68)",
  "rgb(139, 92, 246)",
];

const dataPointSchema = z.record(z.string(), z.union([z.string(), z.number()]));

const dataSeriesSchema = z.object({
  dataKey: z.string().describe("The key in the data that this series maps to"),
  name: z.string().optional().describe("Display name for the series"),
  color: z.string().optional().describe("Color for this series"),
  stackId: z.string().optional().describe("Stack ID for grouped stacking"),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getChartImageTool(): Record<string, any> {
  return {
    getChartImageForDocument: tool({
      description:
        "Render a chart as a PNG image and return its URL. Use this ONLY when preparing visuals " +
        "for a createDocument call. For interactive charts in chat, use createChart instead. " +
        "Supports bar, line, area, pie, and radar chart types.",
      inputSchema: z.object({
        chartType: z
          .enum(["bar", "line", "area", "pie", "radar"])
          .describe("The type of chart to render"),
        title: z.string().optional().describe("Chart title"),
        data: z
          .array(dataPointSchema)
          .describe("Array of data points"),
        series: z
          .array(dataSeriesSchema)
          .describe("Array of data series to plot"),
        categoryKey: z
          .string()
          .optional()
          .describe("The key used for labels/categories"),
        stacked: z.boolean().optional().describe("Whether to stack bars/areas"),
      }),
      execute: async (input) => {
        try {
          const { ChartJSNodeCanvas } = await import("chartjs-node-canvas");

          const width = 800;
          const height = 450;
          const chartJSNodeCanvas = new ChartJSNodeCanvas({
            width,
            height,
            backgroundColour: "#ffffff",
          });

          const { chartType, title, data, series, categoryKey, stacked } = input;

          // Detect category key
          const seriesKeys = new Set(series.map((s) => s.dataKey));
          const catKey =
            categoryKey ??
            Object.keys(data[0] ?? {}).find(
              (k) => !seriesKeys.has(k) && typeof data[0]?.[k] === "string"
            ) ??
            "name";

          const labels = data.map((d) => String(d[catKey] ?? ""));

          // Map to Chart.js type
          const chartJsType =
            chartType === "area" ? "line" : chartType === "radar" ? "radar" : chartType;

          // Build datasets
          const datasets = series.map((s, i) => {
            const values = data.map((d) => Number(d[s.dataKey] ?? 0));
            const bgColor = s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            const borderColor =
              s.color ?? DEFAULT_BORDER_COLORS[i % DEFAULT_BORDER_COLORS.length];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dataset: any = {
              label: s.name ?? s.dataKey,
              data: values,
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: chartType === "line" || chartType === "area" ? 2 : 1,
            };

            if (chartType === "area") {
              dataset.fill = true;
              dataset.backgroundColor = bgColor.replace("0.8", "0.3");
            }

            if (stacked && s.stackId) {
              dataset.stack = s.stackId;
            } else if (stacked) {
              dataset.stack = "stack";
            }

            if (chartType === "line" || chartType === "area") {
              dataset.tension = 0.3;
              dataset.pointRadius = 3;
            }

            if (chartType === "pie") {
              dataset.backgroundColor = data.map(
                (_, j) => DEFAULT_COLORS[j % DEFAULT_COLORS.length]
              );
              dataset.borderColor = data.map(
                (_, j) => DEFAULT_BORDER_COLORS[j % DEFAULT_BORDER_COLORS.length]
              );
            }

            return dataset;
          });

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const config: any = {
            type: chartJsType,
            data: { labels, datasets },
            options: {
              responsive: false,
              plugins: {
                title: title
                  ? { display: true, text: title, color: "#1f2937", font: { size: 16 } }
                  : undefined,
                legend: {
                  display: series.length > 1 || chartType === "pie",
                  labels: { color: "#4b5563" },
                },
              },
              scales:
                chartType !== "pie" && chartType !== "radar"
                  ? {
                      x: {
                        ticks: { color: "#4b5563" },
                        grid: { color: "rgba(107,114,128,0.15)" },
                        stacked: stacked ?? false,
                      },
                      y: {
                        ticks: { color: "#4b5563" },
                        grid: { color: "rgba(107,114,128,0.15)" },
                        stacked: stacked ?? false,
                      },
                    }
                  : undefined,
            },
          };

          if (chartType === "radar") {
            config.options.scales = {
              r: {
                ticks: { color: "#4b5563", backdropColor: "transparent" },
                grid: { color: "rgba(107,114,128,0.2)" },
                angleLines: { color: "rgba(107,114,128,0.2)" },
                pointLabels: { color: "#4b5563" },
              },
            };
          }

          const buffer = await chartJSNodeCanvas.renderToBuffer(config);
          const url = await uploadImageToConvex(Buffer.from(buffer));

          return { url, title };
        } catch (error) {
          return {
            error: `Failed to generate chart image: ${(error as Error).message}`,
          };
        }
      },
    }),
  };
}
