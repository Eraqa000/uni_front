import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, FlatList, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator 
} from 'react-native';
import { api } from '../../lib/api'; 

// 1. Описываем структуру сообщения
interface Message {
  id: string;
  role: 'user' | 'model';
  message: string;
}

// 2. Описываем структуру пользователя
interface UserData {
  id: string;
  full_name: string;
  role: string;
}

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]); // Типизируем массив
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null); // Типизируем пользователя
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUserAndHistory();
  }, []);

  const loadUserAndHistory = async () => {
    const userData = await api.checkSession();
    if (userData) {
      setUser(userData);
      const history = await api.getChatHistory(userData.id);
      setMessages(history);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading || !user) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    const newUserMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      message: userMessage 
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const response = await api.sendChatMessage(user.id, userMessage);
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        message: response.reply 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Явно указываем тип для item
  const renderItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageBubble, 
      item.role === 'user' ? styles.userBubble : styles.aiBubble
    ]}>
      <Text style={[
        styles.messageText,
        item.role === 'user' ? styles.userText : styles.aiText
      ]}>
        {item.message}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#007AFF" />
          <Text style={styles.loadingText}>Ассистент печатает...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Спросите ассистента..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && { opacity: 0.5 }]} 
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Отправить</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Стили остаются прежними...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 15, paddingBottom: 20 },
  messageBubble: {
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 2,
  },
  messageText: { fontSize: 16 },
  userText: { color: '#fff' },
  aiText: { color: '#000' },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? 30 : 10
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: { backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, marginBottom: 10 },
  loadingText: { marginLeft: 10, color: '#888', fontStyle: 'italic' }
});