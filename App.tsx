import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, FlatList} from 'react-native';
import {
  ReadUserData,
} from './DatabaseOperation/RetrieveData';
import {InsertUser, initializeDatabase} from './DatabaseOperation/InsertValue';

//Just for testing purpose
const Test = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    initializeDatabase;
    loadUsers();
  }, []);

  const loadUsers = () => {
    ReadUserData('John') // Pass empty string to get all users
      .then(data => setUsers(data))
      .catch(error => console.log('Load error:', error));
  };

  const handleAddUser = () => {
    if (!username || !password || !name || !email) {
      alert('All fields are required');
      return;
    }

    InsertUser(username, password, name, email);
    alert('User added successfully');

    // Clear form and refresh list
    setUsername('');
    setPassword('');
    setName('');
    setEmail('');
    loadUsers(); // Refresh the user list
  };

  return (
    <View style={{padding: 20, flex: 1}}>
      <Text style={{fontSize: 20, marginBottom: 10}}>Add User</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{borderWidth: 1, marginBottom: 10, padding: 8}}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{borderWidth: 1, marginBottom: 10, padding: 8}}
      />
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{borderWidth: 1, marginBottom: 10, padding: 8}}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{borderWidth: 1, marginBottom: 10, padding: 8}}
      />
      <Button title="Add User" onPress={handleAddUser} />

      <Text style={{fontSize: 20, marginTop: 20, marginBottom: 10}}>
        Users List
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <View style={{padding: 10, borderBottomWidth: 1}}>
            <Text>Username: {item.username}</Text>
            <Text>Name: {item.name}</Text>
            <Text>Email: {item.email}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default Test;
