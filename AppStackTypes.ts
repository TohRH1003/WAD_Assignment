import {NavigatorScreenParams} from '@react-navigation/native';

//Update Note type
export interface Note {
  id: number;
  title: string;
  content: string;
  folder: string;
  image?: string | null;
  date: string;
}

export type AuthTabParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainDrawerParamList = {
  NoteList: {username: string};
  FolderList: {username: string}; // Added FolderList screen type
  Profile: {username: string};
  MindMap: {content?: string; title?: string; imageUri?: string};
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthTabParamList> | undefined;
  MainDrawer: NavigatorScreenParams<MainDrawerParamList>;
  Edit: {username: string};
  MindMap: {content?: string; title?: string; imageUri?: string}; // Add this line

 // NoteEditorScreen it opens for both creating a new note and editing an existing one.
  // When noteId is undefined, the screen creates a brand-new note.
  NoteEditor: {
    username: string;
    noteId?: number;    // undefined → new note
    noteTitle?: string; // pre-fill the title input
  };
};
 
