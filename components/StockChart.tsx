import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Cell,
  ReferenceLine
} from 'recharts';
import { StockData, Trade } from '../types';

interface StockChartProps {
  data: StockData[];
  trades?: Trade[];
}

// Custom Shape for Candlesticks
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;
  
  const isUp = close >= open;
  const color = isUp ? '#ef4444' : '#22c55e';
  const wickWidth = 2;
  
  const range = high - low;
  
  if (range === 0 || height <= 0) {
     return (
       <line 
         x1={x} y1={y + height / 2} 
         x2={x + width} y2={y + height / 2} 
         stroke={color} strokeWidth={2} 
       />
     );
  }

  const ratio = height / range;
  const openOffset = (high - open) * ratio;
  const closeOffset = (high - close) * ratio;
  
  const bodyTop = y + Math.min(openOffset, closeOffset);
  const bodyHeight = Math.max(Math.abs(openOffset - closeOffset), 1);

  return (
    <g>
      <line 
        x1={x + width / 2} y1={y} 
        x2={x + width / 2} y2={y + height} 
        stroke={color} strokeWidth={wickWidth} 
      />
      <rect 
        x={x + 1} y={bodyTop} 
        width={width - 2} height={bodyHeight} 
        fill={color} stroke="none" 
      />
    </g>
  );
};

const StockChart: React.FC<StockChartProps> = ({ data, trades = [] }) => {
  if (!data || data.length === 0) return null;

  const processedData = data.map(d => {
    const isUp = d.close >= d.open;
    return {
      ...d,
      fullRange: [d.low, d.high], 
      candleColor: isUp ? '#ef4444' : '#22c55e',
    };
  });

  const lows = data.map(d => d.low);
  const highs = data.map(d => d.high);
  const minPrice = Math.min(...lows) * 0.99;
  const maxPrice = Math.max(...highs) * 1.01;
  const maxVol = Math.max(...data.map(d => d.volume));

  // MACD Min/Max for nice centering
  const macdValues = data.flatMap(d => [d.dif || 0, d.dea || 0, d.macd || 0]);
  const maxMacdAbs = Math.max(...macdValues.map(Math.abs)) * 1.1;

  return (
    <div className="flex flex-col w-full h-full">
      {/* Top Chart: Candles + MA + Volume */}
      <div className="flex-[3] w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={processedData} 
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            syncId="financeId"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" hide={true} />
            
            {/* Price YAxis */}
            <YAxis 
              yAxisId="price"
              domain={[minPrice, maxPrice]} 
              orientation="right" 
              tick={{ fill: '#94a3b8', fontSize: 10 }} 
              tickCount={6}
              width={40}
            />
            
            {/* Volume YAxis (Hidden, scaled to sit at bottom) */}
            <YAxis 
              yAxisId="vol"
              domain={[0, maxVol * 4]} // Scale up domain so bars only take bottom 1/4
              orientation="left"
              hide={true}
            />

            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
              itemStyle={{ fontSize: 12 }}
              labelStyle={{ color: '#94a3b8', fontSize: 12 }}
              formatter={(value: any, name: string) => {
                 if (name === 'fullRange') return null;
                 if (typeof value === 'number') return [value.toFixed(2), name.toUpperCase()];
                 return [value, name];
              }}
              labelFormatter={(label) => `Date: ${label}`}
            />
            
            {/* Volume Bars */}
            <Bar dataKey="volume" yAxisId="vol" barSize={4} isAnimationActive={false}>
              {processedData.map((entry, index) => (
                <Cell key={`vol-${index}`} fill={entry.candleColor} fillOpacity={0.3} />
              ))}
            </Bar>

            {/* MAs */}
            <Line yAxisId="price" type="monotone" dataKey="ma5" stroke="#fbbf24" dot={false} strokeWidth={1} isAnimationActive={false} />
            <Line yAxisId="price" type="monotone" dataKey="ma10" stroke="#60a5fa" dot={false} strokeWidth={1} isAnimationActive={false} />
            <Line yAxisId="price" type="monotone" dataKey="ma20" stroke="#a78bfa" dot={false} strokeWidth={1} isAnimationActive={false} />

            {/* Candles */}
            <Bar
              yAxisId="price"
              dataKey="fullRange" 
              shape={<CandlestickShape />}
              isAnimationActive={false}
            />

            {/* Trades */}
            {trades.map((trade, idx) => (
               <ReferenceLine
                 key={idx}
                 yAxisId="price"
                 x={trade.date}
                 stroke={trade.type === 'BUY' ? '#ef4444' : '#22c55e'}
                 strokeDasharray="3 3"
                 label={{
                   position: 'top',
                   value: trade.type === 'BUY' ? 'B' : 'S',
                   fill: trade.type === 'BUY' ? '#ef4444' : '#22c55e',
                   fontSize: 10,
                   fontWeight: 'bold',
                 }}
               />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Chart: MACD */}
      <div className="flex-1 w-full min-h-0 border-t border-slate-800">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={processedData} 
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            syncId="financeId"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis dataKey="date" hide={true} />
            <YAxis 
              domain={[-maxMacdAbs, maxMacdAbs]}
              orientation="right" 
              tick={{ fill: '#94a3b8', fontSize: 9 }} 
              tickCount={3}
              width={40}
            />
            <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                itemStyle={{ fontSize: 10 }}
                labelStyle={{ display: 'none' }}
                formatter={(value: any) => typeof value === 'number' ? value.toFixed(3) : value}
            />
            
            {/* MACD Histogram */}
            <Bar dataKey="macd" barSize={2} isAnimationActive={false}>
                {processedData.map((entry, index) => (
                    <Cell key={`macd-${index}`} fill={(entry.macd || 0) >= 0 ? '#ef4444' : '#22c55e'} />
                ))}
            </Bar>
            
            {/* DIF & DEA */}
            <Line type="monotone" dataKey="dif" stroke="#f1f5f9" dot={false} strokeWidth={1} isAnimationActive={false} />
            <Line type="monotone" dataKey="dea" stroke="#facc15" dot={false} strokeWidth={1} isAnimationActive={false} />
            
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockChart;