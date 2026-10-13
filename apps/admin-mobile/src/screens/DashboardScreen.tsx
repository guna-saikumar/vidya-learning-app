import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  GraduationCap,
  BookOpen,
  Layers,
  FileText,
  PlusCircle,
  UploadCloud,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  School,
  Sparkles,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { StatCard } from '../components/common/StatCard';
import { HoverCard } from '../components/common/HoverCard';
import { getDashboardStats, DashboardStats } from '../services/statsService';
import { getClasses } from '../services/curriculumService';
import { SchoolClass } from '../types/curriculum';
import { useAdminAuth } from '../hooks/useAdminAuth';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const [s, cls] = await Promise.all([getDashboardStats(), getClasses()]);
      setStats(s);
      setClasses(cls);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const publishedPercent =
    stats && stats.totalMaterials > 0
      ? Math.round((stats.publishedMaterials / stats.totalMaterials) * 100)
      : 0;

  return (
    <View className="flex-1 bg-white">
      <HeaderBar onProfilePress={() => navigation.navigate('Profile')} />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: 20,
          paddingBottom: 50,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Welcome Hero Card matching student HeroCard */}
        <View className="bg-primaryDark rounded-3xl p-6 relative overflow-hidden justify-center min-h-[155px]">
          <View className="w-4/5 gap-2.5 z-10">
            <View className="self-start flex-row items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10">
              <Sparkles size={13} color={Colors.white} />
              <Text className="text-[11px] font-manrope-bold text-white tracking-wide">
                ACADEMIC YEAR 2026–2027
              </Text>
            </View>
            <Text className="text-xl font-manrope-extrabold text-white leading-[26px] tracking-tight">
              Welcome, {user?.fullName || 'Admin'}
            </Text>
            <Text className="text-[13px] font-manrope-medium text-primaryLight leading-[19px]">
              {user?.department || 'Academic Director · AP SCERT Division'} · Classes 6–10
            </Text>
          </View>

          {/* Watermark Icon */}
          <View className="absolute -right-2.5 -bottom-2.5 w-24 h-24 rounded-full bg-white/5 items-center justify-center">
            <School size={40} color="rgba(255, 255, 255, 0.2)" />
          </View>
        </View>

        {/* Quick Actions Panel */}
        <View className="gap-2.5">
          <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
            Quick Actions
          </Text>
          <View className="flex-row items-center gap-3">
            <HoverCard
              className="flex-1 bg-white rounded-[20px] p-4 border border-border shadow-sm items-center justify-center gap-2"
              onPress={() => navigation.navigate('Curriculum')}
              lift={-3}
            >
              <View className="w-11 h-11 rounded-[14px] bg-palePeach items-center justify-center border border-primaryLight">
                <PlusCircle size={22} color={Colors.primary} />
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-center">
                Add Subject
              </Text>
            </HoverCard>

            <HoverCard
              className="flex-1 bg-white rounded-[20px] p-4 border border-border shadow-sm items-center justify-center gap-2"
              onPress={() => navigation.navigate('AddEditMaterial')}
              lift={-3}
            >
              <View className="w-11 h-11 rounded-[14px] bg-successBg items-center justify-center border border-success/30">
                <UploadCloud size={22} color={Colors.success} />
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-center">
                Upload Material
              </Text>
            </HoverCard>

            <HoverCard
              className="flex-1 bg-white rounded-[20px] p-4 border border-border shadow-sm items-center justify-center gap-2"
              onPress={() => navigation.navigate('ContentEditor', {})}
              lift={-3}
            >
              <View className="w-11 h-11 rounded-[14px] bg-accentGoldBg items-center justify-center border border-accentGold/30">
                <FileText size={22} color={Colors.accentGoldDark} />
              </View>
              <Text className="font-manrope-bold text-xs text-textPrimary text-center">
                Note Editor
              </Text>
            </HoverCard>
          </View>
        </View>

        {/* Real-time Statistics Cards Grid (Paired 2x2 layout matching student-mobile) */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
              Curriculum Overview
            </Text>
            <Text className="font-manrope-semibold text-xs text-textMuted">Classes 6–10 • SCERT</Text>
          </View>

          <View className="gap-3">
            <View className="flex-row gap-3">
              <StatCard
                label="Classes"
                value={stats?.totalClasses || 5}
                icon={<GraduationCap size={22} color={Colors.primary} />}
                badge="SCERT"
                badgeColor="primary"
                onPress={() => navigation.navigate('Curriculum')}
              />
              <StatCard
                label="Subjects"
                value={stats?.totalSubjects || 33}
                icon={<BookOpen size={22} color={Colors.primary} />}
                badge="Grades 6–10"
                badgeColor="primary"
                onPress={() => navigation.navigate('Curriculum')}
              />
            </View>

            <View className="flex-row gap-3">
              <StatCard
                label="Chapters"
                value={stats?.totalChapters || 58}
                icon={<Layers size={22} color={Colors.primary} />}
                badge="Structured"
                badgeColor="primary"
              />
              <StatCard
                label="Published"
                value={`${publishedPercent}%`}
                subtitle={`${stats?.publishedMaterials || 4} of ${stats?.totalMaterials || 6} live`}
                icon={<FileText size={22} color={Colors.success} />}
                badge={`${stats?.publishedMaterials || 0} Live`}
                badgeColor="success"
                isProgress={true}
                onPress={() => navigation.navigate('Materials')}
              />
            </View>
          </View>
        </View>

        {/* Publication Progress Tracker Card */}
        <HoverCard className="bg-white rounded-[20px] p-5 border border-border gap-3.5 shadow-sm" lift={-3}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
                Publication Pipeline
              </Text>
              <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                {stats?.publishedMaterials || 0} of {stats?.totalMaterials || 0} materials currently active
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-successBg px-2.5 py-1 rounded-full">
              <CheckCircle2 size={13} color={Colors.success} />
              <Text className="font-manrope-bold text-xs text-success">
                {publishedPercent}% Ready
              </Text>
            </View>
          </View>

          {/* Progress track */}
          <View className="gap-1.5">
            <View className="h-1.5 rounded-full bg-[#F3EDE9] overflow-hidden">
              <View
                className="h-full rounded-full bg-success"
                style={{ width: `${Math.max(2, Math.min(100, publishedPercent))}%` }}
              />
            </View>
          </View>

          <View className="flex-row items-center justify-between pt-1">
            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-success" />
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Published ({stats?.publishedMaterials || 0})
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-accentGoldDark" />
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Drafts ({stats?.draftsCount || 0})
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-textMuted" />
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Archived ({stats?.archivedCount || 0})
              </Text>
            </View>
          </View>
        </HoverCard>

        {/* Classes Overview Breakdown */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-manrope-extrabold text-lg text-textPrimary tracking-tight">
              Class Hierarchy
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Curriculum')}>
              <Text className="font-manrope-bold text-[13px] text-primary">View All Classes</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {classes.map((c) => (
              <HoverCard
                key={c.id}
                className="bg-white rounded-[20px] p-5 border border-border shadow-sm flex-row items-center justify-between"
                onPress={() => navigation.navigate('Curriculum')}
                lift={-3}
              >
                <View className="flex-row items-center gap-3.5 flex-1 min-w-0">
                  <View className="w-11 h-11 rounded-[14px] bg-palePeach items-center justify-center">
                    <GraduationCap size={22} color={Colors.primary} />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-manrope-extrabold text-base text-textPrimary tracking-tight">
                      {c.title}
                    </Text>
                    <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                      {c.subtitle} · {c.subjects.length} Subjects
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-2">
                  <View className="bg-softWarm px-2.5 py-1 rounded-full">
                    <Text className="font-manrope-bold text-xs text-primary">
                      {c.subjects.reduce((acc, s) => acc + s.chapters.length, 0)} Chapters
                    </Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </View>
              </HoverCard>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
