import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

// Router
import { AppRouter } from './router';

// Stores
import { useThemeStore, useAppStore } from './stores';

// Components
import GeneralAIChat from './components/GeneralAIChat';
import { GeometricBrain } from './components/icons/GeometricBrain';

// Context
import { useConfig } from './context/ConfigContext';

const App: React.FC = () => {
  const { theme, isPrism, lang } = useThemeStore();
  const { isChatOpen, setChatOpen } = useAppStore();
  const { isLoading } = useConfig();

  // Apply theme classes to body
  useEffect(() => {
    let themeClass = '';
    if (theme === 'light') themeClass = 'light-theme';
    else if (theme === 'cream') themeClass = 'cream-theme';
    else if (theme === 'navy') themeClass = 'navy-theme';

    // Apply prism-mode independently
    if (isPrism) {
      themeClass += ' prism-mode';
    }

    document.body.className = themeClass.trim();
  }, [theme, isPrism]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          style={{ color: 'var(--accent)' }}
        >
          <Zap size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Main App Router */}
      <AppRouter />

      {/* Persistent AI Assistant - Outside Main Scroll */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, translateY: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setChatOpen(true)}
            style={{
              position: 'fixed',
              bottom: '32px',
              right: '32px',
              width: '64px',
              height: '64px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 12px 36px rgba(37, 99, 235, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 9999,
              backdropFilter: 'blur(10px)'
            }}
          >
            <GeometricBrain size={34} color="#FFD700" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Chat Component */}
      <GeneralAIChat
        isOpen={isChatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        lang={lang}
        userLevel={6}
        context="Dashboard"
        analysisData={[]}
      />
    </>
  );
};

export default App;
