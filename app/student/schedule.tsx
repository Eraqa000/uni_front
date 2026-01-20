import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, SafeAreaView } from 'react-native';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext'; // Используем твой реальный контекст
import { Ionicons } from '@expo/vector-icons';

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
// Соответствие индекса массива (0-5) дням в твоей БД (1-6)
const dayIndexToDbDay = [1, 2, 3, 4, 5, 6];

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Вычисляем текущий день (0 для Пн, 5 для Сб). Воскресенье (6) сбрасываем на Понедельник (0)
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(todayIndex < 6 ? todayIndex : 0);

  useEffect(() => {
    const fetchSchedule = async () => {
      // 1. Егер пайдаланушы жүктелмесе, тоқтаймыз
      if (!user) return;

      setLoading(true);
      try {
        // 2. Біз login-де group_id-ді сақтадық, соны қолданамыз
        // Ескерту: Егер контекстте әлі жоқ болса, api-ден userData-ны қайта оқуға болады
        let groupId = user.group_id;

        // 3. Егер group_id сақталмаған болса ғана профильге сұраныс жібереміз (резервтік жол)
        if (!groupId) {
          const profile = await api.getStudentProfile(user.id);
          groupId = profile.groups?.id;
        }

        if (groupId) {
          const data = await api.getSchedule(groupId);
          setSchedule(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки расписания:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  // Фильтруем расписание локально при смене дня
  const dailySchedule = useMemo(() => {
    const dbDay = dayIndexToDbDay[selectedDay];
    return schedule.filter(item => item.day_of_week === dbDay);
  }, [selectedDay, schedule]);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{item.time.split(' - ')[0]}</Text>
        <Text style={styles.timeEndText}>{item.time.split(' - ')[1]}</Text>
        <View style={styles.pairBadge}>
            <Text style={styles.pairText}>{item.pair} пара</Text>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.subjectText}>{item.subject}</Text>
        <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#8E8E93" />
          <Text style={styles.detailText}>{item.teacher}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color="#007AFF" />
          <Text style={[styles.detailText, {color: '#007AFF', fontWeight: '600'}]}>
            Аудитория {item.room}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Расписание</Text>
      
      <View style={styles.daySwitcher}>
        {WEEK_DAYS.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayButton, selectedDay === index && styles.activeDayButton]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[styles.dayLabel, selectedDay === index && styles.activeDayLabel]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={dailySchedule}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="cafe-outline" size={64} color="#1C1C1E" />
              <Text style={styles.emptyText}>На этот день занятий нет</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#FFF', paddingHorizontal: 20, marginVertical: 10 },
  daySwitcher: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginBottom: 20 
  },
  dayButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  activeDayButton: { backgroundColor: '#007AFF' },
  dayLabel: { color: '#8E8E93', fontSize: 16, fontWeight: '600' },
  activeDayLabel: { color: '#FFF' },
  list: { paddingHorizontal: 20 },
  card: { 
    backgroundColor: '#1C1C1E', 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: 'row', 
    marginBottom: 12 
  },
  timeContainer: { 
    width: 80, 
    borderRightWidth: 1, 
    borderRightColor: '#2C2C2E', 
    marginRight: 16,
    justifyContent: 'center'
  },
  timeText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  timeEndText: { color: '#8E8E93', fontSize: 13 },
  pairBadge: { backgroundColor: '#2C2C2E', alignSelf: 'flex-start', padding: 4, borderRadius: 5, marginTop: 8 },
  pairText: { color: '#007AFF', fontSize: 10, fontWeight: 'bold' },
  infoContainer: { flex: 1 },
  subjectText: { color: '#FFF', fontSize: 17, fontWeight: '600', marginBottom: 4 },
  typeText: { color: '#007AFF', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailText: { color: '#8E8E93', fontSize: 14, marginLeft: 6 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: '#8E8E93', fontSize: 16, marginTop: 10 }
});