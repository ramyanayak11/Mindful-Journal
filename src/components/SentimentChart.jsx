import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import '../styles/SentimentChart.css';

const SentimentChart = ({ entries }) => {
  // Prepare data for the chart
  const prepareChartData = () => {
    if (!entries || entries.length === 0) return [];

    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Format data for recharts
    return sortedEntries.map((entry, index) => ({
      date: entry.date,
      sentiment: entry.sentiment,
      displayDate: new Date(entry.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      entry: entry.content.substring(0, 50) + '...',
      themes: entry.themes?.join(', ') || 'General',
      index: index
    }));
  };

  const chartData = prepareChartData();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sentiment = data.sentiment;
      
      const getSentimentLabel = (sentiment) => {
        if (sentiment > 0.3) return 'Very Positive';
        if (sentiment > 0.1) return 'Positive';
        if (sentiment > -0.1) return 'Neutral';
        if (sentiment > -0.3) return 'Challenging';
        return 'Very Challenging';
      };

      const getSentimentColor = (sentiment) => {
        if (sentiment > 0.2) return '#10b981';
        if (sentiment > 0) return '#f59e0b';
        if (sentiment > -0.2) return '#6b7280';
        return '#ef4444';
      };

      return (
        <div className="custom-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-date">{data.displayDate}</span>
            <span 
              className="tooltip-sentiment"
              style={{ color: getSentimentColor(sentiment) }}
            >
              {getSentimentLabel(sentiment)}
            </span>
          </div>
          <div className="tooltip-content">
            <p className="tooltip-entry">{data.entry}</p>
            <p className="tooltip-themes">Themes: {data.themes}</p>
          </div>
          <div className="tooltip-score">
            Score: {(sentiment * 100).toFixed(0)}%
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot component for line points
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const sentiment = payload.sentiment;
    
    const getDotColor = (sentiment) => {
      if (sentiment > 0.2) return '#10b981';
      if (sentiment > 0) return '#f59e0b';
      if (sentiment > -0.2) return '#6b7280';
      return '#ef4444';
    };

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={getDotColor(sentiment)}
        stroke="white"
        strokeWidth={2}
        className="sentiment-dot"
      />
    );
  };

  // If no data, show empty state
  if (chartData.length === 0) {
    return (
      <div className="chart-empty-state">
        <div className="empty-icon">📊</div>
        <h3>No Data Available</h3>
        <p>Start journaling to see your sentiment trends here!</p>
      </div>
    );
  }

  // Calculate average sentiment for reference line
  const avgSentiment = chartData.reduce((sum, item) => sum + item.sentiment, 0) / chartData.length;

  return (
    <div className="sentiment-chart-container">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" opacity={0.6} />
            
            <XAxis 
              dataKey="displayDate"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#78350f' }}
              interval="preserveStartEnd"
            />
            
            <YAxis
              domain={[-1, 1]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#78350f' }}
              tickFormatter={(value) => {
                if (value === 1) return 'Positive';
                if (value === 0) return 'Neutral';
                if (value === -1) return 'Negative';
                return '';
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="#d97706"
              strokeWidth={3}
              fill="url(#sentimentGradient)"
              fillOpacity={0.6}
            />
            
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#d97706"
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: '#d97706', stroke: 'white', strokeWidth: 2 }}
            />
            
            {/* Average sentiment reference line */}
            <Line
              type="monotone"
              dataKey={() => avgSentiment}
              stroke="#78350f"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              opacity={0.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-dot positive"></div>
          <span>Positive Sentiment</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot neutral"></div>
          <span>Neutral Sentiment</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot negative"></div>
          <span>Challenging Sentiment</span>
        </div>
        <div className="legend-item">
          <div className="legend-line"></div>
          <span>Average ({(avgSentiment * 100).toFixed(0)}%)</span>
        </div>
      </div>

      <div className="chart-insights">
        <div className="insight-item">
          <strong>Trend:</strong> {
            avgSentiment > 0.2 ? 'Generally positive outlook' :
            avgSentiment < -0.2 ? 'Working through challenges' :
            'Balanced emotional state'
          }
        </div>
        <div className="insight-item">
          <strong>Data Points:</strong> {chartData.length} entries analyzed
        </div>
        <div className="insight-item">
          <strong>Range:</strong> {
            new Date(chartData[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          } - {
            new Date(chartData[chartData.length - 1]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;