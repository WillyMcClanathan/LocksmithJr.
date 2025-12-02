import { useState, useRef } from 'react';
import { X, Download, Upload, AlertTriangle } from 'lucide-react';

interface ExportImportModalProps {
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onClose: () => void;
}

export default function ExportImportModal({ onExport, onImport, onClose }: ExportImportModalProps) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError('');

    try {
      await onImport(file);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import vault');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#161B22] border border-[#30363D] rounded-lg shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[#30363D]">
          <h2 className="text-xl font-bold text-white">Export / Import</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#30363D] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Export Vault</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Download your encrypted vault as a JSON file. Keep this file safe.
                </p>
                <button
                  onClick={onExport}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  Export Encrypted Vault
                </button>
              </div>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Import Vault</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Load an encrypted vault file. You'll need the master password.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                  {importing ? 'Importing...' : 'Import Vault File'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-xs">
                <strong>Warning:</strong> Importing a vault will replace your current vault.
                Export your current vault first if you want to keep it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
