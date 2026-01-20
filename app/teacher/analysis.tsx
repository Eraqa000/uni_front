import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  report_content: string;
  created_at: string;
}

export default function TeacherAnalysis() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const data = await api.getTeacherReports();
      setReports(data || []);
    } catch (error) {
      console.error("Ошибка загрузки отчетов:", error);
      Alert.alert("Ошибка", "Не удалось загрузить отчеты. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleReportPress = (report: Report) => {
    Alert.alert(
      report.title,
      report.report_content,
      [{ text: 'Закрыть' }]
    );
  };

  const renderItem = ({ item }: { item: Report }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleReportPress(item)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="document-text-outline" size={24} color="#6200EE" />
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.titleText}>{item.title}</Text>
        <Text style={styles.dateText}>
          {format(new Date(item.created_at), 'dd.MM.yyyy HH:mm')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={styles.loadingText}>Загрузка аналитики...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>AI-Аналитика</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>Аналитические отчеты не найдены.</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: { 
    marginTop: 10, 
    color: '#8E8E93',
    fontSize: 16
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    padding: 20, 
    paddingBottom: 10,
    color: '#1C1C1E' 
  },
  listContent: { 
    paddingBottom: 20 
  },
  card: { 
    backgroundColor: '#FFF', 
    marginHorizontal: 20, 
    marginTop: 12, 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 5 
  },
  iconContainer: {
    marginRight: 15,
  },
  infoBox: { 
    flex: 1,
  },
  titleText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1C1C1E' 
  },
  dateText: { 
    fontSize: 13, 
    color: '#8E8E93', 
    marginTop: 4 
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#8E8E93',
    fontSize: 16,
  }
});
