import { UserProfile, Subject, TimetableSlot, AttendanceRecord, Holiday, ChatMessage, NotificationItem } from '../types';

const STORAGE_KEYS = {
  USER: 'attendance_ai_user',
  SUBJECTS: 'attendance_ai_subjects',
  TIMETABLE: 'attendance_ai_timetable',
  ATTENDANCE: 'attendance_ai_attendance',
  HOLIDAYS: 'attendance_ai_holidays',
  CHATS: 'attendance_ai_chats',
  NOTIFICATIONS: 'attendance_ai_notifications',
  THEME: 'attendance_ai_theme',
};

// Initial Sample Data for Instant Demo
const defaultUser: UserProfile = {
  id: 'usr_demo_123',
  name: 'Alex Sharma',
  email: 'alex.sharma@campus.edu',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  role: 'student',
  collegeName: 'Imperial Institute of Technology',
  branch: 'Computer Science & Engineering',
  semester: 5,
  targetAttendanceGoal: 75,
  preferredLanguage: 'English',
  createdAt: new Date().toISOString(),
};

const defaultSubjects: Subject[] = [
  {
    id: 'sub_1',
    name: 'Database Management Systems',
    code: 'CS501',
    teacher: 'Dr. Ramesh Gupta',
    credits: 4,
    color: '#3b82f6', // blue
    presentCount: 22,
    absentCount: 4,
    cancelledCount: 1,
    totalClasses: 27,
    currentPercentage: 81.48,
    minTargetPercentage: 75,
  },
  {
    id: 'sub_2',
    name: 'Operating Systems',
    code: 'CS502',
    teacher: 'Prof. Ananya Roy',
    credits: 4,
    color: '#8b5cf6', // purple
    presentCount: 18,
    absentCount: 7,
    cancelledCount: 0,
    totalClasses: 25,
    currentPercentage: 72.0, // warning
    minTargetPercentage: 75,
  },
  {
    id: 'sub_3',
    name: 'Design & Analysis of Algorithms',
    code: 'CS503',
    teacher: 'Dr. Vikramaditya',
    credits: 4,
    color: '#10b981', // emerald
    presentCount: 25,
    absentCount: 3,
    cancelledCount: 2,
    totalClasses: 30,
    currentPercentage: 83.33,
    minTargetPercentage: 75,
  },
  {
    id: 'sub_4',
    name: 'Artificial Intelligence & Machine Learning',
    code: 'CS504',
    teacher: 'Prof. Neha Kapoor',
    credits: 3,
    color: '#f59e0b', // amber
    presentCount: 19,
    absentCount: 2,
    cancelledCount: 1,
    totalClasses: 22,
    currentPercentage: 86.36,
    minTargetPercentage: 75,
  },
  {
    id: 'sub_5',
    name: 'Web Technologies Lab',
    code: 'CS505P',
    teacher: 'Er. Rajesh Verma',
    credits: 2,
    color: '#ec4899', // pink
    presentCount: 10,
    absentCount: 4,
    cancelledCount: 0,
    totalClasses: 14,
    currentPercentage: 71.42, // danger
    minTargetPercentage: 75,
  },
];

