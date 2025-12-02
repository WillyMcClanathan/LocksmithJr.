import { useState } from 'react';
import { Copy, Edit2, Trash2, Check } from 'lucide-react';
import { VaultEntry as VaultEntryType } from '../utils/crypto';
import SecurePasswordField from './SecurePasswordField';

interface VaultEntryProps {
  entry: VaultEntryType;
  onEdit: (entry: VaultEntryType) => void;
  onDelete: (id: string) => void;
  revealDelayMs?: number;
}

export default function VaultEntry({ entry, onEdit, onDelete, revealDelayMs }: VaultEntryProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#161B22] border border-gray-300 dark:border-[#30363D] rounded-lg p-4 hover:border-blue-500/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-gray-900 dark:text-white font-semibold text-lg">{entry.site}</h3>
          {entry.notes && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{entry.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Username</div>
            <div className="bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] rounded-lg px-3 py-2">
              <div className="text-gray-900 dark:text-white text-sm">{entry.username}</div>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(entry.username)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#30363D] rounded-lg transition-colors mt-5"
            title="Copy username"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>

        <SecurePasswordField
          password={entry.password}
          label="Password"
          revealDelayMs={revealDelayMs}
        />
      </div>
    </div>
  );
}
