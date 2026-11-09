import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { HeaderBar, BottomNav } from '../components/navigation';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../hooks/useAuth';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { supportApi, SupportConfig, ComplaintPayload } from '../services/apiClient';
import { showAlert } from '../utils/dialog';

type Props = NativeStackScreenProps<RootStackParamList, 'ContactUs'>;

const CLASSES = [6, 7, 8, 9, 10] as const;

const CATEGORIES: Array<{
  value: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}> = [
  { value: 'technical_issue', label: 'Technical issue', icon: 'build-circle' },
  { value: 'textbook_access', label: 'Textbook / soft copy', icon: 'menu-book' },
  { value: 'recorded_classes', label: 'Recorded classes', icon: 'videocam' },
  { value: 'attendance', label: 'Attendance', icon: 'fact-check' },
  { value: 'login_account', label: 'Login / account', icon: 'lock' },
  { value: 'content_issue', label: 'Wrong content', icon: 'edit-note' },
  { value: 'billing_fees', label: 'Fees / payments', icon: 'payments' },
  { value: 'feedback', label: 'Feedback', icon: 'lightbulb' },
  { value: 'other', label: 'Other', icon: 'help-outline' },
];

const webOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : undefined;

export const ContactUsScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { profile } = useLearningProgress();

  const [activeTab, setActiveTab] = useState<'form' | 'office' | 'history'>('form');

  // Form state, prefilled from the student's profile (the screen is opened
  // after the profile has loaded).
  const profileGrade = (() => {
    const match = profile?.activeClassId?.match(/\d+/);
    const grade = match ? parseInt(match[0], 10) : null;
    return grade && grade >= 6 && grade <= 10 ? grade : null;
  })();

  const [fullName, setFullName] = useState(profile?.displayName || user?.name || '');
  const [classGrade, setClassGrade] = useState<number | null>(profileGrade);
  const [section, setSection] = useState(profile?.section || '');
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.guardianPhone || profile?.parentPhone || '');
  const [category, setCategory] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketRef, setTicketRef] = useState<string | null>(null);

  // Support config state
  const [config, setConfig] = useState<SupportConfig>({
    supportEmail: 'support@vidya.school',
    supportPhone: '+91 98765 43210',
    supportHours: 'Mon-Sat, 8:00 AM - 5:00 PM',
  });

  // History state
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  // Load support configuration
  useEffect(() => {
    supportApi.getSupportConfig()
      .then((cfg) => {
        if (cfg) setConfig(cfg);
      })
      .catch(() => {});
  }, []);

  // Load student ticket history when tab is opened
  useEffect(() => {
    if (activeTab !== 'history') return;

    let cancelled = false;
    const loadTickets = async () => {
      setLoadingTickets(true);
      try {
        const data = await supportApi.getMyComplaints();
        if (!cancelled && Array.isArray(data)) setMyTickets(data);
      } catch {
        // Keep the previously loaded list when the request fails.
      } finally {
        if (!cancelled) setLoadingTickets(false);
      }
    };

    loadTickets();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const resetForm = () => {
    setCategory(null);
    setSubject('');
    setMessage('');
    setError(null);
    setTicketRef(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (fullName.trim().length < 2) return setError('Please enter your full name.');
    if (!classGrade) return setError('Please select your class grade (6 to 10).');
    if (!email.trim() && !phone.trim() && !rollNumber.trim()) {
      return setError('Please provide at least one contact detail: email, phone, or roll number.');
    }
    if (!category) return setError('Please choose an issue category.');
    if (subject.trim().length < 4) return setError('Please write a short subject (at least 4 characters).');
    if (message.trim().length < 10) return setError('Please describe the issue in detail (at least 10 characters).');

    setSubmitting(true);
    try {
      const payload: ComplaintPayload = {
        full_name: fullName.trim(),
        class_grade: classGrade,
        section: section.trim() || undefined,
        roll_number: rollNumber.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        category,
        subject: subject.trim(),
        message: message.trim(),
        source: 'mobile',
      };

      const res = await supportApi.fileComplaint(payload);
      setTicketRef(res.ticket_ref || 'VIDYA-RECEIVED');
    } catch (e: any) {
      const msg = e.response?.data?.details?.[0]?.message || e.response?.data?.error || e.message;
      setError(msg || 'Network error — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = () => {
    const cleaned = config.supportPhone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      showAlert('Helpline', config.supportPhone);
    });
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${config.supportEmail}?subject=Vidya%20Student%20Support`).catch(() => {
      showAlert('Support Email', config.supportEmail);
    });
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <HeaderBar
        showBack
        onBackPress={() => navigation.goBack()}
        title="Contact Us & Help Desk"
        subtitle="AP SCERT Student Grievance Support"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Support Hero Banner */}
        <View className="overflow-hidden rounded-2xl bg-primaryDark p-5 shadow-sm">
          <View className="flex-row items-center gap-2">
            <View className="w-8 h-8 rounded-xl bg-palePeach/20 items-center justify-center">
              <MaterialIcons name="support-agent" size={18} color={Colors.primaryLight} />
            </View>
            <Text className="font-manrope-bold text-xs text-primaryLight tracking-widest uppercase">
              Student Grievance Cell
            </Text>
          </View>
          <Text className="mt-2 font-manrope-extrabold text-[20px] text-white leading-6">
            {"We're here to help you."}
          </Text>
          <Text className="mt-1 font-manrope-medium text-xs text-primaryLight leading-5">
            Facing problems with textbooks, recorded classes, login, or attendance? Send us your grievance or reach our helpline.
          </Text>

          {/* Quick Contact Buttons */}
          <View className="mt-4 flex-row gap-2.5">
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/15 border border-white/20"
              activeOpacity={0.8}
              onPress={handleCall}
            >
              <MaterialIcons name="call" size={15} color={Colors.white} />
              <Text className="font-manrope-bold text-xs text-white">Call Helpline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/15 border border-white/20"
              activeOpacity={0.8}
              onPress={handleEmail}
            >
              <MaterialIcons name="email" size={15} color={Colors.white} />
              <Text className="font-manrope-bold text-xs text-white">Email Us</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row p-1 bg-softWarm rounded-2xl border border-border">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === 'form' ? 'bg-primary shadow-xs' : ''
            }`}
            activeOpacity={0.8}
            onPress={() => setActiveTab('form')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                activeTab === 'form' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              File Issue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === 'office' ? 'bg-primary shadow-xs' : ''
            }`}
            activeOpacity={0.8}
            onPress={() => setActiveTab('office')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                activeTab === 'office' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              Helpline & Info
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-2 rounded-xl items-center justify-center ${
              activeTab === 'history' ? 'bg-primary shadow-xs' : ''
            }`}
            activeOpacity={0.8}
            onPress={() => setActiveTab('history')}
          >
            <Text
              className={`font-manrope-bold text-xs ${
                activeTab === 'history' ? 'text-white' : 'text-textSecondary'
              }`}
            >
              My Tickets
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: FILE COMPLAINT */}
        {activeTab === 'form' && (
          <>
            {ticketRef ? (
              /* Success confirmation */
              <View className="items-center justify-center py-8 px-4 bg-white rounded-2xl border border-border gap-3 shadow-sm">
                <View className="w-16 h-16 rounded-2xl bg-successBg border border-[#bfe3d2] items-center justify-center mb-1">
                  <MaterialIcons name="check-circle" size={36} color={Colors.success} />
                </View>
                <Text className="font-manrope-extrabold text-xl text-textPrimary">
                  Grievance Registered!
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary text-center">
                  Your complaint reference number is:
                </Text>
                <View className="bg-palePeach border border-dashed border-primary rounded-2xl px-6 py-3">
                  <Text className="font-manrope-extrabold text-xl text-primaryDark tracking-widest">
                    {ticketRef}
                  </Text>
                </View>
                <Text className="font-manrope-medium text-xs text-textMuted text-center px-4 leading-5">
                  Your grievance has been stored in our system. The school authority will review it within one school day.
                </Text>
                <View className="flex-row gap-3 mt-3 w-full">
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-xl bg-primary items-center"
                    onPress={resetForm}
                    activeOpacity={0.85}
                  >
                    <Text className="font-manrope-bold text-sm text-white">File Another Issue</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-xl border border-border bg-softWarm items-center"
                    onPress={() => setActiveTab('history')}
                    activeOpacity={0.85}
                  >
                    <Text className="font-manrope-bold text-sm text-textPrimary">View My Tickets</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Form */
              <View className="gap-4">
                {error && (
                  <View className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex-row items-center gap-2.5">
                    <MaterialIcons name="error-outline" size={18} color="#DC2626" />
                    <Text className="font-manrope-medium text-xs text-red-600 flex-1">{error}</Text>
                  </View>
                )}

                {/* Full Name */}
                <View className="gap-1.5">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Student Full Name <Text className="text-primary">*</Text>
                  </Text>
                  <TextInput
                    className="rounded-xl border border-border bg-softWarm px-4 py-3 font-manrope-semibold text-sm text-textPrimary"
                    style={webOutline as any}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter student name"
                    placeholderTextColor={Colors.textPlaceholder}
                  />
                </View>

                {/* Class selector */}
                <View className="gap-1.5">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Class Grade <Text className="text-primary">*</Text>
                  </Text>
                  <View className="flex-row gap-2">
                    {CLASSES.map((c) => {
                      const isSelected = classGrade === c;
                      return (
                        <TouchableOpacity
                          key={c}
                          className={`flex-1 h-11 rounded-xl items-center justify-center border ${
                            isSelected ? 'bg-palePeach border-primary' : 'bg-softWarm border-border'
                          }`}
                          activeOpacity={0.8}
                          onPress={() => setClassGrade(c)}
                        >
                          <Text
                            className={`font-manrope-extrabold text-sm ${
                              isSelected ? 'text-primary' : 'text-textSecondary'
                            }`}
                          >
                            Class {c}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Section & Roll Number */}
                <View className="flex-row gap-3">
                  <View className="flex-1 gap-1.5">
                    <Text className="font-manrope-bold text-xs text-textSecondary">Section</Text>
                    <TextInput
                      className="rounded-xl border border-border bg-softWarm px-4 py-3 font-manrope-semibold text-sm text-textPrimary"
                      style={webOutline as any}
                      value={section}
                      onChangeText={setSection}
                      placeholder="e.g. A"
                      placeholderTextColor={Colors.textPlaceholder}
                      maxLength={10}
                    />
                  </View>
                  <View className="flex-1 gap-1.5">
                    <Text className="font-manrope-bold text-xs text-textSecondary">Roll Number</Text>
                    <TextInput
                      className="rounded-xl border border-border bg-softWarm px-4 py-3 font-manrope-semibold text-sm text-textPrimary"
                      style={webOutline as any}
                      value={rollNumber}
                      onChangeText={setRollNumber}
                      placeholder="e.g. 15"
                      placeholderTextColor={Colors.textPlaceholder}
                      maxLength={30}
                    />
                  </View>
                </View>

                {/* Email & Phone */}
                <View className="gap-1.5">
                  <Text className="font-manrope-bold text-xs text-textSecondary">Contact Email</Text>
                  <TextInput
                    className="rounded-xl border border-border bg-softWarm px-4 py-3 font-manrope-semibold text-sm text-textPrimary"
                    style={webOutline as any}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="student@vidya.school"
                    placeholderTextColor={Colors.textPlaceholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View className="gap-1.5">
                  <Text className="font-manrope-bold text-xs text-textSecondary">Phone / WhatsApp Number</Text>
                  <TextInput
                    className="rounded-xl border border-border bg-softWarm px-4 py-3 font-manrope-semibold text-sm text-textPrimary"
                    style={webOutline as any}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={Colors.textPlaceholder}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Issue Category */}
                <View className="gap-2">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Issue Category <Text className="text-primary">*</Text>
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = category === cat.value;
                      return (
                        <TouchableOpacity
                          key={cat.value}
                          className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
                            isSelected ? 'bg-palePeach border-primary' : 'bg-softWarm border-border'
                          }`}
                          activeOpacity={0.8}
                          onPress={() => setCategory(cat.value)}
                        >
                          <MaterialIcons
                            name={cat.icon}
                            size={15}
                            color={isSelected ? Colors.primaryDark : Colors.textSecondary}
                          />
                          <Text
                            className={`font-manrope-bold text-xs ${
                              isSelected ? 'text-primaryDark' : 'text-textSecondary'
                            }`}
                          >
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Subject */}
                <View className="gap-1.5">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Subject <Text className="text-primary">*</Text>
                  </Text>
                  <TextInput
                    className="rounded-xl border border-border bg-softWarm px-4 py-3 font-manrope-semibold text-sm text-textPrimary"
                    style={webOutline as any}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Brief summary of the issue"
                    placeholderTextColor={Colors.textPlaceholder}
                    maxLength={200}
                  />
                </View>

                {/* Message */}
                <View className="gap-1.5">
                  <Text className="font-manrope-bold text-xs text-textSecondary">
                    Message / Problem Description <Text className="text-primary">*</Text>
                  </Text>
                  <TextInput
                    className="rounded-xl border border-border bg-softWarm px-4 py-3 font-manrope-medium text-sm text-textPrimary min-h-[110px]"
                    style={[webOutline as any, { textAlignVertical: 'top' }]}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Please explain the issue in detail so the school authority can resolve it quickly."
                    placeholderTextColor={Colors.textPlaceholder}
                    multiline
                    numberOfLines={4}
                    maxLength={5000}
                  />
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  className={`mt-2 py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-sm ${
                    submitting ? 'bg-primary/70' : 'bg-primary'
                  }`}
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <MaterialIcons name="send" size={18} color={Colors.white} />
                      <Text className="font-manrope-extrabold text-sm text-white">Submit Grievance</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* TAB 2: OFFICE & HELPLINE INFO */}
        {activeTab === 'office' && (
          <View className="gap-4">
            <View className="bg-white rounded-2xl p-5 border border-border shadow-sm gap-3.5">
              <Text className="font-manrope-extrabold text-base text-textPrimary">
                School Grievance & Helpdesk
              </Text>
              <Text className="font-manrope-medium text-xs text-textSecondary leading-5">
                Our support team is available during school working hours to assist students and parents with academic queries, digital access, and technical concerns.
              </Text>

              <View className="h-[1px] bg-border my-1" />

              {/* Helpline */}
              <TouchableOpacity
                className="flex-row items-center gap-3 p-3 rounded-xl bg-softWarm border border-border"
                activeOpacity={0.8}
                onPress={handleCall}
              >
                <View className="w-10 h-10 rounded-xl bg-palePeach items-center justify-center">
                  <MaterialIcons name="phone" size={20} color={Colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope-bold text-xs text-textSecondary">Toll-Free Helpline</Text>
                  <Text className="font-manrope-extrabold text-sm text-textPrimary mt-0.5">
                    {config.supportPhone}
                  </Text>
                </View>
                <MaterialIcons name="call" size={18} color={Colors.primary} />
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                className="flex-row items-center gap-3 p-3 rounded-xl bg-softWarm border border-border"
                activeOpacity={0.8}
                onPress={handleEmail}
              >
                <View className="w-10 h-10 rounded-xl bg-palePeach items-center justify-center">
                  <MaterialIcons name="mail-outline" size={20} color={Colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope-bold text-xs text-textSecondary">Support Email</Text>
                  <Text className="font-manrope-extrabold text-sm text-textPrimary mt-0.5">
                    {config.supportEmail}
                  </Text>
                </View>
                <MaterialIcons name="open-in-new" size={18} color={Colors.primary} />
              </TouchableOpacity>

              {/* Working Hours */}
              <View className="flex-row items-center gap-3 p-3 rounded-xl bg-softWarm border border-border">
                <View className="w-10 h-10 rounded-xl bg-palePeach items-center justify-center">
                  <MaterialIcons name="schedule" size={20} color={Colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="font-manrope-bold text-xs text-textSecondary">Help Desk Hours</Text>
                  <Text className="font-manrope-extrabold text-sm text-textPrimary mt-0.5">
                    {config.supportHours}
                  </Text>
                </View>
              </View>
            </View>

            {/* SCERT Division Card */}
            <View className="bg-palePeach/50 rounded-2xl p-4 border border-[#f2ded3] flex-row items-center gap-3">
              <MaterialIcons name="verified" size={24} color={Colors.primary} />
              <View className="flex-1">
                <Text className="font-manrope-bold text-xs text-textPrimary">Official Education Division</Text>
                <Text className="font-manrope-medium text-[11px] text-textSecondary mt-0.5">
                  Andhra Pradesh State Board of Educational Research and Training (SCERT) Digital Learning Cell.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* TAB 3: MY COMPLAINTS / TICKETS */}
        {activeTab === 'history' && (
          <View className="gap-3">
            {loadingTickets ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : myTickets.length > 0 ? (
              myTickets.map((t) => {
                const isResolved = t.status === 'resolved' || t.status === 'closed';
                const statusBg = isResolved ? Colors.successBg : Colors.palePeach;
                const statusColor = isResolved ? Colors.success : Colors.primaryDark;

                return (
                  <View
                    key={t.id || t.ticket_ref}
                    className="p-4 rounded-2xl bg-white border border-border shadow-sm gap-2"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="bg-softWarm px-2.5 py-1 rounded-lg border border-border">
                        <Text className="font-manrope-extrabold text-xs text-textPrimary">
                          {t.ticket_ref}
                        </Text>
                      </View>
                      <View
                        className="px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: statusBg }}
                      >
                        <Text
                          className="font-manrope-bold text-[11px] uppercase tracking-wider"
                          style={{ color: statusColor }}
                        >
                          {t.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>

                    <Text className="font-manrope-extrabold text-sm text-textPrimary mt-1">
                      {t.subject}
                    </Text>

                    <Text className="font-manrope-medium text-xs text-textSecondary leading-5" numberOfLines={2}>
                      {t.message}
                    </Text>

                    <View className="flex-row items-center justify-between pt-2 border-t border-border mt-1">
                      <Text className="font-manrope-semibold text-[10px] text-textMuted uppercase">
                        {t.category?.replace('_', ' ')}
                      </Text>
                      <Text className="font-manrope-medium text-[10px] text-textMuted">
                        {new Date(t.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="py-16 items-center justify-center gap-2">
                <View className="w-14 h-14 rounded-2xl bg-palePeach items-center justify-center mb-1">
                  <MaterialIcons name="inbox" size={28} color={Colors.primary} />
                </View>
                <Text className="font-manrope-extrabold text-base text-textPrimary">No Complaints Yet</Text>
                <Text className="font-manrope-medium text-xs text-textMuted text-center px-6">
                  You have not submitted any complaints or grievance tickets.
                </Text>
                <TouchableOpacity
                  className="mt-2 px-5 py-2.5 rounded-xl bg-primary"
                  onPress={() => setActiveTab('form')}
                  activeOpacity={0.85}
                >
                  <Text className="font-manrope-bold text-xs text-white">File an Issue</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab="Profile" navigation={navigation} />
    </View>
  );
};
