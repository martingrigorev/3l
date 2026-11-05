import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import FreePlay from './components/FreePlay';
import Learning from './components/Learning';
import LearningGame from './components/LearningGame';
import AnimalsMenu from './components/AnimalsMenu';
import AnimalsGame from './components/AnimalsGame';
import { initVoices, speakText, startBgMusic } from './audio';
import { loadSeaAnimalsProgress, saveSeaAnimalScore, loadForestAnimalsProgress, saveForestAnimalScore, loadForestAnimals2Progress, saveForestAnimal2Score, loadInsects1Progress, saveInsects1Score } from './storage';
import { SEA_ANIMALS, SeaAnimal } from './seaAnimalsData';
import { SEA_ANIMALS_2 } from './seaAnimalsData2';
import { FOREST_ANIMALS } from './forestAnimalsData';
import { FOREST_ANIMALS_2 } from './forestAnimalsData2';
import { INSECTS_1 } from './insectsData1';

type AppMode = 'menu' | 'free_play' | 'learning' | 'sea_animals' | 'sea_animals_2' | 'forest_animals' | 'forest_animals_2' | 'insects_1';

export default function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<SeaAnimal | null>(null);

  // Initialize voices once at the root level
  useEffect(() => {
    initVoices();
    startBgMusic();
  }, []);

  // Handler to unlock audio context/speech on first interaction
  const handleModeSelect = (newMode: AppMode) => {
    let modeText = '';
    switch (newMode) {
        case 'free_play': modeText = 'Свободная игра'; break;
        case 'forest_animals': modeText = 'Лесные животные 1'; break;
        case 'forest_animals_2': modeText = 'Лесные животные 2'; break;
        case 'sea_animals': modeText = 'Морские животные 1'; break;
        case 'sea_animals_2': modeText = 'Морские животные 2'; break;
        case 'insects_1': modeText = 'Насекомые 1'; break;
        case 'learning': modeText = 'Учим буквы'; break;
    }
    speakText(modeText);
    setMode(newMode);
  };

  const handleStartLearningGame = (letter: string) => {
    setSelectedLetter(letter);
  };

  const handleBackToLearning = () => {
    setSelectedLetter(null);
  };

  const handleStartSeaAnimalsGame = (animal: SeaAnimal) => {
    setSelectedAnimal(animal);
  };

  const handleBackToSeaAnimals = () => {
    setSelectedAnimal(null);
  };

  if (selectedAnimal) {
    let saveScore = saveSeaAnimalScore;
    if (mode === 'forest_animals') saveScore = saveForestAnimalScore;
    if (mode === 'forest_animals_2') saveScore = saveForestAnimal2Score;
    if (mode === 'insects_1') saveScore = saveInsects1Score;
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="animal-game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsGame animal={selectedAnimal} onBack={handleBackToSeaAnimals} saveScore={saveScore} />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (selectedLetter) {
      return (
        <AnimatePresence mode="wait">
          <motion.div
            key="letter-game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[100dvh] w-full"
          >
            <LearningGame letter={selectedLetter} onBack={handleBackToLearning} />
          </motion.div>
        </AnimatePresence>
      );
  }

  return (
    <AnimatePresence mode="wait">
      {mode === 'free_play' && (
        <motion.div
          key="free-play"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <FreePlay onBack={() => setMode('menu')} />
        </motion.div>
      )}

      {mode === 'learning' && (
        <motion.div
          key="learning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <Learning onBack={() => setMode('menu')} onSelectLetter={handleStartLearningGame} />
        </motion.div>
      )}

      {mode === 'sea_animals' && (
        <motion.div
          key="sea-animals"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsMenu onBack={() => setMode('menu')} onSelectAnimal={handleStartSeaAnimalsGame} animals={SEA_ANIMALS} title="Морские животные 1" loadProgress={loadSeaAnimalsProgress} />
        </motion.div>
      )}

      {mode === 'sea_animals_2' && (
        <motion.div
          key="sea-animals-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsMenu onBack={() => setMode('menu')} onSelectAnimal={handleStartSeaAnimalsGame} animals={SEA_ANIMALS_2} title="Морские животные 2" loadProgress={loadSeaAnimalsProgress} />
        </motion.div>
      )}

      {mode === 'forest_animals' && (
        <motion.div
          key="forest-animals"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsMenu onBack={() => setMode('menu')} onSelectAnimal={handleStartSeaAnimalsGame} animals={FOREST_ANIMALS} title="Лесные животные 1" loadProgress={loadForestAnimalsProgress} />
        </motion.div>
      )}

      {mode === 'forest_animals_2' && (
        <motion.div
          key="forest-animals-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsMenu onBack={() => setMode('menu')} onSelectAnimal={handleStartSeaAnimalsGame} animals={FOREST_ANIMALS_2} title="Лесные животные 2" loadProgress={loadForestAnimals2Progress} />
        </motion.div>
      )}

      {mode === 'insects_1' && (
        <motion.div
          key="insects-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsMenu onBack={() => setMode('menu')} onSelectAnimal={handleStartSeaAnimalsGame} animals={INSECTS_1} title="Насекомые 1" loadProgress={loadInsects1Progress} />
        </motion.div>
      )}

      {mode === 'menu' && (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full grid grid-cols-4 grid-rows-4 bg-neutral-900 overflow-hidden relative"
        >
          
          {/* 0: Free Play (Sky) */}
          <div 
            onClick={() => handleModeSelect('free_play')}
            className="bg-sky-600 hover:bg-sky-500 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-1 sm:p-2 select-none border border-neutral-800 z-10"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="bg-white/20 p-1.5 sm:p-3 rounded-full mb-1 sm:mb-2 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-10 sm:h-10 text-white">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
               </svg>
            </div>
            <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center drop-shadow-md leading-tight px-1">
              Свободная игра
            </h1>
          </div>

          {/* 1: Learning Letters (Emerald) */}
          <div 
            onClick={() => handleModeSelect('learning')}
            className="bg-emerald-600 hover:bg-emerald-500 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-1 sm:p-2 select-none border border-neutral-800 z-10"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="bg-white/20 p-1.5 sm:p-3 rounded-full mb-1 sm:mb-2 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 sm:w-10 sm:h-10 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center drop-shadow-md leading-tight px-1">
              Учим буквы
            </h1>
          </div>

          {/* 2: Sea Animals 1 (Teal) */}
          <div 
            onClick={() => handleModeSelect('sea_animals')}
            className="bg-teal-600 hover:bg-teal-500 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-1 sm:p-2 select-none border border-neutral-800 z-10"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="bg-white/20 p-1.5 sm:p-3 rounded-full mb-1 sm:mb-2 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-10 sm:h-10 text-white">
                <path d="M22,12C22,12 18,17 14,17C10,17 8,14 8,14L4,18L4,6L8,10C8,10 10,7 14,7C18,7 22,12 22,12ZM16,12.5C16.552,12.5 17,12.052 17,11.5C17,10.948 16.552,10.5 16,10.5C15.448,10.5 15,10.948 15,11.5C15,12.052 15.448,12.5 16,12.5Z"/>
               </svg>
            </div>
            <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center drop-shadow-md leading-tight px-1">
              Морские животные 1
            </h1>
          </div>

          {/* 3: Sea Animals 2 (Cyan) */}
          <div 
            onClick={() => handleModeSelect('sea_animals_2')}
            className="bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-1 sm:p-2 select-none border border-neutral-800 z-10"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="bg-white/20 p-1.5 sm:p-3 rounded-full mb-1 sm:mb-2 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-10 sm:h-10 text-white">
                <path d="M22,12C22,12 18,17 14,17C10,17 8,14 8,14L4,18L4,6L8,10C8,10 10,7 14,7C18,7 22,12 22,12ZM16,12.5C16.552,12.5 17,12.052 17,11.5C17,10.948 16.552,10.5 16,10.5C15.448,10.5 15,10.948 15,11.5C15,12.052 15.448,12.5 16,12.5Z"/>
               </svg>
            </div>
            <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center drop-shadow-md leading-tight px-1">
              Морские животные 2
            </h1>
          </div>

          {/* 4: Forest Animals 1 (Orange/Amber) */}
          <div 
            onClick={() => handleModeSelect('forest_animals')}
            className="bg-amber-600 hover:bg-amber-500 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-1 sm:p-2 select-none border border-neutral-800 z-10"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="bg-white/20 p-1.5 sm:p-3 rounded-full mb-1 sm:mb-2 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-10 sm:h-10 text-white">
                {/* Tree Icon */}
                <path d="M12 22v-5M5 17l7-7 7 7H5zM8 10l4-4 4 4H8zM10 6l2-2 2 2h-4z" />
               </svg>
            </div>
            <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center drop-shadow-md leading-tight px-1">
              Лесные животные 1
            </h1>
          </div>

          {/* 5: Forest Animals 2 (Orange/Amber) */}
          <div 
            onClick={() => handleModeSelect('forest_animals_2')}
            className="bg-orange-700 hover:bg-orange-600 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-1 sm:p-2 select-none border border-neutral-800 z-10"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="bg-white/20 p-1.5 sm:p-3 rounded-full mb-1 sm:mb-2 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-10 sm:h-10 text-white">
                {/* Tree Icon */}
                <path d="M12 22v-5M5 17l7-7 7 7H5zM8 10l4-4 4 4H8zM10 6l2-2 2 2h-4z" />
               </svg>
            </div>
            <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center drop-shadow-md leading-tight px-1">
              Лесные животные 2
            </h1>
          </div>

          {/* 6: Insects 1 (Lime/Green) */}
          <div 
            onClick={() => handleModeSelect('insects_1')}
            className="bg-lime-700 hover:bg-lime-600 transition-all cursor-pointer relative group flex flex-col items-center justify-center p-1 sm:p-2 select-none border border-neutral-800 z-10"
          >
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="bg-white/20 p-1.5 sm:p-3 rounded-full mb-1 sm:mb-2 backdrop-blur-sm shadow-xl transform group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-10 sm:h-10 text-white">
                <path d="m8 2 1.88 1.88" />
                <path d="M14.12 3.88 16 2" />
                <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                <path d="M12 20v-9" />
                <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                <path d="M6 13H2" />
                <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                <path d="M22 13h-4" />
                <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
              </svg>
            </div>
            <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center drop-shadow-md leading-tight px-1">
              Насекомые 1
            </h1>
          </div>

          {/* Placeholders 7-15 (Gray / Empty slots) */}
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-neutral-800 border border-neutral-700/40 z-10" />
          ))}

        </motion.div>
      )}
    </AnimatePresence>
  );
}
