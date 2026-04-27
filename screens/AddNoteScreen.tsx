import React, {useState, useContext} from 'react';
import {View, Image} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {NoteContext} from '../context/NoteContext';
import {MyTextInput, MyButton} from '../components/MyCustomComponent';
import {appStyles as styles} from '../styles/AppStyles';

const AddNoteScreen = ({navigation}: any) => {
  const {addNote} = useContext(NoteContext);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [folder, setFolder] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const templates = {
    study: 'Topic:\nSummary:\nImportant Points:',
    meeting: 'Meeting Notes:\nAction Items:',
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (res: any) => {
      if (res.assets) setImage(res.assets[0].uri || null);
    });
  };

  const save = () => {
    addNote({
      title,
      content,
      folder: folder || 'General',
      image,
      date: new Date().toLocaleString(),
    });

    navigation.goBack();
  };

  return (
    <View style={styles.content}>
      <MyTextInput label="Title" value={title} onChangeText={setTitle} />
      <MyTextInput label="Content" value={content} onChangeText={setContent} />
      <MyTextInput label="Folder" value={folder} onChangeText={setFolder} />

      <MyButton title="Study Template" onPress={() => setContent(templates.study)} />
      <MyButton title="Meeting Template" onPress={() => setContent(templates.meeting)} />

      <MyButton title="Insert Image" onPress={pickImage} />

      {image && <Image source={{uri: image}} style={{width: 120, height: 120}} />}

      <MyButton title="Save Note" onPress={save} />
    </View>
  );
};

export default AddNoteScreen;

/**
 * android/app/src/main/AndroidManifest.xml

Add these lines inside the <manifest> tag but above the <application> tag:

<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
 */