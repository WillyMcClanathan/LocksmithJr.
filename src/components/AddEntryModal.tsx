import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { VaultEntry } from '../utils/crypto';
import PasswordGenerator from './PasswordGenerator';
import PasswordStrengthMeter from './PasswordStrengthMeter';

interface AddEntryModalProps {
  entry?: VaultEntry;
  onSave: (entry: Omit<VaultEntry, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

export default function AddEntryModal({ entry, onSave, onClose }: AddEntryModalProps) {
  const [site, setSite] = useState(entry?.site || '');
  const [username, setUsername] = useState(entry?.username || '');
  const [password, setPassword] = useState(entry?.password || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [showGenerator, setShowGenerator] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: entry?.id,
      site,
      username,
      password,
      notes,
    });
  };

  const handleUsePassword = (generatedPassword: string) => {
    setPassword(generatedPassword);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-[#161B22] border border-gray-300 dark:border-[#30363D] rounded-lg shadow-2xl w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-[#30363D]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {entry ? 'Edit Entry' : 'Add Entry'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-white hover:bg-[#30363D] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label htmlFor="site" className="block text-sm font-medium text-gray-300 mb-2">
                Site / Service
              </label>
              <input
                id="site"
                type="text"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username / Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowGenerator(true)}
                  className="text-sm text-[#58A6FF] hover:text-[#79C0FF] flex items-center gap-1 transition-colors"
                >
                  <Sparkles size={14} />
                  Generate
                </button>
              </div>
              <input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a strong password"
                required
              />

              {password && (
                <div className="mt-3 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg p-3">
                  <PasswordStrengthMeter password={password} />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Additional information..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                {entry ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <PasswordGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onUsePassword={handleUsePassword}
      />
    </>
  );
}
