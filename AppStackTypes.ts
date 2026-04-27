export type Note = {
  id: string;
  title: string;
  content: string;
  folder: string;
  date: string;
  image?: string | null;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  NoteList: {username: string};
  Profile: {username: string};
  Edit: {username: string};
  AddNote: undefined;
  EditNote: {note: Note};
  MindMap: {content: string};
};
