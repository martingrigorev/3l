import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  closestCenter,
  pointerWithin,
  CollisionDetection,
} from '@dnd-kit/core';
import { GRID_COLS, GRID_ROWS, TOTAL_CELLS, KEYBOARD_LAYOUT } from '../constants';
import { GridState, DragData } from '../types';
import { DroppableCell } from './DroppableCell';
import { DraggableItem } from './DraggableItem';
import { Tile } from './Tile';
import { playSound, speakText, initVoices } from '../audio';
import { LEARNING_DATA } from '../learningData';
import { saveLetterScore } from '../storage';

// Gap in pixels used for both Grid and Keyboard to ensure alignment
const GAP_PX = 2;

// Custom arbitrary grid style
const gridStyle = {
  gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
  gap: `${GAP_PX}px`
};

// --- Helpers ---

// Shuffle array
const shuffle = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// Check if a specific word exists contiguously in the grid
const checkGridForWord = (state: GridState, targetWord: string): boolean => {
  // Normalize target (remove dashes for syllables like "а-м" -> "ам")
  const cleanTarget = targetWord.replace(/-/g, '').toLowerCase();
  
  // We scan rows
  for (let r = 0; r < GRID_ROWS; r++) {
    let rowChars: string[] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const idx = r * GRID_COLS + c;
      const item = state[idx];
      rowChars.push(item ? item.char.toLowerCase() : ' ');
    }
    
    // Check if sequence exists
    const rowString = rowChars.join(''); 
    
    for (let i = 0; i <= rowChars.length - cleanTarget.length; i++) {
        let match = true;
        for (let j = 0; j < cleanTarget.length; j++) {
            if (rowChars[i+j] !== cleanTarget[j]) {
                match = false;
                break;
            }
        }
        if (match) return true;
    }
  }
  return false;
};

// --- Components ---

function KeyboardArea({ children }: { children?: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: 'keyboard-area',
    data: { type: 'keyboard-area' }
  });
  return (
    <div ref={setNodeRef} className="flex-none bg-neutral-900 rounded-xl p-4 shadow-2xl border border-neutral-700">
      {children}
    </div>
  );
}

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return closestCenter(args);
};

interface LearningGameProps {
  letter: string;
  onBack: () => void;
}

interface Task {
  text: string;
  type: 'syllable' | 'word';
}

