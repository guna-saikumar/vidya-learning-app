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

const HoverCardComponent: React.FC<HoverCardProps> = ({
  className,
  style,
  hoverStyle,
  onPress,
  children,
  lift = -4,
  disabled = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isWeb = Platform.OS === 'web';

  return (
    <Pressable
      className={className}
      onPress={onPress}
      disabled={disabled || !onPress}
      onHoverIn={isWeb ? () => setIsHovered(true) : undefined}
      onHoverOut={isWeb ? () => setIsHovered(false) : undefined}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        style,
        isWeb && ({
          transitionDuration: '180ms',
          transitionProperty: 'transform, box-shadow, border-color',
          transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
          cursor: onPress ? 'pointer' : 'default',
        } as any),
        (isHovered || (!isWeb && pressed)) && [
          {
            transform: [{ translateY: isWeb ? lift : -1 }],
            shadowColor: 'rgba(58, 45, 41, 0.14)',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.14,
            shadowRadius: 12,
            elevation: 4,
            borderColor: Colors.borderHover,
            opacity: !isWeb && pressed ? 0.92 : 1,
          },
          hoverStyle,
        ],
      ]}
    >
      {children}
    </Pressable>
  );
};

export const HoverCard = React.memo(HoverCardComponent);
