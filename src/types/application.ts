export type UserRole = 'admin' | 'instructor' | 'student' | 'guest';

export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'manage'
  | 'publish'
  | 'moderate';

export interface AppInfo {
  name: string;
  shortName: string;
  description: string;
  version: string;
  locale: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}

export interface FeatureConfig {
  key: string;
  label: string;
  enabled: boolean;
}
