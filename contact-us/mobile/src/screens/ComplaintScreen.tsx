import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Platform,
  StyleSheet,
  type KeyboardTypeOptions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import OfficeScreen from './OfficeScreen';
import {
  fetchSupportConfig,
  fileComplaint,
  type ComplaintCategory,
  type SupportConfig,
} from '../api';

const CLASSES = [6, 7, 8, 9, 10] as const;
const CATEGORIES: Array<{ value: ComplaintCategory; label: string; icon: keyof typeof MaterialIcons.glyphMap }> = [
  { value: 'technical_issue', label: 'Technical issue', icon: 'build-circle' },
  { value: 'textbook_access', label: 'Textbook / soft copy', icon: 'menu-book' },
  { value: 'recorded_classes', label: 'Recorded classes', icon: 'videocam' },
  { value: 'attendance', label: 'Attendance', icon: 'fact-check' },
  { value: 'login_account', label: 'Login / account', icon: 'lock' },
  { value: 'content_issue', label: 'Wrong content', icon: 'edit-note' },
  { value: 'billing_fees', label: 'Fees / payments', icon: 'payments' },
  { value: 'feedback', label: 'Feedback', icon: 'lightbulb' },
  { value: 'other', label: 'Other', icon: 'help-outline' },
] as const;

type AutoCapitalize = 'none' | 'sentences' | 'words' | 'characters';

const webOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : undefined;

