import React, {useState, useContext, useEffect} from 'react'; //add useEffect
import {Picker} from '@react-native-picker/picker'; //added
import {View, Image, Text, ScrollView} from 'react-native'; //add Text, ScrollView
import {launchImageLibrary} from 'react-native-image-picker';
import {MyTextInput, MyButton} from '../components/MyCustomComponent';
import {appStyles as styles} from '../styles/AppStyles';

// Mock function for database - replace with your actual DB call
// import { saveNoteToDB, getFoldersFromDB } from '../services/DatabaseOperation';

const AddNoteScreen = ({navigation}: any) => {

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('General'); // Selected folder
  const [folder, setFolder] = useState<string[]>(['General']); // Default state
  const [image, setImage] = useState<string | null>(null);

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

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, (res: any) => {
      if (res.assets) setImage(res.assets[0].uri || null);
    });
  };

  const save = () => {
    const newNote = {
      title,
      content,
      folder: selectedFolder,
      image,
      date: new Date().toLocaleString(),
    };

    // Add console log 
    console.log('Saving Note:', newNote);
    // saveNoteToDB(newNote); // Call your save function here

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
      
      <Text style={{marginTop: 10, fontWeight: 'bold'}}>Folder Organization</Text>
      <View style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginVertical: 5}}>
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

      <View style={{flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10}}>
        <MyButton title="Study Template" onPress={() => setContent(templates.study)} />
        <MyButton title="Meeting Template" onPress={() => setContent(templates.meeting)} />
      </View>

      <MyButton title="Insert Image" onPress={pickImage} />

      {image && (
        <Image 
          source={{uri: image}} 
          style={{width: 150, height: 150, alignSelf: 'center', marginVertical: 10, borderRadius: 10}} 
        />
      )}

      <View style={{marginTop: 20}}>
        <MyButton title="Save Note" onPress={save} />
      </View>
    </ScrollView>
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