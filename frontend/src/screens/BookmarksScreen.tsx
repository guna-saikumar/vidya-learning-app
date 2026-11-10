import React, { useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import Colors from '../constants/colors';

import { HeaderBar, BottomNav } from '../components/navigation';
import { PageIntro, HoverCard } from '../components/common';

import { useLearningProgress } from '../hooks/useLearningProgress';
import { getApiErrorMessage } from '../services/apiClient';
import { showAlert } from '../utils/dialog';

import { RootStackParamList } from '../types/navigation';
import { BookmarkItem } from '../types/curriculum';

type Props = NativeStackScreenProps<RootStackParamList, 'Bookmarks'>;

export const BookmarksScreen: React.FC<Props> = ({ navigation }) => {
  const {
    bookmarks,
    bookmarksLoading,
    bookmarksError,
    bookmarksSource,
    deletingBookmarkIds,
    removeBookmark,
    refreshData,
  } = useLearningProgress();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData(true);
    } finally {
      setRefreshing(false);
    }
  };

  // Remove bookmark. The thunk only updates Redux after the server confirms.
  const handleRemove = async (id: string) => {
    if (deletingBookmarkIds.includes(id)) {
      return;
    }

    try {
      await removeBookmark(id);
    } catch (error) {
      showAlert(
        'Could not remove bookmark',
        getApiErrorMessage(
          error,
          'Unable to remove bookmark. Please try again.'
        )
      );
    }
  };

  // Open the bookmark's own target. The type decides the screen, so a chapter
  // bookmark can never be routed to SectionDetails (or vice versa).
  const handleOpenBookmark = (bm: BookmarkItem) => {
    if (!bm.classId || !bm.subjectId || !bm.chapterId) {
      showAlert(
        'Unable to open bookmark',
        'Some required bookmark information is missing.'
      );
      return;
    }

    if (bm.type === 'section') {
      if (!bm.sectionId) {
        showAlert(
          'Unable to open bookmark',
          'This section bookmark is missing its section id.'
        );
        return;
      }

      navigation.navigate('SectionDetails', {
        classId: bm.classId,
        subjectId: bm.subjectId,
        chapterId: bm.chapterId,
        sectionId: bm.sectionId,
      });
      return;
    }

    // Chapter and formula bookmarks both belong to a chapter. There is no
    // dedicated formula screen yet, so open the chapter that contains it.
    navigation.navigate('ChapterDetails', {
      classId: bm.classId,
      subjectId: bm.subjectId,
      chapterId: bm.chapterId,
    });
  };

  const showInitialLoading = bookmarksLoading && bookmarks.length === 0;
  const showEmptyState =
    !showInitialLoading && !bookmarksError && bookmarks.length === 0;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />

      <HeaderBar
        title="Bookmarks"
        subtitle="Saved chapters and study notes."
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 18,
          paddingBottom: 48,
          gap: 18,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        <PageIntro
          eyebrow="STUDY VAULT"
          badge={`${bookmarks.length} Saved`}
          title="Saved Bookmarks"
        />

        {bookmarksError && (
          <View
            className="rounded-2xl p-4 gap-2"
            style={{
              backgroundColor: Colors.errorBg,
              borderWidth: 1,
              borderColor: Colors.error,
            }}
          >
            <Text
              className="font-manrope-semibold text-[13px]"
              style={{ color: Colors.error }}
            >
              {bookmarksError}
            </Text>

            <TouchableOpacity
              className="self-start"
              onPress={() => refreshData(true)}
            >
              <Text
                className="font-manrope-bold text-xs"
                style={{ color: Colors.error }}
              >
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {bookmarksSource === 'cache' && (
          <View
            className="rounded-2xl px-4 py-3"
            style={{ backgroundColor: Colors.accentGoldBg }}
          >
            <Text
              className="font-manrope-semibold text-[12px]"
              style={{ color: Colors.accentGoldDark }}
            >
              Offline — showing your last saved bookmarks.
            </Text>
          </View>
        )}

        {showInitialLoading ? (
          <View className="items-center justify-center py-20 gap-3">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text className="font-manrope-medium text-[13px] text-textMuted">
              Loading your bookmarks…
            </Text>
          </View>
        ) : bookmarks.length > 0 ? (
          <View className="gap-3">
            {bookmarks.map((bm) => {
              const isDeleting = deletingBookmarkIds.includes(bm.id);

              return (
                <HoverCard
                  key={bm.id}
                  className="bg-white rounded-[20px] p-5 border border-border gap-3 shadow-sm"
                  lift={-4}
                >
                  <TouchableOpacity
                    className="flex-row items-start gap-3"
                    onPress={() => handleOpenBookmark(bm)}
                    activeOpacity={0.8}
                    disabled={isDeleting}
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

                    <View
                      className="flex-1 min-w-0 gap-0.5"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <Text className="font-manrope-semibold text-[11px] text-textMuted">
                        {bm.subtitle}
                      </Text>

                      <Text className="font-manrope-extrabold text-[15px] text-textPrimary">
                        {bm.title}
                      </Text>

                      {bm.previewText && (
                        <Text
                          className="font-manrope-medium text-xs text-textSecondary mt-1 leading-4"
                          numberOfLines={2}
                        >
                          {bm.previewText}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <View className="flex-row items-center justify-between pt-2.5 border-t border-border">
                    <TouchableOpacity
                      className="flex-row items-center gap-1"
                      onPress={() => handleOpenBookmark(bm)}
                      disabled={isDeleting}
                    >
                      <Text className="font-manrope-bold text-xs text-primary">
                        Open
                      </Text>

                      <MaterialIcons
                        name="arrow-forward"
                        size={14}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200"
                      onPress={() => handleRemove(bm.id)}
                      disabled={isDeleting}
                      activeOpacity={0.7}
                      hitSlop={{
                        top: 12,
                        bottom: 12,
                        left: 12,
                        right: 12,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Remove bookmark ${bm.title}`}
                    >
                      {isDeleting ? (
                        <ActivityIndicator
                          size="small"
                          color={Colors.error}
                        />
                      ) : (
                        <>
                          <MaterialIcons
                            name="bookmark-remove"
                            size={16}
                            color={Colors.error}
                          />
                          <Text className="font-manrope-bold text-xs text-red-600">
                            Remove
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </HoverCard>
              );
            })}
          </View>
        ) : showEmptyState ? (
          <View className="items-center justify-center py-20 gap-2.5">
            <View className="w-[54px] h-[54px] rounded-[17px] bg-palePeach items-center justify-center mb-1.5">
              <MaterialIcons
                name="bookmark-border"
                size={28}
                color={Colors.primary}
              />
            </View>

            <Text className="font-manrope-extrabold text-[17px] text-textPrimary">
              No bookmarks yet
            </Text>

            <Text className="font-manrope-medium text-[13px] text-textMuted text-center px-8 leading-[18px]">
              Save important chapters while reading to find them quickly here.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <BottomNav activeTab="Learn" navigation={navigation} />
    </View>
  );
};
