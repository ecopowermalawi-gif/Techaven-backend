import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // You can add authentication logic here
    router.replace('/Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => router.push('/auth/Register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontFamily: 'Proxima Nova', fontWeight: '400', fontSize: 24, marginBottom: 20 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 15 },
});
