import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Rect } from 'react-native-svg';

export interface DataPoint {
  day: string;
  value: number;
}

export interface WeeklyChartProps {
  data: DataPoint[];
  height?: number;
  colors?: string[];
  title?: string;
  unit?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  data,
  height = 200,
  colors = ['#FF6B6B', '#FF8E53'],
  title,
  unit = ''
}) => {
  const chartWidth = screenWidth - 64;
  const chartHeight = height - 60;
  const padding = 20;
  
  // Validate and sanitize data
  const validData = data.filter(d => d && typeof d.value === 'number' && !isNaN(d.value) && isFinite(d.value));
  
  if (validData.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }
  
  const maxValue = Math.max(...validData.map(d => d.value));
  const minValue = Math.min(...validData.map(d => d.value));
  const valueRange = maxValue - minValue || 1;
  
  const xStep = validData.length > 1 ? (chartWidth - padding * 2) / (validData.length - 1) : 0;
  
  const points = validData.map((point, index) => {
    const x = padding + index * xStep;
    const y = chartHeight - ((point.value - minValue) / valueRange) * (chartHeight - padding * 2) - padding;
    
    // Ensure coordinates are valid numbers
    const validX = isFinite(x) ? x : padding;
    const validY = isFinite(y) ? y : chartHeight - padding;
    
    return { x: validX, y: validY, ...point };
  });
  
  // Create line segments instead of using polyline path
  const lineSegments = points.slice(1).map((point, index) => ({
    x1: points[index].x,
    y1: points[index].y,
    x2: point.x,
    y2: point.y,
  }));
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      
      <Svg width={chartWidth} height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight - ratio * (chartHeight - padding * 2) - padding;
          return (
            <Line
              key={ratio}
              x1={padding}
              y1={y}
              x2={chartWidth - padding}
              y2={y}
              stroke="#F0F0F0"
              strokeWidth={1}
            />
          );
        })}
        
        {/* Chart line segments */}
        {lineSegments.map((segment, index) => (
          <Line
            key={index}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke={colors[0]}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
        
        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={colors[0]}
          />
        ))}
        
        {/* X-axis labels */}
        {points.map((point, index) => (
          <SvgText
            key={index}
            x={point.x}
            y={chartHeight + 15}
            fontSize={12}
            fill="#999"
            textAnchor="middle"
          >
            {days[index] || ''}
          </SvgText>
        ))}
        
        {/* Y-axis labels */}
        {[minValue, maxValue].map((value, index) => {
          const y = index === 0 ? chartHeight - padding : padding;
          return (
            <SvgText
              key={index}
              x={padding - 5}
              y={y + 4}
              fontSize={10}
              fill="#999"
              textAnchor="end"
            >
              {isFinite(value) ? value.toFixed(0) : '0'}{unit}
            </SvgText>
          );
        })}
        
        {/* Today indicator */}
        {points.length > 0 && (
          <Rect
            x={points[points.length - 1].x - 15}
            y={0}
            width={30}
            height={chartHeight}
            fill={colors[0]}
            opacity={0.1}
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  noDataContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});