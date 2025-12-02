import { useState } from 'react';
import { Plus, Lock, BookOpen, Download, Search, ShieldAlert } from 'lucide-react';
import { VaultEntry as VaultEntryType, DecryptedVault } from '../utils/crypto';
import VaultEntry from './VaultEntry';
import AddEntryModal from './AddEntryModal';
import ExportImportModal from './ExportImportModal';

interface VaultDashboardProps {
  vault: DecryptedVault;
  onUpdateVault: (vault: DecryptedVault) => void;
  onLock: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onShowExplainer: () => void;
  revealDelayMs: number;
}

export default function VaultDashboard({
  vault,
  onUpdateVault,
  onLock,
  onExport,
  onImport,
  onShowExplainer,
  revealDelayMs,
}: VaultDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VaultEntryType | undefined>();
  const [showExportImport, setShowExportImport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSaveEntry = (entry: Omit<VaultEntryType, 'id'> & { id?: string }) => {
    const newVault = { ...vault };

    if (entry.id) {
      const index = newVault.entries.findIndex((e) => e.id === entry.id);
      if (index !== -1) {
        newVault.entries[index] = entry as VaultEntryType;
      }
    } else {
      newVault.entries.push({
        ...entry,
        id: crypto.randomUUID(),
      });
    }

    onUpdateVault(newVault);
    setShowAddModal(false);
    setEditingEntry(undefined);
  };

  const handleDeleteEntry = (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const newVault = {
      ...vault,
      entries: vault.entries.filter((e) => e.id !== id),
    };
    onUpdateVault(newVault);
  };

  const handleEdit = (entry: VaultEntryType) => {
    setEditingEntry(entry);
    setShowAddModal(true);
  };

  const filteredEntries = vault.entries.filter((entry) =>
    entry.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D1117]">
      <header className="bg-white dark:bg-[#161B22] border-b border-gray-300 dark:border-[#30363D] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Locksmith Jr.</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">{vault.entries.length} entries</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onShowExplainer}
                className="px-4 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] hover:border-blue-500/50 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center gap-2"
                title="Learn about cryptography"
              >
                <BookOpen size={16} />
                <span className="hidden sm:inline">Learn</span>
              </button>
              <button
                onClick={() => setShowExportImport(true)}
                className="px-4 py-2 bg-gray-50 dark:bg-[#0D1117] border border-gray-300 dark:border-[#30363D] hover:border-blue-500/50 text-gray-900 dark:text-white rounded-lg transition-colors flex items-center gap-2"
                title="Export or import vault"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export/Import</span>
              </button>
              <button
                onClick={onLock}
                className="px-4 py-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors flex items-center gap-2"
                title="Panic Lock - Clear memory immediately"
              >
                <ShieldAlert size={16} />
                <span className="hidden sm:inline">Panic Lock</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#161B22] border border-gray-300 dark:border-[#30363D] rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              setEditingEntry(undefined);
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Entry
          </button>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-white dark:bg-[#161B22] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-10 h-10 text-gray-600 dark:text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No entries found' : 'No entries yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first password entry to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Add Your First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry) => (
              <VaultEntry
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDeleteEntry}
                revealDelayMs={revealDelayMs}
              />
            ))}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddEntryModal
          entry={editingEntry}
          onSave={handleSaveEntry}
          onClose={() => {
            setShowAddModal(false);
            setEditingEntry(undefined);
          }}
        />
      )}

      {showExportImport && (
        <ExportImportModal
          onExport={() => {
            onExport();
            setShowExportImport(false);
          }}
          onImport={onImport}
          onClose={() => setShowExportImport(false)}
        />
      )}
    </div>
  );
}
