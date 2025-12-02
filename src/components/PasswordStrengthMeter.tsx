import { analyzePassword } from '../utils/password';
import { Shield } from 'lucide-react';

interface Props {
  password: string;
  showHints?: boolean;
}

export default function PasswordStrengthMeter({ password, showHints = true }: Props) {
  const strength = analyzePassword(password);

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" style={{ color: strength.color }} />
            <span className="text-sm font-medium" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {strength.entropy} bits entropy
          </span>
        </div>

        <div className="h-2 bg-[#21262D] rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(strength.score / 5) * 100}%`,
              backgroundColor: strength.color,
            }}
          />
        </div>
      </div>

      {showHints && strength.hints.length > 0 && (
        <div className="space-y-1">
          {strength.hints.map((hint, index) => (
            <div key={index} className="text-xs text-gray-400 flex items-start gap-2">
              <span className="text-gray-500 mt-0.5">•</span>
              <span>{hint}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
