"use client";

import {
  Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { num, usd } from "@/lib/utils";

const C = { indigo: "#2e2a8f", mist: "#a9b0d6", oxide: "#9a2b22", palm: "#1f6b3a", grid: "#e2e5ee", text: "#5b6079" };
const axis = { tick: { fill: C.text, fontSize: 12 }, tickLine: false, axisLine: false } as const;
const tooltipStyle = {
  contentStyle: { borderRadius: 6, border: "1px solid #d6dae4", boxShadow: "0 6px 20px rgba(26,25,80,0.12)", fontSize: 13 },
  labelStyle: { color: "#1a1950", fontWeight: 600, marginBottom: 4 },
};

export type AnnualPoint = { year: number; production: number; sales: number; revenue: number };

export function AnnualChart({ data }: { data: AnnualPoint[] }) {
  return (
    <div className="h-80 w-full sm:h-96">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="year" {...axis} />
          <YAxis yAxisId="t" {...axis} width={52} tickFormatter={(v: number) => (v === 0 ? "0" : `${num(v / 1000, v % 1000 ? 1 : 0)}k t`)} />
          <YAxis yAxisId="usd" orientation="right" {...axis} width={58} tickFormatter={(v: number) => usd(v)} />
          <Tooltip
            {...tooltipStyle}
            cursor={{ fill: "rgba(46,42,143,0.06)" }}
            formatter={(v, name) => (name === "Sales revenue" ? usd(Number(v)) : `${num(Number(v))} t`)}
          />
          <Legend iconType="square" wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
          <Bar yAxisId="t" dataKey="production" name="Production" fill={C.indigo} radius={[2, 2, 0, 0]} />
          <Bar yAxisId="t" dataKey="sales" name="Sales volume" fill={C.mist} radius={[2, 2, 0, 0]} />
          <Line yAxisId="usd" dataKey="revenue" name="Sales revenue" stroke={C.oxide} strokeWidth={2} dot={{ r: 3 }} type="monotone" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export type MonthlyPoint = { month: string } & Record<string, number | string | null>;

const YEAR_COLORS = [C.mist, C.indigo, C.palm, C.oxide]; // oldest year lightest, current year strongest

export function MonthlyChart({ data, years }: { data: MonthlyPoint[]; years: string[] }) {
  const colors = years.length <= 2 ? YEAR_COLORS.slice(2 - years.length, 2) : YEAR_COLORS;
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barGap={1}>
          <CartesianGrid vertical={false} stroke={C.grid} />
          <XAxis dataKey="month" {...axis} />
          <YAxis {...axis} width={40} />
          <Tooltip
            {...tooltipStyle}
            cursor={{ fill: "rgba(46,42,143,0.06)" }}
            formatter={(v) => (v == null ? "no data yet" : `${num(Number(v))} t`)}
          />
          <Legend iconType="square" wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
          {years.map((y, i) => (
            <Bar key={y} dataKey={y} name={y} fill={colors[i]} radius={[2, 2, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
