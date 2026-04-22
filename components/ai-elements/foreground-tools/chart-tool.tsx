"use client";

import {
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

type ChartState =
  | "input-available"
  | "input-streaming"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

interface SeriesConfig {
  dataKey: string;
  name?: string;
  color?: string;
  stackId?: string;
}

export interface ChartInput {
  chartType?: "bar" | "line" | "area" | "pie" | "radar";
  title?: string;
  description?: string;
}

export interface ChartOutput {
  chartType: "bar" | "line" | "area" | "pie" | "radar";
  title?: string;
  description?: string;
  data: Record<string, string | number>[];
  series: SeriesConfig[];
  categoryKey?: string;
  stacked?: boolean;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  error?: string;
}

const DEFAULT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function buildChartConfig(series: SeriesConfig[]): ChartConfig {
  const config: ChartConfig = {};
  series.forEach((s, i) => {
    config[s.dataKey] = {
      label: s.name ?? s.dataKey,
      color: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    };
  });
  return config;
}

function detectCategoryKey(
  data: Record<string, string | number>[],
  series: SeriesConfig[],
  categoryKey?: string
): string {
  if (categoryKey) return categoryKey;
  const seriesKeys = new Set(series.map((s) => s.dataKey));
  const firstRow = data[0];
  if (!firstRow) return "name";
  for (const key of Object.keys(firstRow)) {
    if (!seriesKeys.has(key) && typeof firstRow[key] === "string") {
      return key;
    }
  }
  return Object.keys(firstRow)[0] ?? "name";
}

function resolveSeriesColor(series: SeriesConfig[], index: number): string {
  return series[index]?.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

function ChartRenderer({ output }: { output: ChartOutput }) {
  const {
    chartType,
    data,
    series,
    categoryKey: rawCategoryKey,
    stacked,
    horizontal,
    showGrid,
    showLegend,
    showTooltip,
  } = output;

  const catKey = detectCategoryKey(data, series, rawCategoryKey);
  const chartConfig = buildChartConfig(series);

  if (chartType === "pie") {
    const valueKey = series[0]?.dataKey ?? "value";
    const pieConfig: ChartConfig = {};
    data.forEach((d, i) => {
      const label = String(d[catKey] ?? `Slice ${i + 1}`);
      pieConfig[label] = {
        label,
        color: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      };
    });
    const pieData = data.map((d, i) => ({
      ...d,
      fill: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));

    return (
      <ChartContainer config={pieConfig} className="mx-auto aspect-square min-h-[250px] w-full max-w-[350px]">
        <PieChart>
          {showTooltip && <ChartTooltip content={<ChartTooltipContent nameKey={catKey} />} />}
          {showLegend && <ChartLegend content={<ChartLegendContent nameKey={catKey} />} />}
          <Pie
            data={pieData}
            dataKey={valueKey}
            nameKey={catKey}
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="80%"
            paddingAngle={2}
          />
        </PieChart>
      </ChartContainer>
    );
  }

  if (chartType === "radar") {
    return (
      <ChartContainer config={chartConfig} className="mx-auto aspect-square min-h-[250px] w-full max-w-[400px]">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey={catKey} />
          {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {series.map((s, i) => {
            const color = resolveSeriesColor(series, i);
            return (
              <Radar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                fill={color}
                fillOpacity={0.3}
                stroke={color}
              />
            );
          })}
        </RadarChart>
      </ChartContainer>
    );
  }

  // Bar, Line, Area charts share a similar structure
  const ChartComponent =
    chartType === "line" ? LineChart : chartType === "area" ? AreaChart : BarChart;

  const layout = horizontal && chartType === "bar" ? "vertical" : undefined;

  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <ChartComponent
        accessibilityLayer
        data={data}
        layout={layout}
      >
        {showGrid && <CartesianGrid vertical={false} />}
        {layout === "vertical" ? (
          <>
            <YAxis
              dataKey={catKey}
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={80}
              tickFormatter={(v: string) => (v.length > 12 ? v.slice(0, 12) + "…" : v)}
            />
            <XAxis type="number" hide />
          </>
        ) : (
          <XAxis
            dataKey={catKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(v: string) =>
              typeof v === "string" && v.length > 10 ? v.slice(0, 10) + "…" : v
            }
          />
        )}
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {series.map((s, i) => {
          const color = resolveSeriesColor(series, i);
          const stackId = stacked ? (s.stackId ?? "stack") : s.stackId;

          if (chartType === "line") {
            return (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            );
          }
          if (chartType === "area") {
            return (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name ?? s.dataKey}
                fill={color}
                stroke={color}
                fillOpacity={0.3}
                stackId={stackId}
              />
            );
          }
          // bar
          return (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name ?? s.dataKey}
              fill={color}
              radius={4}
              stackId={stackId}
            />
          );
        })}
      </ChartComponent>
    </ChartContainer>
  );
}

export function Chart({
  state,
  input,
  output,
}: {
  state: ChartState;
  input?: ChartInput;
  output?: ChartOutput;
}) {
  const isLoading = state === "input-available" || state === "input-streaming";
  const isDone = state === "output-available";
  const isError = state === "output-error" || state === "output-denied";

  const title = output?.title ?? input?.title;
  const description = output?.description;
  const error = output?.error;

  return (
    <div className="not-prose py-2">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-3.5 animate-spin" />
          <span>Creating chart…</span>
        </div>
      )}
      {isDone && output && !error && (
        <div>
          <ChartRenderer output={output} />
          {title && (
            <p className="mt-2 text-center text-sm font-medium text-foreground">{title}</p>
          )}
          {description && (
            <p className="mt-0.5 text-center text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {(isError || error) && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircleIcon className="size-3.5" />
          <span>{error ?? "Failed to create chart"}</span>
        </div>
      )}
    </div>
  );
}
