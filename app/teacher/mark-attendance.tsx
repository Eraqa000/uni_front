  import React, { useState, useEffect } from 'react';
  import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
  import { useLocalSearchParams, useRouter } from 'expo-router';
  import { api } from '../../lib/api';
  import { Ionicons } from '@expo/vector-icons';

  export default function MarkAttendance() {
    const { scheduleId, subjectName, subjectId } = useLocalSearchParams(); // subjectId қосылды
    const router = useRouter();
    
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<{[key: string]: 'present' | 'absent'}>({});
    const [marks, setMarks] = useState<{[key: string]: {seminar: string, lecture: string, srs: string}}>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      loadStudents();
    }, [scheduleId]);

    const loadStudents = async () => {
      try {
        const data = await api.getLessonStudents(scheduleId as string);
        setStudents(data || []);
        
        const initialStatus: any = {};
        const initialMarks: any = {};
        data.forEach((s: any) => {
          initialStatus[s.id] = 'present';
          initialMarks[s.id] = { seminar: '', lecture: '', srs: '' };
        });
        setAttendance(initialStatus);
        setMarks(initialMarks);
      } catch (error) {
        Alert.alert("Қате", "Студенттер тізімін жүктеу мүмкін болмады");
      } finally {
        setLoading(false);
      }
    };

    const updateMark = (studentId: string, field: 'seminar' | 'lecture' | 'srs', value: string) => {
      setMarks(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], [field]: value }
      }));
    };

    const toggleStatus = (studentId: string) => {
      setAttendance(prev => ({
        ...prev,
        [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
      }));
    };

    const handleSave = async () => {
      setSubmitting(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // 1. Қатысу деректері
        const attendancePayload = {
          schedule_id: scheduleId,
          date: today,
          attendance_data: Object.keys(attendance).map(id => ({
            student_id: id,
            status: attendance[id]
          }))
        };
        

        // 2. Балл деректері
        const marksPayload = {
          subject_id: subjectId as string,
          week_number: 1, // Болашақта бұл мәнді динамикалық түрде алуға болады
          marks: Object.keys(marks)
            .filter(id => marks[id].seminar !== '' || marks[id].lecture !== '' || marks[id].srs !== '')         
            .map((id: string) => ({
              student_id: id,
              seminar_mark: parseInt(marks[id].seminar) || 0,
              lecture_mark: parseInt(marks[id].lecture) || 0,
              srs_mark: parseInt(marks[id].srs) || 0
          }))
        };

        const resAtt = await api.markAttendance(attendancePayload);
        const resMarks = await api.saveWeeklyMarks(marksPayload);

        if (resAtt.success && resMarks.success) {
          Alert.alert("Сәтті", "Қатысу мен баллдар сақталды!");
          router.back();
        }
      } catch (error) {
        Alert.alert("Қате", "Мәліметтерді сақтау кезінде қате шықты");
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title} numberOfLines={1}>{subjectName}</Text>
              <Text style={styles.subtitle}>Журнал және баллдар</Text>
            </View>
          </View>

          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.studentCard}>
                <View style={styles.topRow}>
                  <View style={styles.studentInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.full_name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.studentName}>{item.full_name}</Text>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => toggleStatus(item.id)}
                    style={[styles.statusBadge, attendance[item.id] === 'absent' ? styles.absentBadge : styles.presentBadge]}
                  >
                    <Text style={styles.statusText}>{attendance[item.id] === 'present' ? "Келді" : "Жоқ"}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.marksRow}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Сем</Text>
                    <TextInput 
                      style={styles.markInput} 
                      keyboardType="numeric" 
                      placeholder="0"
                      onChangeText={(v) => updateMark(item.id, 'seminar', v)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Лек</Text>
                    <TextInput 
                      style={styles.markInput} 
                      keyboardType="numeric" 
                      placeholder="0"
                      onChangeText={(v) => updateMark(item.id, 'lecture', v)}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>ӨЖЖ</Text>
                    <TextInput 
                      style={styles.markInput} 
                      keyboardType="numeric" 
                      placeholder="0"
                      onChangeText={(v) => updateMark(item.id, 'srs', v)}
                    />
                  </View>
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Журналды сақтау</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
    backBtn: { marginRight: 15 },
    title: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', width: '80%' },
    subtitle: { fontSize: 14, color: '#8E8E93' },
    list: { padding: 15 },
    studentCard: { backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 10, elevation: 2 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    studentInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#6200EE20', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { color: '#6200EE', fontWeight: 'bold' },
    studentName: { fontSize: 15, fontWeight: '500' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    presentBadge: { backgroundColor: '#34C759' },
    absentBadge: { backgroundColor: '#FF3B30' },
    statusText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
    marksRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 10 },
    inputContainer: { alignItems: 'center', flex: 1 },
    inputLabel: { fontSize: 10, color: '#8E8E93', marginBottom: 4 },
    markInput: { backgroundColor: '#F2F2F7', width: '80%', textAlign: 'center', borderRadius: 6, padding: 5, fontSize: 14, fontWeight: 'bold' },
    footer: { padding: 20, backgroundColor: '#FFF' },
    saveBtn: { backgroundColor: '#6200EE', padding: 16, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
  });