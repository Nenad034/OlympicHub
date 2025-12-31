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
import { ToastProvider } from './components/ui/Toast';

// Context
import { useConfig } from './context/ConfigContext';

// Dynamic CSS Imports
import classicStyles from './classic_index.css?inline';
import modernStyles from './modern_index.css?inline';

const StyleManager: React.FC = () => {
  const { layoutMode } = useThemeStore();

  useEffect(() => {
    const styleId = 'dynamic-app-styles';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const cssContent = layoutMode === 'classic' ? classicStyles : modernStyles;
    // Handle cases where Vite might return an object with a default property
    const finalCSS = typeof cssContent === 'string' ? cssContent : (cssContent as any).default || '';

    styleTag.textContent = finalCSS;
  }, [layoutMode]);

  return null;
};

const App: React.FC = () => {
  const { theme, isPrism, lang, layoutMode } = useThemeStore();
  const { isChatOpen, setChatOpen } = useAppStore();
  const { isLoading } = useConfig();

  // Apply theme and layout classes to body
  useEffect(() => {
    const themeClassMap: Record<string, string> = {
      'light': 'light-theme',
      'cream': 'cream-theme',
      'navy': 'navy-theme',
      'dark-rainbow': 'dark-rainbow-theme',
      'light-rainbow': 'light-rainbow-theme',
      'cyberpunk': 'cyberpunk-theme',
      'forest': 'forest-theme',
    };

    let themeClass = themeClassMap[theme] || '';

    // Apply prism-mode independently
    if (isPrism) {
      themeClass += ' prism-mode';
    }

    document.body.className = `${themeClass.trim()} layout-${layoutMode}`;
  }, [theme, isPrism, layoutMode]);

  // Loading state
  const loadingContent = (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#050608' // Fallback color
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
        style={{ color: '#3fb950' }}
      >
        <Zap size={48} />
      </motion.div>
    </div>
  );

  return (
    <ToastProvider>
      <StyleManager />
      {isLoading ? loadingContent : (
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
      )}
    </ToastProvider>
  );
};

export default App;
