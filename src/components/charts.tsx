import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11 };

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-popover)",
    border: "1px solid var(--color-border)",
    borderRadius: 10,
    fontSize: 12,
    color: "var(--color-popover-foreground)",
  },
  labelStyle: { color: "var(--color-muted-foreground)", fontSize: 11 },
  cursor: { fill: "oklch(1 0 0 / 5%)" },
};

export function ChartFrame({ children, height = 260 }: { children: React.ReactElement; height?: number }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

/** Compact summary strip rendered directly below a chart with visible percentages. */
export function ChartLegend({ items }: { items: { name: string; value: number; color?: string }[] }) {
  const total = items.reduce((sum, i) => sum + (Number(i.value) || 0), 0);
  if (!items.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <div
          key={it.name}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2 py-1 text-[11px] leading-none"
        >
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ background: it.color ?? CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <span className="text-muted-foreground">{it.name}</span>
          <span className="font-medium tabular-nums">{it.value}</span>
          <span className="tabular-nums text-primary">
            {total > 0 ? Math.round((Number(it.value) / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}


export function BarSeries({
  data,
  x,
  bars,
  height,
  layout = "horizontal",
}: {
  data: Record<string, unknown>[];
  x: string;
  bars: { key: string; name: string; color?: string }[];
  height?: number;
  layout?: "horizontal" | "vertical";
}) {
  return (
    <ChartFrame height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 8, right: 8, bottom: 0, left: layout === "vertical" ? 24 : 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        {layout === "horizontal" ? (
          <>
            <XAxis dataKey={x} tick={axis} tickLine={false} axisLine={false} />
            <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
          </>
        ) : (
          <>
            <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey={x} tick={axis} tickLine={false} axisLine={false} width={110} />
          </>
        )}
        <Tooltip {...tooltipStyle} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color ?? CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={38} />
        ))}
      </BarChart>
    </ChartFrame>
  );
}

export function ColoredBars({
  data,
  x,
  y,
  height,
}: {
  data: { [k: string]: unknown; color?: string }[];
  x: string;
  y: string;
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey={x} tick={axis} tickLine={false} axisLine={false} interval={0} angle={-12} height={44} textAnchor="end" />
        <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey={y} radius={[4, 4, 0, 0]} maxBarSize={44}>
          {data.map((d, i) => (
            <Cell key={i} fill={(d.color as string) ?? CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

export function Donut({
  data,
  height = 260,
  inner = 62,
}: {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  inner?: number;
}) {
  return (
    <ChartFrame height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={inner} outerRadius={92} paddingAngle={2} stroke="var(--color-background)">
          {data.map((d, i) => (
            <Cell key={d.name} fill={d.color ?? CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ChartFrame>
  );
}

export function TrendArea({
  data,
  x,
  series,
  height,
}: {
  data: Record<string, unknown>[];
  x: string;
  series: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color ?? CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.45} />
              <stop offset="100%" stopColor={s.color ?? CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey={x} tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            fill={`url(#grad-${s.key})`}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartFrame>
  );
}

export function TrendLine({
  data,
  x,
  series,
  height,
}: {
  data: Record<string, unknown>[];
  x: string;
  series: { key: string; name: string; color?: string }[];
  height?: number;
}) {
  return (
    <ChartFrame height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey={x} tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {series.map((s, i) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ChartFrame>
  );
}

export function Gauge({ value, label, height = 200 }: { value: number; label: string; height?: number }) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ name: label, value }]} startAngle={210} endAngle={-30}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar dataKey="value" cornerRadius={12} fill="var(--color-chart-1)" background={{ fill: "var(--color-secondary)" }} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold tabular-nums">{value}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
