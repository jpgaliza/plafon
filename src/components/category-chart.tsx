"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/currency";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface CategoryChartProps {
  data: CategoryData[];
  currency?: string;
  locale?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  className?: string;
}

interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  payload?: {
    name?: string;
    value?: number;
    color?: string;
    [key: string]: unknown;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  total: number;
  currency?: string;
  locale?: string;
}

function CustomTooltip({
  active,
  payload,
  total,
  currency,
  locale,
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const item = payload[0];
  const value = typeof item.value === "number" ? item.value : 0;
  const categoryName = item.name || item.payload?.name || "";
  const color = item.payload?.color || item.color || "#3B82F6";
  const percentage =
    total > 0
      ? ((value / total) * 100).toFixed(1).replace(/\.0$/, "")
      : "0";

  return (
    <div className="rounded-xl border border-white/10 bg-[#121215]/95 backdrop-blur-md px-3.5 py-2.5 shadow-2xl shadow-black/80 ring-1 ring-white/5 select-none pointer-events-none">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="size-2.5 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs font-medium text-zinc-300 max-w-[130px] truncate">
          {categoryName}
        </span>
        {total > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-zinc-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-full tabular-nums">
            {percentage}%
          </span>
        )}
      </div>
      <div className="text-sm font-bold text-white tracking-tight tabular-nums pl-4.5">
        {formatCurrency(value, currency, locale)}
      </div>
    </div>
  );
}

export function CategoryChart({
  data,
  currency,
  locale,
  innerRadius = 60,
  outerRadius = 80,
  className,
}: CategoryChartProps) {
  // Only show positive values and sort by value descending
  const chartData = useMemo(() => {
    return data
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const total = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [chartData]);

  const isEn =
    locale?.startsWith("en") ||
    (typeof document !== "undefined" &&
      document.cookie.includes("NEXT_LOCALE=en-US"));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center text-sm text-muted-foreground">
        {isEn ? "No data to display." : "Nenhum dado para exibir."}
      </div>
    );
  }

  return (
    <div className={className || "h-[200px] w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            wrapperStyle={{ outline: "none" }}
            content={
              <CustomTooltip
                total={total}
                currency={currency}
                locale={locale}
              />
            }
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
