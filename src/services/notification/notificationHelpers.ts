import type { NotificationType, NotificationPriority, NotificationChannel, TemplateType } from './notification.types';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  course_purchased: 'Course Purchased',
  enrollment_success: 'Enrollment Success',
  payment_failed: 'Payment Failed',
  live_class_reminder: 'Live Class Reminder',
  live_class_started: 'Live Class Started',
  assignment_available: 'Assignment Available',
  pdf_uploaded: 'PDF Uploaded',
  video_uploaded: 'Video Uploaded',
  mcq_available: 'MCQ Available',
  course_completed: 'Course Completed',
  certificate_ready: 'Certificate Ready',
  system_announcement: 'System Announcement',
  custom_admin_message: 'Admin Message',
};

export const NOTIFICATION_TYPE_ICONS: Record<NotificationType, string> = {
  course_purchased: 'ShoppingCart',
  enrollment_success: 'GraduationCap',
  payment_failed: 'CreditCard',
  live_class_reminder: 'Clock',
  live_class_started: 'Radio',
  assignment_available: 'FileText',
  pdf_uploaded: 'FileText',
  video_uploaded: 'PlayCircle',
  mcq_available: 'HelpCircle',
  course_completed: 'Award',
  certificate_ready: 'BadgeCheck',
  system_announcement: 'Megaphone',
  custom_admin_message: 'MessageSquare',
};

export const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: 'text-neutral-400',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

export const PRIORITY_BG_COLORS: Record<NotificationPriority, string> = {
  low: 'bg-neutral-100',
  normal: 'bg-blue-50',
  high: 'bg-orange-50',
  urgent: 'bg-red-50',
};

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  in_app: 'In-App',
  email: 'Email',
  push: 'Push',
};

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  welcome: 'Welcome',
  purchase_success: 'Purchase Success',
  enrollment: 'Enrollment',
  password_reset: 'Password Reset',
  payment_failed: 'Payment Failed',
  live_reminder: 'Live Reminder',
  certificate: 'Certificate',
  custom: 'Custom',
};

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

export function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] ?? `{{${key}}}`);
}

export function extractVariables(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ''))));
}

export function mapNotificationRow(row: Record<string, unknown>): import('./notification.types').Notification {
  return {
    id: String(row.id),
    type: row.type as NotificationType,
    title: String(row.title),
    message: String(row.message),
    priority: row.priority as NotificationPriority,
    channels: (row.channels as NotificationChannel[]) ?? ['in_app'],
    actionUrl: (row.action_url as string | null) ?? null,
    actionLabel: (row.action_label as string | null) ?? null,
    batchId: (row.batch_id as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    scheduledFor: (row.scheduled_for as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapRecipientRow(row: Record<string, unknown>): import('./notification.types').NotificationRecipient {
  return {
    id: String(row.id),
    notificationId: String(row.notification_id),
    recipientId: String(row.recipient_id),
    isRead: Boolean(row.is_read),
    readAt: (row.read_at as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export function mapAnnouncementRow(row: Record<string, unknown>): import('./notification.types').Announcement {
  return {
    id: String(row.id),
    title: String(row.title),
    body: String(row.body),
    imageUrl: (row.image_url as string | null) ?? null,
    isPinned: Boolean(row.is_pinned),
    isGlobal: Boolean(row.is_global),
    batchId: (row.batch_id as string | null) ?? null,
    status: row.status as import('./notification.types').AnnouncementStatus,
    scheduledFor: (row.scheduled_for as string | null) ?? null,
    expiresAt: (row.expires_at as string | null) ?? null,
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapTemplateRow(row: Record<string, unknown>): import('./notification.types').MessageTemplate {
  return {
    id: String(row.id),
    name: String(row.name),
    type: row.type as TemplateType,
    subject: String(row.subject),
    body: String(row.body),
    variables: (row.variables as string[]) ?? [],
    isActive: Boolean(row.is_active),
    createdBy: (row.created_by as string | null) ?? null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function mapEmailLogRow(row: Record<string, unknown>): import('./notification.types').EmailLog {
  return {
    id: String(row.id),
    recipientEmail: String(row.recipient_email),
    recipientId: (row.recipient_id as string | null) ?? null,
    subject: String(row.subject),
    body: String(row.body),
    status: row.status as import('./notification.types').EmailStatus,
    errorMessage: (row.error_message as string | null) ?? null,
    retryCount: Number(row.retry_count ?? 0),
    notificationId: (row.notification_id as string | null) ?? null,
    templateId: (row.template_id as string | null) ?? null,
    sentAt: (row.sent_at as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}
