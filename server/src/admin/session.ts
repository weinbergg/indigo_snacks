import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { env } from '../config/env';

const COOKIE_NAME = 'indigo_admin';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret() {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || '';
}

function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('hex');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function parseCookies(header: string | undefined) {
  const cookies: Record<string, string> = {};

  if (!header) {
    return cookies;
  }

  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index === -1) {
      continue;
    }

    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();

    if (!key) {
      continue;
    }

    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  }

  return cookies;
}

export function isAdminConfigured() {
  return Boolean(env.ADMIN_PASSWORD);
}

export function verifyAdminPassword(password: string) {
  if (!env.ADMIN_PASSWORD) {
    return false;
  }

  return safeEqual(password, env.ADMIN_PASSWORD);
}

export function hasAdminSession(request: Request) {
  if (!isAdminConfigured() || !sessionSecret()) {
    return false;
  }

  const token = parseCookies(request.headers.cookie)[COOKIE_NAME];
  if (!token) {
    return false;
  }

  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) {
    return false;
  }

  if (Number(expiresAt) < Date.now()) {
    return false;
  }

  return safeEqual(signature, sign(`admin|${expiresAt}`));
}

function cookieSecure(request?: Request) {
  return request?.get('x-forwarded-proto') === 'https' || request?.protocol === 'https';
}

export function setAdminSession(response: Response, request?: Request) {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const value = `${expiresAt}.${sign(`admin|${expiresAt}`)}`;
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(value)}`,
    'Path=/admin',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`
  ];

  if (cookieSecure(request)) {
    parts.push('Secure');
  }

  response.setHeader('Set-Cookie', parts.join('; '));
}

export function clearAdminSession(response: Response, request?: Request) {
  const parts = [`${COOKIE_NAME}=`, 'Path=/admin', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];

  if (cookieSecure(request)) {
    parts.push('Secure');
  }

  response.setHeader('Set-Cookie', parts.join('; '));
}
