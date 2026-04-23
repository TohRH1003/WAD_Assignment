/*
  ─────────────────────────────────────────────────────────────────────────────
  This tsx enables these functions:
1) This app allows user to edit the text (Exp: bold, italic, underline)
2) This app allows user to edit alignment (Exp: Align middle, Align right)
3) This app allows user to edit font size
4) This app allows user to create a new note
  ─────────────────────────────────────────────────────────────────────────────
*/


import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../AppStackTypes';
import {InsertNote} from '../DatabaseOperation/InsertValue';
import {ReadNoteContent} from '../DatabaseOperation/RetrieveData';
import {UpdateNoteContent} from '../DatabaseOperation/UpdateNote';

//  must making the Types first ──────────────────────────────────────────────

type NavProp = StackNavigationProp<RootStackParamList, 'NoteEditor'>;
type RoutePropType = RouteProp<RootStackParamList, 'NoteEditor'>;

type Alignment = 'left' | 'center' | 'right';

interface Segment {
  id: string;
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: Alignment;
}

interface FormattingState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: Alignment;
}

// declare Constants here ──────────────────────────────────────────────────────────

const FONT_SIZES: {label: string; value: number}[] = [
  {label: 'Small', value: 14},
  {label: 'Normal', value: 16},
  {label: 'Large', value: 20},
  {label: 'Heading', value: 26},
];

const DEFAULT_FORMATTING: FormattingState = {
  bold: false,
  italic: false,
  underline: false,
  fontSize: 16,
  alignment: 'left',
};

// Helpers here ──────────────────────────────────────────────────────────

const makeId = () => Math.random().toString(36).slice(2, 9);

const segmentsToStorageString = (segs: Segment[]): string =>
  JSON.stringify(segs);

const storageStringToSegments = (raw: string): Segment[] | null => {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Segment[];
    }
    return null;
  } catch {
    return null;
  }
};

// adding for Sub-components ──────────────────────────────────────────────────────────

