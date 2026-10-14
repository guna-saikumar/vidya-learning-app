import React, { useEffect, useRef, useState } from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

interface QuizTimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onTimeUp: () => void;
  onTick?: (remaining: number) => void;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({
  totalSeconds,
  isRunning,
  onTimeUp,
  onTick,
}) => {
  const [remaining, setRemaining] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          const next = prev - 1;
          onTick?.(next);
          if (next <= 0) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onTimeUp();
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 60;
  const percent = (remaining / totalSeconds) * 100;

  return (
    <View className="flex-row items-center gap-2.5">
      {/* Timer icon */}
      <MaterialIcons
        name="timer"
        size={18}
        color={isLow ? Colors.error : Colors.textSecondary}
      />

      {/* Time display */}
      <Text
        className="font-manrope-extrabold text-sm"
        style={{ color: isLow ? Colors.error : Colors.textPrimary }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>

      {/* Mini progress bar */}
      <View className="flex-1 h-1 rounded-full bg-[#F3EDE9] overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percent}%`,
            backgroundColor: isLow ? Colors.error : Colors.primary,
          }}
        />
      </View>
    </View>
  );
};
