import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '../utils/toast';
import { vaultExists } from '../utils/storage';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const BLUR_ON_LOCK = true;

interface UnlockVaultProps {
  onUnlock: (password: string) => Promise<void>;
}

export default function UnlockVault({ onUnlock }: UnlockVaultProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  useEffect(() => {
    checkVaultExists();
  }, []);

  const checkVaultExists = async () => {
    const exists = await vaultExists();
    if (!exists) {
      toast.error('No vault found. Create one first.');
      navigate('/create');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('[UnlockVault] Attempting to unlock vault...');
      await onUnlock(password);
      console.log('[UnlockVault] Vault unlocked successfully');
      toast.success('Vault unlocked!');
      navigate('/vault');
    } catch (err) {
      console.error('[UnlockVault] Error unlocking vault:', err);
      const errorMessage = 'Incorrect password or vault data is corrupted';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-[#0D1117] flex items-center justify-center p-4 ${BLUR_ON_LOCK ? 'backdrop-blur-sm' : ''}`}>
      <div className="w-full max-w-md">
        <div className={`bg-white dark:bg-[#161B22] border border-gray-300 dark:border-[#30363D] rounded-lg shadow-2xl p-8 ${BLUR_ON_LOCK ? 'backdrop-blur-md dark:bg-[#161B22]/90 bg-white/90' : ''}`}>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Unlock Vault
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Enter your master password to access your vault
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                  autoFocus
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-gray-900 dark:text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Unlocking...' : 'Unlock Vault'}
            </button>

            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-blue-400 transition-colors"
            >
              Forgot password?
            </button>
          </form>
        </div>
      </div>

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </div>
  );
}
