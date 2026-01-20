import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TeacherDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const menuItems = [
    { title: 'Кесте', icon: 'calendar', color: '#6200EE', path: '/teacher/my-schedule' },
    { title: 'Журнал (Балл)', icon: 'journal', color: '#FF9500', path: '/teacher/grades' },
    { title: 'Студенттер', icon: 'people', color: '#34C759', path: '/teacher/students' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Қайырлы күн,</Text>
          <Text style={styles.name}>{user?.full_name}</Text>
          <Text style={styles.role}>{user?.role}</Text>

        </View>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Бүгінгі сабақ</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>75</Text>
          <Text style={styles.statLabel}>Студенттер</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Мәзір</Text>
      <View style={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuCard}
            onPress={() => router.push(item.path as any)}
          >
            <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={30} color={item.color} />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 25, paddingTop: 60, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcome: { fontSize: 16, color: '#8E8E93' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E' },
  role: { fontSize: 14, color: '#8E8E93' },
  statsRow: { flexDirection: 'row', padding: 20, gap: 15 },
  statCard: { flex: 1, backgroundColor: '#6200EE', padding: 20, borderRadius: 20, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  statLabel: { fontSize: 12, color: '#E0E0E0', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 25, marginTop: 10 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-between' },
  menuCard: { width: '47%', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 15, alignItems: 'center', elevation: 3 },
  iconCircle: { padding: 15, borderRadius: 25, marginBottom: 10 },
  menuText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' }
});