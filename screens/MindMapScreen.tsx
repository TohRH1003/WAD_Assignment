import React from 'react';
import { ScrollView, Text, View, StyleSheet} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../AppStackTypes';
import { appStyles as styles } from '../styles/AppStyles';
import {useContext} from 'react';
import {NoteContext} from '../context/NoteContext';

const {notes, addNote, deleteNote, isLoading, error} =
  useContext(NoteContext);

const MindMapScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'MindMap'>>();
    const { content } = route.params;
    
    // Split content and remove empty lines
    const lines = content.split('\n').filter(line => line.trim() !== ' ');

    return(
        <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}>
            <View style = {styles.noteScreenHeader}>
                <View>
                    <Text style={styles.title}>Mind Map</Text>
                    <Text style={styles.subtitle}>Thought Visualization</Text>
                </View>
            </View>
            <View style = {styles.card}>
                {lines.map((line, index) => (
                    <View
                    key={index}
                    style={[customStyles.nodeRow, {marginLeft: index * 15}]}
                    >
                        <View style={customStyles.dot}/>
                        <Text style={styles.noteItemTitle}>{line}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const customStyles = StyleSheet.create({
    nodeRow:{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: '#d1d5db',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3dc9f3',
        marginRight: 10,
    },
});

export default MindMapScreen;

/**
 * import React from 'react';
import {View, Text} from 'react-native';
import {appStyles as styles} from '../styles/AppStyles';

const MindMapScreen = ({route}: any) => {
  const {content} = route.params;
  const lines = content.split('\n');

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Mind Map</Text>

      {lines.map((line: string, i: number) => (
        <Text key={i} style={{marginLeft: i * 10}}>
          • {line}
        </Text>
      ))}
    </View>
  );
};

export default MindMapScreen;
 */