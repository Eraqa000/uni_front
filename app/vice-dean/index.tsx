import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function ViceDeanDashboard() {
  const [stats, setStats] = useState({ students: 0, groups: 0, teachers: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await api.getAdminFacultyStats();
    if (data) setStats(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6200EE" />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Обзор Факультета</Text>
        <Text style={styles.headerSubtitle}>Весенний семестр 2026</Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.card, { borderLeftColor: '#6200EE', borderLeftWidth: 4 }]}>
          <Ionicons name="people" size={20} color="#6200EE" />
          <Text style={styles.cardNum}>{stats.students}</Text>
          <Text style={styles.cardLabel}>Студентов</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#007AFF', borderLeftWidth: 4 }]}>
          <Ionicons name="layers" size={20} color="#007AFF" />
          <Text style={styles.cardNum}>{stats.groups}</Text>
          <Text style={styles.cardLabel}>Групп</Text>
        </View>

        <View style={[styles.card, { borderLeftColor: '#FF9500', borderLeftWidth: 4 }]}>
          <Ionicons name="school" size={20} color="#FF9500" />
          <Text style={styles.cardNum}>{stats.teachers}</Text>
          <Text style={styles.cardLabel}>Преподавателей</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Системный статус</Text>
        <Text style={styles.infoText}>Все системы работают штатно. Данные синхронизированы с Базой данных.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 25, backgroundColor: '#6200EE', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  headerSubtitle: { color: '#E0E0E0', fontSize: 14, marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 15, justifyContent: 'space-between' },
  card: { backgroundColor: '#FFF', width: '48%', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  cardNum: { fontSize: 24, fontWeight: 'bold', color: '#1C1C1E', marginVertical: 5 },
  cardLabel: { fontSize: 13, color: '#8E8E93' },
  infoBox: { margin: 15, padding: 20, backgroundColor: '#FFF', borderRadius: 15 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E', marginBottom: 5 },
  infoText: { fontSize: 14, color: '#666' }
});