import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext'; // Контекстті қостық
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Роутер қостық

export default function TeacherSchedule() {
  const { user } = useAuth(); // Қолданушы мәліметтерін алдық
  const router = useRouter();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dayNames = ["", "Дүйсенбі", "Сейсенбі", "Сәрсенбі", "Бейсенбі", "Жұма", "Сенбі", "Жексенбі"];

  useEffect(() => {
    if (user?.id) {
      fetchTeacherSchedule();
    }
  }, [user]);

  const fetchTeacherSchedule = async () => {
    try {
      // ҚАТЕ ТҮЗЕТІЛДІ: user.id параметрі жіберілді
      const data = await api.getTeacherSchedule(user!.id); 
      setSchedule(data || []);
    } catch (error) {
      console.error("Кесте жүктеу қатесі:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSections = (data: any[]) => {
    const sections: { [key: number]: any[] } = {};
    data.forEach(item => {
      if (!sections[item.day_of_week]) sections[item.day_of_week] = [];
      sections[item.day_of_week].push(item);
    });

    return Object.keys(sections).map(day => ({
      title: dayNames[parseInt(day)],
      data: sections[parseInt(day)].sort((a, b) => a.pair - b.pair),
      dayNum: parseInt(day) // Сұрыптау үшін сан түрінде сақтаймыз
    })).sort((a, b) => a.dayNum - b.dayNum); // Күндерді 1, 2, 3... ретімен қояды
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      // ҚАТЕ ТҮЗЕТІЛДІ: Attendance бетіне бағыттау қосылды
      onPress={() => router.push({
        pathname: '/teacher/mark-attendance',
        params: { 
          scheduleId: item.id, 
          subjectId: item.subject_id, 
          subjectName: item.subject 
        }
      })}
    >
      <View style={styles.timeBox}>
        <Text style={styles.timeText}>{item.time.split(' - ')[0]}</Text>
        <View style={[styles.typeBadge, { backgroundColor: item.is_lecture ? '#E3F2FD' : '#F3E5F5' }]}>
          <Text style={[styles.typeText, { color: item.is_lecture ? '#1976D2' : '#7B1FA2' }]}>
            {item.is_lecture ? 'ЛЕК' : 'ПР'}
          </Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <Text style={styles.groupText}>
          Топ: {item.groups && item.groups.length > 0 
                ? item.groups.map((g: any) => g.name).join(', ') 
                : 'Топ белгісіз'}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#6200EE" />
          <Text style={styles.roomText}>{item.room} аудитория</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#6200EE" />
      <Text style={styles.loadingText}>Кесте жүктелуде...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Менің кестем</Text>
      <SectionList
        sections={getSections(schedule)}
        keyExtractor={(item) => item.id.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>Сабақтар табылмады</Text>}
        stickySectionHeadersEnabled={true} // Тақырыптардың жабысып тұруы үшін
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (сенің стилдерің)
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#8E8E93' },
  // Қалған стилдерді сол қалпында қалдыруға болады
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', padding: 20, color: '#1C1C1E' },
  sectionHeader: { backgroundColor: '#F2F2F7', paddingVertical: 8, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#8E8E93', textTransform: 'uppercase' },
  listContent: { paddingBottom: 20 },
  card: { backgroundColor: '#FFF', marginHorizontal: 20, marginTop: 12, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  timeBox: { alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F2F2F7', paddingRight: 12, width: 65 },
  timeText: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  typeBadge: { marginTop: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '800' },
  infoBox: { flex: 1, paddingLeft: 15 },
  subjectText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  groupText: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  roomText: { fontSize: 13, color: '#6200EE', marginLeft: 4, fontWeight: '500' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#8E8E93' }
});