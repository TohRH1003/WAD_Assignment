import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    ActivityIndicator,
    Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { appStyles as styles } from '../styles/AppStyles';
import { MyButton } from '../components/MyCustomComponent';

// Import the database operations
import {
    ReadUserFolders,
    CreateNewFolder,
    SoftDeleteFolder,
} from '../DatabaseOperation/RetrieveData';

import { UpdateFolderName } from '../DatabaseOperation/UpdateFolder';
import { UpdateNoteFolder } from '../DatabaseOperation/UpdateFolder';

const FolderListScreen = ({ navigation, route }: any) => {
    const { username } = route.params;

    // State management
    const [folders, setFolders] = useState<any[]>([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- NEW MODAL STATES ---
    const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
    const [folderToRename, setFolderToRename] = useState<any>(null);
    const [renameValue, setRenameValue] = useState('');

    // 1. Fetch folders from the SQLite database
    const loadFolders = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await ReadUserFolders(username);
            setFolders(data);
        } catch (error: any) {
            console.log('Load folders error:', error.message);
            Alert.alert('Error', 'Unable to load folders.');
        } finally {
            setIsLoading(false);
        }
    }, [username]);

    // Refresh list whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadFolders();
        }, [loadFolders]),
    );

    // 2. Handle creating a new folder
    const handleAddFolder = async () => {
        const trimmedName = newFolderName.trim();
        if (!trimmedName) {
            Alert.alert('Required', 'Please enter a folder name.');
            return;
        }

        try {
            await CreateNewFolder(username, trimmedName);
            setNewFolderName('');
            loadFolders(); // Refresh list
            Alert.alert('Success', `Folder "${trimmedName}" created.`);
        } catch (error: any) {
            Alert.alert("System Error", error.message);
            console.log("FULL ERROR:", error);
        }
    };

    // 3. Handle deleting a folder (Soft Delete)
    const handleDeletePress = (folder: any) => {
        Alert.alert(
            'Delete Folder',
            `Are you sure you want to delete "${folder.folder_name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SoftDeleteFolder(folder.folder_id);
                            loadFolders(); // Refresh list
                        } catch (error: any) {
                            Alert.alert('Error', 'Unable to delete folder.');
                        }
                    },
                },
            ],
        );
    };

    const UpdateFolderName = (folderId: number, currentName: string) => {
        Alert.prompt(
            "Rename Folder",
            "Enter a new name for this folder:",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Save",
                    onPress: async (newName) => {
                        if (newName && newName.trim() !== "") {
                            try {
                                await UpdateFolderName(folderId, newName.trim());
                                // Refresh your folder list here
                                loadFolders();
                                Alert.alert("Success", "Folder renamed successfully.");
                            } catch (error) {
                                Alert.alert("Error", "Could not rename folder.");
                            }
                        }
                    }
                }
            ],
            "plain-text",
            currentName
        );
    };

    const handleRenamePress = (folder: any) => {
        setFolderToRename(folder);
        setRenameValue(folder.folder_name); // Pre-fill with current name
        setIsRenameModalVisible(true);
    };

    const saveRename = async () => {
        if (!renameValue.trim()) return;
        try {
            // 1. Wait for the DB to finish updating
            await UpdateFolderName(folderToRename.folder_id, renameValue.trim());

            // 2. Close the modal
            setIsRenameModalVisible(false);

            // 3. CRITICAL: Force the UI to fetch fresh data from SQLite
            await loadFolders();

            Alert.alert("Success", "Folder renamed successfully.");
        } catch (error) {
            Alert.alert("Error", "Could not rename folder.");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.pageHeaderRow}>
                    <View style={styles.pageHeaderTextWrap}>
                        <Text style={styles.title}>Manage Folders</Text>
                        <Text style={styles.subtitle}>Organizing for {username}</Text>
                    </View>
                    <MyButton
                        title="Back"
                        variant="header"
                        onPress={() => navigation.goBack()}
                    />
                </View>

                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Create New Folder</Text>
                        <TextInput
                            style={[styles.input, { marginBottom: 12 }]}
                            placeholder="e.g. Study, Work, Personal..."
                            placeholderTextColor="#9ca3af"
                            value={newFolderName}
                            onChangeText={setNewFolderName}
                        />
                        <MyButton title="＋ Add Folder" onPress={handleAddFolder} />
                    </View>
                </View>

                <Text style={[styles.inputLabel, { marginLeft: 5, marginBottom: 5, marginTop: 5 }]}>
                    Existing Folders
                </Text>

                <View style={styles.card}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#3dc9f3" style={{ padding: 20 }} />
                    ) : folders.length === 0 ? (
                        <Text style={{ textAlign: 'center', color: '#9ca3af', padding: 20 }}>
                            No folders created yet.
                        </Text>
                    ) : (
                        folders.map((item, index) => (
                            <View
                                key={item.folder_id.toString()}
                                style={[
                                    {
                                        paddingVertical: 15,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    },
                                    index !== folders.length - 1 && {
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#f3f4f6',
                                    },
                                ]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 20, marginRight: 12 }}>📁</Text>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: '#111827' }}>
                                        {item.folder_name}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => handleRenamePress(item)}
                                        style={{ backgroundColor: '#e0f7fd', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 10 }}
                                    >
                                        <Text style={{ color: '#3dc9f3', fontWeight: '700', fontSize: 12 }}>RENAME</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => handleDeletePress(item)}>
                                        <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 12 }}>DELETE</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                <MyButton
                    title="Return to Notes"
                    variant="secondary"
                    onPress={() => navigation.navigate('NoteList', { username })}
                />
            </ScrollView>

            {/* RENAME MODAL POP-UP */}
            <Modal
                visible={isRenameModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ width: '85%', backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 10 }}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 5 }}>Rename Folder</Text>
                        <Text style={{ color: '#6b7280', marginBottom: 20 }}>Enter new name for "{folderToRename?.folder_name}"</Text>

                        <TextInput
                            style={[styles.input, { borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 25 }]}
                            value={renameValue}
                            onChangeText={setRenameValue}
                            autoFocus={true}
                        />

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <TouchableOpacity onPress={() => setIsRenameModalVisible(false)} style={{ marginRight: 25, paddingVertical: 10 }}>
                                <Text style={{ color: '#6b7280', fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={saveRename} style={{ backgroundColor: '#3dc9f3', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
                                <Text style={{ color: 'white', fontWeight: '700' }}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default FolderListScreen;