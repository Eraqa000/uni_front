import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from './api';

// Устанавливаем, как должны отображаться уведомления, когда приложение открыто
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Регистрирует устройство для получения push-уведомлений и отправляет токен на бэкенд.
 */
export async function registerForPushNotificationsAsync() {
  let token;

  // Для Android необходимо указать канал уведомлений
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Функция работает только на реальных устройствах
  if (Device.isDevice) {
    // Проверяем текущие разрешения
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Если разрешение не предоставлено, запрашиваем его
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Если пользователь не дал разрешение, выходим
    if (finalStatus !== 'granted') {
      console.log('Пользователь не предоставил разрешение на push-уведомления.');
      return;
    }

    // Получаем Expo Push Token
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('В app.json не найден projectId, необходимый для push-уведомлений.');
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token:', token);
    } catch (e) {
      console.error("Ошибка при получении push-токена:", e);
      return;
    }

  } else {
    console.log('Push-уведомления работают только на реальных устройствах.');
  }

  // Если токен получен, отправляем его на наш бэкенд
  if (token) {
    await api.registerPushToken(token);
  }
}
