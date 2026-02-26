import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Journal() {
  const { user } = useAuth();
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.id) loadMarks();
  }, [user]);

  const loadMarks = async () => {
    try {
      const data = await api.getStudentMarks(user!.id);
      setMarks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMarks();
  };

  if (loading) return <View style={styles.darkLoader}><ActivityIndicator color="#007AFF" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Журнал</Text>
        <Text style={styles.semesterText}>Осенний семестр 2025</Text>
      </View>
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />}
      >
        {marks.length === 0 ? (
          <Text style={styles.emptyText}>Предметы еще не назначены</Text>
        ) : (
          marks.map((item) => (
            <TouchableOpacity 
            
              key={item.subject_id} 
              style={styles.card} 
              activeOpacity={0.8}
              onPress={() => {
                console.log("Таңдалған пән ID-і:", item.subject_id); // Терминалдан тексер
  
                if (!item.subject_id) {
                  Alert.alert("Қате", "Пәннің идентификаторы табылмады");
                  return;
                }
                router.push({
                pathname: "/student/subject-details",
                params: { 
                  subjectId: item.subject_id, 
                  subjectName: item.subject_name,
                  studentId: user?.id 
                }
              })}}
            >
              <View style={styles.cardContent}>
                <Text style={styles.subjectName}>{item.subject_name}</Text>
                <View style={styles.marksRow}>
                  <View style={styles.markBadge}>
                    <Text style={styles.markLabel}>РК 1</Text>
                    <Text style={[styles.markValue, item.rk1_total > 0 ? styles.activeMark : styles.zeroMark]}>
                      {item.rk1_total || 0}
                    </Text>
                  </View>
                  <View style={styles.markBadge}>
                    <Text style={styles.markLabel}>РК 2</Text>
                    <Text style={[styles.markValue, item.rk2_total > 0 ? styles.activeMark : styles.zeroMark]}>
                      {item.rk2_total || 0}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#48484A" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  darkLoader: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
  headerTitle: { fontSize: 34, fontWeight: 'bold', color: '#FFF' },
  semesterText: { color: '#007AFF', fontSize: 16, fontWeight: '500', marginTop: 4 },
  container: { flex: 1, paddingHorizontal: 16 },
  card: { 
    backgroundColor: '#1C1C1E', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center'
  },
  cardContent: { flex: 1 },
  subjectName: { color: '#FFF', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  marksRow: { flexDirection: 'row' },
  markBadge: { 
    backgroundColor: '#2C2C2E', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    marginRight: 10,
    alignItems: 'center',
    minWidth: 60
  },
  markLabel: { color: '#8E8E93', fontSize: 10, fontWeight: 'bold', marginBottom: 2, textTransform: 'uppercase' },
  markValue: { fontSize: 16, fontWeight: '700' },
  activeMark: { color: '#34C759' }, // Зеленый, если есть баллы
  zeroMark: { color: '#8E8E93' },    // Серый, если 0
  emptyText: { color: '#8E8E93', textAlign: 'center', marginTop: 50, fontSize: 16 }
});