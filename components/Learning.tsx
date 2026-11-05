import React, { useEffect, useState } from 'react';
import { Tile } from './Tile';
import { loadProgress, resetProgress, UserProgress } from '../storage';
import { playSound, speakText } from '../audio';

// Russian Alphabet in strict alphabetical order
const LEVEL_LETTERS = [
  'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й',
  'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф',
  'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ', 'Ы', 'Ь', 'Э', 'Ю', 'Я'
];

interface LearningProps {
  onBack: () => void;
  onSelectLetter?: (letter: string) => void;
}

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill={filled ? "currentColor" : "none"} 
    stroke="currentColor" 
    strokeWidth={2} 
    className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400 drop-shadow-sm' : 'text-neutral-600'}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

export default function Learning({ onBack, onSelectLetter }: LearningProps) {
  const [progress, setProgress] = useState<UserProgress>({});
  const [secretClicks, setSecretClicks] = useState(0);

  // Load data on mount
  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const handleTitleClick = () => {
    const nextCount = secretClicks + 1;
    if (nextCount >= 5) {
      handleReset();
    } else {
      setSecretClicks(nextCount);
      speakText(nextCount.toString());
    }
  };

  const handleReset = () => {
    try {
      speakText("Сброс");
      playSound('success');
      setProgress({});
      localStorage.clear();
      resetProgress();
      window.location.reload();
    } catch (err) {
      localStorage.clear();
      window.location.href = window.location.href;
    }
  };

  return (
    <div className="h-[100dvh] bg-neutral-900 flex flex-col items-center py-4 sm:py-6 font-sans select-none overflow-hidden text-neutral-100">
       
       {/* Header */}
       <div className="w-full max-w-6xl px-4 mb-4 sm:mb-6 flex items-center justify-between flex-none">
          <button 
            onClick={onBack}
            className="flex items-center justify-center font-bold text-white rounded-lg shadow-sm select-none border-b-2 transition-all bg-neutral-700 border-neutral-800 hover:bg-neutral-600 active:border-b-0 active:translate-y-[2px] px-4 py-2 sm:px-5 sm:py-2.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 mr-2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-sm sm:text-base">Главная</span>
          </button>
          
          <h1 
            onClick={handleTitleClick}
            className="text-lg sm:text-2xl font-black text-white uppercase tracking-wider mx-4 cursor-pointer select-none"
          >
            Учим буквы
          </h1>

          {secretClicks >= 3 ? (
            <button 
                onClick={handleReset}
                title="Сбросить прогресс"
                className="flex items-center justify-center font-bold text-red-400 bg-red-500/10 rounded-full p-2 hover:bg-red-500/20 transition-all animate-pulse"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
            </button>
          ) : (
             <div className="w-10"></div>
          )}
       </div>

       {/* Grid Content */}
       <div className="flex-1 w-full max-w-6xl px-3 sm:px-6 overflow-y-auto pb-6 custom-scrollbar flex flex-col justify-center">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2 sm:gap-3">
            {LEVEL_LETTERS.map((char, index) => {
              const score = progress[char];
              const hasPlayed = score !== undefined;
              const displayScore = score || 0;
              
              return (
                <div 
                  key={char + index} 
                  onClick={() => onSelectLetter && onSelectLetter(char)}
                  className={`rounded-xl p-2 border shadow-sm flex flex-col items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer active:scale-95 ${
                    hasPlayed 
                      ? 'bg-neutral-800/90 border-neutral-700/80' 
                      : 'bg-neutral-800/50 border-neutral-700/40 hover:border-neutral-600'
                  }`}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 aspect-square pointer-events-none flex items-center justify-center">
                    <Tile char={char} className="text-xl sm:text-2xl font-bold" />
                  </div>
                  
                  {/* Stars Rating */}
                  <div className="flex gap-0.5">
                    <StarIcon filled={displayScore >= 1} />
                    <StarIcon filled={displayScore >= 2} />
                    <StarIcon filled={displayScore >= 3} />
                  </div>
                </div>
              );
            })}
          </div>
       </div>

    </div>
  );
}