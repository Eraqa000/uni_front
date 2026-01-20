import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

// Расширенный интерфейс пользователя на основе БД
interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'декан' | 'студент' | 'преподаватель (практик)' | 'преподаватель (лектор)' | 'заместитель декана';
  group_id?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Флаг для предотвращения редиректов во время проверки сессии
  login: (credentials: any) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка сессии при каждом холодном запуске приложения
  useEffect(() => {
    const initAuth = async () => {
      try {
        const sessionUser = await api.checkSession();
        if (sessionUser) {
          setUser(sessionUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Ошибка инициализации сессии:", error);
      } finally {
        setIsLoading(false); // Загрузка завершена, можно показывать экраны
      }
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    // Вызываем ваш метод API, который сохраняет токены в SecureStore
    const result = await api.login(credentials);
    if (result.user) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = async () => {
    try {
      await api.logout(); // Очистка SecureStore
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};