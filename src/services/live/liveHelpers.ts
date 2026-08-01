import type {
  MeetingProviderType, LiveClassStatus, RecurringPattern,
  AttendanceStatus, RecordingSource, ReminderType,
} from './live.types';

export const PROVIDER_LABELS: Record<MeetingProviderType, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  jitsi_meet: 'Jitsi Meet',
  microsoft_teams: 'Microsoft Teams',
  youtube_live: 'YouTube Live',
  custom_url: 'Custom URL',
};

export const PROVIDER_COLORS: Record<MeetingProviderType, string> = {
  zoom: 'bg-blue-100 text-blue-700',
  google_meet: 'bg-green-100 text-green-700',
  jitsi_meet: 'bg-teal-100 text-teal-700',
  microsoft_teams: 'bg-indigo-100 text-indigo-700',
  youtube_live: 'bg-red-100 text-red-700',
  custom_url: 'bg-neutral-100 text-neutral-700',
};

export const STATUS_LABELS: Record<LiveClassStatus, string> = {
  scheduled: 'Scheduled',
  live: 'Live Now',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_COLORS: Record<LiveClassStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-neutral-100 text-neutral-500',
};

export const STATUS_DOT_COLORS: Record<LiveClassStatus, string> = {
  scheduled: 'bg-blue-500',
  live: 'bg-red-500 animate-pulse',
  completed: 'bg-green-500',
  cancelled: 'bg-neutral-400',
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
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-orange-100 text-orange-700',
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

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  const remMin = min % 60;
  return `${hr}h ${remMin}m`;
}

export function formatDateTime(dateString: string, timezone?: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  };
  if (timezone) options.timeZone = timezone;
  return date.toLocaleString('en-US', options);
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function isLiveNow(startTime: string, endTime: string, status: LiveClassStatus): boolean {
  if (status === 'live') return true;
  const now = new Date();
  return new Date(startTime) <= now && new Date(endTime) >= now && status !== 'cancelled';
}

export function isUpcoming(startTime: string): boolean {
  return new Date(startTime) > new Date();
}

export function isToday(startTime: string): boolean {
  const date = new Date(startTime);
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function getDaysUntil(startTime: string): number {
  const diff = new Date(startTime).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function generateICSEvent(event: {
  title: string; startTime: string; endTime: string; description?: string; url?: string;
}): string {
  const formatDate = (d: string) => new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LMS//Live Class//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${event.title}`,
    `DTSTART:${formatDate(event.startTime)}`,
    `DTEND:${formatDate(event.endTime)}`,
    event.description ? `DESCRIPTION:${event.description}` : '',
    event.url ? `URL:${event.url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

export function generateGoogleCalendarLink(event: {
  title: string; startTime: string; endTime: string; description?: string;
}): string {
  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDate(event.startTime)}/${formatDate(event.endTime)}`,
    details: event.description ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function mapLiveClassRow(row: Record<string, unknown>): import('./live.types').LiveClass {
  return {
    id: String(row.id),
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    providerType: row.provider_type as MeetingProviderType,
    meetingUrl: String(row.meeting_url),
    meetingPassword: (row.meeting_password as string | null) ?? null,
    meetingId: (row.meeting_id as string | null) ?? null,
    hostId: (row.host_id as string | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
    subjectId: (row.subject_id as string | null) ?? null,
    chapterId: (row.chapter_id as string | null) ?? null,
    classId: (row.class_id as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    bannerUrl: (row.banner_url as string | null) ?? null,
    startTime: String(row.start_time),
    endTime: String(row.end_time),
    timezone: (row.timezone as string) ?? 'UTC',
    status: row.status as LiveClassStatus,
    recurring: row.recurring as RecurringPattern,
    recurringInterval: (row.recurring_interval as number | null) ?? null,
    recurringEndDate: (row.recurring_end_date as string | null) ?? null,
    waitingRoom: Boolean(row.waiting_room),
    maxParticipants: (row.max_participants as number | null) ?? null,
    allowRecording: Boolean(row.allow_recording),
    autoRecording: Boolean(row.auto_recording),
    hostControls: (row.host_controls as Record<string, unknown>) ?? {},
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapAttendanceRow(row: Record<string, unknown>): import('./live.types').LiveAttendance {
  return {
    id: String(row.id),
    liveClassId: String(row.live_class_id),
    studentId: String(row.student_id),
    joinTime: (row.join_time as string | null) ?? null,
    leaveTime: (row.leave_time as string | null) ?? null,
    durationSeconds: Number(row.duration_seconds ?? 0),
    status: row.status as AttendanceStatus,
    manualOverride: Boolean(row.manual_override),
    overriddenBy: (row.overridden_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapRecordingRow(row: Record<string, unknown>): import('./live.types').LiveRecording {
  return {
    id: String(row.id),
    liveClassId: (row.live_class_id as string | null) ?? null,
    title: String(row.title),
    description: (row.description as string | null) ?? null,
    source: row.source as RecordingSource,
    url: String(row.url),
    downloadUrl: (row.download_url as string | null) ?? null,
    thumbnailUrl: (row.thumbnail_url as string | null) ?? null,
    durationSeconds: (row.duration_seconds as number | null) ?? null,
    fileSizeBytes: (row.file_size_bytes as number | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapProviderRow(row: Record<string, unknown>): import('./live.types').MeetingProvider {
  return {
    id: String(row.id),
    name: String(row.name),
    providerType: row.provider_type as MeetingProviderType,
    apiKey: (row.api_key as string | null) ?? null,
    apiSecret: (row.api_secret as string | null) ?? null,
    serverUrl: (row.server_url as string | null) ?? null,
    defaultSettings: (row.default_settings as Record<string, unknown>) ?? {},
    isActive: Boolean(row.is_active),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapReminderRow(row: Record<string, unknown>): import('./live.types').LiveReminder {
  return {
    id: String(row.id),
    liveClassId: String(row.live_class_id),
    reminderType: row.reminder_type as ReminderType,
    status: row.status as import('./live.types').ReminderStatus,
    scheduledFor: String(row.scheduled_for),
    sentAt: (row.sent_at as string | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}
