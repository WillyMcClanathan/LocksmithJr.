export type AppSettings = {
  autoLockMinutes: number;
  revealHoldMs: number;
  theme: 'system' | 'dark' | 'light';
  blurOnLock: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  autoLockMinutes: 5,
  revealHoldMs: 500,
  theme: 'dark',
  blurOnLock: true,
};

const LS_KEY = 'lsjr.settings.v1';

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(LS_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      autoLockMinutes: clamp(parsed.autoLockMinutes ?? DEFAULT_SETTINGS.autoLockMinutes, 2, 20),
      revealHoldMs: clamp(parsed.revealHoldMs ?? DEFAULT_SETTINGS.revealHoldMs, 300, 1000),
      theme: ['system', 'dark', 'light'].includes(parsed.theme) ? parsed.theme : DEFAULT_SETTINGS.theme,
      blurOnLock: typeof parsed.blurOnLock === 'boolean' ? parsed.blurOnLock : DEFAULT_SETTINGS.blurOnLock,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  const validated: AppSettings = {
    autoLockMinutes: clamp(settings.autoLockMinutes, 2, 20),
    revealHoldMs: clamp(settings.revealHoldMs, 300, 1000),
    theme: settings.theme,
    blurOnLock: settings.blurOnLock,
  };

  localStorage.setItem(LS_KEY, JSON.stringify(validated));
}

let mediaQueryListener: (() => void) | null = null;

export function applyTheme(theme: AppSettings['theme']): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);

  if (mediaQueryListener) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.removeEventListener('change', mediaQueryListener);
    mediaQueryListener = null;
  }

  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryListener = () => {
      const currentSettings = loadSettings();
      if (currentSettings.theme === 'system') {
        const prefersDarkNow = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDarkNow);
      }
    };
    mediaQuery.addEventListener('change', mediaQueryListener);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function initializeTheme(): void {
  const settings = loadSettings();
  applyTheme(settings.theme);
}
