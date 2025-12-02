import { useNavigate } from 'react-router-dom';
import ExplainerMode from '../components/ExplainerMode';

export default function LearnPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D1117] text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="text-[#58A6FF] hover:text-[#79C0FF] mb-6"
        >
          ← Back to Home
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Learn About Locksmith Jr.</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Understand how password encryption works and explore the cryptography that keeps your data secure.
          </p>
          <button
            onClick={() => navigate('/explainer')}
            className="bg-[#238636] hover:bg-[#2EA043] px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Launch Interactive Crypto Demo
          </button>
        </div>
        <ExplainerMode />
      </div>
    </div>
  );
}
