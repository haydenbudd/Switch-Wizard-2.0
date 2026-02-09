import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

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

function getLoginAttempts(): LoginAttempt {
  const stored = localStorage.getItem('login_attempts');
  if (!stored) return { count: 0, lastAttempt: 0 };
  return JSON.parse(stored);
}

function saveLoginAttempts(attempts: LoginAttempt) {
  localStorage.setItem('login_attempts', JSON.stringify(attempts));
}

function clearLoginAttempts() {
  localStorage.removeItem('login_attempts');
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
  localStorage.setItem('last_activity', Date.now().toString());
}

export function checkSessionTimeout(): boolean {
  const lastActivity = localStorage.getItem('last_activity');
  if (!lastActivity) return true;
  
  const timeSinceActivity = Date.now() - parseInt(lastActivity);
  return timeSinceActivity > SESSION_TIMEOUT;
}

// Auth helpers
export async function signInWithPassword(email: string, password: string) {
  // Check if account is locked
  const lockStatus = checkAccountLocked();
  if (lockStatus.locked) {
    throw new Error(`Account locked. Try again in ${lockStatus.remainingTime} minutes.`);
  }
  
  try {
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
  } catch (err) {
    throw err;
  }
}

export async function signOut() {
  clearLoginAttempts();
  localStorage.removeItem('last_activity');
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
export function onAuthStateChange(callback: (session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      localStorage.removeItem('last_activity');
    }
    callback(session);
  });
}