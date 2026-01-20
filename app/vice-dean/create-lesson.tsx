import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // Егер орнатылмаса: npx expo install @react-native-picker/picker

export default function CreateLesson() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Тізімдерге арналған state
  const [data, setData] = useState({
    subjects: [],
    teachers: [],
    rooms: [],
    groups: [],
    slots: []
  });

  const [form, setForm] = useState({
    subject_id: '',
    teacher_id: '',
    room_id: '',
    group_id: '',
    day_of_week: 1,
    time_slot_id: '',
    is_lecture: true
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    // Бұл жерде бэкендтен барлық қажетті деректерді алу керек
    // api.ts-те бұл үшін жалпы fetch функцияларын қосу керек болады
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.subject_id || !form.room_id || !form.group_id || !form.time_slot_id) {
      Alert.alert("Қате", "Барлық өрістерді толтырыңыз");
      return;
    }

    try {
      // Аудиторияның бостығын тексеру
      const isAvailable = await api.checkRoomAvailability(form.room_id, form.day_of_week, form.time_slot_id);
      if (!isAvailable) {
        Alert.alert("Конфликт", "Бұл аудитория таңдалған уақытта бос емес!");
        return;
      }

      const success = await api.createManualLesson(form);
      if (success) {
        Alert.alert("Сәтті", "Сабақ кестеге қосылды");
        router.back();
      }
    } catch (e: any) {
      Alert.alert("Қате", e.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#6200EE" style={{flex: 1}} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Жаңа сабақ қосу</Text>

      <Text style={styles.label}>Күн:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={form.day_of_week}
          onValueChange={(v) => setForm({...form, day_of_week: v})}>
          <Picker.Item label="Дүйсенбі" value={1} />
          <Picker.Item label="Сейсенбі" value={2} />
          <Picker.Item label="Сәрсенбі" value={3} />
          <Picker.Item label="Бейсенбі" value={4} />
          <Picker.Item label="Жұма" value={5} />
        </Picker>
      </View>

      {/* Осылайша қалған Picker-лерді (Subject, Teacher, Room, Slot) қосыңыз */}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Кестеге сақтау</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 5 },
  pickerContainer: { backgroundColor: '#F2F2F7', borderRadius: 10, marginBottom: 15 },
  saveBtn: { backgroundColor: '#6200EE', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' }
});