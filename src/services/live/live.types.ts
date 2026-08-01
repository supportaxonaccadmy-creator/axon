export type MeetingProviderType =
  | 'zoom' | 'google_meet' | 'jitsi_meet' | 'microsoft_teams'
  | 'youtube_live' | 'custom_url';

export type LiveClassStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
export type AttendanceStatus = 'present' | 'absent' | 'late';
export type RecordingSource = 'youtube' | 'vimeo' | 'supabase_storage' | 'external_url';
export type ReminderType = '24h' | '1h' | '15min' | 'started' | 'cancelled' | 'rescheduled' | 'recording_available';
export type ReminderStatus = 'pending' | 'sent' | 'failed';

export interface MeetingProvider {
  id: string;
  name: string;
  providerType: MeetingProviderType;
  apiKey: string | null;
  apiSecret: string | null;
  serverUrl: string | null;
  defaultSettings: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string | null;
  providerType: MeetingProviderType;
  meetingUrl: string;
  meetingPassword: string | null;
  meetingId: string | null;
  hostId: string | null;
  batchId: string | null;
  subjectId: string | null;
  chapterId: string | null;
  classId: string | null;
  thumbnailUrl: string | null;
  bannerUrl: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  status: LiveClassStatus;
  recurring: RecurringPattern;
  recurringInterval: number | null;
  recurringEndDate: string | null;
  waitingRoom: boolean;
  maxParticipants: number | null;
  allowRecording: boolean;
  autoRecording: boolean;
  hostControls: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiveAttendance {
  id: string;
  liveClassId: string;
  studentId: string;
  joinTime: string | null;
  leaveTime: string | null;
  durationSeconds: number;
  status: AttendanceStatus;
  manualOverride: boolean;
  overriddenBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiveRecording {
  id: string;
  liveClassId: string | null;
  title: string;
  description: string | null;
  source: RecordingSource;
  url: string;
  downloadUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  fileSizeBytes: number | null;
  batchId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LiveChatMessage {
  id: string;
  liveClassId: string;
  senderId: string;
  message: string;
  isPinned: boolean;
  createdAt: string;
}

export interface LiveReminder {
  id: string;
  liveClassId: string;
  reminderType: ReminderType;
  status: ReminderStatus;
  scheduledFor: string;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface CreateLiveClassInput {
  title: string;
  description?: string | null;
  providerType: MeetingProviderType;
  meetingUrl: string;
  meetingPassword?: string | null;
  meetingId?: string | null;
  batchId: string;
  subjectId?: string | null;
  chapterId?: string | null;
  classId?: string | null;
  thumbnailUrl?: string | null;
  bannerUrl?: string | null;
  startTime: string;
  endTime: string;
  timezone?: string;
  recurring?: RecurringPattern;
  recurringInterval?: number | null;
  recurringEndDate?: string | null;
  waitingRoom?: boolean;
  maxParticipants?: number | null;
  allowRecording?: boolean;
  autoRecording?: boolean;
  hostControls?: Record<string, unknown>;
}

export interface UpdateLiveClassInput extends Partial<CreateLiveClassInput> {
  status?: LiveClassStatus;
}

export interface CreateRecordingInput {
  liveClassId?: string | null;
  title: string;
  description?: string | null;
  source: RecordingSource;
  url: string;
  downloadUrl?: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  fileSizeBytes?: number | null;
  batchId?: string | null;
}

export interface CreateReminderInput {
  liveClassId: string;
  reminderType: ReminderType;
  scheduledFor: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: LiveClassStatus;
  providerType: MeetingProviderType;
  batchId: string | null;
}

export interface LiveClassStats {
  total: number;
  scheduled: number;
  live: number;
  completed: number;
  cancelled: number;
  totalParticipants: number;
  averageAttendance: number;
}

export interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  attendanceRate: number;
}

export interface LiveClassFilter {
  status?: LiveClassStatus | null;
  batchId?: string | null;
  providerType?: MeetingProviderType | null;
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  limit?: number;
  offset?: number;
}
