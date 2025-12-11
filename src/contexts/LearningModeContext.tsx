import React, { createContext, useContext, useState, useEffect } from 'react';

export type LearningMode = 'deaf' | 'hearing';

interface LearningModeContextType {
  mode: LearningMode;
  setMode: (mode: LearningMode) => void;
}

const LearningModeContext = createContext<LearningModeContextType | undefined>(undefined);

export const LearningModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<LearningMode>(() => {
    try {
      const saved = localStorage.getItem('learningMode');
      if (saved === 'deaf' || saved === 'hearing') {
        return saved;
      }
    } catch (e) {
      console.error('Error reading learning mode from localStorage:', e);
    }
    return 'deaf';
  });

  useEffect(() => {
    localStorage.setItem('learningMode', mode);
  }, [mode]);

  const setMode = (newMode: LearningMode) => {
    setModeState(newMode);
  };

  return (
    <LearningModeContext.Provider value={{ mode, setMode }}>
      {children}
    </LearningModeContext.Provider>
  );
};

export const useLearningMode = () => {
  const context = useContext(LearningModeContext);
  if (!context) {
    throw new Error('useLearningMode must be used within a LearningModeProvider');
  }
  return context;
};
