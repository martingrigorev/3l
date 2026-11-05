import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import FreePlay from './components/FreePlay';
import Learning from './components/Learning';
import LearningGame from './components/LearningGame';
import AnimalsMenu from './components/AnimalsMenu';
import AnimalsGame from './components/AnimalsGame';
import { initVoices, speakText, startBgMusic } from './audio';
import { loadSeaAnimalsProgress, saveSeaAnimalScore, loadForestAnimalsProgress, saveForestAnimalScore, loadForestAnimals2Progress, saveForestAnimal2Score, loadInsects1Progress, saveInsects1Score, loadFurnitureProgress, saveFurnitureScore, loadHomeChoresProgress, saveHomeChoresScore } from './storage';
import { SEA_ANIMALS, SeaAnimal } from './seaAnimalsData';
import { SEA_ANIMALS_2 } from './seaAnimalsData2';
import { FOREST_ANIMALS } from './forestAnimalsData';
import { FOREST_ANIMALS_2 } from './forestAnimalsData2';
import { INSECTS_1 } from './insectsData1';
import { FURNITURE } from './furnitureData';
import { HOME_CHORES } from './homeChoresData';

type AppMode = 'menu' | 'free_play' | 'learning' | 'sea_animals' | 'sea_animals_2' | 'forest_animals' | 'forest_animals_2' | 'insects_1' | 'furniture' | 'home_chores';
type CategoryTab = 'all' | 'letters' | 'animals' | 'things' | 'actions';

