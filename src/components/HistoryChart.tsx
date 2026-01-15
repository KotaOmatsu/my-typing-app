'use client';

import { HistoryResult } from '@/types/typing';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface HistoryChartProps {
  results: HistoryResult[];
}

export default function HistoryChart({ results }: HistoryChartProps) {
  // グラフ用にデータを整形する
  const chartData = results
    .map(result => ({
      // 日付を '5/21' のような短い形式にフォーマット
      date: new Date(result.createdAt).toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
      }),
      WPM: parseFloat(result.wpm.toFixed(2)),
      正解率: parseFloat(result.accuracy.toFixed(2)),
    }))
    .reverse(); // 時系列で表示するために配列を逆順にする

  return (
    <div className="w-full h-80">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: 10,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
          <YAxis yAxisId="wpm" label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', fontSize: 12 }} stroke="hsl(var(--foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis yAxisId="accuracy" orientation="right" label={{ value: 'ACCURACY (%)', angle: 90, position: 'insideRight', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} fontSize={12} tickLine={false} axisLine={false} />
          
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '2px', fontSize: '12px', color: 'hsl(var(--card-foreground))' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          
          <Line yAxisId="wpm" type="monotone" dataKey="WPM" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 4, fill: 'hsl(var(--primary))' }} dot={false} />
          <Line yAxisId="accuracy" type="monotone" dataKey="正解率" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'hsl(var(--muted-foreground))' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
