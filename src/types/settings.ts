export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'export' | 'publish' | 'archive';

export interface PermissionGroupConfig {
  key: string;
  label: string;
  actions: PermissionAction[];
}

export interface RoleConfig {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  permissions: Record<string, PermissionAction[]>;
}

export interface AdminUser {
  id: string;
  authUserId: string;
  uuid: string;
  fullName: string | null;
  email: string | null;
  mobile: string | null;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  entity: string;
  timestamp: string;
  ip: string;
  browser: string;
}

export interface BackupRecord {
  id: string;
  filename: string;
  size: string;
  createdAt: string;
  status: 'completed' | 'failed' | 'in-progress';
}

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  socialFacebook: string;
  socialInstagram: string;
  socialYouTube: string;
  socialTelegram: string;
  footerCopyright: string;
  footerLinks: string;
}

export interface SeoSettings {
  homepageTitle: string;
  homepageDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  robots: string;
  canonicalUrl: string;
  sitemapUrl: string;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  username: string;
  password: string;
  encryption: 'none' | 'ssl' | 'tls';
  senderName: string;
  senderEmail: string;
}

export interface PaymentGatewayConfig {
  key: string;
  label: string;
  enabled: boolean;
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
  testMode: boolean;
}

export interface StorageSettings {
  bucketName: string;
  maxUploadSize: string;
  allowedExtensions: string;
  imageMaxWidth: string;
  imageMaxHeight: string;
  videoMaxSize: string;
  pdfMaxSize: string;
  attachmentMaxSize: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  announcementNotifications: boolean;
  studentRegistration: boolean;
  purchaseSuccess: boolean;
  enrollmentSuccess: boolean;
  passwordReset: boolean;
  coursePublish: boolean;
}

export interface SecuritySettings {
  minPasswordLength: number;
  requireNumbers: boolean;
  requireSymbols: boolean;
  requireUppercase: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorAuth: boolean;
}

export interface SystemSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  maintenanceMode: boolean;
  debugMode: boolean;
  registrationEnabled: boolean;
  studentApprovalRequired: boolean;
}

export interface SystemHealth {
  supabaseStatus: string;
  storageUsage: string;
  databaseStatus: string;
  environment: string;
  version: string;
  memoryUsage: string;
  lastBackup: string;
}
