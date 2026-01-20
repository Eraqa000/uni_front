import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext'; // Используем ваш контекст
import { api } from '../../lib/api';
import { registerForPushNotificationsAsync } from '../../lib/notifications';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth(); // Извлекаем метод login из контекста

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Введите почту и пароль');
      return;
    }

    setLoading(true);
    try {
      // 1. Вызываем login через AuthContext. 
      // Это обновит стейт isAuthenticated внутри провайдера.
      const result = await login({ email, password });

      if (result && result.user) {
        // >>> РЕГИСТРАЦИЯ PUSH-ТОКЕНА <<<
        // Вызываем функцию регистрации, она сама отправит токен на бэкенд
        await registerForPushNotificationsAsync();
        // >>> КОНЕЦ РЕГИСТРАЦИИ <<<

        const rawRole = result.user.role || '';
        const role = rawRole.trim().toLowerCase();

        console.log("Жүйеге кіруші рөлі:", role); // Рөлді консольден тексеру үшін

        if (role === 'декан') {
            router.replace('/dean/dashboard');
        } 
        else if (role === 'заместитель декана') {
            router.replace('/vice-dean');
        } 
        // "преподаватель" сөзі бар кез келген рөлді (лектор немесе практик) бірден ұстау
        else if (role.includes('преподаватель')) {
            router.replace('/teacher');
        } else if (role === 'студент') {
            router.replace('/student');
        } else {
            // Егер рөл мүлдем белгісіз болса, қате туралы хабарлама берген дұрыс
            Alert.alert("Қате", "Рөл анықталмады: " + role);
            await api.logout();
        }
    }
    } catch (err: any) {
      console.error("Ошибка входа:", err.message);
      Alert.alert('Ошибка входа', err.message || 'Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Университет IT</Text>
          <Text style={styles.subtitle}>Авторизация в системе</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@univer.kz"
              placeholderTextColor="#999" 
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999" 
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={signInWithEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Войти</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  form: { 
    backgroundColor: '#FFF', 
    padding: 24, 
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12,
    elevation: 5 
  },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { 
    backgroundColor: '#F9F9F9', 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E1E4E8',
    fontSize: 16,
    color: '#1A1A1A'
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#A0CFFF' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});