import React, { useState } from 'react';
import { Pressable, StyleProp, ViewStyle, Platform } from 'react-native';
import Colors from '../../constants/colors';

interface HoverCardProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  children: React.ReactNode;
  lift?: number;
  disabled?: boolean;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  className,
  style,
  hoverStyle,
  onPress,
  children,
  lift = -4,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      className={className}
      onPress={onPress}
      disabled={disabled || !onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessibilityRole={onPress ? 'button' : undefined}
      style={[
        style,
        Platform.OS === 'web' && ({
          transitionDuration: '220ms',
          transitionProperty: 'transform, box-shadow, border-color',
          transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
          cursor: onPress ? 'pointer' : 'default',
        } as any),
        isHovered && [
          {
            transform: [{ translateY: lift }],
            shadowColor: 'rgba(58, 45, 41, 0.14)',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.14,
            shadowRadius: 16,
            elevation: 6,
            borderColor: Colors.borderHover,
          },
          hoverStyle,
        ],
      ]}
    >
      {children}
    </Pressable>
  );
};