interface TextFieldProps {
  label: string;
  required?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: AutoCapitalize;
  autoCorrect?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  required,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
  multiline,
  numberOfLines,
}) => {
  const [focused, setFocused] = useState(false);
  const border = focused ? 'border-primary' : 'border-border';
  const bg = focused ? 'bg-white' : 'bg-softWarm';
  const iconColor = focused ? Colors.primary : Colors.textMuted;

  return (
    <View className="gap-1.5">
      <Text className="font-manrope-bold text-[11px] text-textSecondary tracking-wide">
        {label}
        {required && <Text className="text-primary"> *</Text>}
      </Text>
      <View
        className={`flex-row ${multiline ? 'items-start' : 'items-center'} rounded-2xl border ${border} ${bg} px-4 ${
          multiline ? 'py-3' : 'py-3'
        } shadow-sm`}
      >
        {icon && (
          <View className="w-7 h-7 rounded-lg bg-palePeach items-center justify-center mr-2.5">
            <MaterialIcons name={icon} size={17} color={iconColor} />
          </View>
        )}
        <TextInput
          className={`flex-1 ${multiline ? 'font-manrope-medium text-sm' : 'font-manrope-semibold text-[15px]'} text-textPrimary ${
            multiline ? 'min-h-[110px]' : ''
          }`}
          style={[
            webOutline as any,
            multiline ? { textAlignVertical: 'top' } : undefined,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textPlaceholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    </View>
  );
};

const ClassChip: React.FC<{ value: number; selected: boolean; onPress: () => void }> = ({
  value,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    className={`h-11 flex-1 rounded-xl border items-center justify-center ${
      selected ? 'bg-palePeach border-primary' : 'bg-softWarm border-border'
    }`}
  >
    <Text
      className={`font-manrope-extrabold text-[15px] ${
        selected ? 'text-primaryDark' : 'text-textSecondary'
      }`}
    >
      {value}
    </Text>
  </TouchableOpacity>
);

const CategoryChip: React.FC<{
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  selected: boolean;
  onPress: () => void;
}> = ({ label, icon, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityState={{ selected }}
    className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 ${
      selected ? 'bg-palePeach border-primary' : 'bg-softWarm border-border'
    }`}
  >
    <MaterialIcons
      name={icon}
      size={15}
      color={selected ? Colors.primaryDark : Colors.textSecondary}
    />
    <Text
      className={`font-manrope-bold text-[11px] ${
        selected ? 'text-primaryDark' : 'text-textSecondary'
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const HeroCard: React.FC = () => (
  <View className="overflow-hidden rounded-2xl bg-primaryDark p-4">
    {/* Decorative shapes */}
    <View
      className="absolute -right-10 -top-10 h-28 w-28 rounded-full"
      style={{ backgroundColor: 'rgba(246, 217, 204, 0.16)' }}
    />
    <View
      className="absolute -right-3 bottom-2 h-14 w-14 rounded-full"
      style={{ backgroundColor: 'rgba(246, 217, 204, 0.1)' }}
    />
    <View
      className="absolute left-1/2 top-0 h-16 w-16 rounded-full"
      style={{ backgroundColor: 'rgba(214, 168, 79, 0.12)' }}
    />

    <View className="flex-row items-center gap-1.5">
      <MaterialIcons name="support-agent" size={15} color={Colors.primaryLight} />
      <Text className="font-manrope-bold text-[9px] text-primaryLight tracking-widest uppercase">
        School help desk
      </Text>
    </View>
    <Text className="mt-1.5 font-manrope-extrabold text-[20px] text-white leading-6">
      We&apos;re here to help.
    </Text>
    <Text className="mt-1 font-manrope-medium text-[11px] text-primaryLight leading-4">
      Textbooks, recordings, attendance or login issues — the school office reviews
      every complaint.
    </Text>
    <View className="mt-2 flex-row items-center gap-1.5">
      <MaterialIcons name="schedule" size={13} color={Colors.primaryLight} />
      <Text className="font-manrope-bold text-[9px] text-primaryLight">
        Response within one school day
      </Text>
    </View>
  </View>
);

export default function ComplaintScreen() {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [classGrade, setClassGrade] = useState<number | null>(null);
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [showOffice, setShowOffice] = useState(false);
  const [support, setSupport] = useState<SupportConfig>({
    supportEmail: 'support@vidya.school',
    supportPhone: '+91 98765 43210',
    supportHours: 'Mon-Sat, 8:00 AM - 5:00 PM',
  });

  useEffect(() => {
    fetchSupportConfig().then((cfg) => {
      if (cfg) setSupport(cfg);
    });
  }, []);

  const resetForm = () => {
    setFullName('');
    setClassGrade(null);
    setSection('');
    setRollNumber('');
    setEmail('');
    setPhone('');
    setCategory(null);
    setSubject('');
    setMessage('');
    setError(null);
    setTicketRef(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (fullName.trim().length < 2)
      return setError('Please enter your full name.');
    if (!classGrade) return setError('Please select your class.');
    if (!email.trim() && !phone.trim() && !rollNumber.trim())
      return setError(
        'Please give at least one contact detail: email, phone or roll number.'
      );
    if (!category) return setError('Please choose an issue category.');
    if (subject.trim().length < 4)
      return setError('Please write a short subject.');
    if (message.trim().length < 10)
      return setError('Please describe the issue in at least 10 characters.');

    setSubmitting(true);
    try {
      const result = await fileComplaint({
        full_name: fullName.trim(),
        class_grade: classGrade,
        section: section.trim(),
        roll_number: rollNumber.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category,
        subject: subject.trim(),
        message: message.trim(),
      });
      setTicketRef(result.ticket_ref || 'RECEIVED');
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Network error — please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const topBar = (
    <View
      className="bg-white border-b border-border"
      style={{ paddingTop: Math.max(insets.top, 8) }}
    >
      <View className="h-16 px-4 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-2xl bg-palePeach border border-[#f2ded3] items-center justify-center">
          <MaterialIcons name="school" size={22} color={Colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="font-manrope-extrabold text-[15px] text-textPrimary tracking-tight leading-5">
            Vidya Learning
          </Text>
          <Text className="font-manrope-medium text-[9px] text-textMuted uppercase tracking-widest">
            AP SCERT Division
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowOffice(true)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="School office access"
          className="flex-row items-center gap-1.5 rounded-full border border-border bg-softWarm px-2.5 py-1.5"
        >
          <MaterialIcons name="admin-panel-settings" size={16} color={Colors.primaryDark} />
          <Text className="font-manrope-bold text-[10px] text-primaryDark">Office</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (showOffice) {
    return <OfficeScreen onClose={() => setShowOffice(false)} />;
  }

  // ---- Success state ----
  if (ticketRef) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" />
        {topBar}
        <View className="flex-1 items-center justify-center px-8 gap-3">
          <View
            className="w-16 h-16 rounded-2xl bg-successBg border border-[#bfe3d2] items-center justify-center"
          >
            <MaterialIcons name="check" size={34} color={Colors.success} />
          </View>
          <Text className="font-manrope-extrabold text-[18px] text-textPrimary">
            Complaint filed
          </Text>
          <Text className="font-manrope-medium text-[13px] text-textSecondary text-center">
            Your reference number
          </Text>
          <View className="bg-palePeach border border-dashed border-primary rounded-2xl px-6 py-2.5">
            <Text className="font-manrope-extrabold text-lg text-primaryDark tracking-widest">
              {ticketRef}
            </Text>
          </View>
          <Text className="font-manrope-medium text-[11px] text-textMuted text-center leading-4">
            Note it down — the school office will update you against this reference.
          </Text>
          <TouchableOpacity
            className="mt-2 bg-primary rounded-2xl px-6 py-3 shadow-sm"
            onPress={resetForm}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text className="font-manrope-extrabold text-sm text-white">
              File another complaint
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ---- Form state ----
  return (
    <View className="flex-1 bg-surfaceSoft">
      <StatusBar barStyle="dark-content" />
      {topBar}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 40,
          gap: 12,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <HeroCard />

        {/* Form panel */}
        <View className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          {/* Panel header */}
          <View className="flex-row items-center gap-3 border-b border-border bg-surfaceSoft px-4 py-3">
            <View className="w-10 h-10 rounded-xl bg-palePeach border border-border items-center justify-center">
              <MaterialIcons name="feedback" size={20} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="font-manrope-extrabold text-[15px] text-textPrimary">
                File a complaint
              </Text>
              <Text className="font-manrope-medium text-[10px] text-textMuted">
                * required · response within one school day
              </Text>
            </View>
          </View>

          <View className="gap-4 p-4">
            <TextField
              label="Full name"
              required
              icon="person"
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Aarav Sharma"
              autoCapitalize="words"
            />

            {/* Class selector */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-[11px] text-textSecondary tracking-wide">
                Class <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {CLASSES.map((c) => (
                  <ClassChip
                    key={c}
                    value={c}
                    selected={classGrade === c}
                    onPress={() => setClassGrade(c)}
                  />
                ))}
              </View>
            </View>

            {/* Section + roll number */}
            <View className="flex-row gap-3">
              <View className="w-20">
                <TextField
                  label="Section"
                  value={section}
                  onChangeText={setSection}
                  placeholder="A"
                  autoCapitalize="characters"
                  maxLength={5}
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Roll number"
                  icon="badge"
                  value={rollNumber}
                  onChangeText={setRollNumber}
                  placeholder="e.g. 23"
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  maxLength={30}
                />
              </View>
            </View>

            {/* Email */}
            <TextField
              label="School email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="aarav@vidya.school"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            {/* Phone */}
            <TextField
              label="Phone / WhatsApp"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              maxLength={20}
            />
            <Text className="-mt-2 font-manrope-medium text-[10px] text-textMuted leading-4">
              Give at least one contact detail — email, phone or roll number.
            </Text>

            {/* Category */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-[11px] text-textSecondary tracking-wide">
                Issue category <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <CategoryChip
                    key={c.value}
                    label={c.label}
                    icon={c.icon}
                    selected={category === c.value}
                    onPress={() => setCategory(c.value)}
                  />
                ))}
              </View>
            </View>

            {/* Subject */}
            <TextField
              label="Subject"
              required
              icon="short-text"
              value={subject}
              onChangeText={setSubject}
              placeholder="e.g. Attendance not marked on 3 Nov"
              maxLength={200}
            />

            {/* Message */}
            <TextField
              label="Describe the issue"
              required
              value={message}
              onChangeText={setMessage}
              placeholder="What happened? Which class, subject or chapter? When did it start? What did you try?"
              multiline
              numberOfLines={5}
              maxLength={5000}
            />

            {/* Error */}
            {error && (
              <View className="flex-row items-start gap-2 rounded-2xl border border-[#f3b8b2] bg-errorBg px-3 py-2.5">
                <MaterialIcons name="error-outline" size={18} color={Colors.error} />
                <Text className="flex-1 font-manrope-semibold text-[11px] text-error leading-4">
                  {error}
                </Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              className={`flex-row items-center justify-center gap-2 rounded-2xl py-4 shadow-sm ${
                submitting ? 'bg-primaryDark' : 'bg-primary'
              }`}
              style={styles.submitShadow}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Submit complaint"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <MaterialIcons name="send" size={18} color="#fff" />
              )}
              <Text className="font-manrope-extrabold text-[15px] text-white">
                {submitting ? 'Submitting…' : 'Submit complaint'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support strip */}
        <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-white p-3.5">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-accentGoldBg border border-[#efe2bd]">
            <MaterialIcons name="support-agent" size={22} color="#9a742a" />
          </View>
          <View className="flex-1">
            <Text className="font-manrope-bold text-[10px] text-textMuted uppercase tracking-widest">
              School office support
            </Text>
            <Text className="font-manrope-semibold text-[11px] text-textPrimary leading-4">
              {support.supportEmail} · {support.supportPhone}
            </Text>
            <Text className="font-manrope-medium text-[9px] text-textSecondary leading-4">
              {support.supportHours}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  submitShadow: {
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
});
