export interface DateRange {
  start: Date;
  end: Date;
}

export interface DurationParts {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export interface RelativeDateResult {
  text: string;
  isPast: boolean;
  diffMs: number;
}

export interface ExpiryResult {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number | null;
  expiryDate: Date | null;
}
