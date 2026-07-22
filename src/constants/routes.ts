export const ROUTES = {
  HOME: '/',
  UNAUTHORIZED: '/unauthorized',
  ACCESS_DENIED: '/access-denied',
  NOT_FOUND: '*',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
