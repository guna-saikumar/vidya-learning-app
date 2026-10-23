import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/navigation';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { useAuth } from '../hooks/useAuth';
import { getClasses } from '../services/curriculumService';
import { RootStackParamList } from '../types/navigation';
import { useAppDispatch } from '../store';
import { submitOnboardingThunk } from '../store/slices/studentSlice';
import { setIsOnboarded } from '../store/slices/authSlice';
import { toIsoDateOfBirth, validateDateOfBirth } from '../services/profileMapper';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentOnboarding'>;

// Andhra Pradesh 26 Administrative Districts
const AP_DISTRICTS = [
  'Guntur',
  'NTR (Vijayawada)',
  'Krishna (Machilipatnam)',
  'Visakhapatnam',
  'Tirupati',
  'Chittoor',
  'Kurnool',
  'East Godavari (Rajahmundry)',
  'West Godavari (Bhimavaram)',
  'Kakinada',
  'Prakasam (Ongole)',
  'SPSR Nellore',
  'YSR Kadapa',
  'Annamayya (Rayachoty)',
  'Anantapur',
  'Sri Sathya Sai (Puttaparthi)',
  'Srikakulam',
  'Vizianagaram',
  'Eluru',
  'Bapatla',
  'Palnadu (Narasaraopet)',
  'Nandyal',
  'Konaseema (Amalapuram)',
  'Alluri Sitharama Raju',
  'Parvathipuram Manyam',
  'Anakapalli',
];

// District Locations & Mandals
const DISTRICT_LOCATIONS: Record<string, string[]> = {
  'Guntur': ['Guntur Urban', 'Tenali', 'Mangalagiri', 'Ponnur', 'Prathipadu', 'Tadikonda', 'Chebrolu', 'Medikonduru'],
  'NTR (Vijayawada)': ['Vijayawada Urban', 'Vijayawada Rural', 'Mylavaram', 'Nandigama', 'Jaggayyapeta', 'Tiruvuru', 'G Konduru'],
  'Krishna (Machilipatnam)': ['Machilipatnam', 'Gudivada', 'Pamarru', 'Avanigadda', 'Kaikalur', 'Pedana', 'Bantumilli'],
  'Visakhapatnam': ['Visakhapatnam Urban', 'Gajuwaka', 'Bheemunipatnam', 'Pendurthi', 'Anandapuram', 'Padmanabham'],
  'Tirupati': ['Tirupati Urban', 'Chandragiri', 'Srikalahasti', 'Renigunta', 'Puttur', 'Venkatagiri', 'Pakala'],
  'Chittoor': ['Chittoor Urban', 'Palamaner', 'Nagari', 'Kuppam', 'Bangarupalem', 'GD Nellore', 'Penumuru'],
  'Kurnool': ['Kurnool Urban', 'Adoni', 'Yemmiganur', 'Kodumur', 'Dhone', 'Pattikonda', 'Alur'],
  'East Godavari (Rajahmundry)': ['Rajahmundry Urban', 'Rajahmundry Rural', 'Kovvur', 'Nidadavole', 'Anaparthi', 'Gokavaram'],
  'West Godavari (Bhimavaram)': ['Bhimavaram', 'Tadepalligudem', 'Tanuku', 'Palakollu', 'Narasapuram', 'Akividu'],
  'Kakinada': ['Kakinada Urban', 'Kakinada Rural', 'Samalkot', 'Pithapuram', 'Peddapuram', 'Tuni', 'Prathipadu'],
  'Prakasam (Ongole)': ['Ongole', 'Chirala', 'Markapur', 'Kandukur', 'Giddalur', 'Addanki', 'Kanigiri'],
  'SPSR Nellore': ['Nellore Urban', 'Nellore Rural', 'Kavali', 'Gudur', 'Atmakur', 'Naidupeta', 'Venkatachalam'],
  'YSR Kadapa': ['Kadapa Urban', 'Proddatur', 'Pulivendula', 'Jammalamadugu', 'Badvel', 'Mydukur', 'Rayachoti'],
  'Annamayya (Rayachoty)': ['Rayachoty', 'Madanapalle', 'Rajampet', 'Railway Kodur', 'Pileru', 'Thamballapalle'],
  'Anantapur': ['Anantapur Urban', 'Guntakal', 'Tadipatri', 'Dharmavaram', 'Rayadurg', 'Kalyandurg', 'Singanamala'],
  'Sri Sathya Sai (Puttaparthi)': ['Puttaparthi', 'Hindupur', 'Kadiri', 'Penukonda', 'Madakasira', 'Bukkapatnam'],
  'Srikakulam': ['Srikakulam Urban', 'Amadalavalasa', 'Palasa', 'Tekkali', 'Narasannapeta', 'Ichchapuram'],
  'Vizianagaram': ['Vizianagaram Urban', 'Bobbili', 'Cheepurupalli', 'Salur', 'Gajapathinagaram', 'Srungavarapukota'],
  'Eluru': ['Eluru Urban', 'Denduluru', 'Chintalapudi', 'Polavaram', 'Unguturu', 'Kaikalur'],
  'Bapatla': ['Bapatla', 'Repalle', 'Vemuru', 'Karamchedu', 'Parchur', 'Addanki'],
  'Palnadu (Narasaraopet)': ['Narasaraopet', 'Sattenapalle', 'Vinukonda', 'Gurazala', 'Macherla', 'Chilakaluripet', 'Piduguralla'],
  'Nandyal': ['Nandyal Urban', 'Allagadda', 'Banaganapalle', 'Koilkuntla', 'Atmakur', 'Nandikotkur'],
  'Konaseema (Amalapuram)': ['Amalapuram', 'Razole', 'Kothapeta', 'Mummidivaram', 'Ramachandrapuram', 'Mandapeta'],
};