export default function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<SeaAnimal | null>(null);

  // Initialize voices once at the root level
  useEffect(() => {
    initVoices();
    startBgMusic();
  }, []);

  const handleCategoryChange = (tab: CategoryTab) => {
    setActiveCategory(tab);
    let title = '';
    if (tab === 'letters') title = 'Учим буквы';
    else if (tab === 'animals') title = 'Животный мир';
    else if (tab === 'things') title = 'Вещи';
    else if (tab === 'actions') title = 'Действия';
    else if (tab === 'all') title = 'Все разделы';
    if (title) speakText(title);
  };

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
        case 'furniture': modeText = 'Мебель'; break;
        case 'home_chores': modeText = 'Домашние дела'; break;
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
    if (mode === 'furniture') saveScore = saveFurnitureScore;
    if (mode === 'home_chores') saveScore = saveHomeChoresScore;
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="animal-game"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsGame animal={selectedAnimal} onBack={handleBackToSeaAnimals} saveScore={saveScore} gridCols={mode === 'home_chores' ? 13 : 12} gridRows={mode === 'home_chores' ? 5 : 4} />
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

      {mode === 'furniture' && (
        <motion.div
          key="furniture"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsMenu onBack={() => setMode('menu')} onSelectAnimal={handleStartSeaAnimalsGame} animals={FURNITURE} title="Мебель" loadProgress={loadFurnitureProgress} />
        </motion.div>
      )}

      {mode === 'home_chores' && (
        <motion.div
          key="home-chores"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full"
        >
          <AnimalsMenu onBack={() => setMode('menu')} onSelectAnimal={handleStartSeaAnimalsGame} animals={HOME_CHORES} title="Делаем дома" loadProgress={loadHomeChoresProgress} />
        </motion.div>
      )}

      {mode === 'menu' && (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-[100dvh] w-full flex flex-col bg-neutral-900 text-neutral-100 overflow-hidden relative"
        >
          {/* Top Bar: Minimal Sleek Tabs */}
          <div className="flex-none h-12 px-2 sm:px-4 flex items-center justify-center border-b border-neutral-800 bg-neutral-900/95 z-20">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-neutral-800/80 p-1 rounded-xl border border-neutral-700/40 overflow-x-auto max-w-full">
              <button 
                onClick={() => handleCategoryChange('all')}
                className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'all' 
                    ? 'bg-neutral-700 text-white shadow-sm border border-neutral-600/50' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <span>Все 4 части</span>
              </button>

              <button 
                onClick={() => handleCategoryChange('letters')}
                className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeCategory === 'letters' 
                    ? 'bg-neutral-700 text-white shadow-sm border border-neutral-600/50' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <span>📖</span>
                <span>Учим буквы</span>
              </button>

              <button 
                onClick={() => handleCategoryChange('animals')}
                className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeCategory === 'animals' 
                    ? 'bg-neutral-700 text-white shadow-sm border border-neutral-600/50' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <span>🐾</span>
                <span>Животный мир</span>
              </button>

              <button 
                onClick={() => handleCategoryChange('things')}
                className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeCategory === 'things' 
                    ? 'bg-neutral-700 text-white shadow-sm border border-neutral-600/50' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <span>🪑</span>
                <span>Вещи</span>
              </button>

              <button 
                onClick={() => handleCategoryChange('actions')}
                className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeCategory === 'actions' 
                    ? 'bg-neutral-700 text-white shadow-sm border border-neutral-600/50' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <span>⚡</span>
                <span>Действия</span>
              </button>
            </div>
          </div>

          {/* Main Area: Split into 4 parts or single focused category */}
          {activeCategory === 'all' ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 p-2 sm:p-3 overflow-hidden h-full bg-neutral-900">
              
              {/* PART 1: УЧИМ БУКВЫ */}
              <div className="flex flex-col h-full overflow-hidden bg-neutral-800/30 rounded-2xl border border-neutral-800/60">
                <div 
                  onClick={() => handleCategoryChange('letters')}
                  className="flex-none bg-neutral-800/60 hover:bg-neutral-800 cursor-pointer px-3 py-2 border-b border-neutral-800/50 flex items-center justify-center transition-colors rounded-t-2xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">📖</span>
                    <h2 className="text-neutral-300 font-bold text-xs sm:text-sm uppercase tracking-wider">Учим буквы</h2>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2 p-2 overflow-hidden bg-transparent">
                  {/* Free play */}
                  <div 
                    onClick={() => handleModeSelect('free_play')}
                    className="bg-sky-600 hover:bg-sky-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
                        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                    </div>
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Свободная игра
                    </h1>
                  </div>

                  {/* Learning */}
                  <div 
                    onClick={() => handleModeSelect('learning')}
                    className="bg-emerald-600 hover:bg-emerald-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Учим буквы
                    </h1>
                  </div>

                  {/* 4 Empty slots */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`empty-let-${i}`} className="bg-neutral-800/20 rounded-xl border border-neutral-800/30" />
                  ))}
                </div>
              </div>

              {/* PART 2: ЖИВОТНЫЙ МИР */}
              <div className="flex flex-col h-full overflow-hidden bg-neutral-800/30 rounded-2xl border border-neutral-800/60">
                <div 
                  onClick={() => handleCategoryChange('animals')}
                  className="flex-none bg-neutral-800/60 hover:bg-neutral-800 cursor-pointer px-3 py-2 border-b border-neutral-800/50 flex items-center justify-center transition-colors rounded-t-2xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">🐾</span>
                    <h2 className="text-neutral-300 font-bold text-xs sm:text-sm uppercase tracking-wider">Животный мир</h2>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2 p-2 overflow-hidden bg-transparent">
                  {/* Sea Animals 1 */}
                  <div 
                    onClick={() => handleModeSelect('sea_animals')}
                    className="bg-teal-600 hover:bg-teal-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
                        <path d="M22,12C22,12 18,17 14,17C10,17 8,14 8,14L4,18L4,6L8,10C8,10 10,7 14,7C18,7 22,12 22,12ZM16,12.5C16.552,12.5 17,12.052 17,11.5C17,10.948 16.552,10.5 16,10.5C15.448,10.5 15,10.948 15,11.5C15,12.052 15.448,12.5 16,12.5Z"/>
                      </svg>
                    </div>
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Морские животные 1
                    </h1>
                  </div>

                  {/* Sea Animals 2 */}
                  <div 
                    onClick={() => handleModeSelect('sea_animals_2')}
                    className="bg-cyan-600 hover:bg-cyan-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
                        <path d="M22,12C22,12 18,17 14,17C10,17 8,14 8,14L4,18L4,6L8,10C8,10 10,7 14,7C18,7 22,12 22,12ZM16,12.5C16.552,12.5 17,12.052 17,11.5C17,10.948 16.552,10.5 16,10.5C15.448,10.5 15,10.948 15,11.5C15,12.052 15.448,12.5 16,12.5Z"/>
                      </svg>
                    </div>
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Морские животные 2
                    </h1>
                  </div>

                  {/* Forest Animals 1 */}
                  <div 
                    onClick={() => handleModeSelect('forest_animals')}
                    className="bg-amber-600 hover:bg-amber-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
                        <path d="M12 22v-5M5 17l7-7 7 7H5zM8 10l4-4 4 4H8zM10 6l2-2 2 2h-4z" />
                      </svg>
                    </div>
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Лесные животные 1
                    </h1>
                  </div>

                  {/* Forest Animals 2 */}
                  <div 
                    onClick={() => handleModeSelect('forest_animals_2')}
                    className="bg-orange-700 hover:bg-orange-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
                        <path d="M12 22v-5M5 17l7-7 7 7H5zM8 10l4-4 4 4H8zM10 6l2-2 2 2h-4z" />
                      </svg>
                    </div>
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Лесные животные 2
                    </h1>
                  </div>

                  {/* Insects 1 */}
                  <div 
                    onClick={() => handleModeSelect('insects_1')}
                    className="bg-lime-700 hover:bg-lime-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
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
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Насекомые 1
                    </h1>
                  </div>

                  {/* 1 Gray slot */}
                  <div className="bg-neutral-800/20 rounded-xl border border-neutral-800/30" />
                </div>
              </div>

              {/* PART 3: ВЕЩИ */}
              <div className="flex flex-col h-full overflow-hidden bg-neutral-800/30 rounded-2xl border border-neutral-800/60">
                <div 
                  onClick={() => handleCategoryChange('things')}
                  className="flex-none bg-neutral-800/60 hover:bg-neutral-800 cursor-pointer px-3 py-2 border-b border-neutral-800/50 flex items-center justify-center transition-colors rounded-t-2xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">🪑</span>
                    <h2 className="text-neutral-300 font-bold text-xs sm:text-sm uppercase tracking-wider">Вещи</h2>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2 p-2 overflow-hidden bg-transparent">
                  {/* Мебель */}
                  <div 
                    onClick={() => handleModeSelect('furniture')}
                    className="bg-indigo-700 hover:bg-indigo-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
                        <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                        <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
                        <path d="M5 18v2" />
                        <path d="M19 18v2" />
                      </svg>
                    </div>
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Мебель
                    </h1>
                  </div>

                  {/* 5 Gray slots */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={`empty-things-${i}`} className="bg-neutral-800/20 rounded-xl border border-neutral-800/30" />
                  ))}
                </div>
              </div>

              {/* PART 4: ДЕЙСТВИЯ */}
              <div className="flex flex-col h-full overflow-hidden bg-neutral-800/30 rounded-2xl border border-neutral-800/60">
                <div 
                  onClick={() => handleCategoryChange('actions')}
                  className="flex-none bg-neutral-800/60 hover:bg-neutral-800 cursor-pointer px-3 py-2 border-b border-neutral-800/50 flex items-center justify-center transition-colors rounded-t-2xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base">⚡</span>
                    <h2 className="text-neutral-300 font-bold text-xs sm:text-sm uppercase tracking-wider">Действия</h2>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-2 p-2 overflow-hidden bg-transparent">
                  {/* Домашние дела */}
                  <div 
                    onClick={() => handleModeSelect('home_chores')}
                    className="bg-violet-700 hover:bg-violet-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-7 sm:h-7 text-white">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <h1 className="text-[10px] sm:text-xs md:text-sm font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Домашние дела
                    </h1>
                  </div>

                  {/* 5 Gray slots */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={`empty-actions-${i}`} className="bg-neutral-800/20 rounded-xl border border-neutral-800/30" />
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* Focused Category: 4x4 Grid */
            <div className={`flex-1 grid ${activeCategory === 'actions' ? 'grid-cols-5 grid-rows-5' : 'grid-cols-4 grid-rows-4'} gap-2 p-3 overflow-hidden bg-neutral-900`}>
              {activeCategory === 'letters' && (
                <>
                  {/* Free play */}
                  <div 
                    onClick={() => handleModeSelect('free_play')}
                    className="bg-sky-600 hover:bg-sky-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6 sm:w-9 sm:h-9 text-white">
                        <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                      </svg>
                    </div>
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Свободная игра
                    </h1>
                  </div>

                  {/* Learning letters */}
                  <div 
                    onClick={() => handleModeSelect('learning')}
                    className="bg-emerald-600 hover:bg-emerald-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 sm:w-9 sm:h-9 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Учим буквы
                    </h1>
                  </div>

                  {/* 14 Empty slots */}
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={`empty-let-4x4-${i}`} className="bg-neutral-800/20 rounded-xl border border-neutral-800/30" />
                  ))}
                </>
              )}

              {activeCategory === 'animals' && (
                <>
                  {/* Sea Animals 1 */}
                  <div 
                    onClick={() => handleModeSelect('sea_animals')}
                    className="bg-teal-600 hover:bg-teal-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-9 sm:h-9 text-white">
                        <path d="M22,12C22,12 18,17 14,17C10,17 8,14 8,14L4,18L4,6L8,10C8,10 10,7 14,7C18,7 22,12 22,12ZM16,12.5C16.552,12.5 17,12.052 17,11.5C17,10.948 16.552,10.5 16,10.5C15.448,10.5 15,10.948 15,11.5C15,12.052 15.448,12.5 16,12.5Z"/>
                      </svg>
                    </div>
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Морские животные 1
                    </h1>
                  </div>

                  {/* Sea Animals 2 */}
                  <div 
                    onClick={() => handleModeSelect('sea_animals_2')}
                    className="bg-cyan-600 hover:bg-cyan-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-9 sm:h-9 text-white">
                        <path d="M22,12C22,12 18,17 14,17C10,17 8,14 8,14L4,18L4,6L8,10C8,10 10,7 14,7C18,7 22,12 22,12ZM16,12.5C16.552,12.5 17,12.052 17,11.5C17,10.948 16.552,10.5 16,10.5C15.448,10.5 15,10.948 15,11.5C15,12.052 15.448,12.5 16,12.5Z"/>
                      </svg>
                    </div>
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Морские животные 2
                    </h1>
                  </div>

                  {/* Forest Animals 1 */}
                  <div 
                    onClick={() => handleModeSelect('forest_animals')}
                    className="bg-amber-600 hover:bg-amber-500 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-9 sm:h-9 text-white">
                        <path d="M12 22v-5M5 17l7-7 7 7H5zM8 10l4-4 4 4H8zM10 6l2-2 2 2h-4z" />
                      </svg>
                    </div>
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Лесные животные 1
                    </h1>
                  </div>

                  {/* Forest Animals 2 */}
                  <div 
                    onClick={() => handleModeSelect('forest_animals_2')}
                    className="bg-orange-700 hover:bg-orange-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 sm:w-9 sm:h-9 text-white">
                        <path d="M12 22v-5M5 17l7-7 7 7H5zM8 10l4-4 4 4H8zM10 6l2-2 2 2h-4z" />
                      </svg>
                    </div>
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Лесные животные 2
                    </h1>
                  </div>

                  {/* Insects 1 */}
                  <div 
                    onClick={() => handleModeSelect('insects_1')}
                    className="bg-lime-700 hover:bg-lime-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-9 sm:h-9 text-white">
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
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Насекомые 1
                    </h1>
                  </div>

                  {/* 11 Empty slots */}
                  {Array.from({ length: 11 }).map((_, i) => (
                    <div key={`empty-anim-${i}`} className="bg-neutral-800/20 rounded-xl border border-neutral-800/30" />
                  ))}
                </>
              )}

              {activeCategory === 'things' && (
                <>
                  {/* Мебель */}
                  <div 
                    onClick={() => handleModeSelect('furniture')}
                    className="bg-indigo-700 hover:bg-indigo-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-9 sm:h-9 text-white">
                        <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
                        <path d="M3 11v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
                        <path d="M5 18v2" />
                        <path d="M19 18v2" />
                      </svg>
                    </div>
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Мебель
                    </h1>
                  </div>

                  {/* 15 Empty slots */}
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={`empty-thing-${i}`} className="bg-neutral-800/20 rounded-xl border border-neutral-800/30" />
                  ))}
                </>
              )}

              {activeCategory === 'actions' && (
                <>
                  {/* Домашние дела */}
                  <div 
                    onClick={() => handleModeSelect('home_chores')}
                    className="bg-violet-700 hover:bg-violet-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer relative group flex flex-col items-center justify-center p-2 rounded-xl border border-white/10 shadow-sm select-none"
                  >
                    <div className="bg-white/20 p-2 sm:p-3 rounded-full mb-1.5 sm:mb-2 backdrop-blur-sm transform group-hover:scale-105 transition-transform duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 sm:w-9 sm:h-9 text-white">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <h1 className="text-[11px] sm:text-base md:text-lg font-black text-white uppercase tracking-wider text-center leading-tight px-1">
                      Домашние дела
                    </h1>
                  </div>

                  {/* 24 Empty slots */}
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={`empty-act-${i}`} className="bg-neutral-800/20 rounded-xl border border-neutral-800/30" />
                  ))}
                </>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
