/*
  ─────────────────────────────────────────────────────────────────────────────
  This tsx enables these functions:
1) This app allows user to edit the text (Exp: bold, italic, underline)
2) This app allows user to edit alignment (Exp: Align middle, Align right)
3) This app allows user to edit font size
4) This app allows user to create a new note
  ─────────────────────────────────────────────────────────────────────────────
*/


import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { launchImageLibrary } from 'react-native-image-picker';
import { RouteProp, useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../AppStackTypes';
import { InsertNote } from '../DatabaseOperation/InsertValue';
import { ReadNoteContent } from '../DatabaseOperation/RetrieveData';
import { UpdateNoteContent } from '../DatabaseOperation/UpdateNote';
import { UpdateNoteFolder } from '../DatabaseOperation/UpdateFolder';
import { UpdateNoteImage } from '../DatabaseOperation/UpdateFolder';
import { MyButton } from '../components/MyCustomComponent';

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

const FONT_SIZES: { label: string; value: number }[] = [
  { label: 'Small', value: 14 },
  { label: 'Normal', value: 16 },
  { label: 'Large', value: 20 },
  { label: 'Heading', value: 26 },
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

const plainTextToSegments = (text: string): Segment[] => {
  const lines = String(text ?? '').split('\n');
  if (lines.length === 0) {
    return [{id: makeId(), text: '', ...DEFAULT_FORMATTING}];
  }

  return lines.map(line => ({
    id: makeId(),
    text: line,
    ...DEFAULT_FORMATTING,
  }));
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

  const { username, noteId, noteTitle: initialTitle, noteTemplate } = route.params;

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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const selectMockup = (key: string) => {
    // Instead of a file URI, we save the "key" string
    setImageUri(key);
  };

  // 1. Add these new states
  const [folderId, setFolderId] = useState<number | null>(null);
  const [folderName, setFolderName] = useState<string>('General');

  useEffect(() => {
    if (!noteId && noteTemplate) {
      setSegments(plainTextToSegments(noteTemplate));
    }
  }, [noteId, noteTemplate]);

  // 2. Load all note data (Title, Folder, Content, Image)
  useEffect(() => {
    if (!noteId) return;
    setIsLoading(true);

    ReadNoteContent(noteId)
      .then((data: any) => {
        // Load Title
        setTitle(data.title || initialTitle || '');

        // Load Folder Info
        if (data.folder_id) {
          setFolderId(data.folder_id);
          setFolderName(data.folder_name || 'General');
        }

        // Load Content (Segments)
        if (data.content) {
          const parsed = storageStringToSegments(data.content);
          if (parsed && parsed.length > 0) {
            setSegments(parsed);
          } else {
            // Fallback if content is just a plain string
            setSegments([{ id: makeId(), text: data.content, ...DEFAULT_FORMATTING }]);
          }
        }
      })
      .catch(err => console.log("Load error:", err))
      .finally(() => setIsLoading(false));
  }, [noteId]);

  // 3. Add the picker function
  const handleSelectFolder = async () => {
    try {
      const { ReadUserFolders } = require('../DatabaseOperation/RetrieveData');
      const userFolders = await ReadUserFolders(username);

      const options = userFolders.map((f: any) => ({
        text: f.folder_name,
        onPress: () => {
          setFolderId(f.folder_id);
          setFolderName(f.folder_name);
        }
      }));

      options.push({
        text: "None (General)",
        onPress: () => {
          setFolderId(null);
          setFolderName('General');
        }
      });

      options.push({ text: "Cancel", style: "cancel" });
      Alert.alert("Move to Folder", "Select a destination:", options);
    } catch (error) {
      Alert.alert("Error", "Could not load folders.");
    }
  };

  // Add image
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  // View Mind Map
  const handleViewMindMap = () => {
    // Join all segment texts with newlines to create the content string
    const fullContent = segments
      .map(s => s.text)
      .join('\n');

    if (!fullContent.trim()) {
      Alert.alert("Empty Note", "Please add some text before viewing the Mind Map.");
      return;
    }

    // Navigate and pass the compiled content
    navigation.navigate('MindMap', { content: fullContent });
  };

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
          const last = { ...updated[updated.length - 1], ...patch };
          updated[updated.length - 1] = last;
          return updated;
        });



        setFormatting(prev => ({
          ...prev,
          ...(patch.bold !== undefined ? { bold: patch.bold } : {}),
          ...(patch.italic !== undefined ? { italic: patch.italic } : {}),
          ...(patch.underline !== undefined ? { underline: patch.underline } : {}),
          ...(patch.fontSize !== undefined ? { fontSize: patch.fontSize } : {}),
          ...(patch.alignment !== undefined ? { alignment: patch.alignment } : {}),
        }));
        return;
      }



      setSegments(prev =>
        prev.map(s =>
          s.id === activeSegmentId ? { ...s, ...patch } : s,
        ),
      );
      setFormatting(prev => ({
        ...prev,
        ...(patch.bold !== undefined ? { bold: patch.bold } : {}),
        ...(patch.italic !== undefined ? { italic: patch.italic } : {}),
        ...(patch.underline !== undefined ? { underline: patch.underline } : {}),
        ...(patch.fontSize !== undefined ? { fontSize: patch.fontSize } : {}),
        ...(patch.alignment !== undefined ? { alignment: patch.alignment } : {}),
      }));
    },
    [activeSegmentId],
  );

  const toggleBold = () => applyToActive({ bold: !formatting.bold });
  const toggleItalic = () => applyToActive({ italic: !formatting.italic });
  const toggleUnderline = () =>
    applyToActive({ underline: !formatting.underline });
  const setAlignment = (a: Alignment) => applyToActive({ alignment: a });
  const applyFontSize = (size: number) => {
    applyToActive({ fontSize: size });
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
        // Update existing note (ensure your update function handles folder_id)
        const { UpdateNoteFolder } = require('../DatabaseOperation/UpdateFolder');
        const { UpdateNoteContent } = require('../DatabaseOperation/UpdateNote');
        await Promise.all([
          UpdateNoteFolder(noteId, folderId),
          UpdateNoteContent(noteId, contentStr), // this is for existing note, just update content
          UpdateNoteImage(noteId, imageUri),
        ]); // Add this helper if needed

        Alert.alert('Saved', 'Your note has been saved.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);


      } else {
        // this is for new note, insert then update (to get the noteId)
        // const result: any = await InsertNote(title.trim(), username, null);
        // Change line 341 to this:
        const result: any = await InsertNote(
          title.trim(),
          username,
          folderId ? String(folderId) : null // Ensure it's a number
        );
        await UpdateNoteContent(result.noteId, contentStr);
        await UpdateNoteImage(result.noteId, imageUri);
        Alert.alert('Note created!', 'Your new note has been saved.', [
          { text: 'OK', onPress: () => navigation.goBack() },
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

      {/* ── Folder Selector ── */}
      <TouchableOpacity
        onPress={handleSelectFolder}
        style={editorStyles.folderSelector}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>📁</Text>
          <View>
            <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: '600' }}>FOLDER</Text>
            {/* <Text style={{ fontSize: 14, color: '#111827', fontWeight: '500' }}>{folderName}</Text> */}
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>{folderName ? String(folderName) : 'General'}
            </Text>
          </View>
        </View>
        <Text style={{ color: '#3dc9f3', fontSize: 12, fontWeight: '700' }}>CHANGE</Text>
      </TouchableOpacity>

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
                prev.map(s => (s.id === seg.id ? { ...s, text } : s)),
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
        {/* Other note content (Title, Folder, etc) */}
        {imageUri && (
          <View style={{ marginVertical: 20, alignItems: 'center' }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: 200, borderRadius: 10 }}
            />
            <TouchableOpacity onPress={() => setImageUri(null)}>
              <Text style={{ color: 'red', marginTop: 10 }}>Remove Photo</Text>
            </TouchableOpacity>
          </View>
        )}

        <MyButton title="📷 Add Photo" variant="primary" onPress={pickImage} />

        {/* Mind Map */}
        <MyButton
          title="🌳 View Mind Map"
          variant="primary"
          onPress={handleViewMindMap}
          style={{ marginTop: 10 }}
        />

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
                    { fontSize: opt.value },
                    formatting.fontSize === opt.value && { color: '#3dc9f3' },
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

  // Folder Selector
  folderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
});

export default NoteEditorScreen;