// Common School Names in AP
const POPULAR_SCHOOLS = [
  'Zilla Parishad High School (ZPHS)',
  'A.P. Model School & Junior College',
  'Government High School (Boys/Girls)',
  'Municipal Corporation High School',
  'Kasturba Gandhi Balika Vidyalaya (KGBV)',
  'A.P. Residential School (APRS)',
  'A.P. Tribal Welfare Residential School',
  'Kendriya Vidyalaya (Central School)',
  'Jawahar Navodaya Vidyalaya (JNV)',
  'Sri Chaitanya Techno School',
  'Narayana Olympiad High School',
  'Bhashyam Educational Institution',
  'Dr. K.K.R. Gowtham High School',
];

const GENDERS = ['Male', 'Female', 'Other'];
const SECTIONS = ['A', 'B', 'C', 'D'];
// Only English and Telugu mediums as requested
const MEDIUMS = ['English Medium', 'Telugu Medium'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// All years dynamically up to now (current year down to 1990)
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1990;
const CALENDAR_YEARS = Array.from(
  { length: CURRENT_YEAR - MIN_YEAR + 1 },
  (_, i) => CURRENT_YEAR - i
);

const getAcademicYear = (): string => {
  const now = new Date();
  const start = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}–${start + 1}`;
};

export const StudentOnboardingScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const isEdit = route.params?.isEdit || false;
  const { user } = useAuth();
  const { profile, saveProfile } = useLearningProgress();
  const classes = getClasses();

  // Multi-step state: 1: Student, 2: School & Location, 3: Class & Medium, 4: Parents
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Student Details (First Name & Last Name)
  const initialNames = (profile?.displayName || user?.name || '').split(' ');
  const [firstName, setFirstName] = useState(
    profile?.firstName || initialNames[0] || ''
  );
  const [lastName, setLastName] = useState(
    profile?.lastName || initialNames.slice(1).join(' ') || ''
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    profile?.dateOfBirth || ''
  );
  const [gender, setGender] = useState(profile?.gender || '');

  // Step 2: Location & School
  const [district, setDistrict] = useState(
    profile?.district || ''
  );
  const [location, setLocation] = useState(
    profile?.location || ''
  );
  const [schoolName, setSchoolName] = useState(
    profile?.schoolName || ''
  );

  // Step 3: Class, Medium & Roll Number (moved here as requested)
  const [activeClassId, setActiveClassId] = useState(
    profile?.activeClassId || ''
  );
  const [section, setSection] = useState(profile?.section || '');
  const [medium, setMedium] = useState(
    profile?.medium || ''
  );
  const [rollNumber, setRollNumber] = useState(profile?.rollNumber || '');

  // Step 4: Parent & Guardian Details
  const [fatherName, setFatherName] = useState(
    profile?.fatherName || ''
  );
  const [motherName, setMotherName] = useState(
    profile?.motherName || ''
  );
  const [parentPhone, setParentPhone] = useState(
    profile?.parentPhone || profile?.guardianPhone || ''
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar Modal Picker State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calYear, setCalYear] = useState<number>(2012);
  const [calMonth, setCalMonth] = useState<number>(7); // August (0-indexed: 7)
  const [calDay, setCalDay] = useState<number>(15);
  const [showYearGrid, setShowYearGrid] = useState(false);

  // Dropdown Picker Modal State (District, Location, School)
  const [modalType, setModalType] = useState<'district' | 'location' | 'school' | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [customInputText, setCustomInputText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Parse existing date into calendar state when opening calendar
  const handleOpenCalendar = () => {
    const iso = toIsoDateOfBirth(dateOfBirth);
    if (iso) {
      const [y, m, d] = iso.split('-').map((part) => parseInt(part, 10));
      if (!Number.isNaN(d)) setCalDay(d);
      if (!Number.isNaN(m) && m >= 1 && m <= 12) setCalMonth(m - 1);
      if (!Number.isNaN(y) && y >= MIN_YEAR && y <= CURRENT_YEAR) setCalYear(y);
    }
    setShowYearGrid(false);
    setShowCalendar(true);
  };

  // Calendar calculations
  const daysInMonth = useMemo(() => {
    return new Date(calYear, calMonth + 1, 0).getDate();
  }, [calYear, calMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(calYear, calMonth, 1).getDay();
  }, [calYear, calMonth]);

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      if (calYear > MIN_YEAR) {
        setCalMonth(11);
        setCalYear((prev) => prev - 1);
      }
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      if (calYear < CURRENT_YEAR) {
        setCalMonth(0);
        setCalYear((prev) => prev + 1);
      }
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  const handleConfirmCalendarDate = () => {
    const formatted = `${calDay.toString().padStart(2, '0')}/${(calMonth + 1).toString().padStart(2, '0')}/${calYear}`;
    const result = validateDateOfBirth(formatted);
    if (!result.valid) {
      Alert.alert('Invalid Date of Birth', result.error);
      return;
    }
    setDateOfBirth(formatted);
    setShowCalendar(false);
  };

  // Current locations list based on selected district
  const availableLocations = useMemo(() => {
    return DISTRICT_LOCATIONS[district] || [
      `${district} Urban`,
      `${district} Rural`,
      `${district} Town`,
    ];
  }, [district]);

  // Filtered lists for modal picker
  const filteredItems = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (modalType === 'district') {
      return AP_DISTRICTS.filter((d) => d.toLowerCase().includes(q));
    }
    if (modalType === 'location') {
      return availableLocations.filter((l) => l.toLowerCase().includes(q));
    }
    if (modalType === 'school') {
      return POPULAR_SCHOOLS.filter((s) => s.toLowerCase().includes(q));
    }
    return [];
  }, [modalType, pickerSearch, availableLocations]);

  // Step Validation
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!firstName.trim()) {
        Alert.alert('Required Field', 'Please enter student first name.');
        return false;
      }
      if (!lastName.trim()) {
        Alert.alert('Required Field', 'Please enter student last name.');
        return false;
      }
      if (!dateOfBirth.trim()) {
        Alert.alert('Required Field', 'Please select student date of birth.');
        return false;
      }
      const dobResult = validateDateOfBirth(dateOfBirth);
      if (!dobResult.valid) {
        Alert.alert('Invalid Date of Birth', dobResult.error);
        return false;
      }
      if (!gender) {
        Alert.alert('Required Field', 'Please select student gender.');
        return false;
      }
    } else if (step === 2) {
      if (!district.trim()) {
        Alert.alert('Required Field', 'Please select a district.');
        return false;
      }
      if (!location.trim()) {
        Alert.alert('Required Field', 'Please select a location / mandal.');
        return false;
      }
      if (!schoolName.trim()) {
        Alert.alert('Required Field', 'Please select or enter school name.');
        return false;
      }
    } else if (step === 3) {
      if (!activeClassId) {
        Alert.alert('Required Field', 'Please choose your enrolled class.');
        return false;
      }
      if (!section) {
        Alert.alert('Required Field', 'Please choose your section.');
        return false;
      }
      if (!medium) {
        Alert.alert('Required Field', 'Please choose your medium.');
        return false;
      }
      if (!rollNumber.trim()) {
        Alert.alert('Required Field', 'Please enter student roll number / ID.');
        return false;
      }
    } else if (step === 4) {
      if (!fatherName.trim()) {
        Alert.alert('Required Field', "Please enter father's name.");
        return false;
      }
      if (!motherName.trim()) {
        Alert.alert('Required Field', "Please enter mother's name.");
        return false;
      }
      if (!parentPhone.trim() || parentPhone.trim().length < 8) {
        Alert.alert('Required Field', 'Please enter a valid parent contact number.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
    } else if (isEdit) {
      navigation.goBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const cleanPhone = parentPhone.replace(/\D/g, '').slice(-10);
    const cleanGrade = activeClassId.replace(/\D/g, '') || '8';
    const dobResult = validateDateOfBirth(dateOfBirth);

    if (!dobResult.valid) {
      Alert.alert('Invalid Date of Birth', dobResult.error);
      return;
    }
    const cleanDob = dobResult.iso!;
    if (cleanPhone.length !== 10) {
      Alert.alert(
        'Invalid phone',
        'Parent phone must be a 10-digit mobile number.'
      );
      return;
    }
    if (!activeClassId) {
      Alert.alert('Missing class', 'Please select your class before continuing.');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        submitOnboardingThunk({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          gender: (gender || 'MALE').toUpperCase(),
          dob: cleanDob,
          district: district.trim(),
          villageCity: location.trim(),
          schoolName: schoolName.trim(),
          classId: activeClassId,
          grade: cleanGrade,
          section: (section || 'A').toUpperCase(),
          medium: (medium || 'ENGLISH').toUpperCase(),
          rollNumber: rollNumber.trim() || '1',
          fatherName: fatherName.trim(),
          motherName: motherName.trim(),
          parentPhone: cleanPhone,
        })
      ).unwrap();
      dispatch(setIsOnboarded(true));

      // Keep local cache in sync (API is source of truth after unwrap).
      await saveProfile({
        displayName: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: cleanDob,
        gender,
        schoolName: schoolName.trim(),
        location: location.trim(),
        district: district.trim(),
        activeClassId,
        section,
        rollNumber: rollNumber.trim(),
        medium,
        fatherName: fatherName.trim(),
        motherName: motherName.trim(),
        guardianName: fatherName.trim() || motherName.trim(),
        guardianPhone: cleanPhone,
        parentPhone: cleanPhone,
        academicYear: getAcademicYear(),
        isOnboarded: true,
      });

      if (isEdit) {
        Alert.alert(
          'Profile Updated',
          'Your academic details have been successfully saved.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        navigation.navigate('Home');
      }
    } catch (err: any) {
      Alert.alert(
        'Could not save',
        err?.message || 'Failed to save student details. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPicker = (type: 'district' | 'location' | 'school') => {
    setModalType(type);
    setPickerSearch('');
    setShowCustomInput(false);
    setCustomInputText('');
  };

  const selectPickerItem = (val: string) => {
    if (modalType === 'district') {
      setDistrict(val);
      const locs = DISTRICT_LOCATIONS[val];
      if (locs && locs.length > 0) {
        setLocation(locs[0]);
      } else {
        setLocation(`${val} Urban`);
      }
    } else if (modalType === 'location') {
      setLocation(val);
    } else if (modalType === 'school') {
      setSchoolName(val);
    }
    setModalType(null);
  };

  const saveCustomInput = () => {
    if (!customInputText.trim()) return;
    if (modalType === 'location') {
      setLocation(customInputText.trim());
    } else if (modalType === 'school') {
      setSchoolName(customInputText.trim());
    }
    setModalType(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      {isEdit ? (
        <HeaderBar
          showBack
          onBackPress={() => navigation.goBack()}
          title="Edit Student Profile"
          subtitle="Update student, school, and parent details"
        />
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingTop: isEdit ? 16 : Math.max(insets.top, 24) + 8,
          paddingBottom: 28,
          gap: 18,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Onboarding Welcome Header (Only for initial setup) */}
        {!isEdit && (
          <View className="items-center text-center gap-1.5 mb-1">
            <View
              className="w-14 h-14 rounded-2xl bg-palePeach border border-[#f2ded3] items-center justify-center shadow-sm overflow-hidden mb-1"
              style={{ width: 56, height: 56 }}
            >
              <Image
                source={require('../../assets/app-images/logo.png')}
                className="w-9 h-9"
                style={{ width: 36, height: 36 }}
                resizeMode="contain"
              />
            </View>
            <View className="bg-palePeach px-3 py-1 rounded-full border border-border/70">
              <Text className="font-manrope-bold text-[11px] text-primaryDark">
                AP SCERT · STUDENT ONBOARDING
              </Text>
            </View>
            <Text className="font-manrope-extrabold text-2xl text-textPrimary tracking-tight text-center">
              Student Information Form
            </Text>
            <Text className="font-manrope-medium text-xs text-textSecondary text-center px-4 leading-relaxed">
              Complete your student registration in 4 easy steps to unlock personalized subjects and study progress.
            </Text>
          </View>
        )}

        {/* Step Indicator Header */}
        <View className="bg-sand/30 rounded-2xl p-3.5 border border-sand/60">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-manrope-bold text-xs text-primaryDark uppercase tracking-wider">
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Student Details' :
                currentStep === 2 ? 'School & Location' :
                currentStep === 3 ? 'Class & Medium' : 'Parent & Contact'
              }
            </Text>
            <Text className="font-manrope-bold text-xs text-textSecondary">
              {Math.round((currentStep / 4) * 100)}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-1.5 rounded-full bg-border/50 overflow-hidden mb-3">
            <View
              className="h-full rounded-full bg-primary"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </View>

          {/* Step Badges Row */}
          <View className="flex-row items-center justify-between">
            {[
              { num: 1, label: 'Student', icon: 'person' },
              { num: 2, label: 'School', icon: 'school' },
              { num: 3, label: 'Class', icon: 'auto-stories' },
              { num: 4, label: 'Parents', icon: 'family-restroom' },
            ].map((st) => {
              const isActive = st.num === currentStep;
              const isDone = st.num < currentStep;
              return (
                <TouchableOpacity
                  key={st.num}
                  className="items-center flex-1"
                  disabled={st.num > currentStep}
                  onPress={() => setCurrentStep(st.num)}
                >
                  <View
                    className={`w-7 h-7 rounded-full items-center justify-center mb-1 ${
                      isActive
                        ? 'bg-primary border-2 border-palePeach shadow-sm'
                        : isDone
                        ? 'bg-emerald-600'
                        : 'bg-border/60'
                    }`}
                  >
                    {isDone ? (
                      <MaterialIcons name="check" size={14} color="#fff" />
                    ) : (
                      <MaterialIcons
                        name={st.icon as any}
                        size={13}
                        color={isActive ? '#fff' : Colors.textMuted}
                      />
                    )}
                  </View>
                  <Text
                    className={`font-manrope-bold text-[10px] ${
                      isActive ? 'text-primary' : isDone ? 'text-textPrimary' : 'text-textMuted'
                    }`}
                  >
                    {st.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ================= STEP 1: STUDENT DETAILS ================= */}
        {currentStep === 1 && (
          <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-4">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-palePeach items-center justify-center">
                <MaterialIcons name="person" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text className="font-manrope-extrabold text-base text-textPrimary">
                  Student Information
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Enter personal identification details
                </Text>
              </View>
            </View>

            {/* Student First Name & Last Name */}
            <View className="flex-row gap-3">
              {/* First Name */}
              <View className="flex-1 gap-1.5">
                <Text className="font-manrope-bold text-xs text-textSecondary">
                  First Name <Text className="text-primary">*</Text>
                </Text>
                <View className="flex-row items-center bg-softWarm border border-border rounded-xl px-3.5 py-3">
                  <MaterialIcons name="person" size={18} color={Colors.textMuted} />
                  <TextInput
                    className="flex-1 ml-2 font-manrope-bold text-sm text-textPrimary"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. Aarav"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>

              {/* Last Name */}
              <View className="flex-1 gap-1.5">
                <Text className="font-manrope-bold text-xs text-textSecondary">
                  Last Name <Text className="text-primary">*</Text>
                </Text>
                <View className="flex-row items-center bg-softWarm border border-border rounded-xl px-3.5 py-3">
                  <TextInput
                    className="flex-1 font-manrope-bold text-sm text-textPrimary"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="e.g. Sharma"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>
            </View>

            {/* Date of Birth with Interactive Calendar Button */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Date of Birth (DOB) <Text className="text-primary">*</Text>
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-softWarm border border-border rounded-xl px-3.5 py-3"
                onPress={handleOpenCalendar}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <MaterialIcons name="event" size={20} color={Colors.primary} />
                  <View className="ml-2.5">
                    <Text className="font-manrope-bold text-sm text-textPrimary">
                      {dateOfBirth || 'Choose Date of Birth'}
                    </Text>
                    <Text className="font-manrope-medium text-[11px] text-textSecondary">
                      {dateOfBirth && validateDateOfBirth(dateOfBirth).valid
                        ? `Age: ${validateDateOfBirth(dateOfBirth).age} years • Verified`
                        : 'Tap to open visual calendar picker'}
                    </Text>
                  </View>
                </View>
                <View className="bg-palePeach px-2.5 py-1 rounded-lg border border-border/80 flex-row items-center gap-1">
                  <MaterialIcons name="calendar-today" size={14} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-primaryDark">Calendar</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Gender Selector */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Gender <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {GENDERS.map((g) => {
                  const isSelected = gender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      className={`flex-1 py-2.5 rounded-xl items-center justify-center border ${
                        isSelected
                          ? 'bg-primary border-primary shadow-xs'
                          : 'bg-softWarm border-border'
                      }`}
                      onPress={() => setGender(g)}
                      activeOpacity={0.8}
                    >
                      <Text
                        className={`font-manrope-bold text-xs ${
                          isSelected ? 'text-white' : 'text-textSecondary'
                        }`}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ================= STEP 2: SCHOOL & LOCATION ================= */}
        {currentStep === 2 && (
          <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-4">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-palePeach items-center justify-center">
                <MaterialIcons name="school" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text className="font-manrope-extrabold text-base text-textPrimary">
                  School & Location
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Select your district, mandal, and school
                </Text>
              </View>
            </View>

            {/* District Dropdown Selector */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                District <Text className="text-primary">*</Text>
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-softWarm border border-border rounded-xl px-3.5 py-3"
                onPress={() => openPicker('district')}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <MaterialIcons name="location-on" size={18} color={Colors.primary} />
                  <Text className="font-manrope-bold text-sm text-textPrimary ml-2.5">
                    {district || 'Select District'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="font-manrope-medium text-xs text-primary">Change</Text>
                  <MaterialIcons name="arrow-drop-down" size={22} color={Colors.primary} />
                </View>
              </TouchableOpacity>
              <Text className="font-manrope-medium text-[11px] text-textMuted">
                AP State Board (26 administrative districts supported)
              </Text>
            </View>

            {/* Location / Mandal Dropdown Selector */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Location / Mandal / City <Text className="text-primary">*</Text>
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-softWarm border border-border rounded-xl px-3.5 py-3"
                onPress={() => openPicker('location')}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <MaterialIcons name="map" size={18} color={Colors.primary} />
                  <Text className="font-manrope-bold text-sm text-textPrimary ml-2.5">
                    {location || 'Select Location / Mandal'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="font-manrope-medium text-xs text-primary">Select</Text>
                  <MaterialIcons name="arrow-drop-down" size={22} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* School Name Dropdown Selector */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                School Name <Text className="text-primary">*</Text>
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between bg-softWarm border border-border rounded-xl px-3.5 py-3"
                onPress={() => openPicker('school')}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <MaterialIcons name="account-balance" size={18} color={Colors.primary} />
                  <Text
                    className="font-manrope-bold text-sm text-textPrimary ml-2.5"
                    numberOfLines={1}
                  >
                    {schoolName || 'Select or Enter School'}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="font-manrope-medium text-xs text-primary">Select</Text>
                  <MaterialIcons name="arrow-drop-down" size={22} color={Colors.primary} />
                </View>
              </TouchableOpacity>

              {/* Or Direct Custom School Input */}
              <View className="mt-2 pt-2 border-t border-border/60">
                <Text className="font-manrope-bold text-[11px] text-textSecondary mb-1.5">
                  Or enter specific school name manually:
                </Text>
                <View className="flex-row items-center bg-softWarm border border-border rounded-xl px-3 py-2.5">
                  <MaterialIcons name="edit" size={16} color={Colors.textMuted} />
                  <TextInput
                    className="flex-1 ml-2 font-manrope-medium text-xs text-textPrimary"
                    value={schoolName}
                    onChangeText={setSchoolName}
                    placeholder="Type custom school name if not in list"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ================= STEP 3: CLASS & MEDIUM ================= */}
        {currentStep === 3 && (
          <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-4">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-palePeach items-center justify-center">
                <MaterialIcons name="auto-stories" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text className="font-manrope-extrabold text-base text-textPrimary">
                  Class & Medium
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Enrolled grade, section, medium & roll number
                </Text>
              </View>
            </View>

            {/* Enrolled Grade Selector */}
            <View className="gap-2">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Select Your Enrolled Class <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {classes.map((c) => {
                  const isSelected = c.id === activeClassId;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      className={`flex-1 py-3 rounded-2xl items-center justify-center border ${
                        isSelected
                          ? 'bg-primary border-primary shadow-sm'
                          : 'bg-softWarm border-border'
                      }`}
                      onPress={() => setActiveClassId(c.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        className={`font-manrope-extrabold text-base ${
                          isSelected ? 'text-white' : 'text-textPrimary'
                        }`}
                      >
                        {c.grade}
                      </Text>
                      <Text
                        className={`font-manrope-medium text-[10px] mt-0.5 ${
                          isSelected ? 'text-palePeach' : 'text-textSecondary'
                        }`}
                      >
                        Grade
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section Selector */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Section <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {SECTIONS.map((sec) => {
                  const isSelected = section === sec;
                  return (
                    <TouchableOpacity
                      key={sec}
                      className={`flex-1 py-2.5 rounded-xl items-center justify-center border ${
                        isSelected
                          ? 'bg-primary border-primary shadow-xs'
                          : 'bg-softWarm border-border'
                      }`}
                      onPress={() => setSection(sec)}
                    >
                      <Text
                        className={`font-manrope-bold text-xs ${
                          isSelected ? 'text-white' : 'text-textSecondary'
                        }`}
                      >
                        Section {sec}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Medium of Instruction (Only English and Telugu) */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Medium of Instruction <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row gap-2.5">
                {MEDIUMS.map((m) => {
                  const isSelected = medium === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      className={`flex-1 flex-row items-center justify-between p-3.5 rounded-xl border ${
                        isSelected
                          ? 'bg-palePeach/75 border-primary shadow-xs'
                          : 'bg-softWarm border-border'
                      }`}
                      onPress={() => setMedium(m)}
                    >
                      <View className="flex-1 mr-1">
                        <Text
                          className={`font-manrope-bold text-xs ${
                            isSelected ? 'text-primaryDark' : 'text-textPrimary'
                          }`}
                        >
                          {m}
                        </Text>
                      </View>
                      {isSelected ? (
                        <MaterialIcons name="check-circle" size={18} color={Colors.primary} />
                      ) : (
                        <MaterialIcons name="radio-button-unchecked" size={18} color={Colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Roll Number / Student ID (Placed here in Class & Medium Form as requested) */}
            <View className="gap-1.5 pt-1 border-t border-border/60">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Roll Number / Student ID <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row items-center bg-softWarm border border-border rounded-xl px-3.5 py-3">
                <MaterialIcons name="confirmation-number" size={18} color={Colors.textMuted} />
                <TextInput
                  className="flex-1 ml-2.5 font-manrope-bold text-sm text-textPrimary"
                  value={rollNumber}
                  onChangeText={setRollNumber}
                  placeholder="e.g. 18 or 2026-081"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <Text className="font-manrope-medium text-[11px] text-textMuted">
                Your assigned class roll number or student admission ID
              </Text>
            </View>
          </View>
        )}

        {/* ================= STEP 4: PARENT & CONTACT ================= */}
        {currentStep === 4 && (
          <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-4">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-palePeach items-center justify-center">
                <MaterialIcons name="family-restroom" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text className="font-manrope-extrabold text-base text-textPrimary">
                  Parent & Guardian Information
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary">
                  Used for academic reports & notices
                </Text>
              </View>
            </View>

            {/* Father Name */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Father&apos;s Name <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row items-center bg-softWarm border border-border rounded-xl px-3.5 py-3">
                <MaterialIcons name="person-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  className="flex-1 ml-2.5 font-manrope-bold text-sm text-textPrimary"
                  value={fatherName}
                  onChangeText={setFatherName}
                  placeholder="e.g. Venkata Sharma"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Mother Name */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Mother&apos;s Name <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row items-center bg-softWarm border border-border rounded-xl px-3.5 py-3">
                <MaterialIcons name="face" size={18} color={Colors.textMuted} />
                <TextInput
                  className="flex-1 ml-2.5 font-manrope-bold text-sm text-textPrimary"
                  value={motherName}
                  onChangeText={setMotherName}
                  placeholder="e.g. Lakshmi Sharma"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            {/* Parent Contact Number */}
            <View className="gap-1.5">
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Parent / Guardian Contact Mobile <Text className="text-primary">*</Text>
              </Text>
              <View className="flex-row items-center bg-softWarm border border-border rounded-xl px-3.5 py-3">
                <MaterialIcons name="phone" size={18} color={Colors.textMuted} />
                <TextInput
                  className="flex-1 ml-2.5 font-manrope-bold text-sm text-textPrimary"
                  value={parentPhone}
                  onChangeText={setParentPhone}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Summary Confirmation Note */}
            <View className="bg-sand/25 p-3.5 rounded-xl border border-sand/60 gap-1 mt-1">
              <View className="flex-row items-center gap-1.5">
                <MaterialIcons name="verified" size={16} color={Colors.primary} />
                <Text className="font-manrope-bold text-xs text-primaryDark">
                  Ready to Complete Registration
                </Text>
              </View>
              <Text className="font-manrope-medium text-[11px] text-textSecondary leading-relaxed">
                Clicking &quot;Complete Registration&quot; will personalize your subject curriculum to your enrolled grade.
              </Text>
            </View>
          </View>
        )}

        {/* Navigation Buttons (Back & Next / Submit) - Inline with form flow */}
        <View className="flex-row items-center gap-3 pt-2 pb-8">
          {/* Back Button */}
          {(currentStep > 1 || isEdit) && (
            <TouchableOpacity
              className="px-5 py-4 rounded-2xl bg-white border border-border items-center justify-center flex-row gap-1 shadow-xs"
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <MaterialIcons name="chevron-left" size={20} color={Colors.textSecondary} />
              <Text className="font-manrope-bold text-xs text-textSecondary">Back</Text>
            </TouchableOpacity>
          )}

          {/* Next or Submit Button */}
          {currentStep < 4 ? (
            <TouchableOpacity
              className="flex-1 py-4 rounded-2xl bg-primary items-center justify-center flex-row gap-2 shadow-sm"
              onPress={handleNext}
              activeOpacity={0.85}
            >
              <Text className="font-manrope-bold text-sm text-white">
                Next: {
                  currentStep === 1 ? 'School & Location' :
                  currentStep === 2 ? 'Class & Medium' : 'Parent Details'
                }
              </Text>
              <MaterialIcons name="chevron-right" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="flex-1 py-4 rounded-2xl bg-primary items-center justify-center flex-row gap-2 shadow-sm"
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={18} color="#fff" />
                  <Text className="font-manrope-bold text-sm text-white">
                    {isEdit ? 'Save Academic Details' : 'Complete & Continue'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ================= INTERACTIVE CALENDAR MODAL PICKER FOR DOB ================= */}
      <Modal
        visible={showCalendar}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View
            className="bg-white rounded-[28px] p-5 w-full max-w-[360px] border border-border shadow-2xl gap-3.5"
            style={{ maxHeight: '90%' }}
          >
            {/* Header: Selected Date Display */}
            <View className="flex-row items-center justify-between pb-2 border-b border-border/80">
              <View>
                <Text className="font-manrope-bold text-[11px] text-primaryDark uppercase tracking-wider">
                  SELECT DATE OF BIRTH
                </Text>
                <Text className="font-manrope-extrabold text-xl text-textPrimary mt-0.5">
                  {calDay} {MONTH_NAMES[calMonth]} {calYear}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCalendar(false)}
                className="w-8 h-8 rounded-full bg-softWarm items-center justify-center border border-border"
              >
                <MaterialIcons name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Month & Year Navigation Row */}
            <View className="flex-row items-center justify-between px-1">
              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-softWarm items-center justify-center border border-border"
                onPress={handlePrevMonth}
              >
                <MaterialIcons name="chevron-left" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>

              {/* Month & Year selector toggle */}
              <TouchableOpacity
                className="flex-row items-center gap-1.5 bg-palePeach px-3.5 py-1.5 rounded-full border border-border"
                onPress={() => setShowYearGrid((prev) => !prev)}
              >
                <Text className="font-manrope-extrabold text-xs text-primaryDark">
                  {MONTH_NAMES[calMonth]} {calYear}
                </Text>
                <MaterialIcons
                  name={showYearGrid ? 'arrow-drop-up' : 'arrow-drop-down'}
                  size={18}
                  color={Colors.primary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-softWarm items-center justify-center border border-border"
                onPress={handleNextMonth}
              >
                <MaterialIcons name="chevron-right" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Quick Year Selection Grid (if toggled) */}
            {showYearGrid ? (
              <View className="gap-1.5">
                <Text className="font-manrope-bold text-[11px] text-textSecondary text-center">
                  Select Birth Year ({MIN_YEAR} — {CURRENT_YEAR})
                </Text>
                <ScrollView className="max-h-60" showsVerticalScrollIndicator={true}>
                  <View className="flex-row flex-wrap gap-2 justify-center py-2">
                    {CALENDAR_YEARS.map((yr) => {
                      const isSelected = yr === calYear;
                      return (
                        <TouchableOpacity
                          key={yr}
                          className={`w-16 py-2 rounded-xl items-center justify-center border ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'bg-softWarm border-border'
                          }`}
                          onPress={() => {
                            setCalYear(yr);
                            setShowYearGrid(false);
                          }}
                        >
                          <Text
                            className={`font-manrope-bold text-xs ${
                              isSelected ? 'text-white' : 'text-textPrimary'
                            }`}
                          >
                            {yr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : (
              /* Calendar Days Grid */
              <View className="gap-1">
                {/* Weekday Labels */}
                <View className="flex-row justify-between mb-1">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                    <View key={d} className="w-10 items-center">
                      <Text className="font-manrope-bold text-[11px] text-textMuted">{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Day Cells */}
                <View className="flex-row flex-wrap">
                  {/* Empty offsets before first day of month */}
                  {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <View key={`empty-${i}`} className="w-[14.28%] h-9" />
                  ))}

                  {/* Days 1 to daysInMonth */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const isSelected = dayNum === calDay;
                    return (
                      <TouchableOpacity
                        key={dayNum}
                        className="w-[14.28%] h-9 items-center justify-center"
                        onPress={() => setCalDay(dayNum)}
                        activeOpacity={0.7}
                      >
                        <View
                          className={`w-8 h-8 rounded-full items-center justify-center ${
                            isSelected ? 'bg-primary' : ''
                          }`}
                        >
                          <Text
                            className={`font-manrope-bold text-xs ${
                              isSelected ? 'text-white' : 'text-textPrimary'
                            }`}
                          >
                            {dayNum}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Confirm Date Button */}
            <TouchableOpacity
              className="py-3 rounded-2xl bg-primary items-center justify-center mt-1 shadow-sm"
              onPress={handleConfirmCalendarDate}
              activeOpacity={0.85}
            >
              <Text className="font-manrope-bold text-xs text-white">
                Confirm Selected Date ({calDay}/{calMonth + 1}/{calYear})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= DROPDOWN MODAL PICKER (DISTRICT, LOCATION, SCHOOL) ================= */}
      <Modal
        visible={modalType !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalType(null)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View
            className="bg-white rounded-t-[32px] p-6 max-h-[85%] border-t border-border shadow-xl gap-4"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            {/* Modal Title & Close */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-manrope-extrabold text-lg text-textPrimary">
                  {modalType === 'district' ? 'Select District' :
                   modalType === 'location' ? `Select Location in ${district}` :
                   'Select School'}
                </Text>
                <Text className="font-manrope-medium text-xs text-textSecondary mt-0.5">
                  Tap to choose from verified list
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalType(null)}
                className="w-9 h-9 rounded-full bg-softWarm items-center justify-center border border-border"
              >
                <MaterialIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Input within Dropdown */}
            <View className="flex-row items-center bg-softWarm border border-border rounded-xl px-3.5 py-2.5">
              <MaterialIcons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                className="flex-1 ml-2 font-manrope-medium text-xs text-textPrimary"
                value={pickerSearch}
                onChangeText={setPickerSearch}
                placeholder={`Search ${modalType || 'options'}...`}
                placeholderTextColor={Colors.textMuted}
                autoFocus={false}
              />
              {pickerSearch.length > 0 && (
                <TouchableOpacity onPress={() => setPickerSearch('')}>
                  <MaterialIcons name="clear" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Options List */}
            <ScrollView
              className="max-h-72"
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              <View className="gap-1.5 pb-2">
                {filteredItems.map((item) => {
                  const isCurrent =
                    (modalType === 'district' && district === item) ||
                    (modalType === 'location' && location === item) ||
                    (modalType === 'school' && schoolName === item);

                  return (
                    <TouchableOpacity
                      key={item}
                      className={`flex-row items-center justify-between p-3.5 rounded-xl border ${
                        isCurrent
                          ? 'bg-palePeach/70 border-primary'
                          : 'bg-white border-border/70'
                      }`}
                      onPress={() => selectPickerItem(item)}
                    >
                      <Text
                        className={`font-manrope-bold text-xs flex-1 mr-2 ${
                          isCurrent ? 'text-primaryDark' : 'text-textPrimary'
                        }`}
                      >
                        {item}
                      </Text>
                      {isCurrent ? (
                        <MaterialIcons name="check" size={18} color={Colors.primary} />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}

                {filteredItems.length === 0 && (
                  <View className="py-6 items-center">
                    <Text className="font-manrope-medium text-xs text-textMuted">
                      No matching {modalType} found.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Custom Entry Option for Location and School */}
            {(modalType === 'location' || modalType === 'school') && (
              <View className="border-t border-border pt-3 gap-2">
                {!showCustomInput ? (
                  <TouchableOpacity
                    className="flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl bg-softWarm border border-border"
                    onPress={() => setShowCustomInput(true)}
                  >
                    <MaterialIcons name="add" size={16} color={Colors.primary} />
                    <Text className="font-manrope-bold text-xs text-primary">
                      Enter Custom {modalType === 'location' ? 'Location' : 'School'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View className="gap-2">
                    <View className="flex-row items-center bg-softWarm border border-primary rounded-xl px-3 py-2.5">
                      <TextInput
                        className="flex-1 font-manrope-bold text-xs text-textPrimary"
                        value={customInputText}
                        onChangeText={setCustomInputText}
                        placeholder={`Type custom ${modalType} name`}
                        placeholderTextColor={Colors.textMuted}
                        autoFocus
                      />
                    </View>
                    <TouchableOpacity
                      className="py-2.5 rounded-xl bg-primary items-center justify-center"
                      onPress={saveCustomInput}
                    >
                      <Text className="font-manrope-bold text-xs text-white">Use This Custom Name</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};
