import type {
  MeetingProviderType, LiveClassStatus, RecurringPattern,
  AttendanceStatus, RecordingSource, ReminderType, ReminderStatus,
  LiveClass, LiveAttendance, LiveRecording, MeetingProvider,
  LiveReminder, CalendarEvent,
} from './live.types';

export const PROVIDER_LABELS: Record<MeetingProviderType, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  jitsi_meet: 'Jitsi Meet',
  microsoft_teams: 'Microsoft Teams',
  youtube_live: 'YouTube Live',
  custom_url: 'Custom URL',
};

export const STATUS_LABELS: Record<LiveClassStatus, string> = {
  scheduled: 'Scheduled',
  live: 'Live',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const RECURRING_LABELS: Record<RecurringPattern, string> = {
  none: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  custom: 'Custom',
};

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
};

export const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  present: 'bg-success-100 text-success-700',
  absent: 'bg-error-100 text-error-700',
  late: 'bg-warning-100 text-warning-700',
};

export const RECORDING_SOURCE_LABELS: Record<RecordingSource, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  supabase_storage: 'Supabase Storage',
  external_url: 'External URL',
};

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  '24h': '24 hours before',
  '1h': '1 hour before',
  '15min': '15 minutes before',
  started: 'Class started',
  cancelled: 'Class cancelled',
  rescheduled: 'Class rescheduled',
  recording_available: 'Recording available',
};

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  pending: 'Pending',
  sent: 'Sent',
  failed: 'Failed',
};

export const STATUS_VARIANT: Record<LiveClassStatus, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  scheduled: 'info',
  live: 'error',
  completed: 'success',
  cancelled: 'default',
};

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatDateTime(dateStr: string, timezone?: string): string {
  try {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    if (timezone) options.timeZone = timezone;
    return date.toLocaleString(undefined, options);
  } catch {
    return dateStr;
  }
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function isLiveNow(liveClass: { status: LiveClassStatus; startTime: string; endTime: string }): boolean {
  if (liveClass.status === 'live') return true;
  const now = new Date();
  const start = new Date(liveClass.startTime);
  const end = new Date(liveClass.endTime);
  return now >= start && now <= end;
}

export function isUpcoming(liveClass: { startTime: string; status: LiveClassStatus }): boolean {
  if (liveClass.status === 'cancelled' || liveClass.status === 'completed') return false;
  return new Date(liveClass.startTime) > new Date();
}

export function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function generateICSEvent(event: CalendarEvent): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatICSDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return (
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
      `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
    );
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LMS//Live Class//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@lms`,
    `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
    `DTSTART:${formatICSDate(event.startTime)}`,
    `DTEND:${formatICSDate(event.endTime)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.description ?? '')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

function escapeICS(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

export function mapLiveClassRow(row: Record<string, unknown>): LiveClass {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: (row.description as string | null) ?? null,
    providerType: (row.provider_type as MeetingProviderType) ?? 'custom_url',
    meetingUrl: (row.meeting_url as string | null) ?? null,
    meetingPassword: (row.meeting_password as string | null) ?? null,
    meetingId: (row.meeting_id as string | null) ?? null,
    hostId: (row.host_id as string | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
    subjectId: (row.subject_id as string | null) ?? null,
    chapterId: (row.chapter_id as string | null) ?? null,
    classId: (row.class_id as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    bannerUrl: (row.banner_url as string | null) ?? null,
    startTime: String(row.start_time ?? ''),
    endTime: String(row.end_time ?? ''),
    timezone: (row.timezone as string) ?? 'UTC',
    status: (row.status as LiveClassStatus) ?? 'scheduled',
    recurring: (row.recurring as RecurringPattern) ?? 'none',
    recurringInterval: (row.recurring_interval as number | null) ?? null,
    recurringEndDate: (row.recurring_end_date as string | null) ?? null,
    waitingRoom: Boolean(row.waiting_room ?? false),
    maxParticipants: (row.max_participants as number | null) ?? null,
    allowRecording: Boolean(row.allow_recording ?? false),
    autoRecording: Boolean(row.auto_recording ?? false),
    hostControls: (row.host_controls as Record<string, unknown> | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

export function mapAttendanceRow(row: Record<string, unknown>): LiveAttendance {
  return {
    id: String(row.id),
    liveClassId: String(row.live_class_id),
    studentId: String(row.student_id),
    joinTime: (row.join_time as string | null) ?? null,
    leaveTime: (row.leave_time as string | null) ?? null,
    durationSeconds: (row.duration_seconds as number | null) ?? null,
    status: (row.status as AttendanceStatus) ?? 'absent',
    manualOverride: Boolean(row.manual_override ?? false),
    overriddenBy: (row.overridden_by as string | null) ?? null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

export function mapRecordingRow(row: Record<string, unknown>): LiveRecording {
  return {
    id: String(row.id),
    liveClassId: String(row.live_class_id),
    title: String(row.title ?? ''),
    description: (row.description as string | null) ?? null,
    source: (row.source as RecordingSource) ?? 'external_url',
    url: String(row.url ?? ''),
    downloadUrl: (row.download_url as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    durationSeconds: (row.duration_seconds as number | null) ?? null,
    fileSizeBytes: (row.file_size_bytes as number | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

export function mapMeetingProviderRow(row: Record<string, unknown>): MeetingProvider {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    providerType: (row.provider_type as MeetingProviderType) ?? 'custom_url',
    apiKey: (row.api_key as string | null) ?? null,
    apiSecret: (row.api_secret as string | null) ?? null,
    serverUrl: (row.server_url as string | null) ?? null,
    defaultSettings: (row.default_settings as Record<string, unknown> | null) ?? null,
    isActive: Boolean(row.is_active ?? false),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

export function mapReminderRow(row: Record<string, unknown>): LiveReminder {
  return {
    id: String(row.id),
    liveClassId: String(row.live_class_id),
    reminderType: (row.reminder_type as ReminderType) ?? '24h',
    status: (row.status as ReminderStatus) ?? 'pending',
    scheduledFor: String(row.scheduled_for ?? ''),
    sentAt: (row.sent_at as string | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
    createdAt: String(row.created_at ?? ''),
  };
}

export function mapCalendarEventRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: (row.description as string | null) ?? null,
    startTime: String(row.start_time ?? ''),
    endTime: String(row.end_time ?? ''),
    timezone: (row.timezone as string) ?? 'UTC',
    status: (row.status as LiveClassStatus) ?? 'scheduled',
    providerType: (row.provider_type as MeetingProviderType) ?? 'custom_url',
    meetingUrl: (row.meeting_url as string | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
  };
}