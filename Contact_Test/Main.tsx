import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { DrawerNavigationState, NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { ContactAppType } from "./Type";
import ContactListScreen from "./ContactsListScreen";
import AddContactScreen from "./AddContactScreen";
import ContactDetailsScreen from "./ContactDetailsScreen";

const Drawer = createDrawerNavigator<ContactAppType>();

const ContactApp = ()=>
{
    return(

        <NavigationContainer>
            <Drawer.Navigator>
                <Drawer.Screen
                    name = "ContactListScreen"
                    component = {ContactListScreen}>

                    </Drawer.Screen>

                <Drawer.Screen
                    name = "AddContactScreen"
                    component = {AddContactScreen}>

                    </Drawer.Screen>

                <Drawer.Screen
                    name = "ContactDetailsScreen"
                    component = {ContactDetailsScreen}>

                    </Drawer.Screen>
            </Drawer.Navigator>
        </NavigationContainer>
        
    )
}

export default ContactApp;