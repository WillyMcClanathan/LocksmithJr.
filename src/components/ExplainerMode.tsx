import { useState } from 'react';
import { Lock, Key, Shield, FileCode, Info } from 'lucide-react';

const steps = [
  {
    id: 'salt',
    title: 'Salt Generation',
    icon: Shield,
    description: 'A random 16-byte salt is generated using crypto.getRandomValues(). This ensures that even identical passwords produce different encrypted outputs.',
    details: 'The salt is unique per vault and prevents rainbow table attacks. It\'s stored alongside the encrypted data but is not secret.',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    id: 'kdf',
    title: 'Key Derivation (PBKDF2)',
    icon: Key,
    description: 'Your master password is transformed into a 256-bit encryption key using PBKDF2 with SHA-256 and 150,000 iterations.',
    details: 'PBKDF2 makes brute-force attacks computationally expensive. Each iteration applies SHA-256, making password cracking significantly slower.',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
  },
  {
    id: 'iv',
    title: 'IV Generation',
    icon: Shield,
    description: 'A random 12-byte Initialization Vector (IV) is generated for AES-GCM encryption.',
    details: 'The IV ensures that encrypting the same plaintext multiple times produces different ciphertext. It\'s unique for each encryption operation.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    id: 'encryption',
    title: 'AES-GCM Encryption',
    icon: Lock,
    description: 'Your vault data is encrypted using AES-GCM, which provides both confidentiality and authenticity.',
    details: 'AES-GCM is an authenticated encryption mode that detects tampering. It produces ciphertext + authentication tag to verify data integrity.',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
  },
  {
    id: 'storage',
    title: 'Secure Storage',
    icon: FileCode,
    description: 'The encrypted vault (base64-encoded) is stored in IndexedDB along with the salt and IV.',
    details: 'Only the encrypted data, salt, and IV are stored. Your master password and derived key are never persisted, ensuring security even if storage is compromised.',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
];

const glossary = [
  {
    term: 'Salt',
    definition: 'Random data added to the password before hashing to ensure unique outputs.',
  },
  {
    term: 'PBKDF2',
    definition: 'Password-Based Key Derivation Function 2 - transforms passwords into cryptographic keys.',
  },
  {
    term: 'SHA-256',
    definition: 'Secure Hash Algorithm producing 256-bit hashes, used in key derivation.',
  },
  {
    term: 'AES-GCM',
    definition: 'Advanced Encryption Standard with Galois/Counter Mode - authenticated encryption.',
  },
  {
    term: 'IV',
    definition: 'Initialization Vector - random value ensuring unique ciphertext for each encryption.',
  },
  {
    term: 'Ciphertext',
    definition: 'The encrypted output that protects your data from unauthorized access.',
  },
];

export default function ExplainerMode() {
  const [activeStep, setActiveStep] = useState(0);
  const [showGlossary, setShowGlossary] = useState(false);

  const currentStep = steps[activeStep];
  const Icon = currentStep.icon;

  return (
    <div className="min-h-screen bg-[#0D1117] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">How Encryption Works</h1>
          <p className="text-gray-400">
            Learn how Locksmith Jr. protects your passwords using modern cryptography
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`p-4 rounded-lg border transition-all ${
                  activeStep === index
                    ? `${step.bgColor} border-${step.color.replace('text-', '')}/50`
                    : 'bg-[#161B22] border-[#30363D] hover:border-[#484F58]'
                }`}
              >
                <StepIcon
                  className={`w-6 h-6 mx-auto mb-2 ${
                    activeStep === index ? step.color : 'text-gray-400'
                  }`}
                />
                <div className={`text-xs font-medium ${
                  activeStep === index ? 'text-white' : 'text-gray-400'
                }`}>
                  Step {index + 1}
                </div>
              </button>
            );
          })}
        </div>

        <div className={`${currentStep.bgColor} border border-${currentStep.color.replace('text-', '')}/50 rounded-lg p-6 mb-6`}>
          <div className="flex items-start gap-4 mb-4">
            <div className={`p-3 ${currentStep.bgColor} rounded-lg`}>
              <Icon className={`w-8 h-8 ${currentStep.color}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
              <p className="text-gray-300">{currentStep.description}</p>
            </div>
          </div>

          <div className="bg-[#0D1117] rounded-lg p-4 border border-[#30363D]">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-400">Technical Details</span>
            </div>
            <p className="text-sm text-gray-400">{currentStep.details}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            disabled={activeStep === 0}
            className="px-6 py-2 bg-[#161B22] border border-[#30363D] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500/50 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={activeStep === steps.length - 1}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
          <button
            onClick={() => setShowGlossary(!showGlossary)}
            className="ml-auto px-6 py-2 bg-[#161B22] border border-[#30363D] text-white rounded-lg hover:border-blue-500/50 transition-colors"
          >
            {showGlossary ? 'Hide' : 'Show'} Glossary
          </button>
        </div>

        {showGlossary && (
          <div className="bg-[#161B22] border border-[#30363D] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Cryptography Glossary</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {glossary.map((item) => (
                <div key={item.term} className="bg-[#0D1117] rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-1">{item.term}</h4>
                  <p className="text-gray-400 text-sm">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">
            <strong>Educational Disclaimer:</strong> Locksmith Jr. is designed for learning purposes.
            While it uses industry-standard cryptography (WebCrypto API), it should not replace
            production password managers for sensitive data.
          </p>
        </div>
      </div>
    </div>
  );
}
