import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VaultDashboard from '../components/VaultDashboard';
import { DecryptedVault } from '../utils/crypto';
import { SessionManager } from '../utils/session';
import { toast } from '../utils/toast';

const AUTO_LOCK_MINUTES = 5;
const REVEAL_DELAY_MS = 500;

interface VaultPageProps {
  vault: DecryptedVault | null;
  onUpdateVault: (vault: DecryptedVault) => void;
  onLock: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
}

export default function VaultPage({
  vault,
  onUpdateVault,
  onLock,
  onExport,
  onImport,
}: VaultPageProps) {
  const navigate = useNavigate();
  const sessionManager = useRef<SessionManager | null>(null);

  useEffect(() => {
    if (!vault) {
      navigate('/unlock');
    }
  }, [vault, navigate]);

  useEffect(() => {
    if (!vault) return;

    if (!sessionManager.current) {
      sessionManager.current = new SessionManager(AUTO_LOCK_MINUTES);
    }

    const handleWarning = () => {
      toast.warning('Vault will lock in 20 seconds due to inactivity', 20000);
    };

    const handleLock = () => {
      onLock();
      navigate('/unlock');
    };

    sessionManager.current.start(handleWarning, handleLock);

    return () => {
      if (sessionManager.current) {
        sessionManager.current.stop();
      }
    };
  }, [vault, onLock, navigate]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (vault) {
        onLock();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [vault, onLock]);

  if (!vault) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0D1117] flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-xl">Redirecting...</div>
      </div>
    );
  }

  const handlePanicLock = () => {
    if (sessionManager.current) {
      sessionManager.current.stop();
    }
    onLock();
    navigate('/unlock');
  };


  return (
    <VaultDashboard
      vault={vault}
      onUpdateVault={onUpdateVault}
      onLock={handlePanicLock}
      onExport={onExport}
      onImport={onImport}
      onShowExplainer={() => navigate('/learn')}
      revealDelayMs={REVEAL_DELAY_MS}
    />
  );
}
