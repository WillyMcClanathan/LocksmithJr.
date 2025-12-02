import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileAppBarProps {
  title?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
}

export default function MobileAppBar({ title, showBack, actions }: MobileAppBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const getTitle = () => {
    if (title) return title;

    switch (location.pathname) {
      case '/home':
        return 'Locksmith Jr.';
      case '/vault':
        return 'Vault';
      case '/learn':
        return 'Learn';
      case '/create':
        return 'Create Vault';
      case '/unlock':
        return 'Unlock Vault';
      default:
        return 'Locksmith Jr.';
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-white dark:bg-[#161B22] border-b border-gray-200 dark:border-[#30363D] pt-safe z-40 elevation-2">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="touch-target flex items-center justify-center -ml-2 text-gray-700 dark:text-gray-300"
              aria-label="Go back"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          {!showBack && (
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="/icons/locksmithjr-1024.png"
                alt="Locksmith Jr."
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {getTitle()}
          </h1>
        </div>
        {actions && <div className="flex items-center gap-1">{actions}</div>}
      </div>
    </header>
  );
}
