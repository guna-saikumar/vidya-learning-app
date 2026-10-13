import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  Save,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Type,
  AlignLeft,
  List,
  Sparkles,
  BookmarkCheck,
  ChevronUp,
  ChevronDown,
  FileText,
  CheckCircle2,
} from 'lucide-react-native';
import Colors from '../constants/colors';
import { HeaderBar } from '../components/common/HeaderBar';
import { BottomNav } from '../components/common/BottomNav';

interface NoteBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'formula' | 'list' | 'axiom';
  title?: string;
  content: string;
}

export const ContentEditorScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { initialNotes, title: defaultTitle } = route.params || {};

  const [documentTitle, setDocumentTitle] = useState(defaultTitle || 'Distributive Property & Axioms');
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    {
      id: 'b-1',
      type: 'heading',
      content: '1. Introduction to Distributive Law in Rational Numbers',
    },
    {
      id: 'b-2',
      type: 'paragraph',
      content:
        'The distributive property of multiplication over addition is one of the most fundamental algebraic identities in the set of rational numbers ℚ.',
    },
    {
      id: 'b-3',
      type: 'formula',
      title: 'Distributive Law Identity',
      content: 'a(b + c) = ab + ac  (for all a, b, c ∈ ℚ)',
    },
    {
      id: 'b-4',
      type: 'axiom',
      title: 'Key Axiom',
      content: 'Multiplication distributes over addition and subtraction across all real numbers.',
    },
    {
      id: 'b-5',
      type: 'list',
      title: 'Core Learning Objectives',
      content: '• Closure under addition and multiplication\n• Commutative identity\n• Associative identity\n• Distributive expansion',
    },
  ]);

  const [isPreview, setIsPreview] = useState(false);

  const addBlock = (type: NoteBlock['type']) => {
    const newBlock: NoteBlock = {
      id: `blk-${Date.now()}`,
      type,
      title: type === 'formula' ? 'Key Formula' : type === 'axiom' ? 'Key Axiom' : undefined,
      content:
        type === 'heading'
          ? 'New Section Heading'
          : type === 'formula'
          ? 'x² + y² = z²'
          : type === 'list'
          ? '• Point 1\n• Point 2'
          : 'Detailed study explanation...',
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
  };

  const updateBlockTitle = (id: string, title: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, title } : b)));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setBlocks(updated);
  };

  const handleSaveNote = () => {
    Alert.alert('Notes Saved', 'Your note content has been formatted and saved successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const getBlockConfig = (type: NoteBlock['type']) => {
    switch (type) {
      case 'heading':
        return {
          label: 'Section Heading',
          icon: <Type size={13} color={Colors.primary} />,
          badgeBg: 'bg-palePeach',
          badgeText: 'text-primary',
          borderAccent: 'border-l-4 border-l-primary',
          cardBg: 'bg-white',
        };
      case 'formula':
        return {
          label: 'Formula / Math Box',
          icon: <Sparkles size={13} color={Colors.primary} />,
          badgeBg: 'bg-palePeach',
          badgeText: 'text-primary',
          borderAccent: 'border-l-4 border-l-primaryLight',
          cardBg: 'bg-[#FFF9F6]',
        };
      case 'axiom':
        return {
          label: 'Axiom & Key Rule',
          icon: <BookmarkCheck size={13} color={Colors.accentGoldDark} />,
          badgeBg: 'bg-accentGoldBg',
          badgeText: 'text-accentGoldDark',
          borderAccent: 'border-l-4 border-l-[#D97706]',
          cardBg: 'bg-[#FEFCE8]',
        };
      case 'list':
        return {
          label: 'Bullet Points',
          icon: <List size={13} color="#059669" />,
          badgeBg: 'bg-[#E7F3ED]',
          badgeText: 'text-success',
          borderAccent: 'border-l-4 border-l-success',
          cardBg: 'bg-white',
        };
      case 'paragraph':
      default:
        return {
          label: 'Paragraph Text',
          icon: <AlignLeft size={13} color={Colors.textSecondary} />,
          badgeBg: 'bg-softWarm',
          badgeText: 'text-textSecondary',
          borderAccent: 'border-l-4 border-l-border',
          cardBg: 'bg-white',
        };
    }
  };

  return (
    <View className="flex-1 bg-white">
      <HeaderBar
        title="Content Editor"
        subtitle="Structured Note & Formula Builder"
        showBack
        onBackPress={() => navigation.goBack()}
        onProfilePress={() => navigation.navigate('Profile')}
        rightAction={
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-primary px-3.5 py-1.5 rounded-full shadow-sm"
            onPress={handleSaveNote}
            activeOpacity={0.8}
          >
            <Save size={13} color={Colors.white} />
            <Text className="font-manrope-bold text-xs text-white">Save</Text>
          </TouchableOpacity>
        }
      />

      {/* Mode Switcher Segmented Control */}
      <View className="px-5 py-3 bg-white border-b border-border flex-row items-center justify-between">
        <View className="flex-row bg-softWarm p-1 rounded-full border border-border">
          <TouchableOpacity
            className={`flex-row items-center gap-1.5 px-3.5 py-1 rounded-full ${
              !isPreview ? 'bg-white shadow-xs' : ''
            }`}
            onPress={() => setIsPreview(false)}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color={!isPreview ? Colors.primary : Colors.textMuted} />
            <Text
              className={`font-manrope-bold text-xs ${
                !isPreview ? 'text-primary' : 'text-textSecondary'
              }`}
            >
              Editor ({blocks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-row items-center gap-1.5 px-3.5 py-1 rounded-full ${
              isPreview ? 'bg-white shadow-xs' : ''
            }`}
            onPress={() => setIsPreview(true)}
            activeOpacity={0.7}
          >
            <Eye size={13} color={isPreview ? Colors.primary : Colors.textMuted} />
            <Text
              className={`font-manrope-bold text-xs ${
                isPreview ? 'text-primary' : 'text-textSecondary'
              }`}
            >
              Student View
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-palePeach px-2.5 py-1 rounded-full border border-primaryLight">
          <Text className="font-manrope-bold text-[10px] text-primary">SCERT Format</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 32,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Document Title Header Card */}
        <View className="bg-white rounded-[20px] p-4.5 border border-border shadow-sm gap-2.5">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-lg bg-palePeach items-center justify-center border border-primaryLight">
                <FileText size={16} color={Colors.primary} />
              </View>
              <Text className="font-manrope-extrabold text-xs text-primary uppercase tracking-wider">
                Note Document Title
              </Text>
            </View>
            <Text className="font-manrope-medium text-[11px] text-textMuted">
              {blocks.length} Content Blocks
            </Text>
          </View>

          <TextInput
            className="bg-softWarm/60 border border-border rounded-xl px-3.5 h-11 font-manrope-extrabold text-[15px] text-textPrimary"
            value={documentTitle}
            onChangeText={setDocumentTitle}
            placeholder="e.g., Rational Numbers & Axioms"
            placeholderTextColor={Colors.textPlaceholder}
          />
        </View>

        {isPreview ? (
          /* Student Live Preview Mode */
          <View className="bg-white rounded-[22px] p-5 border border-border shadow-sm gap-4">
            <View className="pb-3 border-b border-border gap-1">
              <View className="flex-row items-center gap-1.5">
                <CheckCircle2 size={14} color={Colors.success} />
                <Text className="font-manrope-bold text-[11px] text-success">Verified AP Board Syllabus</Text>
              </View>
              <Text className="font-manrope-extrabold text-xl text-textPrimary tracking-tight">
                {documentTitle}
              </Text>
              <Text className="font-manrope-medium text-xs text-textSecondary">
                Official SCERT Andhra Pradesh State Board Learning Notes
              </Text>
            </View>

            {blocks.map((b) => {
              if (b.type === 'heading') {
                return (
                  <Text key={b.id} className="font-manrope-extrabold text-base text-primary tracking-tight mt-1">
                    {b.content}
                  </Text>
                );
              }
              if (b.type === 'formula') {
                return (
                  <View key={b.id} className="bg-palePeach p-4 rounded-2xl border border-primaryLight gap-1">
                    <Text className="font-manrope-bold text-[10px] text-primary tracking-wider uppercase">
                      {b.title || 'FORMULA IDENTITY'}
                    </Text>
                    <Text className="font-manrope-extrabold text-base text-textPrimary">
                      {b.content}
                    </Text>
                  </View>
                );
              }
              if (b.type === 'axiom') {
                return (
                  <View key={b.id} className="bg-[#FEFCE8] p-4 border-l-4 border-l-[#D97706] rounded-r-2xl gap-1 border border-[#FDE68A]">
                    <Text className="font-manrope-bold text-[10px] text-accentGoldDark tracking-wider uppercase">
                      {b.title || 'AXIOM & PRINCIPLE'}
                    </Text>
                    <Text className="font-manrope-semibold text-sm text-textPrimary">
                      {b.content}
                    </Text>
                  </View>
                );
              }
              if (b.type === 'list') {
                return (
                  <View key={b.id} className="bg-softWarm p-4 rounded-2xl border border-border gap-1.5">
                    {b.title ? (
                      <Text className="font-manrope-bold text-xs text-textPrimary uppercase tracking-wider mb-0.5">
                        {b.title}
                      </Text>
                    ) : null}
                    <Text className="font-manrope-medium text-sm text-textSecondary leading-6">
                      {b.content}
                    </Text>
                  </View>
                );
              }
              return (
                <Text key={b.id} className="font-manrope-medium text-sm text-textSecondary leading-6">
                  {b.content}
                </Text>
              );
            })}
          </View>
        ) : (
          /* Structured Block Editor */
          <View className="gap-3.5">
            {blocks.map((block, idx) => {
              const cfg = getBlockConfig(block.type);

              return (
                <View
                  key={block.id}
                  className={`rounded-[18px] p-4 border border-border shadow-xs gap-2.5 ${cfg.cardBg} ${cfg.borderAccent}`}
                >
                  {/* Block Header Toolbar */}
                  <View className="flex-row items-center justify-between pb-2 border-b border-border/70">
                    <View className="flex-row items-center gap-2">
                      <View className="w-5 h-5 rounded-md bg-white border border-border items-center justify-center shadow-2xs">
                        <Text className="font-manrope-extrabold text-[10px] text-textPrimary">{idx + 1}</Text>
                      </View>
                      <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${cfg.badgeBg}`}>
                        {cfg.icon}
                        <Text className={`font-manrope-bold text-[10px] ${cfg.badgeText}`}>
                          {cfg.label}
                        </Text>
                      </View>
                    </View>

                    {/* Block Action Controls */}
                    <View className="flex-row items-center gap-1">
                      {/* Move Up */}
                      <TouchableOpacity
                        className="w-6 h-6 rounded-md bg-white border border-border items-center justify-center opacity-70"
                        onPress={() => moveBlock(idx, 'up')}
                        disabled={idx === 0}
                      >
                        <ChevronUp size={13} color={idx === 0 ? Colors.border : Colors.textSecondary} />
                      </TouchableOpacity>

                      {/* Move Down */}
                      <TouchableOpacity
                        className="w-6 h-6 rounded-md bg-white border border-border items-center justify-center opacity-70"
                        onPress={() => moveBlock(idx, 'down')}
                        disabled={idx === blocks.length - 1}
                      >
                        <ChevronDown size={13} color={idx === blocks.length - 1 ? Colors.border : Colors.textSecondary} />
                      </TouchableOpacity>

                      {/* Delete */}
                      <TouchableOpacity
                        className="w-6 h-6 rounded-md bg-white border border-border items-center justify-center ml-1"
                        onPress={() => removeBlock(block.id)}
                      >
                        <Trash2 size={12} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Title field if applicable */}
                  {block.title !== undefined && (
                    <TextInput
                      className="bg-white border border-border rounded-xl px-3 h-9 font-manrope-bold text-xs text-textPrimary"
                      placeholder="Block Title / Label"
                      placeholderTextColor={Colors.textPlaceholder}
                      value={block.title}
                      onChangeText={(txt) => updateBlockTitle(block.id, txt)}
                    />
                  )}

                  {/* Content textarea */}
                  <TextInput
                    className="bg-white border border-border rounded-xl p-3 min-h-[64px] font-manrope-medium text-[13px] text-textPrimary"
                    placeholder="Enter block content..."
                    placeholderTextColor={Colors.textPlaceholder}
                    value={block.content}
                    onChangeText={(txt) => updateBlockContent(block.id, txt)}
                    multiline
                    textAlignVertical="top"
                  />
                </View>
              );
            })}

            {/* Block Insert Toolbar */}
            <View className="bg-white rounded-[20px] p-4.5 border border-border shadow-sm gap-3 mt-1">
              <View className="flex-row items-center justify-between">
                <Text className="font-manrope-extrabold text-xs text-textPrimary tracking-tight">
                  Add Content Block
                </Text>
                <Text className="font-manrope-medium text-[11px] text-textMuted">
                  Tap to insert
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                <TouchableOpacity
                  className="flex-row items-center gap-1.5 bg-softWarm px-3 py-2 rounded-xl border border-border"
                  onPress={() => addBlock('heading')}
                  activeOpacity={0.7}
                >
                  <Type size={13} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-textPrimary">+ Heading</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-1.5 bg-softWarm px-3 py-2 rounded-xl border border-border"
                  onPress={() => addBlock('paragraph')}
                  activeOpacity={0.7}
                >
                  <AlignLeft size={13} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-textPrimary">+ Paragraph</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-1.5 bg-palePeach px-3 py-2 rounded-xl border border-primaryLight"
                  onPress={() => addBlock('formula')}
                  activeOpacity={0.7}
                >
                  <Sparkles size={13} color={Colors.primary} />
                  <Text className="font-manrope-bold text-xs text-primary">+ Formula</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-1.5 bg-[#FEFCE8] px-3 py-2 rounded-xl border border-[#FDE68A]"
                  onPress={() => addBlock('axiom')}
                  activeOpacity={0.7}
                >
                  <BookmarkCheck size={13} color={Colors.accentGoldDark} />
                  <Text className="font-manrope-bold text-xs text-accentGoldDark">+ Axiom</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center gap-1.5 bg-[#E7F3ED] px-3 py-2 rounded-xl border border-success/30"
                  onPress={() => addBlock('list')}
                  activeOpacity={0.7}
                >
                  <List size={13} color={Colors.success} />
                  <Text className="font-manrope-bold text-xs text-success">+ Bullets</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Persistent Bottom Navbar */}
      <BottomNav activeTab="Materials" navigation={navigation} />
    </View>
  );
};

export default ContentEditorScreen;
