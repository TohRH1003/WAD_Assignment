import {NavigatorScreenParams} from '@react-navigation/native';

export type AuthTabParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthTabParamList> | undefined;
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
 
