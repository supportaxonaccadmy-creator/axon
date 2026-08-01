export type NotificationType =
  | 'course_purchased' | 'enrollment_success' | 'payment_failed'
  | 'live_class_reminder' | 'live_class_started' | 'assignment_available'
  | 'pdf_uploaded' | 'video_uploaded' | 'mcq_available'
  | 'course_completed' | 'certificate_ready'
  | 'system_announcement' | 'custom_admin_message';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationChannel = 'in_app' | 'email' | 'push';
export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type TemplateType = 'welcome' | 'purchase_success' | 'enrollment' | 'password_reset' | 'payment_failed' | 'live_reminder' | 'certificate' | 'custom';
export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  actionUrl: string | null;
  actionLabel: string | null;
  batchId: string | null;
  createdBy: string | null;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipient {
  id: string;
  notificationId: string;
  recipientId: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationWithRecipient extends Notification {
  recipientId: string;
  isRead: boolean;
  readAt: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  isPinned: boolean;
  isGlobal: boolean;
  batchId: string | null;
  status: AnnouncementStatus;
  scheduledFor: string | null;
  expiresAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  id: string;
  recipientEmail: string;
  recipientId: string | null;
  subject: string;
  body: string;
  status: EmailStatus;
  errorMessage: string | null;
  retryCount: number;
  notificationId: string | null;
  templateId: string | null;
  sentAt: string | null;
  createdAt: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  actionUrl?: string | null;
  actionLabel?: string | null;
  batchId?: string | null;
  scheduledFor?: string | null;
  recipientIds: string[];
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  imageUrl?: string | null;
  isPinned?: boolean;
  isGlobal?: boolean;
  batchId?: string | null;
  status?: AnnouncementStatus;
  scheduledFor?: string | null;
  expiresAt?: string | null;
}

export interface CreateTemplateInput {
  name: string;
  type: TemplateType;
  subject: string;
  body: string;
  variables?: string[];
}

export interface BroadcastInput {
  title: string;
  message: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  target: BroadcastTarget;
  actionUrl?: string | null;
  actionLabel?: string | null;
}

export type BroadcastTarget =
  | { type: 'all_students' }
  | { type: 'batch'; batchId: string }
  | { type: 'individual'; recipientIds: string[] };

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  recent: NotificationWithRecipient[];
}

export interface NotificationFilter {
  type?: NotificationType | null;
  isRead?: boolean | null;
  search?: string | null;
  limit?: number;
  offset?: number;
}
