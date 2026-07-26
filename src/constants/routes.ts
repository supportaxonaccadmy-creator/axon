export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  ACCESS_DENIED: '/access-denied',
  NOT_FOUND: '*',
  ADMIN: '/admin',
  STUDENT: '/student',
} as const;

export type RoutePath = keyof typeof ROUTES;