const ToolbarButton = ({
  label,
  active,
  onPress,
  style,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  style?: object;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      editorStyles.toolbarBtn,
      active && editorStyles.toolbarBtnActive,
      style,
    ]}
    activeOpacity={0.75}>
    <Text
      style={[
        editorStyles.toolbarBtnText,
        active && editorStyles.toolbarBtnTextActive,
      ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// changes to Main Screen (navigation) ─────────────────────────────────────────────────────────────

const NoteEditorScreen = () => {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();

  const {username, noteId, noteTitle: initialTitle} = route.params;

  // STATE ──────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState(initialTitle ?? '');
  const [segments, setSegments] = useState<Segment[]>([
    {
      id: makeId(),
      text: '',
      ...DEFAULT_FORMATTING,
    },
  ]);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [formatting, setFormatting] =
    useState<FormattingState>(DEFAULT_FORMATTING);
  const [isSaving, setIsSaving] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Word count derived from segments
  const wordCount = segments
    .map(s => s.text.trim())
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  // Load existing content (datas) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!noteId) {
      return;
    }
    setIsLoading(true);
    ReadNoteContent(noteId)
      .then((data: any) => {
        setTitle(data.title || initialTitle || '');
        if (data.content) {
          const parsed = storageStringToSegments(data.content);
          if (parsed && parsed.length > 0) {
            setSegments(parsed);
          } else if (data.content) {
            // Plain text fallback (notes created by other teammates)
            setSegments([
              {
                id: makeId(),
                text: data.content,
                ...DEFAULT_FORMATTING,
              },
            ]);
          }
        }
      })
      .catch(() => {
        // New note – nothing to load
      })
      .finally(() => setIsLoading(false));
  }, [noteId]);

  // Update active formatting when cursor moves ─────────────────────────────
  useEffect(() => {
    if (!activeSegmentId) {
      return;
    }
    const seg = segments.find(s => s.id === activeSegmentId);
    if (seg) {
      setFormatting({
        bold: seg.bold,
        italic: seg.italic,
        underline: seg.underline,
        fontSize: seg.fontSize,
        alignment: seg.alignment,
      });
    }
  }, [activeSegmentId, segments]);

  // actions for the Toolbar when making note  ────────────────────────────────────────────────────────

  const applyToActive = useCallback(
    (patch: Partial<Segment>) => {
      if (!activeSegmentId) {
        // If nothing focused, apply to the last segment


        setSegments(prev => {
          const updated = [...prev];
          const last = {...updated[updated.length - 1], ...patch};
          updated[updated.length - 1] = last;
          return updated;
        });



        setFormatting(prev => ({
          ...prev,
          ...(patch.bold !== undefined ? {bold: patch.bold} : {}),
          ...(patch.italic !== undefined ? {italic: patch.italic} : {}),
          ...(patch.underline !== undefined ? {underline: patch.underline} : {}),
          ...(patch.fontSize !== undefined ? {fontSize: patch.fontSize} : {}),
          ...(patch.alignment !== undefined ? {alignment: patch.alignment} : {}),
        }));
        return;
      }



      setSegments(prev =>
        prev.map(s =>
          s.id === activeSegmentId ? {...s, ...patch} : s,
        ),
      );
      setFormatting(prev => ({
        ...prev,
        ...(patch.bold !== undefined ? {bold: patch.bold} : {}),
        ...(patch.italic !== undefined ? {italic: patch.italic} : {}),
        ...(patch.underline !== undefined ? {underline: patch.underline} : {}),
        ...(patch.fontSize !== undefined ? {fontSize: patch.fontSize} : {}),
        ...(patch.alignment !== undefined ? {alignment: patch.alignment} : {}),
      }));
    },
    [activeSegmentId],
  );

  const toggleBold = () => applyToActive({bold: !formatting.bold});
  const toggleItalic = () => applyToActive({italic: !formatting.italic});
  const toggleUnderline = () =>
    applyToActive({underline: !formatting.underline});
  const setAlignment = (a: Alignment) => applyToActive({alignment: a});
  const applyFontSize = (size: number) => {
    applyToActive({fontSize: size});
    setShowFontPicker(false);
  };

  // Add a new formatted segment (like pressing Enter)
  const addSegment = () => {
    const newSeg: Segment = {
      id: makeId(),
      text: '',
      ...formatting,
    };
    setSegments(prev => [...prev, newSeg]);
    setActiveSegmentId(newSeg.id);
  };

  // Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for your note.');
      return;
    }

    try {
      setIsSaving(true);
      const contentStr = segmentsToStorageString(segments);

      if (noteId) {
        // this is for existing note, just update content
        await UpdateNoteContent(noteId, contentStr);
        Alert.alert('Saved', 'Your note has been saved.', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);

        
      } else {
        // this is for new note, insert then update (to get the noteId)
        const result: any = await InsertNote(title.trim(), username, null);
        await UpdateNoteContent(result.noteId, contentStr);
        Alert.alert('Note created!', 'Your new note has been saved.', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (err: any) {
      Alert.alert('Save failed', err?.message ?? 'Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // RENDER ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={editorStyles.loadingWrap}>
        <Text style={editorStyles.loadingText}>Loading note…</Text>
      </View>
    );
  }

  return (
    <View style={editorStyles.root}>


        
      {/* ── Header content below  ── */}
      <View style={editorStyles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={editorStyles.backBtn}>
          <Text style={editorStyles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={editorStyles.headerTitle} numberOfLines={1}>
          {noteId ? 'Edit Note' : 'New Note'}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={editorStyles.saveBtn}>
          <Text style={editorStyles.saveBtnText}>
            {isSaving ? 'Saving…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>


      {/* ── Formatting Toolbar ── */}
<View style={editorStyles.toolbar}>
  
  {/* Bold button */}
  <TouchableOpacity 
    style={[editorStyles.formatButton, 
      formatting.bold && editorStyles.activeButton]}
    onPress={toggleBold}
  >
    <Image source={require('../assets/bold.png')} style={editorStyles.icon} />
  </TouchableOpacity>

  {/* Italic button */}
  <TouchableOpacity 
    style={[editorStyles.formatButton, 
      formatting.italic && editorStyles.activeButton]}
    onPress={toggleItalic}
  >
    <Image source={require('../assets/italic.png')} style={editorStyles.icon} />
  </TouchableOpacity>

  {/* Underline button */}
  <TouchableOpacity 
    style={[editorStyles.formatButton, 
      formatting.underline && editorStyles.activeButton]}
    onPress={toggleUnderline}
  >
    <Image source={require('../assets/underline.png')} style={editorStyles.icon} />
  </TouchableOpacity>

  <View style={editorStyles.toolbarDivider} />

        {/* Alignment */}
        {/* <ToolbarButton
          label="⬛"
          active={formatting.alignment === 'left'}
          onPress={() => setAlignment('left')}
        />
        <ToolbarButton
          label=""
          active={formatting.alignment === 'center'}
          onPress={() => setAlignment('center')}
        />
        <ToolbarButton
          label="▶"
          active={formatting.alignment === 'right'}
          onPress={() => setAlignment('right')}
        /> */}

      {/* Alignment */}

      
<TouchableOpacity 
  style={[editorStyles.alignButton, 
    formatting.alignment === 'left' && editorStyles.activeButton]}
  onPress={() => setAlignment('left')}
>
<Image source={require('../assets/align-left.png')} style={editorStyles.icon} />
</TouchableOpacity>



<TouchableOpacity 
  style={[editorStyles.alignButton, 
    formatting.alignment === 'center' && editorStyles.activeButton]}
  onPress={() => setAlignment('center')}
>
<Image source={require('../assets/align-center.png')} style={editorStyles.icon} />
</TouchableOpacity>




<TouchableOpacity 
  style={[editorStyles.alignButton, 
    formatting.alignment === 'right' && editorStyles.activeButton]}
  onPress={() => setAlignment('right')}
>
<Image source={require('../assets/align-right.png')} style={editorStyles.icon} />
</TouchableOpacity>



        {/* <View style={editorStyles.toolbarDivider} /> */}

        {/* Font size */}
        <TouchableOpacity
          onPress={() => setShowFontPicker(true)}
          style={editorStyles.fontSizeBtn}>
          <Text style={editorStyles.fontSizeBtnText}>
            {FONT_SIZES.find(f => f.value === formatting.fontSize)?.label ??
              'Normal'}{' '}
            ▾
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Word count bar ── */}
      <View style={editorStyles.wordCountBar}>
        <Text style={editorStyles.wordCountText}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </Text>
        <TouchableOpacity onPress={addSegment} style={editorStyles.addLineBtn}>
          <Text style={editorStyles.addLineBtnText}>+ New line</Text>
        </TouchableOpacity>
      </View>

      {/* ── Title ── */}
      <TextInput
        style={editorStyles.titleInput}
        placeholder="Note title…"
        placeholderTextColor="#9ca3af"
        value={title}
        onChangeText={setTitle}
        editable={!noteId} // Title is set on creation; lock it afterwards
      />

      {/* ── Content segments ── */}
      <ScrollView
        style={editorStyles.contentScroll}
        contentContainerStyle={editorStyles.contentPad}
        keyboardShouldPersistTaps="handled">
        {segments.map((seg, idx) => (
          <TextInput
            key={seg.id}
            multiline
            value={seg.text}
            onChangeText={text =>
              setSegments(prev =>
                prev.map(s => (s.id === seg.id ? {...s, text} : s)),
              )
            }
            onFocus={() => setActiveSegmentId(seg.id)}
            placeholder={idx === 0 ? 'Start typing your note…' : ''}
            placeholderTextColor="#d1d5db"
            style={[
              editorStyles.segmentInput,
              {
                fontWeight: seg.bold ? 'bold' : 'normal',
                fontStyle: seg.italic ? 'italic' : 'normal',
                textDecorationLine: seg.underline ? 'underline' : 'none',
                fontSize: seg.fontSize,
                textAlign: seg.alignment,
                borderColor:
                  activeSegmentId === seg.id ? '#3dc9f3' : 'transparent',
              },
            ]}
          />
        ))}
      </ScrollView>

      {/* for Font Size Picker Modal  */}
      <Modal
        visible={showFontPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFontPicker(false)}>
        <TouchableOpacity
          style={editorStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFontPicker(false)}>
          <View style={editorStyles.fontPickerCard}>
            <Text style={editorStyles.fontPickerTitle}>Font Size</Text>
            {FONT_SIZES.map(opt => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => applyFontSize(opt.value)}
                style={[
                  editorStyles.fontPickerRow,
                  formatting.fontSize === opt.value &&
                    editorStyles.fontPickerRowActive,
                ]}>
                <Text
                  style={[
                    editorStyles.fontPickerRowText,
                    {fontSize: opt.value},
                    formatting.fontSize === opt.value && {color: '#3dc9f3'},
                  ]}>
                  {opt.label}
                </Text>
                {formatting.fontSize === opt.value && (
                  <Text style={editorStyles.checkMark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// all Styles used and applied ───────────────────────────────────────────────────────────────────

const editorStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4f7f5',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
  },
  backBtn: {
    paddingHorizontal: 4,
  },
  backBtnText: {
    fontSize: 15,
    color: '#3dc9f3',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 8,
  },
  saveBtn: {
    backgroundColor: '#3dc9f3',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  saveBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  // ── Toolbar
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexWrap: 'wrap',
    gap: 4,
  },
  toolbarBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  toolbarBtnActive: {
    backgroundColor: '#3dc9f3',
    borderColor: '#3dc9f3',
  },
  toolbarBtnText: {
    fontSize: 14,
    color: '#374151',
  },
  toolbarBtnTextActive: {
    color: '#ffffff',
  },
  toolbarBtnBold: {
    // bold label style added inline
  },
  toolbarBtnItalic: {},
  toolbarBtnUnderline: {},
  toolbarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  fontSizeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  fontSizeBtnText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  // ── Word count
  wordCountBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  wordCountText: {
    fontSize: 12,
    color: '#6b7280',
  },
  addLineBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#e0f7fd',
  },
  addLineBtnText: {
    fontSize: 12,
    color: '#3dc9f3',
    fontWeight: '600',
  },
  // ── Title
  titleInput: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  // ── Content
  contentScroll: {
    flex: 1,
  },
  contentPad: {
    padding: 16,
    paddingBottom: 40,
    gap: 6,
  },
  segmentInput: {
    color: '#1f2937',
    lineHeight: 24,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 40,
    backgroundColor: '#ffffff',
  },
  // ── Font picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    padding: 40,
  },
  fontPickerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
  },
  fontPickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  fontPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  fontPickerRowActive: {
    backgroundColor: '#e0f7fd',
  },
  fontPickerRowText: {
    color: '#374151',
    fontWeight: '500',
  },
  checkMark: {
    fontSize: 16,
    color: '#3dc9f3',
    fontWeight: '700',
  },

  // ── Alignment buttons
    alignButton: {
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeButton: {
    backgroundColor: '#e0e0e0',
  },
  icon: {
    width: 20,
    height: 20,
  },
  formatButton: {
  padding: 8,
  borderRadius: 4,
  marginHorizontal: 4,
},
});

export default NoteEditorScreen;
