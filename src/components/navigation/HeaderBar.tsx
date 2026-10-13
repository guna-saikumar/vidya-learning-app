import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';

interface HeaderBarProps {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  showSearch?: boolean;
  onSearchPress?: () => void;
  showBookmark?: boolean;
  isBookmarked?: boolean;
  onBookmarkPress?: () => void;
  onProfilePress?: () => void;
  rightAction?: React.ReactNode;
  studentName?: string;
  studentClass?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  eyebrow,
  subtitle,
  showBack = false,
  onBackPress,
  onProfilePress,
  rightAction,
  studentName = 'Aarav',
  studentClass = 'Class 8',
}) => {
  const insets = useSafeAreaInsets();
  // Safe area top padding ensures the navbar is placed below the mobile status bar/notch
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0
  );

  return (
    <View style={[styles.headerWrapper, { paddingTop: topInset }]}>
      {/* Top Navbar with App Name & Profile */}
      <View style={styles.topNavBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <MaterialIcons name="auto-stories" size={20} color={Colors.white} />
          </View>
          <Text style={styles.brandTitle}>Vidya Learning</Text>
        </View>

        <TouchableOpacity
          style={styles.profileControl}
          onPress={onProfilePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Student profile"
        >
          <Text style={styles.profileName}>{studentName}</Text>
          <Image
            source={require('../../../assets/app-images/avatar.png')}
            style={styles.avatarImage as any}
          />
        </TouchableOpacity>
      </View>

      {/* Back Section seamlessly flowing into the page content below */}
      {showBack && (
        <View style={styles.backSection}>
          <TouchableOpacity
            style={styles.backIconButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.backTitleContainer}>
            {subtitle ? (
              <Text style={styles.backSubtitleText}>{subtitle.toUpperCase()}</Text>
            ) : eyebrow ? (
              <Text style={styles.backSubtitleText}>{eyebrow.toUpperCase()}</Text>
            ) : null}
            {title ? (
              <Text style={styles.backTitleText} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
          </View>

          {rightAction && (
            <View style={styles.rightActionContainer}>
              {rightAction}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    backgroundColor: Colors.white,
    zIndex: 10,
  },
  topNavBar: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 18,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  profileControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  profileName: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  avatarImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  backSection: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    gap: 12,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowCard,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  backTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  backSubtitleText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  backTitleText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    color: Colors.textPrimary,
    letterSpacing: -0.4,
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
