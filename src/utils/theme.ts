const THEME_KEY = 'lsjr.theme.v1';

export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Ignore
  }
  return 'dark';
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Ignore
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function initializeTheme(): void {
  const theme = getTheme();
  applyTheme(theme);
}
