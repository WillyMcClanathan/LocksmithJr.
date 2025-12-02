import { useState, useEffect } from 'react';
import { Play, SkipForward, RotateCcw, Copy, Info, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deriveKeyPBKDF2, encryptJSON, decryptJSON, kdfProof8 } from '../utils/crypto';
import { abToB64, u8ToB64, b64ToAb } from '../utils/base64';
import { toast } from '../utils/toast';
import AnimatedStep from '../components/AnimatedStep';
import { AnimatedBackdrop, AnimatedModal } from '../components/AnimatedModal';

type Step = 'intro' | 'salt' | 'kdf' | 'iv' | 'encrypt' | 'store' | 'decrypt' | 'complete';

interface StepData {
  id: Step;
  title: string;
  description: string;
}

const steps: StepData[] = [
  { id: 'intro', title: 'Introduction', description: 'Overview of the encryption process' },
  { id: 'salt', title: 'Generate Salt', description: 'Create random 16-byte salt' },
  { id: 'kdf', title: 'Key Derivation', description: 'PBKDF2 with 150,000 iterations' },
  { id: 'iv', title: 'Generate IV', description: 'Create random 12-byte initialization vector' },
  { id: 'encrypt', title: 'AES-GCM Encrypt', description: 'Encrypt data with authenticated encryption' },
  { id: 'store', title: 'Store Vault', description: 'Save encrypted vault to IndexedDB' },
  { id: 'decrypt', title: 'Decrypt Vault', description: 'Retrieve and decrypt the vault' },
  { id: 'complete', title: 'Complete', description: 'Full cycle demonstrated' },
];

const DEMO_PASSWORD = 'demo-password-123';
const DEMO_PLAINTEXT = {
  entries: [{ site: 'demo', user: 'alice', pass: 'secret' }],
};

