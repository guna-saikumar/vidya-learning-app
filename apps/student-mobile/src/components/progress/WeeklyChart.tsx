import React from 'react';
import { View, Text } from 'react-native';
import Colors from '../../constants/colors';

interface WeeklyChartProps {
  data: { day: string; minutes: number }[];
  goalMinutes: number;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, goalMinutes }) => {
  const maxMinutes = Math.max(goalMinutes, ...data.map((d) => d.minutes));
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);
  const avgMinutes = Math.round(totalMinutes / data.length);

  return (
    <View className="bg-white rounded-[20px] p-5 border border-border shadow-sm gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="font-manrope-extrabold text-base text-textPrimary">This Week</Text>
          <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
            {totalMinutes} min total · {avgMinutes} min/day avg
          </Text>
        </View>
        <View className="bg-palePeach px-3 py-1.5 rounded-full">
          <Text className="font-manrope-bold text-[11px] text-primaryDark">
            Goal: {goalMinutes}m/day
          </Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View className="flex-row items-end justify-between h-[100px] gap-2 pt-1">
        {data.map((item) => {
          const heightPercent = maxMinutes > 0 ? (item.minutes / maxMinutes) * 100 : 0;
          const meetsGoal = item.minutes >= goalMinutes;

          return (
            <View key={item.day} className="flex-1 items-center gap-1.5">
              {/* Minutes label */}
              <Text className="font-manrope-bold text-[10px] text-textMuted">
                {item.minutes > 0 ? `${item.minutes}` : ''}
              </Text>

              {/* Bar */}
              <View className="w-full items-center" style={{ flex: 1, justifyContent: 'flex-end' }}>
                <View
                  className="w-full max-w-[28px] rounded-lg"
                  style={{
                    height: `${Math.max(heightPercent, 4)}%`,
                    backgroundColor: meetsGoal ? Colors.success : Colors.primary,
                    opacity: item.minutes > 0 ? 1 : 0.2,
                  }}
                />
              </View>

              {/* Day label */}
              <Text className="font-manrope-bold text-[10px] text-textSecondary">
                {item.day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Goal line legend */}
      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded bg-primary" />
          <Text className="font-manrope-medium text-[11px] text-textSecondary">Below Goal</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="w-3 h-3 rounded bg-success" />
          <Text className="font-manrope-medium text-[11px] text-textSecondary">Goal Met</Text>
        </View>
      </View>
    </View>
  );
};
