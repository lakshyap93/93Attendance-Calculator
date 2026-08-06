export type Role = 'student' | 'admin' | 'guest';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  collegeName?: string;
  branch?: string;
  semester?: number;
  targetAttendanceGoal: number; // e.g. 75, 80, 85
  preferredLanguage?: string;
  createdAt: string;
}

export type ClassType = 'lecture' | 'lab' | 'tutorial';

export interface TimetableSlot {
  id: string;
  subjectId: string;
  subjectName: string;
  code?: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // HH:mm format e.g. "09:00"
  endTime: string;   // HH:mm format e.g. "10:00"
  room?: string;
  teacher?: string;
  classType: ClassType;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacher?: string;
  credits: number;
  color: string;
  presentCount: number;
  absentCount: number;
  cancelledCount: number;
  totalClasses: number;
  currentPercentage: number;
  minTargetPercentage: number; // default 75
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'cancelled' | 'holiday';
  note?: string;
}

export interface Holiday {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or date range
  endDate?: string;
  type: 'national' | 'college' | 'festival' | 'medical' | 'custom' | 'exam';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  detectedLanguage?: string;
  actionPayload?: {
    type: 'bunk_summary' | 'schedule_preview' | 'stat_card' | 'simulation_result';
    data: any;
  };
}

export interface BunkCalculation {
  subjectName: string;
  currentPercentage: number;
  totalClasses: number;
  presentCount: number;
  safeBunksLeft: number;
  classesNeededForTarget: number;
  targetPercentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface SimulationScenario {
  subjectId?: string;
  startDate: string;
  endDate: string;
  daysToAttend: string[]; // e.g. ['Monday', 'Wednesday']
  futureAttendancePercentage: number;
  projectedPresent: number;
  projectedTotal: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
}
