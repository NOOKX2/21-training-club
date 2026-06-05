"use client";

import { useMemo } from "react";
import type { DailyNutritionScore } from "@/lib/data";

const CHART_WIDTH = 640;
const CHART_HEIGHT = 280;
const PADDING = { top: 24, right: 24, bottom: 48, left: 52 };
const Y_MIN = 0.5;
const Y_MAX = 5.5;
const Y_TICKS = [1, 2, 3, 4, 5];

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

export function NutritionScoreChart({
  dailyScores,
}: {
  dailyScores: DailyNutritionScore[];
}) {
  const chart = useMemo(() => {
    const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
    const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
    const yRange = Y_MAX - Y_MIN;

    const allPoints = dailyScores.map((day, index) => {
      const x =
        dailyScores.length === 1
          ? PADDING.left + plotWidth / 2
          : PADDING.left + (index / (dailyScores.length - 1)) * plotWidth;
      const y =
        day.score == null
          ? null
          : PADDING.top +
            plotHeight -
            ((day.score - Y_MIN) / yRange) * plotHeight;
      return { x, y, score: day.score, dayLabel: day.dayLabel };
    });

    const plottedPoints = allPoints.filter(
      (point): point is { x: number; y: number; score: number; dayLabel: string } =>
        point.y != null && point.score != null
    );

    const linePath = buildSmoothPath(plottedPoints);
    const areaPath =
      plottedPoints.length > 1
        ? `${linePath} L ${plottedPoints[plottedPoints.length - 1].x} ${
            PADDING.top + plotHeight
          } L ${plottedPoints[0].x} ${PADDING.top + plotHeight} Z`
        : "";

    return { plotHeight, allPoints, plottedPoints, linePath, areaPath };
  }, [dailyScores]);

  const yToPixel = (value: number) => {
    const yRange = Y_MAX - Y_MIN;
    return (
      PADDING.top +
      chart.plotHeight -
      ((value - Y_MIN) / yRange) * chart.plotHeight
    );
  };

  const hasScores = chart.plottedPoints.length > 0;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[320px]">
        <p className="text-sm font-semibold text-white">7-Day Food Score</p>
        {!hasScores ? (
          <p className="mt-6 py-10 text-center text-sm text-zinc-500">
            Score trend appears after your coach reviews meals
          </p>
        ) : (
          <svg
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            className="mt-4 w-full"
            role="img"
            aria-label="7-day food score chart"
          >
            {Y_TICKS.map((tick) => {
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
                    {tick}
                  </text>
                </g>
              );
            })}

            {chart.areaPath && (
              <path
                d={chart.areaPath}
                fill="url(#scoreGradient)"
                opacity={0.35}
              />
            )}

            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3e635" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
              </linearGradient>
            </defs>

            {chart.linePath && (
              <path
                d={chart.linePath}
                fill="none"
                stroke="#a3e635"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {chart.plottedPoints.map((point) => (
              <g key={point.dayLabel}>
                <text
                  x={point.x}
                  y={point.y - 12}
                  textAnchor="middle"
                  className="fill-[#a3e635] text-[11px] font-semibold"
                >
                  {point.score.toFixed(1)}
                </text>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill="#a3e635"
                  stroke="#18181b"
                  strokeWidth={2}
                />
                <circle cx={point.x} cy={point.y} r={2} fill="white" />
              </g>
            ))}

            {chart.allPoints.map((point) => (
              <text
                key={`label-${point.dayLabel}`}
                x={point.x}
                y={CHART_HEIGHT - 16}
                textAnchor="middle"
                className="fill-zinc-500 text-[11px]"
              >
                {point.dayLabel}
              </text>
            ))}
          </svg>
        )}

        {hasScores && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-zinc-400">
            <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-[#a3e635]">
              <span className="h-1 w-1 rounded-full bg-white" />
            </span>
            Food score (1–5)
          </div>
        )}
      </div>
    </div>
  );
}
