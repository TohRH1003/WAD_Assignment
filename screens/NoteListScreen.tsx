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
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useFocusEffect, useRoute} from '@react-navigation/native';
import {MainDrawerParamList} from '../AppStackTypes';
import {MyButton} from '../components/MyCustomComponent';
import {appStyles as styles} from '../styles/AppStyles';
import {
  ReadNoteData,
  UpdateNotePinStatus,
  SoftDeleteNote,
} from '../DatabaseOperation/RetrieveData';

type RoutePropType = RouteProp<MainDrawerParamList, 'NoteList'>;

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
// =======
// const NoteListScreen = ({navigation}:any) => {
//   const route = useRoute<RouteProp<RootStackParamList, 'NoteList'>>();
// >>>>>>> f949056ae0cd80c1d1628ed2fdeb8670bc3862fa
// I only addede this part to the comment to solve the merge conlict,
// please make the necessary changes if needed.

  const bookmarkIcon = require('../assets/bookmark.png');
  const {username} = route.params;

  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [searchText, setSearchText] = useState('');

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

  const handleTogglePin = async (note: NoteRow) => {
  try {
    const newPinStatus = note.is_pinned ? 0 : 1;

    await UpdateNotePinStatus(note.note_id, newPinStatus);

    setNotes(prevNotes =>
      prevNotes.map(item =>
        item.note_id === note.note_id
          ? {...item, is_pinned: newPinStatus}
          : item,
      ),
    );
  } catch (err: any) {
    console.log('Pin note error:', err?.message);
    Alert.alert('Error', 'Unable to update pin status.');
  }
};

const handleSoftDeleteNote = (note: NoteRow) => {
  Alert.alert(
    'Delete note',
    `Are you sure you want to delete "${note.title}"?`,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await SoftDeleteNote(note.note_id);

            setNotes(prevNotes =>
              prevNotes.filter(item => item.note_id !== note.note_id),
            );
          } catch (err: any) {
            console.log('Soft delete note error:', err?.message);
            Alert.alert(
              'Error',
              err?.message || 'Unable to delete note.',
            );
          }
        },
      },
    ],
  );
};

const filteredNotes = notes
  .filter(note =>
    note.title.toLowerCase().includes(searchText.toLowerCase()),
  )
  .sort((a, b) => b.is_pinned - a.is_pinned);

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

      <TextInput
        style={listStyles.searchInput}
        placeholder="Search notes..."
        placeholderTextColor="#9ca3af"
        value={searchText}
        onChangeText={setSearchText}
      />

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
      ) : filteredNotes.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.notePlaceholderTitle}>No notes yet</Text>
          <Text style={styles.notePlaceholderText}>
            Tap "＋ New Note" above to create your first note.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          {filteredNotes.map(note => (
            <TouchableOpacity
              key={note.note_id}
              onPress={() => handleOpenNote(note)}
              activeOpacity={0.75}
              style={[styles.noteItem, listStyles.noteItemWithBookmark]}>
              <Text style={styles.noteItemTitle} numberOfLines={1}>
                {note.is_pinned ? '📌 ' : ''}
                {note.title}
              </Text>
              <Text style={styles.noteItemMeta}>
                Last updated: {formatDate(note.updated_at)}
              </Text>

              <TouchableOpacity
                onPress={event => {
                event.stopPropagation();
                handleTogglePin(note);
              }}
                style={listStyles.bookmarkButton}
                activeOpacity={0.7}>
                <Image
                  source={bookmarkIcon}
                  style={[
                    listStyles.bookmarkIcon,
                    note.is_pinned ? listStyles.bookmarkIconActive : listStyles.bookmarkIconInactive,
                  ]}
                />
              </TouchableOpacity>
              <TouchableOpacity
    onPress={event => {
      event.stopPropagation();
      handleSoftDeleteNote(note);
    }}
    style={listStyles.deleteButton}
    activeOpacity={0.7}>
    <Text style={listStyles.deleteButtonText}>Delete</Text>
  </TouchableOpacity>
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

  searchInput: {
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 12,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: '#ffffff',
  color: '#111827',
  fontSize: 15,
  },

  noteItemWithBookmark: {
  position: 'relative',
  paddingRight: 50,
  paddingBottom: 45,
  },

  bookmarkButton: {
    position: 'absolute',
    right: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bookmarkIcon: {
    width: 42,
    height: 48,
    resizeMode: 'contain',
  },

  bookmarkIconActive: {
    opacity: 1,
  },

  bookmarkIconInactive: {
    opacity: 0.25,
  },

  deleteButton: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#fee2e2',
  },

  deleteButtonText: {
   color: '#b91c1c',
   fontWeight: '600',
   fontSize: 13,
  },
});

export default NoteListScreen;
