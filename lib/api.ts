import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_URL = 'http://172.20.10.2:3000'; 

// --- Платформо-зависимое хранилище ---
const storage = {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }
};


export const api = {
  // --- PUSH NOTIFICATIONS ---
  async registerPushToken(token: string) {
    try {
      const authToken = await storage.getItem('userToken');
      if (!authToken) {
        // Не кидаем ошибку, просто выходим, если пользователь не авторизован
        return;
      }

      const response = await fetch(`${API_URL}/api/register-push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось зарегистрировать push-токен');
      }
      // Успешная регистрация
      return await response.json();
    } catch (error) {
      console.error('Ошибка при регистрации push-токена:', error);
      // Не прерываем работу приложения из-за этой ошибки
    }
  },

  // --- АВТОРИЗАЦИЯ И СОЗДАНИЕ ---

  async checkSession() {
    const token = await storage.getItem('userToken');
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid session');
      }

      const user = await response.json();
      await storage.setItem('userData', JSON.stringify(user));
      
      return user;
    } catch (error) {
      await this.logout();
      return null;
    }
  },
  
  async login(credentials: any) {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ошибка входа');

      if (result.session) {
        await storage.setItem('userToken', result.session.access_token);
        await storage.setItem('userData', JSON.stringify(result.user));
      }


      return result;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },
  

  async createStudent(studentData: any) {
    try {
      const response = await fetch(`${API_URL}/api/create-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ошибка при создании студента');
      return result;
    } catch (error: any) {
      console.error('Create student error:', error);
      throw error;
    }
  },


  async getDepartments() {
    try {
      const res = await fetch(`${API_URL}/api/departments`);
      if (!res.ok) throw new Error('Ошибка при загрузке кафедр');
      return await res.json();
    } catch (error) {
      console.error('getDepartments error:', error);
      return []; 
    }
  },

  async getProfessions(deptId: string) {
    try {
      const res = await fetch(`${API_URL}/api/professions/${deptId}`);
      if (!res.ok) throw new Error('Ошибка при загрузке профессий');
      return await res.json();
    } catch (error) {
      console.error('getProfessions error:', error);
      return [];
    }
  },

  async getGroupsByProfession(profId: string) {
    try {
      // ВАЖНО: убедитесь, что в backend эндпоинт именно /api/groups/:profId
      const res = await fetch(`${API_URL}/api/groups/${profId}`);
      if (!res.ok) throw new Error('Ошибка при загрузке групп');
      return await res.json();
    } catch (error) {
      console.error('getGroupsByProfession error:', error);
      return [];
    }
  },

  // --- СТАТИСТИКА ---

  async getDashboardStats() {
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      if (!response.ok) throw new Error('Не удалось загрузить статистику');
      return await response.json();
    } catch (error: any) {
      console.error('Stats error:', error);
      return { groups: 64, students: 0 }; 
    }
  },

  async getStudentProfile(userId: string) {
    try {
      // Извлекаем токен, если он понадобится для авторизации на бэкенде
      const token = await storage.getItem('userToken');

      const response = await fetch(`${API_URL}/api/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}` // Раскомментируйте, если добавите проверку токена
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить профиль');
      }

      return await response.json();
    } catch (error: any) {
      console.error('getStudentProfile error:', error);
      throw error;
    }
  },

  async getStudentMarks(userId: string) {
    try {
      const response = await fetch(`${API_URL}/api/marks/${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить оценки');
      }
      return await response.json();
    } catch (error: any) {
      console.error('getStudentMarks error:', error);
      throw error; // или return []
    }
  },

  async getSchedule(groupId: string) {
    try {
      const response = await fetch(`${API_URL}/api/schedule/${groupId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить расписание');
      }
      return await response.json();
    } catch (error: any) {
      console.error('getSchedule error:', error);
      throw error; // или return []
    }
  },

  async massRegisterStudents(payload: {
    profession_id: string;
    course: number;
    prefix: string;
    students: any[];
  }) {
    try {
      const response = await fetch(`${API_URL}/api/mass-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ошибка массовой регистрации');
      
      return result; // Возвращает { success: true, data: [...] }
    } catch (error: any) {
      console.error('massRegister error:', error);
      throw error;
    }
  },

  async getPositions() {
    try {
      const res = await fetch(`${API_URL}/api/positions`);
      if (!res.ok) throw new Error('Ошибка при загрузке должностей');
      return await res.json();
    } catch (error) {
      console.error('getPositions error:', error);
      return [];
    }
  },

  async createStaff(staffData: {
    full_name: string;
    email: string;
    password: string;
    position_id: string;
    department_id: string;
  }) {
    try {
      const response = await fetch(`${API_URL}/api/create-staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ошибка при создании сотрудника');
      
      return result;
    } catch (error: any) {
      console.error('createStaff error:', error);
      throw error;
    }
  },

  async sendChatMessage(userId: string, message: string) {
    const response = await fetch(`${API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    return await response.json();
  },


  async getChatHistory(userId: string) {
    const response = await fetch(`${API_URL}/api/ai/history/${userId}`);
    return await response.json();
  },


  // --- АДМИН-ПАНЕЛЬ (ЗАМДЕКАНА) ---

  async getAdminFacultyStats() {
    try {
      const response = await fetch(`${API_URL}/api/admin/faculty-stats`);
      if (!response.ok) throw new Error('Ошибка загрузки статистики');
      return await response.json();
    } catch (error: any) {
      console.error('getAdminFacultyStats error:', error);
      return { students: 0, groups: 0, teachers: 0 };
    }
  },

  async getAdminRiskAnalysis() {
    try {
      const response = await fetch(`${API_URL}/api/admin/risk-analysis`);
      if (!response.ok) throw new Error('Ошибка загрузки AI-анализа');
      return await response.json();
    } catch (error: any) {
      console.error('getAdminRiskAnalysis error:', error);
      return { report: "Не удалось загрузить отчет." };
    }
  },

  // --- ЗАМДЕКАН: КЕСТЕНІ БАСҚАРУ ---

  // 1. Барлық топтар тізімін алу
  async getGroups() {
    try {
      const res = await fetch(`${API_URL}/api/admin/groups`);
      if (!res.ok) throw new Error('Ошибка при загрузке групп');
      return await res.json();
    } catch (error) {
      console.error('getGroups error:', error);
      return [];
    }
  },

  // 2. Сабақты кестеден жою
  async deleteScheduleItem(scheduleId: string) {
    try {
      const res = await fetch(`${API_URL}/api/admin/schedule/${scheduleId}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Ошибка при удалении');
      return true;
    } catch (error) {
      console.error('deleteScheduleItem error:', error);
      return false;
    }
  },

  // 3. Жаңа сабақты қолмен құру
  async createManualLesson(lessonData: {
    subject_id: string;
    teacher_id: string;
    room_id: string;
    group_id: string;
    day_of_week: number;
    time_slot_id: string;
    is_lecture: boolean;
  }) {
    try {
      const res = await fetch(`${API_URL}/api/admin/create-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Ошибка при создании занятия');
      return result;
    } catch (error) {
      console.error('createManualLesson error:', error);
      throw error;
    }
  },

  // 4. Аудиторияның бостығын тексеру
  async checkRoomAvailability(roomId: string, day: number, slotId: string) {
    try {
      const res = await fetch(`${API_URL}/api/admin/check-room?room_id=${roomId}&day=${day}&slot_id=${slotId}`);
      const result = await res.json();
      return result.isAvailable; // true немесе false қайтарады
    } catch (error) {
      console.error('checkRoomAvailability error:', error);
      return false;
    }
  },

  async generateSchedule() {
    try {
      const token = await storage.getItem('userToken');
      if (!token) {
        throw new Error('Требуется авторизация');
      }

      const response = await fetch(`${API_URL}/api/generate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при генерации расписания');
      }
      return result;
    } catch (error) {
      console.error('generateSchedule error:', error);
      throw error;
    }
  },


  getTeacherSchedule: async (teacherId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/teacher/schedule/${teacherId}`);
      if (!response.ok) throw new Error('Кестені жүктеу мүмкін болмады');
      return await response.json();
    } catch (error) {
      console.error("Teacher Schedule Error:", error);
      return null;
    }
  },

  getTeacherDashboard: async (teacherId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/teacher/dashboard/${teacherId}`);
      if (!response.ok) throw new Error('Мәліметтерді алу қатесі');
      return await response.json();
    } catch (error) {
      console.error("Dashboard Error:", error);
      return null;
    }
  },

  // Мұғалімге арналған барлық қажетті деректерді бірден алу (мысалы, формалар үшін)
  getLessonStudents: async (scheduleId: string) => {
    const response = await fetch(`${API_URL}/api/teacher/lesson-students/${scheduleId}`);
    return await response.json();
  },


  markAttendance: async (payload: any) => {
    const response = await fetch(`${API_URL}/api/teacher/mark-attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await response.json();
  },

  async saveWeeklyMarks(payload: { subject_id: string, week_number: number, marks: any[] }) {
    const response = await fetch(`${API_URL}/api/teacher/save-weekly-marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return response.json();
  },

  async getTeacherReports() {
    try {
      const response = await fetch(`${API_URL}/api/teacher/reports`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось загрузить отчеты');
      }
      return await response.json();
    } catch (error: any) {
      console.error('getTeacherReports error:', error);
      throw error;
    }
  },


  async logout() {
    await storage.deleteItem('userToken');
    await storage.deleteItem('userData');
  }
};