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
      スコア: result.score,
      WPM: parseFloat(result.wpm.toFixed(2)),
      正解率: parseFloat(result.accuracy.toFixed(2)),
    }))
    .reverse(); // 時系列で表示するために配列を逆順にする

  return (
    <div className="w-full h-80 bg-white p-4 rounded-lg shadow-md mb-8">
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 20,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="score" label={{ value: 'スコア', angle: -90, position: 'insideLeft' }} stroke="#ffc658" />
          <YAxis yAxisId="wpm" orientation="right" label={{ value: 'WPM', angle: 90, position: 'insideRight' }} stroke="#8884d8" />
          <YAxis yAxisId="accuracy" orientation="right" domain={[0, 100]} hide />
          
          <Tooltip />
          <Legend />
          
          <Line yAxisId="score" type="monotone" dataKey="スコア" stroke="#ffc658" strokeWidth={2} activeDot={{ r: 6 }} />
          <Line yAxisId="wpm" type="monotone" dataKey="WPM" stroke="#8884d8" />
          <Line yAxisId="accuracy" type="monotone" dataKey="正解率" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
