import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle } from 'lucide-react';
import { resetVault } from '../utils/storage';
import { toast } from '../utils/toast';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export default function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleReset = async () => {
    if (confirmText !== 'RESET') {
      toast.error('Please type RESET to confirm');
      return;
    }

    setProcessing(true);
    try {
      await resetVault();
      toast.success('Vault reset successfully');
      onClose();
      navigate('/home');
    } catch (err) {
      console.error('[ForgotPasswordModal] Error resetting vault:', err);
      toast.error('Failed to reset vault');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#30363D]">
          <h2 className="text-xl font-bold text-white">Forgot Password?</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#30363D] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!showResetConfirm ? (
            <>
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                <h3 className="text-blue-400 font-semibold mb-2">No Password Recovery Available</h3>
                <p className="text-gray-400 text-sm">
                  Locksmith Jr. uses client-side encryption with no backend. This means there is absolutely no way
                  to recover your password if you forget it.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-semibold">Your Options:</h4>
                <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside">
                  <li>Try to remember your password</li>
                  <li>Check if you stored it somewhere safe</li>
                  <li>Reset your vault (this will delete all data)</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-[#0D1117] hover:bg-[#30363D] border border-[#30363D] text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex-1 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg transition-colors"
                >
                  Reset Vault
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-red-400 font-semibold mb-2">Warning: This action is irreversible!</h3>
                    <p className="text-gray-400 text-sm">
                      Resetting your vault will permanently delete all stored passwords and data.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-300 mb-2">
                  Type <span className="text-red-400 font-bold">RESET</span> to confirm
                </label>
                <input
                  id="confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0D1117] border border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Type RESET"
                  autoFocus
                  disabled={processing}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-3 bg-[#0D1117] hover:bg-[#30363D] border border-[#30363D] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={handleReset}
                  disabled={confirmText !== 'RESET' || processing}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/30 text-white font-semibold rounded-lg transition-colors"
                >
                  {processing ? 'Resetting...' : 'Reset Vault'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
