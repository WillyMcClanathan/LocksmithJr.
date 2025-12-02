import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, BookOpen, Home, ArrowLeft } from 'lucide-react';
import { getTheme, saveTheme, applyTheme, Theme } from '../utils/theme';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme());

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    saveTheme(theme);
    applyTheme(theme);
  };

  useEffect(() => {
    setCurrentTheme(getTheme());
  }, []);

  const showBackButton = location.pathname === '/create' || location.pathname === '/unlock';

  return (
    <header className="bg-white dark:bg-[#161B22] border-b border-gray-200 dark:border-[#30363D] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton ? (
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] hover:border-blue-500/50 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
                <span>Back</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/home')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                  <img src="/icons/locksmithjr-1024.png" alt="Locksmith Jr. logo" className="w-full h-full" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Locksmith Jr.</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Learn Encryption</p>
                </div>
              </button>
            )}
          </div>

          <nav className="flex items-center gap-2">
            <button
              onClick={() => navigate('/home')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                location.pathname === '/home'
                  ? 'bg-blue-500/10 border border-blue-500/50 text-blue-400'
                  : 'bg-gray-100 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] hover:border-blue-500/50 text-gray-900 dark:text-white'
              }`}
            >
              <Home size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={() => navigate('/vault')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                location.pathname === '/vault'
                  ? 'bg-blue-500/10 border border-blue-500/50 text-blue-400'
                  : 'bg-gray-100 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] hover:border-blue-500/50 text-gray-900 dark:text-white'
              }`}
            >
              <Lock size={16} />
              <span className="hidden sm:inline">Vault</span>
            </button>
            <button
              onClick={() => navigate('/learn')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                location.pathname === '/learn'
                  ? 'bg-blue-500/10 border border-blue-500/50 text-blue-400'
                  : 'bg-gray-100 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] hover:border-blue-500/50 text-gray-900 dark:text-white'
              }`}
            >
              <BookOpen size={16} />
              <span className="hidden sm:inline">Learn</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0D1117] dark:bg-[#0D1117] bg-gray-100 border border-[#30363D] dark:border-[#30363D] border-gray-300 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">Theme:</span>
              <div className="flex gap-0 border border-gray-300 dark:border-[#30363D] rounded overflow-hidden">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    currentTheme === 'light'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-[#0D1117] text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#30363D]'
                  }`}
                  title="Switch to light theme"
                >
                  Light
                </button>
                <div className="w-px bg-gray-300 dark:bg-[#30363D]"></div>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-3 py-1 text-xs transition-colors ${
                    currentTheme === 'dark'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white dark:bg-[#0D1117] text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#30363D]'
                  }`}
                  title="Switch to dark theme"
                >
                  Dark
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
