import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { ContactAppType } from "./Type";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

export type Props = DrawerNavigationProp<ContactAppType, "ContactListScreen">

const ContactListScreen = ({ route }: any) => {
    // Initialize with sample contacts
    const [list, setList] = useState([
        { id: 1, name: "Sohai", number: "01241626236" },
        { id: 2, name: "Ali", number: "01241626236" },
        { id: 3, name: "Ahmed", number: "01241626236" },
    ]);
    
    // Type the navigation hook
    const navigation = useNavigation<DrawerNavigationProp<ContactAppType>>();

    // Use useEffect to handle new contacts from route params
    useEffect(() => {
        // Check if there's a contact in route.params
        if (route.params?.contact) {
            const newContact = route.params.contact;
            
            // Generate a new ID for the contact
            const newId = list.length > 0 ? Math.max(...list.map(c => c.id)) + 1 : 4;
            
            // Add the new contact to the list
            setList(prevList => [
                ...prevList,
                {
                    id: newId,
                    name: newContact.name,
                    number: newContact.number
                }
            ]);
        }
    }, [route.params?.contact]); // Only run when route.params.contact changes

    const viewContactDetails = (info: any) => {
        navigation.navigate("ContactDetailsScreen", { contact: info });
    }

    return (
        <ScrollView>
            <View style={{ backgroundColor: "#97f6ff" }}>
                {list.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => viewContactDetails(item)}
                        style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}
                    >
                        <View>
                            <Text style={{ fontSize: 20 }}>{item.name}</Text>
                            <Text style={{ fontSize: 20 }}>{item.number}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

export default ContactListScreen;