const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];
const WARNING_TIME = 20000;
const SETTINGS_KEY = 'locksmith-settings';

export interface SessionSettings {
  autoLockMinutes: number;
}

export function getSessionSettings(): SessionSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load session settings:', e);
  }
  return { autoLockMinutes: 5 };
}

export function saveSessionSettings(settings: SessionSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save session settings:', e);
  }
}

export class SessionManager {
  private timeoutId: number | null = null;
  private warningTimeoutId: number | null = null;
  private lastActivity: number = Date.now();
  private autoLockMinutes: number;
  private onWarning: (() => void) | null = null;
  private onLock: (() => void) | null = null;
  private isActive: boolean = false;

  constructor(autoLockMinutes: number = 5) {
    this.autoLockMinutes = autoLockMinutes;
    this.handleActivity = this.handleActivity.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  start(onWarning: () => void, onLock: () => void): void {
    this.onWarning = onWarning;
    this.onLock = onLock;
    this.isActive = true;
    this.lastActivity = Date.now();

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.resetTimer();
  }

  stop(): void {
    this.isActive = false;
    this.clearTimers();

    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, this.handleActivity);
    });

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  updateTimeout(autoLockMinutes: number): void {
    this.autoLockMinutes = autoLockMinutes;
    if (this.isActive) {
      this.resetTimer();
    }
  }

  private handleActivity(): void {
    this.lastActivity = Date.now();
    if (this.isActive) {
      this.resetTimer();
    }
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.lastActivity = Date.now();
    } else {
      const elapsed = Date.now() - this.lastActivity;
      const timeoutMs = this.autoLockMinutes * 60 * 1000;

      if (elapsed >= timeoutMs) {
        this.lock();
      } else {
        this.resetTimer();
      }
    }
  }

  private resetTimer(): void {
    this.clearTimers();

    const timeoutMs = this.autoLockMinutes * 60 * 1000;
    const warningMs = timeoutMs - WARNING_TIME;

    this.warningTimeoutId = window.setTimeout(() => {
      if (this.onWarning) {
        this.onWarning();
      }
    }, warningMs);

    this.timeoutId = window.setTimeout(() => {
      this.lock();
    }, timeoutMs);
  }

  private clearTimers(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    if (this.warningTimeoutId !== null) {
      window.clearTimeout(this.warningTimeoutId);
      this.warningTimeoutId = null;
    }
  }

  private lock(): void {
    if (this.onLock && this.isActive) {
      this.onLock();
    }
  }

  resetActivity(): void {
    this.lastActivity = Date.now();
    if (this.isActive) {
      this.resetTimer();
    }
  }
}
