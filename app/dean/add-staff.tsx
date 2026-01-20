import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';

export default function AddStaff() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    position_id: '',
    department_id: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
        const [depts, pos] = await Promise.all([
        api.getDepartments(),
        api.getPositions() // Теперь используем метод из api.ts
        ]);
        setDepartments(depts);
        setPositions(pos);
    } catch (err) {
        console.error(err);
    }
    };

  const handleCreate = async () => {
    if (!form.full_name || !form.email || !form.password || !form.position_id || !form.department_id) {
        Alert.alert("Внимание", "Пожалуйста, заполните все поля формы");
        return;
    }

    setLoading(true);
    try {
        // Используем наш API метод
        await api.createStaff(form);

        // Уведомление об успехе
        const successTitle = "Успех";
        const successMsg = "Сотрудник успешно зарегистрирован в системе";

        if (Platform.OS === 'web') {
        window.alert(`${successTitle}: ${successMsg}`);
        router.replace('/dean/dashboard'); // Используем replace вместо back для надежности на вебе
        } else {
        Alert.alert(successTitle, successMsg, [
            { text: "OK", onPress: () => router.replace('/dean/dashboard') }
        ]);
        }
    } catch (err: any) {
        console.error("Staff registration error:", err);
        Alert.alert("Ошибка регистрации", err.message || "Не удалось сохранить данные");
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Новый сотрудник</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.label}>ФИО</Text>
        <TextInput style={styles.input} placeholder="Иванов Иван Иванович" value={form.full_name} onChangeText={t => setForm({...form, full_name: t})} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} autoCapitalize="none" placeholder="example@kaznu.edu" value={form.email} onChangeText={t => setForm({...form, email: t})} />

        <Text style={styles.label}>Пароль</Text>
        <TextInput style={styles.input} secureTextEntry placeholder="••••••••" value={form.password} onChangeText={t => setForm({...form, password: t})} />

        <Text style={styles.label}>Кафедра</Text>
        <View style={styles.pickerContainer}>
          {departments.map(d => (
            <TouchableOpacity 
              key={d.id} 
              style={[styles.chip, form.department_id === d.id && styles.activeChip]}
              onPress={() => setForm({...form, department_id: d.id})}
            >
              <Text style={[styles.chipText, form.department_id === d.id && styles.whiteText]}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Должность</Text>
        <View style={styles.pickerContainer}>
          {positions.map(p => (
            <TouchableOpacity 
              key={p.id} 
              style={[styles.chip, form.position_id === p.id && styles.activeChip]}
              onPress={() => setForm({...form, position_id: p.id})}
            >
              <Text style={[styles.chipText, form.position_id === p.id && styles.whiteText]}>{p.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Зарегистрировать</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  container: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#F5F7FA', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: '#E1E4E8' },
  pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  chip: { padding: 10, backgroundColor: '#F0F0F0', borderRadius: 20, marginRight: 8, marginBottom: 8 },
  activeChip: { backgroundColor: '#007AFF' },
  chipText: { fontSize: 12, color: '#333' },
  whiteText: { color: '#FFF' },
  saveBtn: { backgroundColor: '#007AFF', padding: 18, borderRadius: 12, marginTop: 10, alignItems: 'center' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});