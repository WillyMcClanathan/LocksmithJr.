import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Plus, Info } from 'lucide-react';
import { vaultExists } from '../utils/storage';
import InstallButton, { InstalledBadge } from '../components/InstallButton';
import OfflineBadge from '../components/OfflineBadge';

export default function Home() {
  const navigate = useNavigate();
  const [hasVault, setHasVault] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkVault();
  }, []);

  const checkVault = async () => {
    const exists = await vaultExists();
    setHasVault(exists);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-900 dark:text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 fade-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4">
          <img src="/icons/locksmithjr-1024.png" alt="Locksmith Jr. logo" className="w-full h-full" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Locksmith Jr.</h1>
        <p className="text-gray-600 dark:text-gray-400 text-base mb-4 px-4">
          Learn encryption by building your own password vault
        </p>
        <div className="flex items-center justify-center gap-2">
          <OfflineBadge />
          <InstalledBadge />
          <InstallButton />
        </div>
      </div>

        <div className="flex flex-col gap-4 mb-6">
          <button
            className={`bg-white dark:bg-[#161B22] rounded-2xl p-5 transition-all touch-target text-left elevation-2 active:scale-[0.98] ${
              hasVault
                ? 'border border-gray-200 dark:border-[#30363D]'
                : 'border-2 border-yellow-500/50'
            }`}
            onClick={() => navigate('/create')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Plus className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Create Vault</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {hasVault
                    ? 'Reset and create a new encrypted vault'
                    : 'Create your first encrypted vault to get started'}
                </p>
              </div>
            </div>
          </button>

          <button
            className={`bg-white dark:bg-[#161B22] rounded-2xl p-5 transition-all touch-target text-left elevation-2 relative ${
              hasVault
                ? 'border border-gray-200 dark:border-[#30363D] active:scale-[0.98]'
                : 'border border-gray-200 dark:border-[#30363D] opacity-50'
            }`}
            onClick={() => hasVault && navigate('/unlock')}
            disabled={!hasVault}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Unlock Vault</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {hasVault
                    ? 'Enter your master password to access your vault'
                    : 'No vault found yet. Create one first.'}
                </p>
              </div>
            </div>
            {!hasVault && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/60 dark:bg-[#161B22]/60 rounded-2xl">
                <div className="bg-gray-100 dark:bg-[#0D1117] px-3 py-1.5 rounded-full elevation-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Create a vault first</p>
                </div>
              </div>
            )}
          </button>
        </div>

        <div className="bg-blue-500/10 rounded-2xl p-4 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-blue-400 font-semibold mb-1 text-sm">Educational Purpose</h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                Locksmith Jr. demonstrates real encryption techniques (PBKDF2, AES-GCM) in a hands-on way.
                This is a learning tool and should not replace production password managers for sensitive data.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
