import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function SubjectDetails() {
  const { subjectId, subjectName, studentId } = useLocalSearchParams();
  const router = useRouter();
  const [weeklyMarks, setWeeklyMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Егер ID-лер болса ғана жүктеуді бастаймыз
    if (subjectId && studentId) {
        setLoading(true); // Жаңа пәнге өткенде лоадерді көрсету үшін
        loadWeeklyDetails();
    }
  }, [subjectId, studentId]); // <--- ОСЫ ЖЕРГЕ ТҮЗЕТУ ЕНГІЗ

  const loadWeeklyDetails = async () => {
    try {
      const data = await api.getSubjectWeeklyMarks(studentId as string, subjectId as string);
      setWeeklyMarks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View style={styles.darkLoader}><ActivityIndicator color="#007AFF" /></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/student/journal')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{subjectName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {weeklyMarks.length === 0 ? (
          <Text style={styles.emptyText}>Баллдар әлі қойылмаған</Text>
        ) : (
          weeklyMarks.map((week) => (
            <View key={week.week_number} style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <Text style={styles.weekTitle}>{week.week_number}-апта</Text>
                <Text style={styles.totalWeekMark}>
                  Жалпы: {(week.seminar_mark || 0) + (week.lecture_mark || 0) + (week.srs_mark || 0)}
                </Text>
              </View>
              
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Семинар</Text>
                  <Text style={styles.detailValue}>{week.seminar_mark || 0}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Лекция</Text>
                  <Text style={styles.detailValue}>{week.lecture_mark || 0}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>ӨЖЖ (СРС)</Text>
                  <Text style={styles.detailValue}>{week.srs_mark || 0}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  darkLoader: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', flex: 1 },
  scrollContent: { padding: 16 },
  weekCard: { backgroundColor: '#1C1C1E', borderRadius: 16, padding: 16, marginBottom: 15 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#2C2C2E', paddingBottom: 10, marginBottom: 12 },
  weekTitle: { color: '#007AFF', fontSize: 16, fontWeight: 'bold' },
  totalWeekMark: { color: '#34C759', fontWeight: 'bold' },
  detailsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { alignItems: 'center', flex: 1 },
  detailLabel: { color: '#8E8E93', fontSize: 10, marginBottom: 4, textTransform: 'uppercase' },
  detailValue: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  emptyText: { color: '#8E8E93', textAlign: 'center', marginTop: 50 }
});