import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from '../utils/toast';

interface LockScreenProps {
  onUnlock: (password: string) => Promise<void>;
  isNewVault: boolean;
  blurEnabled?: boolean;
}

export default function LockScreen({ onUnlock, isNewVault, blurEnabled = false }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isNewVault && password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('[LockScreen] Attempting to unlock/create vault...');
      await onUnlock(password);
      console.log('[LockScreen] onUnlock completed successfully');
      toast.success(isNewVault ? 'Vault created successfully!' : 'Vault unlocked!');
    } catch (err) {
      console.error('[LockScreen] Error during unlock:', err);
      const errorMessage = isNewVault
        ? 'Failed to create vault'
        : 'Incorrect password or corrupted vault';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0D1117] flex items-center justify-center p-4 ${blurEnabled ? 'backdrop-blur-sm' : ''}`}>
      <div className="w-full max-w-md">
        <div className={`bg-[#161B22] border border-[#30363D] rounded-lg shadow-2xl p-8 ${blurEnabled ? 'backdrop-blur-md bg-[#161B22]/90' : ''}`}>
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Locksmith Jr.
          </h1>
          <p className="text-gray-400 text-center mb-8">
            {isNewVault ? 'Create your master password' : 'Enter your master password'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Master Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isNewVault && (
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm password"
                  required
                />
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Processing...' : isNewVault ? 'Create Vault' : 'Unlock Vault'}
            </button>
          </form>

          {isNewVault && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
              <p className="text-yellow-400 text-xs">
                <strong>Important:</strong> Store your master password safely. There is no way to recover it if lost.
                This is a demo app for educational purposes only.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
