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

// Custom Shape that draws both the Wick and the Body
const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;
  
  const isUp = close >= open;
  const color = isUp ? '#ef4444' : '#22c55e';
  const wickWidth = 2;
  
  // The "height" prop from Recharts corresponds to the range [low, high] in pixels
  // The "y" prop corresponds to the pixel position of the "high" value (top of the bar)
  
  const range = high - low;
  
  // Guard against flat line or zero height
  if (range === 0 || height <= 0) {
     return (
       <line 
         x1={x} y1={y + height / 2} 
         x2={x + width} y2={y + height / 2} 
         stroke={color} strokeWidth={2} 
       />
     );
  }

  // Calculate pixel conversion ratio (pixels per unit of price)
  const ratio = height / range;

  // Calculate Body position relative to the bar's top (y)
  // High is at y (0 offset)
  // Open is at (high - open) * ratio
  // Close is at (high - close) * ratio
  
  const openOffset = (high - open) * ratio;
  const closeOffset = (high - close) * ratio;
  
  const bodyTop = y + Math.min(openOffset, closeOffset);
  const bodyHeight = Math.max(Math.abs(openOffset - closeOffset), 1); // Ensure min 1px visibility

  return (
    <g>
      {/* Wick (High to Low) */}
      <line 
        x1={x + width / 2} 
        y1={y} 
        x2={x + width / 2} 
        y2={y + height} 
        stroke={color} 
        strokeWidth={wickWidth} 
      />
      {/* Body (Open to Close) */}
      <rect 
        x={x} 
        y={bodyTop} 
        width={width} 
        height={bodyHeight} 
        fill={color} 
        stroke="none" 
      />
    </g>
  );
};

const StockChart: React.FC<StockChartProps> = ({ data, trades = [] }) => {
  if (!data || data.length === 0) return null;

  // Pre-process data to fit Recharts requirements
  // We use a single Bar to represent the full range (Low to High)
  // and let the custom shape draw the internal details (Open/Close body)
  const processedData = data.map(d => {
    const isUp = d.close >= d.open;
    return {
      ...d,
      // Recharts Bar can take [min, max] array for floating bars
      fullRange: [d.low, d.high], 
      color: isUp ? '#ef4444' : '#22c55e',
    };
  });

  // Calculate Domain for Y-Axis to auto-zoom
  const lows = data.map(d => d.low);
  const highs = data.map(d => d.high);
  const minPrice = Math.min(...lows) * 0.99;
  const maxPrice = Math.max(...highs) * 1.01;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={processedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
        <XAxis 
          dataKey="date" 
          hide={true} 
        />
        <YAxis 
          domain={[minPrice, maxPrice]} 
          orientation="right" 
          tick={{ fill: '#94a3b8', fontSize: 10 }} 
          tickCount={6}
          width={40}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
          itemStyle={{ color: '#f1f5f9' }}
          labelStyle={{ color: '#94a3b8' }}
          formatter={(value: any, name: string) => {
             if (Array.isArray(value)) return null; // Skip range tooltip
             if (typeof value === 'number') return [value.toFixed(2), name.toUpperCase()];
             return [value, name];
          }}
          labelFormatter={(label) => `Date: ${label}`}
        />
        
        {/* MA Lines */}
        <Line type="monotone" dataKey="ma5" stroke="#fbbf24" dot={false} strokeWidth={1} isAnimationActive={false} />
        <Line type="monotone" dataKey="ma10" stroke="#60a5fa" dot={false} strokeWidth={1} isAnimationActive={false} />
        <Line type="monotone" dataKey="ma20" stroke="#a78bfa" dot={false} strokeWidth={1} isAnimationActive={false} />

        {/* Candlestick Bar */}
        {/* dataKey="fullRange" makes Recharts pass y=highPixel and height=(lowPixel-highPixel) */}
        <Bar
          dataKey="fullRange" 
          shape={<CandlestickShape />}
          isAnimationActive={false}
        >
            {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
        </Bar>

        {/* Trade Markers */}
        {trades.map((trade, idx) => (
           <ReferenceLine
             key={idx}
             x={trade.date}
             stroke={trade.type === 'BUY' ? '#ef4444' : '#22c55e'}
             strokeDasharray="3 3"
             label={{
               position: 'top',
               value: trade.type === 'BUY' ? 'B' : 'S',
               fill: trade.type === 'BUY' ? '#ef4444' : '#22c55e',
               fontSize: 12,
               fontWeight: 'bold',
               fillOpacity: 1
             }}
           />
        ))}

      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default StockChart;