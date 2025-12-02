import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MobileAppBar from './components/MobileAppBar';
import BottomNavigation from './components/BottomNavigation';
import UpdateNotification from './components/UpdateNotification';
import ToastManager from './components/ToastManager';
import Home from './pages/Home';
import CreateVault from './pages/CreateVault';
import UnlockVault from './pages/UnlockVault';
import VaultPage from './pages/VaultPage';
import LearnPage from './pages/LearnPage';
import ExplainerPage from './pages/ExplainerPage';
import { DecryptedVault, encryptVault, decryptVault } from './utils/crypto';
import { saveVault, loadVault } from './utils/storage';
import { toast } from './utils/toast';
import { showToast } from './components/ToastManager';

const APP_VERSION = '1.1.0';

function App() {
  const [vault, setVault] = useState<DecryptedVault | null>(null);
  const [masterPassword, setMasterPassword] = useState('');

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (vault) {
        setVault(null);
        setMasterPassword('');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [vault]);

  const handleCreate = async (password: string) => {
    console.log('[App] handleCreate called');

    try {
      const emptyVault: DecryptedVault = { entries: [] };
      console.debug('[App] Creating vault with empty entries:', emptyVault);

      console.debug('[App] About to call encryptVault...');
      const encrypted = await encryptVault(emptyVault, password);
      console.debug('[App] Vault encrypted successfully, record:', {
        version: encrypted.version,
        kdfType: encrypted.kdf.type,
        iterations: encrypted.kdf.iterations,
        saltLength: encrypted.kdf.salt.length,
        ivLength: encrypted.cipher.iv.length,
        vaultLength: encrypted.vault.length,
        createdAt: encrypted.createdAt,
      });

      console.debug('[App] About to save vault to IndexedDB...');
      await saveVault(encrypted);
      console.log('[App] New vault created and saved to IndexedDB');

      setVault(emptyVault);
      setMasterPassword(password);
    } catch (err: any) {
      console.error('[App] ERROR in handleCreate:');
      console.error('[App]   Name:', err?.name);
      console.error('[App]   Message:', err?.message);
      console.error('[App]   Full error:', err);
      console.error('[App]   Stack:', err?.stack);
      throw err;
    }
  };

  const handleUnlock = async (password: string) => {
    console.log('[App] handleUnlock called');

    try {
      const encrypted = await loadVault();
      if (!encrypted) {
        throw new Error('Vault not found');
      }
      console.log('[App] Vault loaded, decrypting...');
      const decrypted = await decryptVault(encrypted, password);
      console.log('[App] Vault decrypted successfully');

      setVault(decrypted);
      setMasterPassword(password);
    } catch (err) {
      console.error('[App] Error unlocking vault:');
      console.error('  Name:', (err as Error).name);
      console.error('  Message:', (err as Error).message);
      console.error('  Stack:', (err as Error).stack);
      throw err;
    }
  };

  const handleUpdateVault = async (newVault: DecryptedVault) => {
    setVault(newVault);
    const encrypted = await encryptVault(newVault, masterPassword);
    await saveVault(encrypted);
  };

  const handleLock = () => {
    setVault(null);
    setMasterPassword('');
    showToast('Vault locked', 'info');
    window.location.href = '/home';
  };

  const handleExport = async () => {
    const encrypted = await loadVault();
    if (!encrypted) return;

    const dataStr = JSON.stringify(encrypted, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `locksmith-vault-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Vault exported successfully', 'success');
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const encrypted = JSON.parse(text);

    const decrypted = await decryptVault(encrypted, masterPassword);

    await saveVault(encrypted);
    setVault(decrypted);
    showToast('Vault imported successfully', 'success');
  };

  return (
    <BrowserRouter>
      <AppLayout
        vault={vault}
        masterPassword={masterPassword}
        onUpdateVault={handleUpdateVault}
        onLock={handleLock}
        onExport={handleExport}
        onImport={handleImport}
        onCreate={handleCreate}
        onUnlock={handleUnlock}
      />
    </BrowserRouter>
  );
}

function AppLayout({
  vault,
  masterPassword,
  onUpdateVault,
  onLock,
  onExport,
  onImport,
  onCreate,
  onUnlock,
}: any) {
  const location = useLocation();
  const showBottomNav = ['/home', '/vault', '/learn'].includes(location.pathname);
  const showBack = ['/create', '/unlock', '/explainer'].includes(location.pathname);

  return (
    <div className="min-h-screen-safe bg-gray-50 dark:bg-[#0D1117] flex flex-col">
      <MobileAppBar showBack={showBack} />
      <UpdateNotification />
      <ToastManager />
      <main className={`flex-1 overflow-y-auto ${showBottomNav ? 'pb-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create" element={<CreateVault onCreate={onCreate} />} />
          <Route path="/unlock" element={<UnlockVault onUnlock={onUnlock} />} />
          <Route
            path="/vault"
            element={
              <VaultPage
                vault={vault}
                onUpdateVault={onUpdateVault}
                onLock={onLock}
                onExport={onExport}
                onImport={onImport}
              />
            }
          />
          <Route path="/learn" element={<LearnPage />} />
          <Route path="/explainer" element={<ExplainerPage />} />
        </Routes>
      </main>
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}

export default App;
