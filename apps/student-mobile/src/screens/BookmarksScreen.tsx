import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { PageIntro, HoverCard } from '../components/common';
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
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <HeaderBar
        title="Bookmarks"
        subtitle="Saved chapters and study notes."
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 48, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Heading & Subheading */}
        <PageIntro
          eyebrow="STUDY VAULT"
          badge={`${bookmarks.length} Saved`}
          title="Saved Bookmarks"
        />

        {bookmarks.length > 0 ? (
          <View className="gap-3">
            {bookmarks.map((bm) => (
              <HoverCard key={bm.id} className="bg-white rounded-[20px] p-5 border border-border gap-3 shadow-sm" lift={-4}>
                <TouchableOpacity
                  className="flex-row items-start gap-3"
                  onPress={() => handleOpenBookmark(bm)}
                  activeOpacity={0.8}
                >
                  <View className="w-10 h-10 rounded-xl bg-palePeach items-center justify-center mt-0.5">
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

                  <View className="flex-1 min-w-0 gap-0.5" style={{ flex: 1, minWidth: 0 }}>
                    <Text className="font-manrope-semibold text-[11px] text-textMuted">{bm.subtitle}</Text>
                    <Text className="font-manrope-extrabold text-[15px] text-textPrimary">{bm.title}</Text>
                    {bm.previewText && (
                      <Text className="font-manrope-medium text-xs text-textSecondary mt-1 leading-4" numberOfLines={2}>
                        {bm.previewText}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View className="flex-row items-center justify-between pt-2.5 border-t border-border">
                  <TouchableOpacity
                    className="flex-row items-center gap-1"
                    onPress={() => handleOpenBookmark(bm)}
                  >
                    <Text className="font-manrope-bold text-xs text-primary">Open</Text>
                    <MaterialIcons name="arrow-forward" size={14} color={Colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="p-1"
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
          <View className="items-center justify-center py-20 gap-2.5">
            <View className="w-[54px] h-[54px] rounded-[17px] bg-palePeach items-center justify-center mb-1.5">
              <MaterialIcons name="bookmark-border" size={28} color={Colors.primary} />
            </View>
            <Text className="font-manrope-extrabold text-[17px] text-textPrimary">No bookmarks yet</Text>
            <Text className="font-manrope-medium text-[13px] text-textMuted text-center px-8 leading-[18px]">
              Save important chapters while reading to find them quickly here.
            </Text>
          </View>
        )}
      </ScrollView>
      <BottomNav activeTab="Bookmarks" navigation={navigation} />
    </View>
  );
};
