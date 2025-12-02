export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
}

export interface PasswordStrength {
  score: number;
  entropy: number;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  hints: string[];
}

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
};

const AMBIGUOUS_CHARS = 'il1Lo0O';

export function generatePassword(options: PasswordOptions): string {
  let charset = '';

  if (options.uppercase) charset += CHAR_SETS.uppercase;
  if (options.lowercase) charset += CHAR_SETS.lowercase;
  if (options.numbers) charset += CHAR_SETS.numbers;
  if (options.symbols) charset += CHAR_SETS.symbols;

  if (charset === '') {
    charset = CHAR_SETS.lowercase;
  }

  if (options.avoidAmbiguous) {
    charset = charset
      .split('')
      .filter((char) => !AMBIGUOUS_CHARS.includes(char))
      .join('');
  }

  const password: string[] = [];
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password.push(charset[array[i] % charset.length]);
  }

  if (options.uppercase && !password.some((c) => CHAR_SETS.uppercase.includes(c))) {
    const pos = array[0] % options.length;
    password[pos] = CHAR_SETS.uppercase[array[1] % CHAR_SETS.uppercase.length];
  }

  if (options.lowercase && !password.some((c) => CHAR_SETS.lowercase.includes(c))) {
    const pos = array[1] % options.length;
    password[pos] = CHAR_SETS.lowercase[array[2] % CHAR_SETS.lowercase.length];
  }

  if (options.numbers && !password.some((c) => CHAR_SETS.numbers.includes(c))) {
    const pos = array[2] % options.length;
    password[pos] = CHAR_SETS.numbers[array[3] % CHAR_SETS.numbers.length];
  }

  if (options.symbols && !password.some((c) => CHAR_SETS.symbols.includes(c))) {
    const pos = array[3] % options.length;
    password[pos] = CHAR_SETS.symbols[array[4] % CHAR_SETS.symbols.length];
  }

  return password.join('');
}

export function analyzePassword(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      entropy: 0,
      label: 'Very Weak',
      color: '#dc2626',
      hints: ['Password is required'],
    };
  }

  const length = password.length;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);

  let poolSize = 0;
  if (hasUppercase) poolSize += 26;
  if (hasLowercase) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 32;

  const entropy = length * Math.log2(poolSize || 1);

  const hints: string[] = [];

  if (length < 12) {
    hints.push('Use at least 12 characters');
  }

  if (!hasUppercase) {
    hints.push('Add uppercase letters (A-Z)');
  }

  if (!hasLowercase) {
    hints.push('Add lowercase letters (a-z)');
  }

  if (!hasNumbers) {
    hints.push('Add numbers (0-9)');
  }

  if (!hasSymbols) {
    hints.push('Add symbols (!@#$%^&*)');
  }

  const commonPatterns = [
    /^(.)\1+$/,
    /^(012|123|234|345|456|567|678|789|890)+/,
    /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+/i,
    /(password|qwerty|asdf|zxcv|admin|letmein|welcome|monkey|dragon)/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    hints.push('Avoid common patterns and dictionary words');
    return {
      score: 1,
      entropy,
      label: 'Very Weak',
      color: '#dc2626',
      hints,
    };
  }

  let score = 0;

  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;

  if (hasUppercase) score++;
  if (hasLowercase) score++;
  if (hasNumbers) score++;
  if (hasSymbols) score++;

  score = Math.min(5, score);

  let label: PasswordStrength['label'];
  let color: string;

  if (score <= 1) {
    label = 'Very Weak';
    color = '#dc2626';
  } else if (score === 2) {
    label = 'Weak';
    color = '#f59e0b';
  } else if (score === 3) {
    label = 'Fair';
    color = '#eab308';
  } else if (score === 4) {
    label = 'Strong';
    color = '#22c55e';
  } else {
    label = 'Very Strong';
    color = '#10b981';
  }

  if (hints.length === 0 && score >= 4) {
    hints.push('Great password!');
  }

  return {
    score,
    entropy: Math.round(entropy),
    label,
    color,
    hints,
  };
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: true,
};
