import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform } from 'react-native';
import { api } from '../../lib/api';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext'; // Используем твой контекст
import { Ionicons } from '@expo/vector-icons';

export default function StudentProfile() {
  const { user, logout } = useAuth(); // Получаем данные и функцию выхода из контекста
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      // Запрашиваем данные профиля через API
      const data = await api.getStudentProfile(user!.id); 
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <View style={styles.darkLoader}><ActivityIndicator color="#007AFF" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Анкета студента</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={26} color="#FF453A" />
          </TouchableOpacity>
        </View>

        <View style={styles.photoSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
              style={styles.avatar} 
            />
          </View>
          <Text style={styles.fullName}>{profile?.full_name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoItem icon="business" label="Факультет" value={profile?.groups?.programs?.departments?.name} />
          <InfoItem icon="school" label="Специальность" value={profile?.groups?.programs?.name} />
          <InfoItem icon="people" label="Группа" value={profile?.groups?.name} />
          <InfoItem icon="layers" label="Курс обучения" value={profile?.groups ? `${profile.groups.course_number} курс` : '—'} />
          <InfoItem 
            icon="wallet" 
            label="Форма оплаты" 
            value={profile?.is_grantee ? "Образовательный грант" : "Платное отделение"}
            valueColor={profile?.is_grantee ? "#32D74B" : "#FF9F0A"} 
          />
        </View>
        <TouchableOpacity 
                  style={styles.button} 
                  onPress={() => router.push('/student/analysis')}
                >
                  <View style={styles.buttonInner}>
                    <Ionicons name="person-add-outline" size={20} color="#FFF" />
                    <Text style={styles.buttonText}>Анализировать</Text>
                  </View>
                </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoItem = ({ icon, label, value, valueColor = "#FFF" }: any) => (
  <View style={styles.infoRow}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={22} color="#007AFF" />
    </View>
    <View style={styles.textColumn}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor }]}>{value || '—'}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' }, // Черный фон как в Журнале
  darkLoader: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  photoSection: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  imageContainer: { position: 'relative' },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#1C1C1E' },
  fullName: { fontSize: 22, fontWeight: 'bold', marginTop: 15, color: '#FFF' },
  email: { fontSize: 14, color: '#8E8E93', marginTop: 5 },
  infoCard: { 
    backgroundColor: '#1C1C1E', // Темно-серые карточки
    marginHorizontal: 16, 
    borderRadius: 20, 
    padding: 20,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, backgroundColor: '#2C2C2E', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  textColumn: { marginLeft: 15, flex: 1 },
  infoLabel: { fontSize: 11, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.8 },
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
  },
  infoValue: { fontSize: 16, fontWeight: '600', marginTop: 3 }
});