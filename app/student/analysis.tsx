import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { api } from '../../lib/api'; 
import { Ionicons } from '@expo/vector-icons';

export default function AnalysisScreen() {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      // Предполагаем, что у тебя есть функция получения ID текущего пользователя
      const userData = await api.checkSession(); 
      if (userData) {
        const response = await fetch(`http://172.20.10.2:3000/api/ai/analyze-performance/${userData.id}`);
        const data = await response.json();
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="analytics" size={32} color="#007AFF" />
          <Text style={styles.title}>AI Аналитика</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Изучаю ваши оценки...</Text>
          </View>
        ) : (
          <View style={styles.analysisCard}>
            <Text style={styles.analysisText}>{analysis}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.refreshButton} onPress={loadAnalysis}>
          <Text style={styles.refreshButtonText}>Обновить анализ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  loadingBox: { marginTop: 50, alignItems: 'center' },
  loadingText: { color: '#8E8E93', marginTop: 10 },
  analysisCard: { 
    backgroundColor: '#1C1C1E', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#2C2C2E' 
  },
  analysisText: { color: '#FFF', fontSize: 16, lineHeight: 24 },
  refreshButton: { 
    marginTop: 20, 
    backgroundColor: '#007AFF', 
    padding: 15, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  refreshButtonText: { color: '#fff', fontWeight: '600' }
});