export default function ExplainerPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const [salt, setSalt] = useState<Uint8Array | null>(null);
  const [iv, setIv] = useState<Uint8Array | null>(null);
  const [iterations, setIterations] = useState(0);
  const [proof, setProof] = useState<string>('');
  const [ciphertext, setCiphertext] = useState<ArrayBuffer | null>(null);
  const [decrypted, setDecrypted] = useState<any>(null);
  const [vaultRecord, setVaultRecord] = useState<any>(null);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const executeStep = async (step: Step) => {
    switch (step) {
      case 'salt': {
        const newSalt = new Uint8Array(16);
        crypto.getRandomValues(newSalt);
        setSalt(newSalt);
        break;
      }

      case 'kdf': {
        if (!salt) return;
        setIterations(0);
        const target = 150000;
        const increment = 5000;
        let current = 0;

        const interval = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          setIterations(current);
        }, 50);

        const kdfProof = await kdfProof8(DEMO_PASSWORD, salt, target);
        setProof(kdfProof);
        break;
      }

      case 'iv': {
        const newIv = new Uint8Array(12);
        crypto.getRandomValues(newIv);
        setIv(newIv);
        break;
      }

      case 'encrypt': {
        if (!salt || !iv) return;
        const key = await deriveKeyPBKDF2(DEMO_PASSWORD, salt, 150000);
        const ct = await encryptJSON(key, iv, DEMO_PLAINTEXT);
        setCiphertext(ct);
        break;
      }

      case 'store': {
        if (!salt || !iv || !ciphertext) return;
        const record = {
          version: 1,
          kdf: { type: 'PBKDF2', iterations: 150000, salt: u8ToB64(salt) },
          cipher: { name: 'AES-GCM', iv: u8ToB64(iv) },
          vault: abToB64(ciphertext),
          createdAt: Math.floor(Date.now() / 1000),
        };
        setVaultRecord(record);
        break;
      }

      case 'decrypt': {
        if (!vaultRecord) return;
        const saltBytes = new Uint8Array(b64ToAb(vaultRecord.kdf.salt));
        const ivBytes = new Uint8Array(b64ToAb(vaultRecord.cipher.iv));
        const ctBytes = b64ToAb(vaultRecord.vault);
        const key = await deriveKeyPBKDF2(DEMO_PASSWORD, saltBytes, 150000);
        const plain = await decryptJSON(key, ivBytes, ctBytes);
        setDecrypted(plain);
        break;
      }
    }
  };

  const nextStep = async () => {
    if (currentStepIndex < steps.length - 1) {
      const next = steps[currentStepIndex + 1];
      setCurrentStep(next.id);
      await executeStep(next.id);
    }
  };

  const reset = () => {
    setCurrentStep('intro');
    setIsPlaying(false);
    setSalt(null);
    setIv(null);
    setIterations(0);
    setProof('');
    setCiphertext(null);
    setDecrypted(null);
    setVaultRecord(null);
  };

  const play = async () => {
    if (isPlaying) return;
    setIsPlaying(true);

    let index = currentStepIndex;
    while (index < steps.length - 1) {
      index++;
      const next = steps[index];
      setCurrentStep(next.id);
      await executeStep(next.id);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    setIsPlaying(false);
  };

  const copyPlaintext = () => {
    navigator.clipboard.writeText(JSON.stringify(DEMO_PLAINTEXT, null, 2));
    toast.success('Copied demo plaintext to clipboard');
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (showGlossary) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (!isPlaying) nextStep();
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      reset();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      play();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, isPlaying, showGlossary]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D1117] text-white flex">
      <aside className="w-80 bg-white dark:bg-[#161B22] border-r border-gray-300 dark:border-[#30363D] flex flex-col">
        <div className="p-6 border-b border-gray-300 dark:border-[#30363D]">
          <button
            onClick={() => navigate('/')}
            className="text-[#58A6FF] hover:text-[#79C0FF] mb-4 flex items-center gap-2"
          >
            ← Back to App
          </button>
          <h1 className="text-2xl font-bold">Crypto Explainer</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Visual walkthrough of encryption
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4" aria-label="Encryption steps">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isComplete = index < currentStepIndex;

            return (
              <button
                key={step.id}
                onClick={() => {
                  if (index <= currentStepIndex && !isPlaying) {
                    setCurrentStep(step.id);
                  }
                }}
                disabled={index > currentStepIndex || isPlaying}
                className={`w-full text-left p-4 rounded-lg mb-2 transition-colors flex items-start gap-3 ${
                  isActive
                    ? 'bg-[#1F6FEB] text-white'
                    : isComplete
                    ? 'bg-[#21262D] text-gray-700 dark:text-gray-300 hover:bg-[#30363D]'
                    : 'bg-white dark:bg-[#161B22] text-gray-500 cursor-not-allowed'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5">
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : isActive ? (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{step.description}</div>
                </div>
                {isActive && <ChevronRight className="w-5 h-5 flex-shrink-0" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-300 dark:border-[#30363D] space-y-2">
          <div className="flex gap-2">
            <button
              onClick={play}
              disabled={isPlaying || currentStep === 'complete'}
              className="flex-1 bg-[#238636] hover:bg-[#2EA043] disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              aria-label="Play through all steps"
            >
              <Play className="w-4 h-4" />
              Play
            </button>
            <button
              onClick={nextStep}
              disabled={isPlaying || currentStepIndex >= steps.length - 1}
              className="flex-1 bg-[#21262D] hover:bg-[#30363D] disabled:bg-gray-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              aria-label="Next step"
            >
              <SkipForward className="w-4 h-4" />
              Step
            </button>
          </div>
          <button
            onClick={reset}
            disabled={isPlaying}
            className="w-full bg-[#21262D] hover:bg-[#30363D] disabled:bg-gray-800 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            aria-label="Reset demonstration"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => setShowGlossary(true)}
            className="w-full bg-[#21262D] hover:bg-[#30363D] px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            aria-label="Open glossary"
          >
            <Info className="w-4 h-4" />
            Glossary
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-8">
            <p className="text-yellow-200 text-sm">
              <strong>Educational Demo:</strong> Values shown here are for demonstration only and are not your real vault.
              This demo uses temporary data that is never persisted.
            </p>
          </div>

          <AnimatedStep stepKey={currentStep}>
            {currentStep === 'intro' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">How Locksmith Jr. Protects Your Data</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  This interactive demo walks through the complete encryption process used to secure your passwords.
                  Each step shows real cryptographic operations with visual feedback.
                </p>
                <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3">Demo Data</h3>
                  <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4 font-mono text-sm">
                    <pre className="text-gray-700 dark:text-gray-300">{JSON.stringify(DEMO_PLAINTEXT, null, 2)}</pre>
                  </div>
                  <button
                    onClick={copyPlaintext}
                    className="mt-3 flex items-center gap-2 text-[#58A6FF] hover:text-[#79C0FF]"
                  >
                    <Copy className="w-4 h-4" />
                    Copy JSON
                  </button>
                </div>
                <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3">Master Password</h3>
                  <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4 font-mono text-sm">
                    <code className="text-gray-700 dark:text-gray-300">{DEMO_PASSWORD}</code>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Click <strong>Step</strong> to proceed through each stage, or <strong>Play</strong> to watch the full process automatically.
                  You can also use <kbd className="px-2 py-1 bg-[#21262D] rounded">Space</kbd> or <kbd className="px-2 py-1 bg-[#21262D] rounded">→</kbd> to step forward.
                </p>
              </div>
            )}

            {currentStep === 'salt' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Generate Salt</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  A <strong>salt</strong> is random data that ensures the same password produces different encryption keys each time.
                  This protects against rainbow table attacks.
                </p>
                {salt && (
                  <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3">16-Byte Random Salt</h3>
                    <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4">
                      <div className="flex flex-wrap gap-2">
                        {Array.from(salt.slice(0, 8)).map((byte, i) => (
                          <div
                            key={i}
                            className="bg-[#1F6FEB] px-3 py-2 rounded font-mono text-sm"
                          >
                            {byte.toString(16).padStart(2, '0')}
                          </div>
                        ))}
                        <div className="px-3 py-2 text-gray-500">... (8 more bytes)</div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                        Full length: {salt.length} bytes ({salt.length * 8} bits)
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-[#21262D] rounded-lg p-4 border border-gray-300 dark:border-[#30363D]">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Why 16 bytes?</strong> This provides 128 bits of entropy, making it computationally infeasible
                    to guess or precompute tables for common passwords.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'kdf' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Key Derivation (PBKDF2)</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  PBKDF2 converts your password into a strong encryption key by applying 150,000 iterations of hashing.
                  This makes brute-force attacks extremely slow.
                </p>
                <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3">Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Iterations</span>
                        <span className="font-mono">{iterations.toLocaleString()} / 150,000</span>
                      </div>
                      <div className="h-3 bg-gray-50 dark:bg-[#0D1117] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#238636] transition-all duration-300"
                          style={{ width: `${(iterations / 150000) * 100}%` }}
                        />
                      </div>
                    </div>
                    {proof && (
                      <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">KDF Proof (first 8 hex chars)</p>
                        <div className="font-mono text-lg text-[#58A6FF]">{proof}</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-[#21262D] rounded-lg p-4 border border-gray-300 dark:border-[#30363D]">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Why 150,000 iterations?</strong> Each iteration takes time. With 150,000 iterations,
                    checking one password takes about 0.1 seconds, making brute-force attacks impractical.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'iv' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Generate Initialization Vector (IV)</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  The <strong>IV</strong> ensures that encrypting the same data twice produces different ciphertexts.
                  For AES-GCM, we use a 12-byte random IV.
                </p>
                {iv && (
                  <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3">12-Byte Random IV</h3>
                    <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4">
                      <div className="flex flex-wrap gap-2">
                        {Array.from(iv.slice(0, 8)).map((byte, i) => (
                          <div
                            key={i}
                            className="bg-[#9E6A03] px-3 py-2 rounded font-mono text-sm"
                          >
                            {byte.toString(16).padStart(2, '0')}
                          </div>
                        ))}
                        <div className="px-3 py-2 text-gray-500">... (4 more bytes)</div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                        Full length: {iv.length} bytes ({iv.length * 8} bits)
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-[#21262D] rounded-lg p-4 border border-gray-300 dark:border-[#30363D]">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Security note:</strong> The IV must be unique for each encryption but does not need to be secret.
                    It's stored alongside the ciphertext.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'encrypt' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">AES-GCM Encryption</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  AES-GCM provides authenticated encryption: it encrypts your data and adds an authentication tag
                  to detect any tampering.
                </p>
                {ciphertext && (
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-3">Input (Plaintext)</h3>
                      <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4 font-mono text-sm">
                        <pre className="text-gray-700 dark:text-gray-300">{JSON.stringify(DEMO_PLAINTEXT, null, 2)}</pre>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Size: {JSON.stringify(DEMO_PLAINTEXT).length} bytes
                      </p>
                    </div>

                    <div className="flex justify-center py-4">
                      <div className="bg-[#238636] text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Encrypting with AES-GCM-256
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                      <h3 className="text-xl font-semibold mb-3">Output (Ciphertext)</h3>
                      <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Array.from(new Uint8Array(ciphertext).slice(0, 12)).map((byte, i) => (
                            <div
                              key={i}
                              className="bg-[#8B5CF6] px-2 py-1 rounded font-mono text-xs"
                            >
                              {byte.toString(16).padStart(2, '0')}
                            </div>
                          ))}
                          <div className="px-2 py-1 text-gray-500 text-xs">... encrypted data ...</div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Size: {ciphertext.byteLength} bytes (includes 16-byte authentication tag)
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#21262D] rounded-lg p-4 border border-gray-300 dark:border-[#30363D]">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Authentication tag included:</strong> AES-GCM automatically appends a 16-byte tag
                        that verifies the data hasn't been modified. Decryption will fail if even one bit changes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 'store' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Store Encrypted Vault</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  The encrypted vault is stored in IndexedDB along with the parameters needed to decrypt it later.
                  Note that the salt and IV are stored in plaintext—they don't need to be secret.
                </p>
                {vaultRecord && (
                  <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3">Vault Record Structure</h3>
                    <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-gray-700 dark:text-gray-300">
                        {JSON.stringify(
                          {
                            version: vaultRecord.version,
                            kdf: {
                              type: vaultRecord.kdf.type,
                              iterations: vaultRecord.kdf.iterations,
                              salt: vaultRecord.kdf.salt.substring(0, 24) + '...',
                            },
                            cipher: {
                              name: vaultRecord.cipher.name,
                              iv: vaultRecord.cipher.iv.substring(0, 16) + '...',
                            },
                            vault: vaultRecord.vault.substring(0, 32) + '...',
                            createdAt: vaultRecord.createdAt,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#21262D] rounded-lg p-4 border border-gray-300 dark:border-[#30363D]">
                    <h4 className="font-semibold mb-2">KDF Parameters</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Salt and iteration count needed to re-derive the key</p>
                  </div>
                  <div className="bg-[#21262D] rounded-lg p-4 border border-gray-300 dark:border-[#30363D]">
                    <h4 className="font-semibold mb-2">Cipher Parameters</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Algorithm name and IV needed for decryption</p>
                  </div>
                  <div className="bg-[#21262D] rounded-lg p-4 border border-gray-300 dark:border-[#30363D]">
                    <h4 className="font-semibold mb-2">Encrypted Data</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Base64-encoded ciphertext with auth tag</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'decrypt' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Decrypt Vault</h2>
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  To decrypt, we re-derive the key using the stored salt and iterations, then decrypt using AES-GCM
                  with the stored IV. The authentication tag is automatically verified.
                </p>

                <div className="space-y-4">
                  <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-3">Decryption Process</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1F6FEB] flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Re-derive Key</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Using password + stored salt + iterations</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1F6FEB] flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Verify Auth Tag</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">AES-GCM checks data integrity</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#238636] flex items-center justify-center text-sm font-bold">
                          3
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Decrypt Data</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Recover original plaintext</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {decrypted && (
                    <div className="bg-white dark:bg-[#161B22] rounded-lg p-6 border-2 border-[#238636]">
                      <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Check className="w-6 h-6 text-[#238636]" />
                        Decrypted Successfully
                      </h3>
                      <div className="bg-gray-50 dark:bg-[#0D1117] rounded p-4 font-mono text-sm">
                        <pre className="text-gray-700 dark:text-gray-300">{JSON.stringify(decrypted, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-[#21262D] rounded-lg p-4 border border-gray-300 dark:border-[#30363D]">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Perfect round-trip:</strong> The decrypted data matches the original plaintext exactly.
                    If the password were wrong or the ciphertext tampered with, decryption would fail with an error.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-[#238636] rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12" />
                  </div>
                  <h2 className="text-4xl font-bold mb-4">Demo Complete!</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto">
                    You've seen the complete encryption and decryption cycle that protects your passwords in Locksmith Jr.
                  </p>
                </div>

                <div className="bg-white dark:bg-[#161B22] rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Key Takeaways</h3>
                  <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#238636] flex-shrink-0 mt-0.5" />
                      <span>Your master password never leaves your device and is never stored</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#238636] flex-shrink-0 mt-0.5" />
                      <span>PBKDF2 with 150,000 iterations makes brute-force attacks impractical</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#238636] flex-shrink-0 mt-0.5" />
                      <span>AES-GCM provides both encryption and authentication</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#238636] flex-shrink-0 mt-0.5" />
                      <span>Random salt and IV ensure unique encryption each time</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#238636] flex-shrink-0 mt-0.5" />
                      <span>All cryptography runs locally in your browser—no server involved</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={reset}
                    className="flex-1 bg-[#21262D] hover:bg-[#30363D] px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Watch Again
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-[#238636] hover:bg-[#2EA043] px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Back to App
                  </button>
                </div>
              </div>
            )}
          </AnimatedStep>
        </div>
      </main>

      {showGlossary && (
        <>
          <AnimatedBackdrop show={showGlossary} onClick={() => setShowGlossary(false)}>
            <div className="fixed inset-0 bg-black/70 z-40" />
          </AnimatedBackdrop>
          <AnimatedModal show={showGlossary}>
            <div
              className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white dark:bg-[#161B22] rounded-lg shadow-xl z-50 overflow-hidden"
              role="dialog"
              aria-labelledby="glossary-title"
              aria-modal="true"
            >
              <div className="p-6 border-b border-gray-300 dark:border-[#30363D]">
                <h2 id="glossary-title" className="text-2xl font-bold">
                  Cryptography Glossary
                </h2>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">Salt</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Random data added to your password before hashing. Ensures that the same password produces different
                    keys each time, protecting against rainbow table attacks.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">IV (Initialization Vector)</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    A random value used to ensure that encrypting the same plaintext multiple times produces different
                    ciphertexts. Must be unique for each encryption but doesn't need to be secret.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">PBKDF2</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Password-Based Key Derivation Function 2. Converts a password into a cryptographic key by applying
                    many iterations of a hash function, making brute-force attacks computationally expensive.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">AES-GCM</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Advanced Encryption Standard in Galois/Counter Mode. Provides authenticated encryption—both encrypting
                    data and verifying its integrity with an authentication tag.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Ciphertext</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    The encrypted output of an encryption algorithm. Appears as random data and can only be decrypted
                    with the correct key.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Authentication Tag</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    A cryptographic checksum produced by AES-GCM that proves the ciphertext hasn't been tampered with.
                    Decryption automatically verifies this tag and fails if it doesn't match.
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-300 dark:border-[#30363D]">
                <button
                  onClick={() => setShowGlossary(false)}
                  className="w-full bg-[#21262D] hover:bg-[#30363D] px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </AnimatedModal>
        </>
      )}
    </div>
  );
}
