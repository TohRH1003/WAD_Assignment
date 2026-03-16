import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { ContactAppType } from "./Type";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

export type Props = DrawerNavigationProp<ContactAppType, "ContactDetailsScreen">

const ContactDetailsScreen = ({ route }: any) => 
{
    const {contact} = route.params;
    
    return(
        <View style = {{backgroundColor:"#97f6ff"}}>
            <Text>Contact Details</Text>
            <Text style = {{fontSize:20}}>{contact.name}</Text>
            <Text style = {{fontSize:20}}>{contact.number}</Text>
            <Text>This guy is a sohai and will not do anything !</Text>
        </View> 
    )
}

export default ContactDetailsScreen;