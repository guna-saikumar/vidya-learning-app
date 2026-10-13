import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity, Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { Shadows } from '../constants/spacing';
import { HeaderBar } from '../components/HeaderBar';
import { PageIntro } from '../components/PageIntro';
import { HoverCard } from '../components/HoverCard';
import { BottomNav } from '../components/BottomNav';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { removeBookmark } from '../services/progressService';
import { MainTabParamList, RootStackParamList } from '../types/navigation';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Bookmarks'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const BookmarksScreen: React.FC<Props> = ({ navigation }) => {
  const { bookmarks, refreshData } = useLearningProgress();

  const handleRemove = async (id: string) => {
    await removeBookmark(id);
    await refreshData();
  };

  const handleOpenBookmark = (bm: any) => {
    if (bm.sectionId) {
      navigation.navigate('SectionDetails', {
        classId: bm.classId,
        subjectId: bm.subjectId,
        chapterId: bm.chapterId,
        sectionId: bm.sectionId,
      });
    } else {
      navigation.navigate('ChapterDetails', {
        classId: bm.classId,
        subjectId: bm.subjectId,
        chapterId: bm.chapterId,
      });
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        title="Bookmarks"
        subtitle="Saved chapters and study notes."
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading & Subheading */}
        <PageIntro
          eyebrow="STUDY VAULT"
          badge={`${bookmarks.length} Saved`}
          title="Saved Bookmarks"
        />

        {bookmarks.length > 0 ? (
          <View style={styles.bookmarkList}>
            {bookmarks.map((bm) => (
              <HoverCard key={bm.id} style={styles.bookmarkCard} lift={-4}>
                <TouchableOpacity
                  style={styles.cardMain}
                  onPress={() => handleOpenBookmark(bm)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconCircle}>
                    <MaterialIcons
                      name={
                        bm.type === 'formula'
                          ? 'functions'
                          : bm.type === 'section'
                          ? 'article'
                          : 'menu-book'
                      }
                      size={20}
                      color={Colors.primary}
                    />
                  </View>

                  <View style={styles.contentBox}>
                    <Text style={styles.subtitleText}>{bm.subtitle}</Text>
                    <Text style={styles.titleText}>{bm.title}</Text>
                    {bm.previewText && (
                      <Text style={styles.previewText} numberOfLines={2}>
                        {bm.previewText}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.openButton}
                    onPress={() => handleOpenBookmark(bm)}
                  >
                    <Text style={styles.openButtonText}>Open</Text>
                    <MaterialIcons name="arrow-forward" size={14} color={Colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemove(bm.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="bookmark-remove" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </HoverCard>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <MaterialIcons name="bookmark-border" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No bookmarks yet</Text>
            <Text style={styles.emptySubtitle}>
              Save important chapters while reading to find them quickly here.
            </Text>
          </View>
        )}
      </ScrollView>
      <BottomNav activeTab="Bookmarks" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  introCopy: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: -4,
  },
  bookmarkList: {
    gap: 10,
  },
  bookmarkCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    ...Shadows.subtle,
    ...(Platform.OS === 'web' && {
      transitionDuration: '220ms',
      transitionProperty: 'transform, box-shadow, border-color',
      transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
      cursor: 'pointer',
    } as any),
  },
  bookmarkCardHovered: {
    transform: [{ translateY: -4 }],
    shadowColor: 'rgba(58, 45, 41, 0.14)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
    borderColor: Colors.borderHover,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  contentBox: {
    flex: 1,
    gap: 2,
  },
  subtitleText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
  },
  titleText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 15,
    color: Colors.textPrimary,
  },
  previewText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  openButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: Colors.primary,
  },
  removeButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 10,
  },
  emptyIconBox: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: Colors.palePeach,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 17,
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 18,
  },
});