const defaultTimetable: TimetableSlot[] = [
  // Monday
  { id: 'ts_1', subjectId: 'sub_1', subjectName: 'Database Management Systems', code: 'CS501', day: 'Monday', startTime: '09:00', endTime: '10:00', room: 'NLH-301', teacher: 'Dr. Ramesh Gupta', classType: 'lecture' },
  { id: 'ts_2', subjectId: 'sub_2', subjectName: 'Operating Systems', code: 'CS502', day: 'Monday', startTime: '10:15', endTime: '11:15', room: 'NLH-301', teacher: 'Prof. Ananya Roy', classType: 'lecture' },
  { id: 'ts_3', subjectId: 'sub_5', subjectName: 'Web Technologies Lab', code: 'CS505P', day: 'Monday', startTime: '11:30', endTime: '13:30', room: 'CS-Lab 3', teacher: 'Er. Rajesh Verma', classType: 'lab' },
  
  // Tuesday
  { id: 'ts_4', subjectId: 'sub_3', subjectName: 'Design & Analysis of Algorithms', code: 'CS503', day: 'Tuesday', startTime: '09:00', endTime: '10:00', room: 'NLH-302', teacher: 'Dr. Vikramaditya', classType: 'lecture' },
  { id: 'ts_5', subjectId: 'sub_4', subjectName: 'Artificial Intelligence & Machine Learning', code: 'CS504', day: 'Tuesday', startTime: '10:15', endTime: '11:15', room: 'NLH-302', teacher: 'Prof. Neha Kapoor', classType: 'lecture' },
  { id: 'ts_6', subjectId: 'sub_1', subjectName: 'Database Management Systems', code: 'CS501', day: 'Tuesday', startTime: '14:00', endTime: '15:00', room: 'NLH-301', teacher: 'Dr. Ramesh Gupta', classType: 'lecture' },

  // Wednesday
  { id: 'ts_7', subjectId: 'sub_2', subjectName: 'Operating Systems', code: 'CS502', day: 'Wednesday', startTime: '09:00', endTime: '10:00', room: 'NLH-301', teacher: 'Prof. Ananya Roy', classType: 'lecture' },
  { id: 'ts_8', subjectId: 'sub_3', subjectName: 'Design & Analysis of Algorithms', code: 'CS503', day: 'Wednesday', startTime: '10:15', endTime: '11:15', room: 'NLH-302', teacher: 'Dr. Vikramaditya', classType: 'lecture' },
  { id: 'ts_9', subjectId: 'sub_4', subjectName: 'Artificial Intelligence & Machine Learning', code: 'CS504', day: 'Wednesday', startTime: '11:30', endTime: '12:30', room: 'NLH-302', teacher: 'Prof. Neha Kapoor', classType: 'lecture' },

  // Thursday
  { id: 'ts_10', subjectId: 'sub_1', subjectName: 'Database Management Systems', code: 'CS501', day: 'Thursday', startTime: '09:00', endTime: '10:00', room: 'NLH-301', teacher: 'Dr. Ramesh Gupta', classType: 'lecture' },
  { id: 'ts_11', subjectId: 'sub_2', subjectName: 'Operating Systems', code: 'CS502', day: 'Thursday', startTime: '10:15', endTime: '11:15', room: 'NLH-301', teacher: 'Prof. Ananya Roy', classType: 'lecture' },
  { id: 'ts_12', subjectId: 'sub_3', subjectName: 'Design & Analysis of Algorithms', code: 'CS503', day: 'Thursday', startTime: '14:00', endTime: '15:00', room: 'NLH-302', teacher: 'Dr. Vikramaditya', classType: 'lecture' },

  // Friday
  { id: 'ts_13', subjectId: 'sub_4', subjectName: 'Artificial Intelligence & Machine Learning', code: 'CS504', day: 'Friday', startTime: '09:00', endTime: '10:00', room: 'NLH-302', teacher: 'Prof. Neha Kapoor', classType: 'lecture' },
  { id: 'ts_14', subjectId: 'sub_5', subjectName: 'Web Technologies Lab', code: 'CS505P', day: 'Friday', startTime: '10:15', endTime: '12:15', room: 'CS-Lab 3', teacher: 'Er. Rajesh Verma', classType: 'lab' },
];

const defaultHolidays: Holiday[] = [
  { id: 'hol_1', title: 'Independence Day', date: '2026-08-15', type: 'national' },
  { id: 'hol_2', title: 'Ganesh Chaturthi', date: '2026-09-14', type: 'festival' },
  { id: 'hol_3', title: 'Mid-Semester Examinations', date: '2026-10-05', endDate: '2026-10-10', type: 'exam' },
  { id: 'hol_4', title: 'Diwali Break', date: '2026-10-30', endDate: '2026-11-04', type: 'festival' },
];

const defaultNotifications: NotificationItem[] = [
  { id: 'notif_1', title: 'Attendance Warning!', message: 'Your Operating Systems attendance is at 72.0%, which is below target (75%). Attend next 2 classes!', type: 'danger', timestamp: '10 mins ago', read: false },
  { id: 'notif_2', title: 'Web Tech Lab Alert', message: 'Web Tech Lab is at 71.42%. You cannot miss any upcoming lab sessions.', type: 'warning', timestamp: '2 hours ago', read: false },
  { id: 'notif_3', title: 'Safe Bunk Available', message: 'You have 3 safe bunks left in AI & Machine Learning!', type: 'success', timestamp: 'Yesterday', read: true },
];

export class StorageService {
  static getUser(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : defaultUser;
  }

  static saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getSubjects(): Subject[] {
    const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return data ? JSON.parse(data) : defaultSubjects;
  }

  static saveSubjects(subjects: Subject[]): void {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }

  static getTimetable(): TimetableSlot[] {
    const data = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
    return data ? JSON.parse(data) : defaultTimetable;
  }

  static saveTimetable(timetable: TimetableSlot[]): void {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  }

  static getHolidays(): Holiday[] {
    const data = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    return data ? JSON.parse(data) : defaultHolidays;
  }

  static saveHolidays(holidays: Holiday[]): void {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
  }

  static getNotifications(): NotificationItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : defaultNotifications;
  }

  static saveNotifications(notifs: NotificationItem[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  static getChats(): ChatMessage[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (data) return JSON.parse(data);
    return [
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: '👋 Hi Alex! I am **Attendance AI**, your personal academic assistant.\n\nI have loaded your timetable & attendance records. Ask me anything like:\n- *"Can I bunk DBMS today?"*\n- *"What is my Operating Systems percentage?"*\n- *"Simulate my attendance if I miss classes next week"*',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedLanguage: 'English',
      },
    ];
  }

  static saveChats(chats: ChatMessage[]): void {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  }

  static resetAllToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(defaultSubjects));
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(defaultTimetable));
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(defaultHolidays));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
    localStorage.removeItem(STORAGE_KEYS.CHATS);
  }
}