export default function LearningGame({ letter, onBack }: LearningGameProps) {
  const [gridState, setGridState] = useState<GridState>({});
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const [dragSize, setDragSize] = useState<{width: number, height: number} | null>(null);
  
  // Game State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [failedStepsCount, setFailedStepsCount] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(Array(6).fill(false));
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStars, setFinalStars] = useState(0);

  // Initialize Game
  useEffect(() => {
    initVoices();
    const data = LEARNING_DATA[letter];
    if (!data) {
        // Fallback or error
        console.error("No data for letter", letter);
        return;
    }

    const syllables = shuffle(data.syllables).slice(0, 3).map(t => ({ text: t, type: 'syllable' as const }));
    const words = shuffle(data.words).slice(0, 3).map(t => ({ text: t, type: 'word' as const }));
    
    // Order: 3 syllables, then 3 words
    const gameTasks = [...syllables, ...words];
    setTasks(gameTasks);
    
    // Speak first task after a short delay
    setTimeout(() => {
        announceTask(gameTasks[0]);
    }, 800);

  }, [letter]);

  const announceTask = (task: Task) => {
    if (!task) return;
    const cleanText = task.text.replace(/-/g, '');
    const prompt = task.type === 'syllable' 
        ? `Напиши слог ${task.text}` 
        : `Напиши слово ${cleanText}`;
    speakText(prompt);
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (gameFinished || isProcessingSuccess) return;
    
    window.speechSynthesis.cancel();

    const { active } = event;
    const data = active.data.current as DragData;
    setActiveDragData(data);

    const node = document.getElementById(active.id as string);
    if (node) {
      const rect = node.getBoundingClientRect();
      setDragSize({ width: rect.width, height: rect.height });
    }

    if (data.origin === 'grid') playSound('rustle'); 
    else playSound('grab');
  }, [gameFinished, isProcessingSuccess]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (gameFinished || isProcessingSuccess) {
        setActiveDragData(null);
        return;
    }

    const { active, over } = event;
    const data = active.data.current as DragData;

    setActiveDragData(null);
    setDragSize(null);
    playSound('drop');

    if (!over) return;

    let nextState = { ...gridState };
    let didChange = false;

    // Handle Drop Logic (Same as FreePlay basically)
    if (data.origin === 'grid' && over.id === 'keyboard-area') {
       if (data.index !== undefined) delete nextState[data.index];
       didChange = true;
    } else if (over.id.toString().startsWith('cell-')) {
      const targetIndex = over.data.current?.index as number;
      if (targetIndex !== undefined) {
        const existingItem = nextState[targetIndex];

        if (data.origin === 'grid' && data.index !== undefined) {
          if (data.index !== targetIndex) {
            delete nextState[data.index];
            if (existingItem) nextState[data.index] = existingItem;
            nextState[targetIndex] = { char: data.char, id: data.id || `item-${Date.now()}` };
            didChange = true;
          }
        } else if (data.origin === 'keyboard') {
           const newId = `placed-${data.char}-${Date.now()}-${Math.random()}`;
           nextState[targetIndex] = { char: data.char, id: newId };
           didChange = true;
        }
      }
    }

    if (didChange) {
      setGridState(nextState);
      
      // GAME LOGIC
      // 1. Increment Moves
      const newMoveCount = moveCount + 1;
      setMoveCount(newMoveCount);

      // 2. Check for Match
      const currentTask = tasks[currentTaskIndex];
      if (currentTask && checkGridForWord(nextState, currentTask.text)) {
        handleTaskSuccess(currentTask);
      } else {
          // Just speak letter if no match
          speakText(data.char);
      }
    }
  }, [gridState, tasks, currentTaskIndex, moveCount, gameFinished, isProcessingSuccess]); 

  const handleTaskSuccess = (task: Task) => {
    setIsProcessingSuccess(true);
    
    // 1. Calculate Failure logic for this step
    const cleanText = task.text.replace(/-/g, '');
    const limit = cleanText.length + 3;
    const isFailedStep = moveCount > limit;
    
    if (isFailedStep) {
        setFailedStepsCount(prev => prev + 1);
    }

    // 2. Sequence
    // Read word -> Success Sound -> Update Indicator -> Clear -> Next
    speakText(cleanText);
    
    setTimeout(() => {
        playSound('success');
        
        // Update indicator
        setCompletedSteps(prev => {
            const next = [...prev];
            next[currentTaskIndex] = true;
            return next;
        });

        setTimeout(() => {
            // Next Task
            const nextIndex = currentTaskIndex + 1;
            
            if (nextIndex >= tasks.length) {
                finishGame(isFailedStep ? failedStepsCount + 1 : failedStepsCount);
            } else {
                setGridState({}); // Clear grid
                setMoveCount(0); // Reset moves
                setCurrentTaskIndex(nextIndex);
                setIsProcessingSuccess(false);
                announceTask(tasks[nextIndex]);
            }
        }, 2000); // Wait after sound

    }, 1000); // Wait after speak
  };

  const finishGame = (finalFailedCount: number) => {
    let stars = 3;
    if (finalFailedCount >= 6) stars = 0;
    else if (finalFailedCount >= 4) stars = 1;
    else if (finalFailedCount >= 2) stars = 2;

    setFinalStars(stars);
    setGameFinished(true);
    saveLetterScore(letter, stars);
    playSound('fanfare'); // Louder fanfare
  };

  const keyWidthStyle = {
    width: `calc((100% - ${(GRID_COLS - 1) * GAP_PX}px) / ${GRID_COLS})`
  };

  if (gameFinished) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-neutral-900 text-white p-4">
              <div className="bg-neutral-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-neutral-700 animate-bounce-in">
                  <h2 className="text-4xl font-bold mb-6">Молодец!</h2>
                  <div className="flex gap-2 mb-8">
                      {[1, 2, 3].map(i => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i <= finalStars ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className={`w-16 h-16 ${i <= finalStars ? 'text-yellow-400' : 'text-gray-600'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                      ))}
                  </div>
                  <button 
                    onClick={onBack}
                    className="bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-4 px-12 rounded-xl shadow-lg transition-transform active:scale-95"
                  >
                      Дальше
                  </button>
              </div>
          </div>
      );
  }

  const task = tasks[currentTaskIndex];

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      autoScroll={false} 
    >
      <div className="h-screen flex flex-col items-center py-4 font-sans select-none overflow-hidden bg-neutral-900">
        
        <div className="w-full max-w-[95vw] lg:max-w-6xl flex flex-col gap-4 h-full flex-1">
          
          {/* Header */}
          <div className="flex w-full items-center justify-between px-2">
             <button 
                onClick={onBack}
                className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
             </button>
             
             {/* Task Prompt Display */}
             <div className="text-2xl text-white font-bold tracking-widest hidden sm:block">
                 {task ? task.text.replace(/-/g, '').toUpperCase() : ''}
             </div>

             <button 
                onClick={() => announceTask(tasks[currentTaskIndex])}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                title="Повторить задание"
             >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
               </svg>
               <span className="font-bold text-sm sm:text-base">Повторить</span>
             </button>
          </div>

          {/* Grid Area */}
          <div className="flex-1 bg-neutral-900 rounded-xl p-2 sm:p-4 shadow-2xl border border-neutral-700 flex flex-col justify-center relative">
            <div className="grid w-full mx-auto" style={gridStyle}>
              {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
                const item = gridState[index];
                return (
                  <DroppableCell key={index} index={index}>
                    {item ? (
                      <DraggableItem
                        id={item.id}
                        char={item.char}
                        origin="grid"
                        index={index}
                        disabled={isProcessingSuccess}
                      />
                    ) : null}
                  </DroppableCell>
                );
              })}
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-4 py-2">
             {completedSteps.map((isComplete, idx) => (
                 <div 
                    key={idx}
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full transition-colors duration-500 border-2 border-neutral-700 ${
                        isComplete ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 
                        (idx === currentTaskIndex ? 'bg-neutral-600 border-neutral-500' : 'bg-neutral-800')
                    }`}
                 />
             ))}
          </div>

          {/* Keyboard Area */}
          <KeyboardArea>
            <div className="flex flex-col gap-[2px] items-center justify-center w-full">
              {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-[2px] justify-center w-full">
                  {row.map((char) => (
                    <div key={char} className="aspect-square relative" style={keyWidthStyle}>
                      <DraggableItem
                        id={`keyboard-${char}`}
                        char={char}
                        origin="keyboard"
                        disabled={isProcessingSuccess}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </KeyboardArea>

        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragData ? (
            <div style={{ width: dragSize?.width || '3rem', height: dragSize?.height || '3rem' }}>
              <Tile char={activeDragData.char} isOverlay />
            </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  );
}