import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Lock, BookOpen } from 'lucide-react';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'vault', label: 'Vault', icon: Lock, path: '/vault' },
    { id: 'learn', label: 'Learn', icon: BookOpen, path: '/learn' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#161B22] border-t border-gray-200 dark:border-[#30363D] pb-safe z-50 elevation-4">
      <div className="flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center py-2 px-4 touch-target transition-all duration-200 ${
                active ? 'scale-105' : 'scale-100'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span
                className={`text-xs mt-1 font-medium transition-all duration-200 ${
                  active
                    ? 'text-blue-500 dark:text-blue-400 opacity-100'
                    : 'text-gray-500 dark:text-gray-400 opacity-70'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
