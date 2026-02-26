import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState(); // Проверка готовности навигатора
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Ждем, пока состояние навигации прогрузится
    if (navigationState?.key) {
      setIsReady(true);
    }
  }, [navigationState?.key]);

  // app/_layout.tsx

useEffect(() => {
  if (isLoading || !isReady) return;

  const inAuthGroup = segments[0] === 'auth';
  const inStudentGroup = segments[0] === 'student';
  const inDeanGroup = segments[0] === 'dean';
  const inViceDeanGroup = segments[0] === 'vice-dean'; // Новая группа сегментов

  if (!isAuthenticated) {
    if (!inAuthGroup) {
      router.replace('/auth/login');
    }
  } else {
    // Нормализуем роль для проверки
    const role = user?.role?.trim().toLowerCase();

    if (role === 'декан') {
      if (!inDeanGroup) router.replace('/dean/dashboard');
    } 
    else if (role === 'заместитель декана') {
      // Проверяем, находится ли пользователь в своей папке
      if (!inViceDeanGroup) router.replace('/vice-dean');
    } 
    else if (role === 'преподаватель') {
      if (!inStudentGroup) router.replace('/teacher');
    }
    else if (role === 'студент') {
      if (!inStudentGroup) router.replace('/student');
    }
  }
}, [isAuthenticated, isLoading, user, segments, isReady]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}