import React, { useState, useContext, useEffect } from 'react'; //add useEffect
import { Picker } from '@react-native-picker/picker'; //added
import {View, Image, Text, ScrollView, TouchableOpacity, Alert} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { MyTextInput, MyButton } from '../components/MyCustomComponent';
import { appStyles as styles } from '../styles/AppStyles';
import { NoteContext } from '../context/NoteContext';

const AddNoteScreen = ({ navigation }: any) => {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('General'); // Selected folder
  const [folder, setFolder] = useState<string[]>(['General']); // Default state
  const [images, setImages] = useState<string[]>([]);
  const { addNote } = useContext(NoteContext);

  const templates = {
    study: 'Topic:\nSummary:\nImportant Points:',
    meeting: 'Meeting Notes:\nAction Items:',
  };

  // Load existing folders when screen opens
  useEffect(() => {
    // Replace this with: const data = await getFoldersFromDB();
    const existingFolder = ['General', 'Study', 'Work', 'Personal'];
    setFolder(existingFolder);
  }, []);

  const pickImages = () => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 0 // 0 means no limit (multiple selection)
    }, (res: any) => {
      if (res.assets) {
        const newUris = res.assets.map((asset: any) => asset.uri);
        setImages([...images, ...newUris]); // Append new images to list
      }
    });
  };

  const save = async () => {
    if (!title.trim()) {
      Alert.alert("Please enter a title");
      return;
    }

    const newNote = {
      title,
      content,
      folder: selectedFolder,
      images, // Sending the array of images
      date: new Date().toLocaleString(),
    };

    // 3. Save to your Cloud Database via Context
    await addNote(newNote);
    navigation.goBack();
  };

  // return (
  //   <View style={styles.content}>
  //     <MyTextInput label="Title" value={title} onChangeText={setTitle} />
  //     <MyTextInput label="Content" value={content} onChangeText={setContent} />
  //     <MyTextInput label="Folder" value={folder} onChangeText={setFolder} />

  //     <MyButton title="Study Template" onPress={() => setContent(templates.study)} />
  //     <MyButton title="Meeting Template" onPress={() => setContent(templates.meeting)} />

  //     <MyButton title="Insert Image" onPress={pickImage} />

  //     {image && <Image source={{uri: image}} style={{width: 120, height: 120}} />}

  //     <MyButton title="Save Note" onPress={save} />
  //   </View>
  // );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <MyTextInput label="Title" value={title} onChangeText={setTitle} />

      <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Folder Organization</Text>
      <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginVertical: 5 }}>
        <Picker
          selectedValue={selectedFolder}
          onValueChange={(itemValue) => setSelectedFolder(itemValue)}>
          {folder.map((f) => (
            <Picker.Item key={f} label={f} value={f} />
          ))}
        </Picker>
      </View>

      <MyTextInput
        label="Content"
        value={content}
        onChangeText={setContent}
        multiline={true}
        numberOfLines={6}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }}>
        <MyButton title="Study Template" onPress={() => setContent(templates.study)} />
        <MyButton title="Meeting Template" onPress={() => setContent(templates.meeting)} />
      </View>

      <MyButton title="Insert Images" onPress={pickImages} />

      {/* 4. Display multiple images in a horizontal row or wrap */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        {images.map((uri, index) => (
          <Image
            key={index}
            source={{ uri }}
            style={{ width: 100, height: 100, margin: 5, borderRadius: 10 }}
          />
        ))}
      </View>

      <View style={{ marginTop: 20 }}>
        <MyButton title="Save Note" onPress={save} />
      </View>
    </ScrollView>
  );
};

export default AddNoteScreen;