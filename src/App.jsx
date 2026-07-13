import { useState, useCallback, createContext, useContext } from 'react';
import Nav from './components/Nav';
import Hero from './components/Hero';
import WhatIsNeritix from './components/WhatIsNeritix';
import DataPipeline from './components/DataPipeline';
import DataProducts from './components/DataProducts';
import DataSelector from './components/DataSelector';
import ApiDocs from './components/ApiDocs';
import LiveTicker from './components/LiveTicker';
import TargetAudience from './components/TargetAudience';
import Footer from './components/Footer';
import PilotAccessModal from './components/PilotAccessModal';
import LegalModal from './components/LegalModal';
import Toast from './components/Toast';

export const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '' });

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const openLegal = useCallback(() => setLegalOpen(true), []);
  const closeLegal = useCallback(() => setLegalOpen(false), []);
  const showToast = useCallback((message) => setToast({ open: true, message }), []);
  const closeToast = useCallback(() => setToast({ open: false, message: '' }), []);

  return (
    <AppContext.Provider value={{ openModal, openLegal, showToast }}>
      <div className="min-h-screen bg-bg text-text-primary">
        <Nav />
        <LiveTicker />
        <Hero />
        <WhatIsNeritix />
        <DataPipeline />
        <DataProducts />
        <DataSelector />
        <ApiDocs />
        <TargetAudience />
        <Footer />
        <PilotAccessModal open={modalOpen} onClose={closeModal} />
        <LegalModal open={legalOpen} onClose={closeLegal} />
        <Toast message={toast.message} open={toast.open} onClose={closeToast} />
      </div>
    </AppContext.Provider>
  );
}
