import React, { useState, useEffect } from 'react';
import FreePlay from './components/FreePlay';
import Learning from './components/Learning';
import LearningGame from './components/LearningGame';
import { initVoices, speakText } from './audio';

type AppMode = 'menu' | 'free_play' | 'learning';

export default function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Initialize voices once at the root level
  useEffect(() => {
    initVoices();
  }, []);

  // Handler to unlock audio context/speech on first interaction
  const handleModeSelect = (newMode: AppMode) => {
    // Playing an empty string or space helps "wake up" the speech engine on iOS/Android
    speakText(' ');
    setMode(newMode);
  };

  const handleStartLearningGame = (letter: string) => {
    setSelectedLetter(letter);
  };

  const handleBackToLearning = () => {
    setSelectedLetter(null);
  };

  if (selectedLetter) {
      return <LearningGame letter={selectedLetter} onBack={handleBackToLearning} />;
  }

  if (mode === 'free_play') {
    return <FreePlay onBack={() => setMode('menu')} />;
  }

  if (mode === 'learning') {
    return <Learning onBack={() => setMode('menu')} onSelectLetter={handleStartLearningGame} />;
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col sm:flex-row bg-neutral-900 overflow-hidden">
      
      {/* Top/Left Half - Free Play */}
      <div 
        onClick={() => handleModeSelect('free_play')}
        className="flex-1 bg-blue-600 hover:bg-blue-500 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-8 select-none
        md:border-b-8 md:border-blue-800 md:active:border-b-0 md:active:translate-y-2"
      >
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        
        <div className="bg-white/20 p-6 rounded-full mb-6 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
           <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 sm:w-24 sm:h-24 text-white">
             <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
           </svg>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider text-center drop-shadow-md">
          Свободная<br/>Игра
        </h1>
      </div>

      {/* Bottom/Right Half - Learning */}
      <div 
        onClick={() => handleModeSelect('learning')}
        className="flex-1 bg-green-600 hover:bg-green-500 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-8 select-none border-t-4 sm:border-t-0 sm:border-l-4 border-neutral-800
        md:border-b-8 md:border-green-800 md:border-l-0 md:active:border-b-0 md:active:translate-y-2"
      >
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
        
        <div className="bg-white/20 p-6 rounded-full mb-6 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16 sm:w-24 sm:h-24 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider text-center drop-shadow-md">
          Обучение
        </h1>
      </div>

    </div>
  );
}