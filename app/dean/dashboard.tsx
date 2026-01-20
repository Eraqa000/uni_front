import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

export default function DeanDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
  // На вебе подтверждение через стандартный confirm
    const confirmLogout = Platform.OS === 'web' 
      ? window.confirm("Вы уверены, что хотите выйти?")
      : true; // На мобилке логика ниже через Alert

    if (Platform.OS === 'web') {
      if (confirmLogout) {
        await logout();
        router.replace('/auth/login');
      }
      return;
    }

  // Для мобильных устройств
    Alert.alert('Выход', 'Вы уверены?', [
      { text: 'Отмена', style: 'cancel' },
      { 
        text: 'Выйти', 
        style: 'destructive', 
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        } 
      },
    ]);
  };

  return (
    // SafeAreaView автоматически обрабатывает вырезы на iPhone (челки)
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Панель Декана</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={26} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Ionicons name="person-circle-outline" size={50} color="#007AFF" style={{marginBottom: 10}} />
          <Text style={styles.welcome}>Қош келдіңіз, Серик Болатович</Text>
          <Text style={styles.subtitle}>Управление факультетом IT</Text>
        </View>
      
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/dean/add-student')}
        >
          <View style={styles.buttonInner}>
            <Ionicons name="person-add-outline" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Регистрация студента</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, {marginTop: 10, backgroundColor: '#34C759'}]} 
          onPress={() => router.push('/dean/add-staff')}
        >
          <View style={styles.buttonInner}>
            <Ionicons name="briefcase-outline" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Регистрация сотрудника</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15, // Уменьшили вертикальный отступ
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8'
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1A1A1A' 
  },
  logoutBtn: { 
    padding: 5 
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  card: { 
    backgroundColor: '#FFF', 
    padding: 25, 
    borderRadius: 20, 
    marginBottom: 20, 
    alignItems: 'center', 
    // Тень для iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Тень для Android
    elevation: 4 
  },
  welcome: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#333', 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 5 
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center' 
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    fontSize: 16,
    marginLeft: 10
  }
});