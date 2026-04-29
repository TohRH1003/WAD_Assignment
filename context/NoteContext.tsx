import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Text } from 'react-native';
import { Note } from '../AppStackTypes';
import { CLOUD_BASE_URL } from '../services/cloudService';

// ---------------- TYPES ---------------- //

type NoteContextType = {
  notes: Note[];
  isLoading: boolean;
  error: string | null;
  loadNotes: () => Promise<void>;
  addNote: (note: Omit<Note, 'id'>) => Promise<void>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
};

// ---------------- CONTEXT ---------------- //

export const NoteContext = createContext<NoteContextType>(
  {} as NoteContextType,
);

// ---------------- PROVIDER ---------------- //

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------- FETCH HELPERS ---------------- //

  const handleRequest = async (callback: () => Promise<void>) => {
    try {
      setIsLoading(true);
      setError(null);
      await callback();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- CRUD ---------------- //

  // READ
  const loadNotes = async () => {
    await handleRequest(async () => {
      const res = await fetch(`${CLOUD_BASE_URL}/notes`);
      if (!res.ok) throw new Error('Failed to load notes');

      const data = await res.json();
      setNotes(data);
    });
  };

  // CREATE
  const addNote = async (note: Omit<Note, 'id'>) => {
    await handleRequest(async () => {
      const newNote: Note = {
        ...note,
        id: Date.now().toString(),
      };

      const res = await fetch(`${CLOUD_BASE_URL}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });

      if (!res.ok) throw new Error('Failed to add note');

      await loadNotes();
    });
  };

  // UPDATE
  const updateNote = async (note: Note) => {
    await handleRequest(async () => {
      const res = await fetch(`${CLOUD_BASE_URL}/notes/${note.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      if (!res.ok) throw new Error('Failed to update note');

      await loadNotes();
    });
  };

  // DELETE
  const deleteNote = async (id: string) => {
    await handleRequest(async () => {
      const res = await fetch(`${CLOUD_BASE_URL}/notes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete note');

      await loadNotes();
    });
  };

  // ---------------- INIT ---------------- //

  useEffect(() => {
    loadNotes();
  }, []);

  // ---------------- PROVIDER ---------------- //

  return (
    <NoteContext.Provider
      value={{
        notes,
        isLoading,
        error,
        loadNotes,
        addNote,
        updateNote,
        deleteNote,
      }}>
      {children}
    </NoteContext.Provider>
  );
};

// USE INSIDE SCREENS
// import {useContext} from 'react';
// import {NoteContext} from '../context/NoteContext';

// const {notes, addNote, deleteNote, isLoading, error} =
//   useContext(NoteContext);