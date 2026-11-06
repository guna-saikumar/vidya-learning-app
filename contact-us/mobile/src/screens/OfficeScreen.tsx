import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import {
  listComplaints,
  updateComplaintStatus,
  type ComplaintStatus,
  type ComplaintSummary,
} from '../api';

const webOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : undefined;

const STATUS_META: Record<
  ComplaintStatus,
  { label: string; color: string; bg: string }
> = {
  open: { label: 'Open', color: '#9a742a', bg: '#fdf8ec' },
  in_progress: { label: 'In progress', color: Colors.primaryDark, bg: Colors.palePeach },
  resolved: { label: 'Resolved', color: Colors.success, bg: Colors.successBg },
  closed: { label: 'Closed', color: Colors.textMuted, bg: Colors.softWarm },
  escalated: { label: 'Escalated', color: Colors.error, bg: Colors.errorBg },
};

const STATUS_ORDER: ComplaintStatus[] = ['open', 'in_progress', 'resolved', 'closed', 'escalated'];

const CATEGORY_LABEL: Record<string, string> = {
  technical_issue: 'Technical issue',
  textbook_access: 'Textbook / soft copy',
  recorded_classes: 'Recorded classes',
  attendance: 'Attendance',
  login_account: 'Login / account',
  content_issue: 'Wrong content',
  billing_fees: 'Fees / payments',
  feedback: 'Feedback',
  other: 'Other',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

interface OfficeScreenProps {
  onClose: () => void;
}

const OfficeScreen: React.FC<OfficeScreenProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updatingRef, setUpdatingRef] = useState<string | null>(null);

  const load = async (tk: string, quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const data = await listComplaints(tk);
      setComplaints(data);
      setAuthed(true);
    } catch (e) {
      setAuthed(false);
      setError(e instanceof Error ? e.message : 'Unable to load complaints.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const unlock = () => {
    const tk = token.trim();
    if (!tk) {
      setError('Enter the admin token.');
      return;
    }
    load(tk);
  };

  const refresh = () => {
    if (authed) load(token.trim(), true);
  };

  const lock = () => {
    setAuthed(false);
    setComplaints([]);
    setToken('');
    setError(null);
  };

  const changeStatus = async (c: ComplaintSummary, next: ComplaintStatus) => {
    if (c.status === next || updatingRef) return;
    setUpdatingRef(c.ticket_ref);
    setError(null);
    try {
      const updated = await updateComplaintStatus(token.trim(), c.ticket_ref, next);
      setComplaints((prev) =>
        prev.map((item) => (item.ticket_ref === updated.ticket_ref ? updated : item))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update status.');
    } finally {
      setUpdatingRef(null);
    }
  };

  const counts = useMemo(() => {
    const base = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0])) as Record<ComplaintStatus, number>;
    for (const c of complaints) base[c.status] += 1;
    return base;
  }, [complaints]);

  return (
    <View className="flex-1 bg-surfaceSoft">
      <StatusBar barStyle="dark-content" />
      {/* Top bar */}
      <View
        className="bg-white border-b border-border"
        style={{ paddingTop: Math.max(insets.top, 8) }}
      >
        <View className="h-16 px-4 flex-row items-center gap-3">
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Close school office"
            className="w-11 h-11 rounded-xl border border-border bg-white items-center justify-center"
          >
            <MaterialIcons name="close" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="font-manrope-extrabold text-[15px] text-textPrimary leading-5">
              School Office
            </Text>
            <Text className="font-manrope-medium text-[9px] text-textMuted uppercase tracking-widest">
              Complaints access
            </Text>
          </View>
          {authed && (
            <TouchableOpacity
              onPress={lock}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Lock office view"
              className="w-11 h-11 rounded-xl border border-border bg-softWarm items-center justify-center"
            >
              <MaterialIcons name="lock" size={20} color={Colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!authed ? (
        /* ---- Token unlock ---- */
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-sm rounded-2xl border border-border bg-white p-5 gap-4 shadow-sm">
            <View className="w-14 h-14 rounded-2xl bg-palePeach border border-border items-center justify-center self-center">
              <MaterialIcons name="admin-panel-settings" size={28} color={Colors.primary} />
            </View>
            <View className="gap-1">
              <Text className="font-manrope-extrabold text-[17px] text-textPrimary text-center">
                School office access
              </Text>
              <Text className="font-manrope-medium text-[12px] text-textSecondary text-center leading-5">
                Enter the admin token to view and update complaints.
              </Text>
            </View>
            <View className="flex-row items-center rounded-2xl border border-border bg-softWarm px-4 py-3">
              <MaterialIcons name="key" size={18} color={Colors.textMuted} />
              <TextInput
                className="flex-1 ml-2 font-manrope-semibold text-[14px] text-textPrimary"
                style={webOutline as any}
                value={token}
                onChangeText={setToken}
                onSubmitEditing={unlock}
                placeholder="Admin token"
                placeholderTextColor={Colors.textPlaceholder}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {error && (
              <View className="flex-row items-start gap-2 rounded-2xl border border-[#f3b8b2] bg-errorBg px-3 py-2.5">
                <MaterialIcons name="error-outline" size={18} color={Colors.error} />
                <Text className="flex-1 font-manrope-semibold text-[11px] text-error leading-4">
                  {error}
                </Text>
              </View>
            )}
            <TouchableOpacity
              className={`flex-row items-center justify-center gap-2 rounded-2xl py-3.5 ${
                loading ? 'bg-primaryDark' : 'bg-primary'
              }`}
              onPress={unlock}
              disabled={loading}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Unlock office view"
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialIcons name="lock-open" size={18} color="#fff" />
              )}
              <Text className="font-manrope-extrabold text-[14px] text-white">
                {loading ? 'Checking…' : 'Unlock office view'}
              </Text>
            </TouchableOpacity>
            <Text className="font-manrope-medium text-[9px] text-textMuted text-center">
              Token is configured in contact-us/.env as ADMIN_TOKEN.
            </Text>
          </View>
        </View>
      ) : (
        /* ---- Complaints list ---- */
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 44,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header + refresh */}
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-1">
              <Text className="font-manrope-bold text-[10px] text-textMuted uppercase tracking-widest">
                Complaints inbox
              </Text>
              <Text className="font-manrope-extrabold text-[17px] text-textPrimary">
                {complaints.length} request{complaints.length === 1 ? '' : 's'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={refresh}
              disabled={refreshing}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Refresh complaints"
              className="w-11 h-11 rounded-xl border border-border bg-white items-center justify-center"
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <MaterialIcons name="refresh" size={20} color={Colors.primaryDark} />
              )}
            </TouchableOpacity>
          </View>

          {/* Status summary */}
          <View className="flex-row flex-wrap gap-2">
            {STATUS_ORDER.map((s) => {
              const meta = STATUS_META[s];
              return (
                <View
                  key={s}
                  className="rounded-full border px-2.5 py-1"
                  style={{ backgroundColor: meta.bg, borderColor: meta.color + '44' }}
                >
                  <Text className="font-manrope-bold text-[10px]" style={{ color: meta.color }}>
                    {meta.label}: {counts[s]}
                  </Text>
                </View>
              );
            })}
          </View>

          {error && (
            <View className="flex-row items-start gap-2 rounded-2xl border border-[#f3b8b2] bg-errorBg px-3 py-2.5">
              <MaterialIcons name="error-outline" size={18} color={Colors.error} />
              <Text className="flex-1 font-manrope-semibold text-[11px] text-error leading-4">
                {error}
              </Text>
            </View>
          )}

          {/* Empty state */}
          {complaints.length === 0 && (
            <View className="items-center justify-center rounded-2xl border border-border bg-white py-14 gap-2">
              <View className="w-14 h-14 rounded-2xl bg-palePeach border border-border items-center justify-center">
                <MaterialIcons name="inbox" size={28} color={Colors.primary} />
              </View>
              <Text className="font-manrope-extrabold text-[15px] text-textPrimary">
                No complaints yet
              </Text>
              <Text className="font-manrope-medium text-[11px] text-textMuted text-center px-8 leading-4">
                When students file complaints, they will appear here in real time.
              </Text>
            </View>
          )}

          {/* Complaint cards */}
          {complaints.map((c) => {
            const meta = STATUS_META[c.status];
            const isUpdating = updatingRef === c.ticket_ref;
            return (
              <View
                key={c.ticket_ref}
                className="rounded-2xl border border-border bg-white p-4 gap-2.5 shadow-sm"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="font-manrope-extrabold text-[12px] text-primaryDark tracking-widest">
                    {c.ticket_ref}
                  </Text>
                  <View
                    className="rounded-full border px-2.5 py-1"
                    style={{ backgroundColor: meta.bg, borderColor: meta.color + '44' }}
                  >
                    <Text
                      className="font-manrope-bold text-[9px] uppercase tracking-widest"
                      style={{ color: meta.color }}
                    >
                      {meta.label}
                    </Text>
                  </View>
                </View>

                <View className="gap-0.5">
                  <Text className="font-manrope-extrabold text-[14px] text-textPrimary leading-5">
                    {c.subject}
                  </Text>
                  <Text className="font-manrope-medium text-[10px] text-textSecondary leading-4">
                    {CATEGORY_LABEL[c.category] ?? c.category} · Class {c.class_grade}
                    {c.section ? `-${c.section}` : ''} · Roll {c.roll_number || '—'}
                  </Text>
                </View>

                <Text className="font-manrope-medium text-[12px] text-textLead leading-5">
                  {c.message}
                </Text>

                <View className="flex-row flex-wrap gap-x-3 gap-y-1 border-t border-border pt-2">
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="person" size={13} color={Colors.textMuted} />
                    <Text className="font-manrope-medium text-[10px] text-textSecondary">
                      {c.full_name}
                    </Text>
                  </View>
                  {c.email && (
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="mail-outline" size={13} color={Colors.textMuted} />
                      <Text className="font-manrope-medium text-[10px] text-textSecondary">
                        {c.email}
                      </Text>
                    </View>
                  )}
                  {c.phone && (
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="phone" size={13} color={Colors.textMuted} />
                      <Text className="font-manrope-medium text-[10px] text-textSecondary">
                        {c.phone}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center gap-1">
                    <MaterialIcons name="schedule" size={13} color={Colors.textMuted} />
                    <Text className="font-manrope-medium text-[10px] text-textSecondary">
                      {formatDate(c.created_at)}
                    </Text>
                  </View>
                </View>

                {/* Status actions */}
                <View className="gap-1.5">
                  <Text className="font-manrope-bold text-[9px] text-textMuted uppercase tracking-widest">
                    Change status
                  </Text>
                  <View className="flex-row flex-wrap gap-1.5">
                    {STATUS_ORDER.map((s) => {
                      const active = c.status === s;
                      const sMeta = STATUS_META[s];
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() => changeStatus(c, s)}
                          disabled={isUpdating}
                          activeOpacity={0.85}
                          accessibilityRole="button"
                          accessibilityState={{ selected: active }}
                          className="rounded-full border px-3 py-1.5"
                          style={{
                            backgroundColor: active ? sMeta.color : sMeta.bg,
                            borderColor: active ? sMeta.color : sMeta.color + '55',
                            opacity: isUpdating ? 0.6 : 1,
                          }}
                        >
                          <Text
                            className="font-manrope-bold text-[10px]"
                            style={{ color: active ? '#ffffff' : sMeta.color }}
                          >
                            {sMeta.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {isUpdating && (
                    <Text className="font-manrope-medium text-[9px] text-textMuted">
                      Updating…
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default OfficeScreen;
