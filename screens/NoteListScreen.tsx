/*
  NoteListScreen.tsx
  • Lists all non-deleted notes for the logged-in user
  • "New Note" button opens a title-input modal, then navigates to NoteEditor
  • Tapping any note card opens NoteEditor for that note
  • Refreshes the list every time the screen comes into focus
*/

import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../AppStackTypes';
import {MyButton} from '../components/MyCustomComponent';
import {appStyles as styles} from '../styles/AppStyles';
import {ReadNoteData} from '../DatabaseOperation/RetrieveData';

type RoutePropType = RouteProp<RootStackParamList, 'NoteList'>;

interface NoteRow {
  note_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  is_pinned: number;
  is_deleted: number;
  folder_id: string | null;
}

const formatDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
};

const NoteListScreen = ({navigation}: any) => {
  const route = useRoute<RoutePropType>();
  const {username} = route.params;

  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        try {
          setIsLoading(true);
          const data = (await ReadNoteData(username)) as NoteRow[];
          setNotes(data);
        } catch (err: any) {
          console.log('NoteList load error:', err?.message);
        } finally {
          setIsLoading(false);
        }
      };
      load();
    }, [username]),
  );

  const handleCreateNote = () => {
    const trimmed = newNoteTitle.trim();
    if (!trimmed) {
      Alert.alert('Title required', 'Please enter a title for your new note.');
      return;
    }
    setShowNewNoteModal(false);
    setNewNoteTitle('');
    navigation.navigate('NoteEditor', {username, noteTitle: trimmed});
  };

  const handleOpenNote = (note: NoteRow) => {
    navigation.navigate('NoteEditor', {
      username,
      noteId: note.note_id,
      noteTitle: note.title,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.noteScreenHeader}>
        <View>
          <Text style={styles.title}>My Notes</Text>
          <Text style={styles.subtitle}>Welcome, {username}</Text>
        </View>
        <MyButton
          title="Profile"
          variant="header"
          onPress={() => navigation.navigate('Profile', {username})}
        />
      </View>

      <MyButton
        title="＋ New Note"
        onPress={() => {
          setNewNoteTitle('');
          setShowNewNoteModal(true);
        }}
      />

      {isLoading ? (
        <View style={listStyles.centered}>
          <ActivityIndicator size="large" color="#3dc9f3" />
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.notePlaceholderTitle}>No notes yet</Text>
          <Text style={styles.notePlaceholderText}>
            Tap "＋ New Note" above to create your first note.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {notes.map(note => (
            <TouchableOpacity
              key={note.note_id}
              onPress={() => handleOpenNote(note)}
              activeOpacity={0.75}
              style={styles.noteItem}>
              <Text style={styles.noteItemTitle} numberOfLines={1}>
                {note.is_pinned ? '📌 ' : ''}
                {note.title}
              </Text>
              <Text style={styles.noteItemMeta}>
                Last updated: {formatDate(note.updated_at)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal
        visible={showNewNoteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewNoteModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNewNoteModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Note</Text>
            <Text style={listStyles.modalLabel}>Note title</Text>
            <TextInput
              style={listStyles.modalInput}
              placeholder="e.g. Meeting notes, Ideas…"
              placeholderTextColor="#9ca3af"
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              autoFocus
              onSubmitEditing={handleCreateNote}
            />
            <MyButton title="Create Note" onPress={handleCreateNote} />
            <MyButton
              title="Cancel"
              variant="secondary"
              onPress={() => setShowNewNoteModal(false)}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const listStyles = StyleSheet.create({
  centered: {paddingVertical: 40, alignItems: 'center'},
  modalLabel: {fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6},
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    color: '#111827',
    marginBottom: 14,
    fontSize: 15,
  },
});

export default NoteListScreen;
