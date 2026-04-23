export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  NoteList: {username: string};
  Profile: {username: string};
  Edit: {username: string};

 // NoteEditorScreen it opens for both creating a new note and editing an existing one.
  // When noteId is undefined, the screen creates a brand-new note.
  NoteEditor: {
    username: string;
    noteId?: number;    // undefined → new note
    noteTitle?: string; // pre-fill the title input
  };
};
 