'use client';

import { TypingResult } from '@prisma/client';
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

// page.tsxから渡される結果の型。Dateが文字列にシリアライズされている。
type SerializableResult = Omit<TypingResult, 'createdAt'> & {
  createdAt: string;
};

interface HistoryChartProps {
  results: SerializableResult[];
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
          <YAxis yAxisId="left" label={{ value: 'WPM', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: '正解率 (%)', angle: 90, position: 'insideRight' }} />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="WPM" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line yAxisId="right" type="monotone" dataKey="正解率" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
