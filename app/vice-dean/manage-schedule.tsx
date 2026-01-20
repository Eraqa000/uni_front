import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert, SectionList, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function ManageSchedule() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const dayNames = ["", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

  const getSections = (data: any[]) => {
    const sections: { [key: number]: any[] } = {};
    
    data.forEach(item => {
      if (!sections[item.day_of_week]) {
        sections[item.day_of_week] = [];
      }
      sections[item.day_of_week].push(item);
    });

    return Object.keys(sections).map(day => ({
      title: dayNames[parseInt(day)],
      data: sections[parseInt(day)].sort((a, b) => a.pair - b.pair),
    })).sort((a, b) => dayNames.indexOf(a.title) - dayNames.indexOf(b.title));
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const data = await api.getGroups();
      if (data) setGroups(data);
    };
    fetchGroups();
  }, []);

  const handleGroupSelect = async (groupId: string) => {
    setLoading(true);
    setSelectedGroup(groupId);
    try {
      const data = await api.getSchedule(groupId);
      setSchedule(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (scheduleId: string) => {
    Alert.alert(
      "Удаление",
      "Вы уверены, что хотите удалить это занятие из расписания?",
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: "Удалить", 
          style: "destructive", 
          onPress: async () => {
            const success = await api.deleteScheduleItem(scheduleId);
            if (success && selectedGroup) {
              handleGroupSelect(selectedGroup);
            }
          } 
        }
      ]
    );
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const response = await api.generateSchedule();
      Alert.alert('Успех', response.message);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Произошла неизвестная ошибка';
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const scheduleSections = getSections(schedule);

  return (
    <View style={styles.container}>
      <Modal
        transparent={true}
        animationType="none"
        visible={isGenerating}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={styles.modalText}>Идет генерация расписания...</Text>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.actionsHeader}>
          <Text style={styles.label}>Управление расписанием</Text>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={handleGenerateSchedule}
            disabled={isGenerating}
          >
            <Ionicons name="cog" size={20} color="#FFF" />
            <Text style={styles.generateButtonText}>Сгенерировать</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.label}>Выберите группу:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.groupList}>
          {groups.map((group) => (
            <TouchableOpacity 
              key={group.id} 
              onPress={() => handleGroupSelect(group.id)}
              style={[styles.groupCard, selectedGroup === group.id && styles.selectedGroupCard]}
            >
              <Text style={[styles.groupName, selectedGroup === group.id && styles.selectedGroupName]}>
                {group.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6200EE" style={{ marginTop: 50 }} />
      ) : (
        <SectionList
          sections={scheduleSections}
          keyExtractor={(item, index) => item.id ? item.id.toString() : `lesson-${index}`}
          stickySectionHeadersEnabled={true}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.timeBox}>
                <Text style={styles.timeText}>{item.time.split(' - ')[0]}</Text>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'Лекция' ? '#E1F5FE' : '#F3E5F5' }]}>
                  <Text style={{ color: item.type === 'Лекция' ? '#0288D1' : '#7B1FA2', fontSize: 10, fontWeight: 'bold' }}>
                    {item.type === 'Лекция' ? 'ЛЕК' : 'ПР'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.subjectText}>{item.subject}</Text>
                <Text style={styles.teacherText}>{item.teacher}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color="#6200EE" />
                  <Text style={styles.roomText}>Аудитория {item.room}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {selectedGroup ? 'На этой неделе занятий нет' : 'Выберите группу из списка выше'}
            </Text>
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/vice-dean/create-lesson')}
      >
        <Ionicons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}
      


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#FFF', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  actionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  generateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6200EE', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  generateButtonText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  label: { fontSize: 14, color: '#8E8E93', marginBottom: 10 },
  groupList: { paddingLeft: 20 },
  groupCard: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F2F2F7', marginRight: 10, borderWidth: 1, borderColor: '#E5E5EA' },
  selectedGroupCard: { backgroundColor: '#6200EE', borderColor: '#6200EE' },
  groupName: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  selectedGroupName: { color: '#FFF' },
  listContent: { padding: 20, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  timeBox: { alignItems: 'center', width: 60, borderRightWidth: 1, borderRightColor: '#F2F2F7', paddingRight: 10 },
  timeText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  typeBadge: { marginTop: 5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  infoBox: { flex: 1, paddingLeft: 15 },
  subjectText: { fontSize: 16, fontWeight: 'bold', color: '#1C1C1E' },
  teacherText: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  roomText: { fontSize: 12, color: '#6200EE', marginLeft: 4, fontWeight: '600' },
  deleteBtn: { padding: 10 },
  fab: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#6200EE', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#6200EE', shadowOpacity: 0.3, shadowRadius: 10 },
  emptyText: { textAlign: 'center', color: '#8E8E93', marginTop: 100, fontSize: 16 },
  dayHeader: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 100,
    width: 250,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  modalText: {
    color: '#333',
    marginTop: 10
  }
});