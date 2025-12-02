import { useState, useRef, useEffect } from 'react';
import { Copy, Eye } from 'lucide-react';
import { toast } from '../utils/toast';

interface Props {
  password: string;
  label?: string;
  revealDelayMs?: number;
}

export default function SecurePasswordField({ password, label, revealDelayMs = 500 }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [pressTimer, setPressTimer] = useState<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (pressTimer !== null) {
        window.clearTimeout(pressTimer);
      }
    };
  }, [pressTimer]);

  const handlePressStart = () => {
    const timer = window.setTimeout(() => {
      setIsRevealed(true);
    }, revealDelayMs);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer !== null) {
      window.clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setIsRevealed(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      toast.success('Password copied to clipboard');
    } catch (e) {
      toast.error('Failed to copy password');
    }
  };

  const maskedPassword = '•'.repeat(Math.min(password.length, 12));

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        {label && <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</label>}
        <div className="bg-gray-50 dark:bg-[#0D1117] rounded px-3 py-2 font-mono text-sm select-none">
          {isRevealed ? password : maskedPassword}
        </div>
      </div>
      <div className="flex gap-1">
        <button
          ref={buttonRef}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onTouchCancel={handlePressEnd}
          className="p-2 hover:bg-gray-100 dark:hover:bg-[#30363D] rounded transition-colors"
          title="Press and hold to reveal"
          type="button"
        >
          <Eye className={`w-4 h-4 ${isRevealed ? 'text-[#58A6FF]' : 'text-gray-600 dark:text-gray-400'}`} />
        </button>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-100 dark:hover:bg-[#30363D] rounded transition-colors"
          title="Copy password"
          type="button"
        >
          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
}
