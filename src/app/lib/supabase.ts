import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Track login attempts in localStorage
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

// localStorage can throw in privacy-restricted browsers (e.g. storage access
// blocked on the embedding WordPress page) — never let that crash the app.
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable — rate limiting / session tracking degrade gracefully
  }
}

function safeRemoveItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable
  }
}

function getLoginAttempts(): LoginAttempt {
  const stored = safeGetItem('login_attempts');
  if (!stored) return { count: 0, lastAttempt: 0 };
  try {
    const parsed = JSON.parse(stored);
    if (typeof parsed === 'object' && parsed !== null && typeof parsed.count === 'number') {
      return parsed;
    }
  } catch {
    // Corrupted value — fall through to a clean slate
  }
  return { count: 0, lastAttempt: 0 };
}

function saveLoginAttempts(attempts: LoginAttempt) {
  safeSetItem('login_attempts', JSON.stringify(attempts));
}

function clearLoginAttempts() {
  safeRemoveItem('login_attempts');
}

export function checkAccountLocked(): { locked: boolean; remainingTime?: number } {
  const attempts = getLoginAttempts();
  if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
    const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 1000 / 60);
    return { locked: true, remainingTime };
  }
  return { locked: false };
}

export function recordFailedLogin() {
  const attempts = getLoginAttempts();
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }
  
  saveLoginAttempts(attempts);
  return attempts;
}

export function recordSuccessfulLogin() {
  clearLoginAttempts();
  updateLastActivity();
}

// Session activity tracking
export function updateLastActivity() {
  safeSetItem('last_activity', Date.now().toString());
}

export function checkSessionTimeout(): boolean {
  const lastActivity = safeGetItem('last_activity');
  if (!lastActivity) return true;

  const lastActivityTime = parseInt(lastActivity, 10);
  if (Number.isNaN(lastActivityTime)) return true; // corrupted value — treat as expired

  return Date.now() - lastActivityTime > SESSION_TIMEOUT;
}

// Auth helpers
export async function signInWithPassword(email: string, password: string) {
  // Check if account is locked
  const lockStatus = checkAccountLocked();
  if (lockStatus.locked) {
    throw new Error(`Account locked. Try again in ${lockStatus.remainingTime} minutes.`);
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    recordFailedLogin();
    throw error;
  }

  recordSuccessfulLogin();
  return data;
}

export async function signOut() {
  clearLoginAttempts();
  safeRemoveItem('last_activity');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function getCurrentSession() {
  // Check session timeout
  if (checkSessionTimeout()) {
    await signOut();
    return null;
  }
  
  updateLastActivity();
  
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    // Only log if it's not just "no session"
    if (error.message !== 'Auth session missing!') {
      console.error('Get session error:', error);
    }
    return null;
  }
  return session;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    // Only log if it's not just "no session"
    if (error.message !== 'Auth session missing!') {
      console.error('Get user error:', error);
    }
    return null;
  }
  return user;
}

// Listen to auth state changes
export function onAuthStateChange(callback: (session: unknown) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      safeRemoveItem('last_activity');
    }
    callback(session);
  });
}