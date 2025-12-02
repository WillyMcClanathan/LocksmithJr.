import { useState, useEffect } from 'react';
import { X, RefreshCw, Copy, Check } from 'lucide-react';
import { generatePassword, DEFAULT_PASSWORD_OPTIONS, PasswordOptions } from '../utils/password';
import { toast } from '../utils/toast';
import PasswordStrengthMeter from './PasswordStrengthMeter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUsePassword: (password: string) => void;
}

export default function PasswordGenerator({ isOpen, onClose, onUsePassword }: Props) {
  const [options, setOptions] = useState<PasswordOptions>(DEFAULT_PASSWORD_OPTIONS);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateNewPassword();
    }
  }, [isOpen]);

  const generateNewPassword = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error('Failed to copy password');
    }
  };

  const handleUse = () => {
    onUsePassword(password);
    onClose();
    toast.success('Password inserted');
  };

  useEffect(() => {
    generateNewPassword();
  }, [options]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 z-40 backdrop-enter backdrop-active backdrop-show"
        onClick={onClose}
      />
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-[#161B22] rounded-lg shadow-xl z-50 scale-enter scale-active scale-show">
        <div className="p-6 border-b border-[#30363D] flex items-center justify-between">
          <h2 className="text-xl font-bold">Password Generator</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#30363D] rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 mb-3">
              <div className="font-mono text-lg text-white break-all mb-3">
                {password}
              </div>
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="flex gap-2">
              <button
                onClick={generateNewPassword}
                className="flex-1 bg-[#21262D] hover:bg-[#30363D] px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={handleCopy}
                className="flex-1 bg-[#21262D] hover:bg-[#30363D] px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Length: {options.length}
            </label>
            <input
              type="range"
              min="8"
              max="32"
              value={options.length}
              onChange={(e) =>
                setOptions({ ...options, length: Number(e.target.value) })
              }
              className="w-full h-2 bg-[#0D1117] rounded-lg appearance-none cursor-pointer accent-[#1F6FEB]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>8</span>
              <span>32</span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg cursor-pointer hover:bg-[#161B22] transition-colors">
              <input
                type="checkbox"
                checked={options.uppercase}
                onChange={(e) =>
                  setOptions({ ...options, uppercase: e.target.checked })
                }
                className="w-4 h-4 accent-[#1F6FEB] cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium">Uppercase Letters</div>
                <div className="text-xs text-gray-400">A-Z</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg cursor-pointer hover:bg-[#161B22] transition-colors">
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={(e) =>
                  setOptions({ ...options, lowercase: e.target.checked })
                }
                className="w-4 h-4 accent-[#1F6FEB] cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium">Lowercase Letters</div>
                <div className="text-xs text-gray-400">a-z</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg cursor-pointer hover:bg-[#161B22] transition-colors">
              <input
                type="checkbox"
                checked={options.numbers}
                onChange={(e) =>
                  setOptions({ ...options, numbers: e.target.checked })
                }
                className="w-4 h-4 accent-[#1F6FEB] cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium">Numbers</div>
                <div className="text-xs text-gray-400">0-9</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg cursor-pointer hover:bg-[#161B22] transition-colors">
              <input
                type="checkbox"
                checked={options.symbols}
                onChange={(e) =>
                  setOptions({ ...options, symbols: e.target.checked })
                }
                className="w-4 h-4 accent-[#1F6FEB] cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium">Symbols</div>
                <div className="text-xs text-gray-400">!@#$%^&*()-_=+</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-[#0D1117] rounded-lg cursor-pointer hover:bg-[#161B22] transition-colors">
              <input
                type="checkbox"
                checked={options.avoidAmbiguous}
                onChange={(e) =>
                  setOptions({ ...options, avoidAmbiguous: e.target.checked })
                }
                className="w-4 h-4 accent-[#1F6FEB] cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-medium">Avoid Ambiguous Characters</div>
                <div className="text-xs text-gray-400">Excludes: i, l, 1, L, o, 0, O</div>
              </div>
            </label>
          </div>
        </div>

        <div className="p-4 border-t border-[#30363D] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-[#21262D] hover:bg-[#30363D] px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUse}
            className="flex-1 bg-[#238636] hover:bg-[#2EA043] px-4 py-2 rounded-lg transition-colors font-semibold"
          >
            Use Password
          </button>
        </div>
      </div>
    </>
  );
}
