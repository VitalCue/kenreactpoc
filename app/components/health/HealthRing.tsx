import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface HealthRingProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  colors?: string[];
  label: string;
  unit?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const HealthRing: React.FC<HealthRingProps> = ({
  value,
  maxValue,
  size = 120,
  strokeWidth = 12,
  colors = ['#FF6B6B', '#FF8E53'],
  label,
  unit = '',
  icon,
  style
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = useSharedValue(0);
  
  React.useEffect(() => {
    progress.value = withTiming(value / maxValue, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [value, maxValue]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (progress.value * circumference);
    return {
      strokeDashoffset,
    };
  });

  const animatedValue = useSharedValue(0);
  React.useEffect(() => {
    animatedValue.value = withTiming(value, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  return (
    <View style={[styles.container, style]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors[0]} />
            <Stop offset="100%" stopColor={colors[1] || colors[0]} />
          </LinearGradient>
        </Defs>
        
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F0F0F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      <View style={[styles.content, { width: size, height: size }]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Animated.Text style={styles.value}>
          {animatedValue.value.toFixed(0)}
        </Animated.Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginTop: -4,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});