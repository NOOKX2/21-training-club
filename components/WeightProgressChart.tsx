"use client";

import { useMemo } from "react";
import type { WeightEntry } from "@/lib/data";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 48, left: 52 };

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    path += ` C ${midX} ${current.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
}

function getYTicks(min: number, max: number): number[] {
  if (min === max) {
    const center = min;
    return [center - 4, center - 2, center, center + 2, center + 4];
  }

  const range = max - min;
  const roughStep = range / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const step = Math.ceil(roughStep / magnitude) * magnitude || 1;
  const tickMin = Math.floor(min / step) * step;
  const tickMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];

  for (let value = tickMin; value <= tickMax + step * 0.01; value += step) {
    ticks.push(Number(value.toFixed(1)));
  }

  return ticks.length >= 2 ? ticks : [min, max];
}

export function WeightProgressChart({ history }: { history: WeightEntry[] }) {
  const chart = useMemo(() => {
    if (!history.length) return null;

    const weights = history.map((entry) => Number(entry.weight));
    const rawMin = Math.min(...weights);
    const rawMax = Math.max(...weights);
    const yTicks = getYTicks(rawMin, rawMax);
    const yMin = yTicks[0];
    const yMax = yTicks[yTicks.length - 1];
    const yRange = yMax - yMin || 1;

    const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

    const points = history.map((entry, index) => {
      const x =
        history.length === 1
          ? PADDING.left + plotWidth / 2
          : PADDING.left + (index / (history.length - 1)) * plotWidth;
      const y =
        PADDING.top +
        plotHeight -
        ((Number(entry.weight) - yMin) / yRange) * plotHeight;
      return { x, y, weight: Number(entry.weight), day: index + 1 };
    });

    const linePath = buildSmoothPath(points);
    const areaPath =
      points.length > 1
        ? `${linePath} L ${points[points.length - 1].x} ${
            PADDING.top + plotHeight
          } L ${points[0].x} ${PADDING.top + plotHeight} Z`
        : "";

    const xLabels = history.map((_, index) => ({
      label: `Day ${index + 1}`,
      x:
        history.length === 1
          ? PADDING.left + plotWidth / 2
          : PADDING.left + (index / (history.length - 1)) * plotWidth,
    }));

    return { yTicks, yMin, yMax, plotHeight, points, linePath, areaPath, xLabels };
  }, [history]);

  if (!chart) return null;

  const yToPixel = (value: number) => {
    const yRange = chart.yMax - chart.yMin || 1;
    return (
      PADDING.top +
      chart.plotHeight -
      ((value - chart.yMin) / yRange) * chart.plotHeight
    );
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <div className="min-w-[320px]">
        <p className="text-sm font-semibold text-white">Weight Progress</p>
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="mt-4 w-full"
          role="img"
          aria-label="Weight progress chart"
        >
          {chart.yTicks.map((tick) => {
            const y = yToPixel(tick);
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={CHART_WIDTH - PADDING.right}
                  y2={y}
                  stroke="#3f3f46"
                  strokeWidth={1}
                  strokeDasharray="4 6"
                />
                <text
                  x={PADDING.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-zinc-500 text-[11px]"
                >
                  {tick} kg
                </text>
              </g>
            );
          })}

          {chart.areaPath && (
            <path
              d={chart.areaPath}
              fill="url(#weightGradient)"
              opacity={0.35}
            />
          )}

          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
            </linearGradient>
          </defs>

          {chart.linePath && (
            <path
              d={chart.linePath}
              fill="none"
              stroke="#fb923c"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {chart.points.map((point) => (
            <g key={point.day}>
              <circle
                cx={point.x}
                cy={point.y}
                r={5}
                fill="#fb923c"
                stroke="#18181b"
                strokeWidth={2}
              />
              <circle cx={point.x} cy={point.y} r={2} fill="white" />
            </g>
          ))}

          {chart.xLabels.map((label) => (
            <text
              key={label.label}
              x={label.x}
              y={CHART_HEIGHT - 16}
              textAnchor="middle"
              className="fill-zinc-500 text-[11px]"
            >
              {label.label}
            </text>
          ))}
        </svg>

        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-zinc-400">
          <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#fb923c]">
            <span className="h-1 w-1 rounded-full bg-white" />
          </span>
          Weight (kg)
        </div>
      </div>
    </div>
  );
}
