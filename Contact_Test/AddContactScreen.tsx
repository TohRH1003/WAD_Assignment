import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import { ContactAppType } from "./Type";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";

export type Props = DrawerNavigationProp<ContactAppType, "AddContactScreen">

const AddContactScreen = () => {
    const [newContactName, setNewContactName] = useState("");
    const [newContactNumber, setNewContactNumber] = useState("");
    
    // Type the navigation hook properly
    const navigation = useNavigation<DrawerNavigationProp<ContactAppType>>();

    const handleAddContact = () => {
        // Validate inputs
        if (!newContactName.trim() || !newContactNumber.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        
        // Navigate with the contact data
        navigation.navigate("ContactListScreen", {
            contact: {
                name: newContactName.trim(),
                number: newContactNumber.trim()
            }
        });
        
        // Optional: Clear the form
        setNewContactName("");
        setNewContactNumber("");
    };
    
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Add new contact</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Enter name"
                value={newContactName}
                onChangeText={setNewContactName}
            />

            <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={newContactNumber}
                onChangeText={setNewContactNumber}
                keyboardType="phone-pad"
                maxLength={15}
            />

            <View style={styles.spacer} />

            <Button
                title="Add Contact"
                onPress={handleAddContact}  // Fixed: removed the arrow function wrapper
            />
        </View> 
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#97f6ff",
        flex: 1,
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    input: {
        backgroundColor: "#86a3a5",
        fontSize: 20,
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        color: 'white'
    },
    spacer: {
        height: 50
    }
});

export default AddContactScreen;