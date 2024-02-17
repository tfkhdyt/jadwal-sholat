import { createCookieSessionStorage } from '@remix-run/node';

type SessionData = {
  locationId: string | null;
};

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData>({
    cookie: {
      name: '__session',
      path: '/',
      sameSite: 'lax',
    },
  });
