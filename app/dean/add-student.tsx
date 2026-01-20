import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, SafeAreaView, Platform, ActivityIndicator 
} from 'react-native'; 
import { api } from '../../lib/api';
import { useRouter } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons'; 
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

interface StudentEntry {
  id: number;
  full_name: string;
  email: string;
  password: string;
}

export default function MassRegistration() {
  const router = useRouter(); 
  const [departments, setDepartments] = useState<any[]>([]);
  const [professions, setProfessions] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedProf, setSelectedProf] = useState<any>(null);
  const [course, setCourse] = useState('1');
  const [groupPrefix, setGroupPrefix] = useState('');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentEntry[]>([
    { id: Date.now(), full_name: '', email: '', password: '' }
  ]);

  useEffect(() => { loadDepts(); }, []);

  const loadDepts = async () => {
    const data = await api.getDepartments();
    setDepartments(data);
  };

  const handleDeptSelect = async (deptId: string) => {
    setSelectedDept(deptId);
    setSelectedProf(null);
    try {
      const data = await api.getProfessions(deptId);
      setProfessions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const transliterate = (text: string) => {
    const map: any = {'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ы':'y','э':'e','ю':'yu','я':'ya'};
    return text.toLowerCase().split('').map(c => map[c] || c).join('');
  };

  // Автозаполнение Email при вводе имени
  const handleNameChange = (id: number, name: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const parts = name.trim().split(/\s+/);
        let email = s.email;
        if (parts.length >= 2 && (s.email === '' || s.email.includes('@kaznu.edu'))) {
          email = `${transliterate(parts[0])}.${transliterate(parts[1])}@kaznu.edu`;
        }
        return { ...s, full_name: name, email };
      }
      return s;
    }));
  };

  // Генерация случайного пароля (8 символов)
  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8).toUpperCase();
  };

  // Применить генерацию ко всем пустым (или всем) паролям в списке
  const handleGenerateAllPasswords = () => {
    setStudents(prev => prev.map(s => ({
      ...s,
      password: generateRandomPassword()
    })));
  };

  const showNotify = (title: string, msg: string) => {
    Platform.OS === 'web' ? alert(`${title}\n${msg}`) : Alert.alert(title, msg);
  };

  const generateAndShareCSV = async (registeredStudents: any[]) => {
    try {
      if (!registeredStudents || registeredStudents.length === 0) return;

      const header = "ФИО;Email;Пароль;Группа;Специальность\n";
      const rows = registeredStudents.map(s => 
        `${s.full_name || ''};${s.email || ''};${s.password || ''};${s.group_name || ''};${selectedProf?.name || ''}`
      ).join("\n");
      
      const csvContent = "\uFEFF" + header + rows;
      const fileName = `Reg_${groupPrefix}_C${course}.csv`;

      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Путь во временную директорию
        const fileUri = FileSystem.cacheDirectory + fileName;
        
        try {
          // Запись через legacy API
          await FileSystem.writeAsStringAsync(fileUri, csvContent, { 
            encoding: FileSystem.EncodingType.UTF8 
          });

          const isSharingAvailable = await Sharing.isAvailableAsync();
          if (isSharingAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'text/csv',
              dialogTitle: 'Список зачисленных студентов',
              UTI: 'public.comma-separated-values-text'
            });
          }
        } catch (err) {
          console.error("Internal Legacy Write Error:", err);
          Alert.alert("Ошибка", "Не удалось создать файл во внутренней памяти");
        }
      }
    } catch (error: any) {
      console.error("CSV Generation error:", error);
      Alert.alert("Ошибка", "Проблема при генерации CSV");
    }
  };

  const handleMassCreate = async () => {
  // 1. Валидация перед отправкой
    const emails = students.map(s => s.email.toLowerCase());
    const hasDuplicates = emails.some((e, i) => emails.indexOf(e) !== i);

    if (!selectedProf || !groupPrefix || students.some(s => !s.full_name || !s.email || !s.password)) {
      showNotify("Внимание", "Заполните все данные (Кафедра, ФИО, Email и Пароль)");
      return;
    }
    
    if (hasDuplicates) {
      showNotify("Ошибка", "В списке есть дубликаты Email");
      return;
    }

    // 2. Формируем данные (Payload)
    const payload = {
      profession_id: selectedProf.id,
      course: parseInt(course),
      prefix: groupPrefix,
      students: students // передаем массив объектов StudentEntry
    };

    setLoading(true);
    try {
      const response = await api.massRegisterStudents(payload);

      if (!response || !response.data) {
        throw new Error("Сервер не вернул данные зарегистрированных студентов");
      }

      const successMsg = "Студенты успешно зачислены. Скачать список для эдвайзеров?";

      if (Platform.OS === 'web') {
        if (window.confirm(successMsg)) {
          await generateAndShareCSV(response.data);
        }
        // Небольшая задержка перед редиректом для стабильности в Web
        setTimeout(() => router.replace('/dean/dashboard'), 500);
      } else {
        Alert.alert("Успех", successMsg, [
          { 
            text: "Скачать CSV", 
            onPress: async () => {
              await generateAndShareCSV(response.data);
              router.replace('/dean/dashboard');
            }
          },
          { text: "Ок", onPress: () => router.replace('/dean/dashboard') }
        ]);
      }
    } catch (err: any) {
      console.error("Registration Error:", err);
      // Исправлено: используем существующую функцию showNotify
      showNotify("Ошибка", err.response?.data?.error || err.message || "Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Массовое зачисление</Text>
        <TouchableOpacity onPress={() => setStudents([{ id: Date.now(), full_name: '', email: '', password: '' }])}>
          <Text style={{color: 'red', fontWeight: 'bold'}}>Очистить</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>1. Направление</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipList}>
          {departments.map((d: any) => (
            <TouchableOpacity key={d.id} onPress={() => handleDeptSelect(d.id)} 
              style={[styles.chip, selectedDept === d.id && styles.activeChip]}>
              <Text style={[styles.chipText, selectedDept === d.id && styles.whiteText]}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedDept && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipList}>
            {professions.map((p: any) => (
              <TouchableOpacity key={p.id} onPress={() => { setSelectedProf(p); setGroupPrefix(p.name.split(' ')[0].toUpperCase()); }}
                style={[styles.chip, selectedProf?.id === p.id && styles.activeChip]}>
                <Text style={[styles.chipText, selectedProf?.id === p.id && styles.whiteText]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.label}>Курс</Text>
            <TextInput style={styles.input} value={course} onChangeText={setCourse} keyboardType="numeric" />
          </View>
          <View style={{flex: 2}}>
            <Text style={styles.label}>Префикс группы</Text>
            <TextInput style={styles.input} value={groupPrefix} onChangeText={setGroupPrefix} autoCapitalize="characters" placeholder="Напр: CS" />
          </View>
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>2. Студенты ({students.length})</Text>
            <TouchableOpacity onPress={handleGenerateAllPasswords}>
                <Text style={styles.actionLink}>Сгенерировать пароли всем</Text>
            </TouchableOpacity>
        </View>

        {students.map((s, i) => (
          <View key={s.id} style={styles.studentCard}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.studentIndex}>СТУДЕНТ #{i+1}</Text>
              <TouchableOpacity onPress={() => setStudents(students.filter(item => item.id !== s.id))}>
                <Ionicons name="trash-outline" size={18} color="red" />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.cardInput} placeholder="Фамилия Имя" placeholderTextColor="#999" value={s.full_name} onChangeText={(v) => handleNameChange(s.id, v)} />
            <TextInput style={styles.cardInput} placeholder="Email" placeholderTextColor="#999" value={s.email} autoCapitalize="none" onChangeText={(v) => setStudents(students.map(item => item.id === s.id ? {...item, email: v} : item))} />
            <TextInput style={styles.cardInput} placeholder="Пароль" placeholderTextColor="#999" value={s.password} onChangeText={(v) => setStudents(students.map(item => item.id === s.id ? {...item, password: v} : item))} />
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={() => setStudents([...students, { id: Date.now(), full_name: '', email: '', password: '' }])}>
          <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={{color: '#007AFF', marginLeft: 8, fontWeight: '600'}}>Добавить строку</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleMassCreate} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Зачислить и распределить</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', alignItems: 'center', borderBottomWidth: 1, borderColor: '#EEE' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  container: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  actionLink: { color: '#007AFF', fontSize: 12, fontWeight: '600' },
  chipList: { marginBottom: 10 },
  chip: { padding: 10, backgroundColor: '#FFF', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#DDD' },
  activeChip: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { fontSize: 12 },
  whiteText: { color: '#FFF' },
  row: { flexDirection: 'row', marginBottom: 20 },
  input: { backgroundColor: '#FFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DDD' },
  label: { fontSize: 12, marginBottom: 5, color: '#666' },
  studentCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#EEE' },
  studentIndex: { fontSize: 10, color: '#007AFF', fontWeight: 'bold', marginBottom: 5 },
  cardInput: { borderBottomWidth: 1, borderColor: '#EEE', paddingVertical: 8, marginBottom: 5, fontSize: 14 },
  addButton: { padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, marginTop: 10 },
  saveBtn: { backgroundColor: '#28A745', padding: 18, borderRadius: 12, marginTop: 25, alignItems: 'center', marginBottom: 50 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});