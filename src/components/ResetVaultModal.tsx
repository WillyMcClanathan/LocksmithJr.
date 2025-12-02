import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { resetVault } from '../utils/storage';
import { toast } from '../utils/toast';

interface ResetVaultModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ResetVaultModal({ onConfirm, onCancel }: ResetVaultModalProps) {
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
      onConfirm();
    } catch (err) {
      console.error('[ResetVaultModal] Error resetting vault:', err);
      toast.error('Failed to reset vault');
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] border border-red-500/50 rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#30363D]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-bold text-white">Reset Vault</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#30363D] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">Warning: This action is irreversible!</h3>
            <ul className="text-gray-400 text-sm space-y-1 list-disc list-inside">
              <li>All stored passwords will be permanently deleted</li>
              <li>Your current vault will be completely erased</li>
              <li>A new vault will be created with the new password</li>
              <li>This cannot be undone</li>
            </ul>
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
              onClick={onCancel}
              disabled={processing}
              className="flex-1 px-4 py-3 bg-[#0D1117] hover:bg-[#30363D] border border-[#30363D] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              disabled={confirmText !== 'RESET' || processing}
              className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/30 text-white font-semibold rounded-lg transition-colors"
            >
              {processing ? 'Resetting...' : 'Reset Vault'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
