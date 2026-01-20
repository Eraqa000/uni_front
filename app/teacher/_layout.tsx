import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext'; // Импортируем контекст

export default function TeacherLayout() {
  const { logout } = useAuth();
  const router = useRouter();

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
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6200EE',
        tabBarStyle: { backgroundColor: '#FFFFFF', height: 60 },
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#FFF',
        // Добавляем кнопку выхода в правый угол заголовка
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Дашборд',
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-schedule"
        options={{
          title: 'Расписание',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Аналитика',
          tabBarIcon: ({ color }) => <Ionicons name="pie-chart-outline" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mark-attendance"
        options={{
          title: 'Добавить занятие',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}