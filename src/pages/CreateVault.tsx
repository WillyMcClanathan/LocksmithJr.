import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from '../utils/toast';
import { vaultExists } from '../utils/storage';
import ResetVaultModal from '../components/ResetVaultModal';

interface CreateVaultProps {
  onCreate: (password: string) => Promise<void>;
}

export default function CreateVault({ onCreate }: CreateVaultProps) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasExistingVault, setHasExistingVault] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [checkingVault, setCheckingVault] = useState(true);

  useEffect(() => {
    checkExistingVault();
  }, []);

  const checkExistingVault = async () => {
    const exists = await vaultExists();
    setHasExistingVault(exists);
    setCheckingVault(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (hasExistingVault) {
      setShowResetModal(true);
      return;
    }

    if (password !== confirmPassword) {
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
      console.log('[CreateVault] Starting vault creation...');
      console.log('[CreateVault] Password length:', password.length);

      await onCreate(password);

      console.log('[CreateVault] Vault created successfully');
      toast.success('Vault created! Please unlock to continue.');
      navigate('/unlock');
    } catch (err: any) {
      console.error('[CreateVault] VAULT CREATION FAILED');
      console.error('[CreateVault] Error name:', err?.name);
      console.error('[CreateVault] Error message:', err?.message);
      console.error('[CreateVault] Full error:', err);
      console.error('[CreateVault] Stack trace:', err?.stack);

      const errorMessage = `Failed to create vault: ${err?.message || 'Unknown error'}. Check console for details.`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirmed = async () => {
    setShowResetModal(false);
    setLoading(true);
    try {
      console.log('[CreateVault] Reset confirmed, creating vault...');
      await onCreate(password);
      toast.success('Vault created! Please unlock to continue.');
      navigate('/unlock');
    } catch (err: any) {
      console.error('[CreateVault] VAULT CREATION FAILED (after reset)');
      console.error('[CreateVault] Error name:', err?.name);
      console.error('[CreateVault] Error message:', err?.message);
      console.error('[CreateVault] Full error:', err);
      console.error('[CreateVault] Stack trace:', err?.stack);

      const errorMessage = `Failed to create vault: ${err?.message || 'Unknown error'}. Check console.`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingVault) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0D1117] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D1117] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#161B22] border border-gray-300 dark:border-[#30363D] rounded-lg shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-yellow-400" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-white mb-2">
            Create Vault
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
            Set a strong master password to secure your vault
          </p>

          {hasExistingVault && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-yellow-400 font-semibold mb-1">Vault Already Exists</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Creating a new vault will permanently delete your existing vault and all stored passwords.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Confirm password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 text-black font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : hasExistingVault ? 'Reset & Create New Vault' : 'Create Vault'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/50 rounded-lg">
            <p className="text-blue-400 text-xs">
              <strong>Important:</strong> Store your master password safely. There is no way to recover it if lost.
              This is a demo app for educational purposes only.
            </p>
          </div>
        </div>
      </div>

      {showResetModal && (
        <ResetVaultModal
          onConfirm={handleResetConfirmed}
          onCancel={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
}
