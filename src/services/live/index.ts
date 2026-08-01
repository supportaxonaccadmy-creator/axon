export { liveClassService } from './liveClassService';
export { meetingProviderService } from './meetingProviderService';
export { attendanceService } from './attendanceService';
export { recordingService } from './recordingService';
export { calendarService } from './calendarService';
export { liveReminderService } from './liveReminderService';

export {
  PROVIDER_LABELS, PROVIDER_COLORS,
  STATUS_LABELS, STATUS_COLORS, STATUS_DOT_COLORS,
  RECURRING_LABELS,
  ATTENDANCE_LABELS, ATTENDANCE_COLORS,
  RECORDING_SOURCE_LABELS,
  REMINDER_TYPE_LABELS,
  formatDuration, formatDateTime, formatRelativeTime,
  isLiveNow, isUpcoming, isToday, getDaysUntil,
  generateICSEvent, generateGoogleCalendarLink,
} from './liveHelpers';

export type {
  MeetingProviderType, LiveClassStatus, RecurringPattern,
  AttendanceStatus, RecordingSource, ReminderType, ReminderStatus,
  MeetingProvider, LiveClass, LiveAttendance, LiveRecording,
  LiveChatMessage, LiveReminder,
  CreateLiveClassInput, UpdateLiveClassInput, CreateRecordingInput,
  CreateReminderInput, CalendarEvent, LiveClassStats,
  AttendanceStats, LiveClassFilter,
} from './live.types';
