import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Типизация для новости
interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
}

const DUMMY_NEWS: NewsItem[] = [
  {
    id: '1',
    category: 'Академия',
    title: 'Начало регистрации на весенний семестр',
    date: '8 января, 2026',
    excerpt: 'Уважаемые студенты, регистрация на дисциплины начнется со следующего понедельника...',
    image: 'https://images.unsplash.com/photo-1523050853063-915894612264?q=80&w=500',
  },
  {
    id: '2',
    category: 'События',
    title: 'Зимний бал в главном холле',
    date: '10 января, 2026',
    excerpt: 'Приглашаем всех на ежегодный благотворительный бал. В программе живая музыка и фуршет...',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=500',
  },
  {
    id: '3',
    category: 'Спорт',
    title: 'Победа нашей сборной по футболу',
    date: '7 января, 2026',
    excerpt: 'Вчера завершился финал межвузовского турнира, где наша команда заняла первое место!',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=500',
  },
];

export default function NewsScreen() {
  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardExcerpt}>{item.excerpt}</Text>
        <View style={styles.cardFooter}>
          <Ionicons name="time-outline" size={14} color="#8E8E93" />
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={DUMMY_NEWS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Сегодня в Univer</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Черный фон в стиле iOS
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardExcerpt: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
  },
});