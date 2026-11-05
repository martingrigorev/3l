import React, { useState, useCallback, useEffect } from 'react';
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
import { KEYBOARD_LAYOUT } from '../constants';
import { GridState, DragData } from '../types';
import { DroppableCell } from './DroppableCell';
import { DraggableItem } from './DraggableItem';
import { Tile } from './Tile';
import { playSound, speakText, initVoices } from '../audio';
import { UserProgress } from '../storage';
import { SeaAnimal } from '../seaAnimalsData';

const GAP_PX = 2;

const charMatches = (charA?: string, charB?: string): boolean => {
  if (!charA || !charB) return false;
  const a = charA.toLowerCase();
  const b = charB.toLowerCase();
  if (a === b) return true;
  if ((a === 'ё' && b === 'е') || (a === 'е' && b === 'ё')) return true;
  return false;
};

const findWordContiguousInRow = (state: GridState, w: string, r: number, gridCols: number): number[] => {
  const matches: number[] = [];
  const wLen = w.length;
  if (wLen === 0 || wLen > gridCols) return matches;

  for (let c = 0; c <= gridCols - wLen; c++) {
    let match = true;
    for (let k = 0; k < wLen; k++) {
      const item = state[r * gridCols + c + k];
      if (!item || !charMatches(item.char, w[k])) {
        match = false;
        break;
      }
    }
    if (match) {
      matches.push(c);
    }
  }
  return matches;
};

const checkGridForWord = (state: GridState, targetWord: string, gridCols: number, gridRows: number): boolean => {
  const cleanWord = targetWord.replace(/[-]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanWord.split(' ').filter(Boolean);
  if (words.length === 0) return false;

  // Single-word: letters must be strictly contiguous without spaces
  if (words.length === 1) {
    const word = words[0];
    for (let r = 0; r < gridRows; r++) {
      if (findWordContiguousInRow(state, word, r, gridCols).length > 0) {
        return true;
      }
    }
    return false;
  }

  // Multi-word phrase (2, 3, 4+ words):
  // Check sequential placement of words in reading order (across or down rows)
  const canPlaceWordsFrom = (wordIndex: number, minRow: number, minCol: number): boolean => {
    if (wordIndex >= words.length) return true;
    const currentWord = words[wordIndex];

    for (let r = minRow; r < gridRows; r++) {
      const validCols = findWordContiguousInRow(state, currentWord, r, gridCols);
      for (const c of validCols) {
        if (r === minRow && c < minCol) continue;

        // If on same row, ensure cells between previous word and current word are empty (spaces)
        if (r === minRow && minCol > 0) {
          let onlySpaces = true;
          for (let emptyCol = minCol; emptyCol < c; emptyCol++) {
            if (state[r * gridCols + emptyCol]) {
              onlySpaces = false;
              break;
            }
          }
          if (!onlySpaces) continue;
        }

        const nextMinRow = r;
        const nextMinCol = c + currentWord.length;
        if (canPlaceWordsFrom(wordIndex + 1, nextMinRow, nextMinCol)) {
          return true;
        }
      }
    }
    return false;
  };

  return canPlaceWordsFrom(0, 0, 0);
};

function KeyboardArea({ children }: { children?: React.ReactNode }) {
  const { setNodeRef } = useDroppable({
    id: 'keyboard-area',
    data: { type: 'keyboard-area' }
  });
  return (
    <div ref={setNodeRef} className="flex-none bg-neutral-800 w-full p-1">
      {children}
    </div>
  );
}

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return closestCenter(args);
};

interface AnimalsGameProps {
  animal: SeaAnimal;
  onBack: () => void;
  saveScore: (id: string, stars: number) => void;
  gridCols?: number;
  gridRows?: number;
}

export default function AnimalsGame({ animal, onBack, saveScore, gridCols = 12, gridRows = 4 }: AnimalsGameProps) {
  const GRID_COLS = gridCols;
  const GRID_ROWS = gridRows;
  const TOTAL_CELLS = GRID_COLS * GRID_ROWS;

  const gridStyle = {
    gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
    gap: `${GAP_PX}px`
  };

  const [gridState, setGridState] = useState<GridState>({});
  const [activeDragData, setActiveDragData] = useState<DragData | null>(null);
  const [dragSize, setDragSize] = useState<{width: number, height: number} | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [moveCount, setMoveCount] = useState(0);
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [finalStars, setFinalStars] = useState(0);

  useEffect(() => {
    initVoices();
    setTimeout(() => {
        speakText(`Напиши слово ${animal.pronunciation || animal.name}`);
    }, 800);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [animal]);

  const announceTask = () => {
    speakText(animal.pronunciation || animal.name);
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

    if (data.origin === 'grid' && over.id === 'keyboard-area') {
       if (data.index !== undefined) delete nextState[data.index];
       didChange = true;
    } else if (over.id.toString().startsWith('cell-')) {
      const targetIndex = over.data.current?.index ?? parseInt(over.id.toString().replace('cell-', ''), 10);
      if (!isNaN(targetIndex)) {
        if (data.origin === 'grid' && data.index !== undefined) {
          if (data.index !== targetIndex) {
            delete nextState[data.index];
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
      const newMoveCount = moveCount + 1;
      setMoveCount(newMoveCount);
      if (checkGridForWord(nextState, animal.name, GRID_COLS, GRID_ROWS)) {
        handleSuccess();
      } else {
        speakText(data.char);
      }
    }
  }, [gridState, moveCount, gameFinished, isProcessingSuccess, animal.name, GRID_COLS, GRID_ROWS]);

  const handleKeyClick = (char: string) => {
    if (gameFinished || isProcessingSuccess) return;
    let targetIndex = -1;
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (!gridState[i]) {
        targetIndex = i;
        break;
      }
    }
    if (targetIndex !== -1) {
      let nextState = { ...gridState };
      const newId = `placed-${char}-${Date.now()}-${Math.random()}`;
      nextState[targetIndex] = { char, id: newId };
      setGridState(nextState);
      playSound('drop');
      const newMoveCount = moveCount + 1;
      setMoveCount(newMoveCount);
      if (checkGridForWord(nextState, animal.name, GRID_COLS, GRID_ROWS)) {
        handleSuccess();
      } else {
        speakText(char);
      }
    }
  };

  const handleGridItemClick = (index: number, char: string) => {
    if (gameFinished || isProcessingSuccess) return;
    let nextState = { ...gridState };
    delete nextState[index];
    setGridState(nextState);
    playSound('rustle');
  };

  const handleSuccess = () => {
    setIsProcessingSuccess(true);
    speakText(animal.pronunciation || animal.name);
    setTimeout(() => {
        playSound('success');
        setTimeout(() => {
            finishGame();
        }, 1500);
    }, 1000);
  };

  const finishGame = () => {
    const cleanName = animal.name.replace(/ /g, '').replace(/-/g, '');
    const limit = cleanName.length + 2;
    let earnedStars = 3;
    if (moveCount > limit + 6) earnedStars = 1;
    else if (moveCount > limit + 2) earnedStars = 2;
    setFinalStars(earnedStars);
    setGameFinished(true);
    saveScore(animal.id, earnedStars);
    playSound('success');
    speakText("Молодец!");
  };

  const keyWidthStyle = {
    width: `calc((100% - ${(11 * GAP_PX)}px) / 11)`
  };

  if (gameFinished) {
      return (
          <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-neutral-800 text-white p-4">
              <div className="bg-neutral-700 p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-neutral-600 animate-bounce-in">
                  <img src={animal.image} alt={animal.name} className="w-48 h-48 object-cover rounded-lg mb-4" referrerPolicy="no-referrer" />
                  <h2 className="text-4xl font-bold mb-6">Молодец!</h2>
                  <div className="flex gap-2 mb-8">
                      {[1, 2, 3].map(i => (
                          <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i <= finalStars ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className={`w-16 h-16 ${i <= finalStars ? 'text-yellow-400' : 'text-gray-600'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                      ))}
                  </div>
                  <button onClick={onBack} className="bg-green-600 hover:bg-green-500 text-white text-xl font-bold py-4 px-12 rounded-xl shadow-lg transition-transform active:scale-95">Дальше</button>
              </div>
          </div>
      );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={customCollisionDetection} onDragStart={handleDragStart} onDragEnd={handleDragEnd} autoScroll={false}>
      <div className="h-[100dvh] flex flex-col items-center py-2 font-sans select-none overflow-hidden bg-neutral-800">
        <div className="w-full max-w-[95vw] lg:max-w-6xl flex flex-col gap-1 sm:gap-2 h-full flex-1">
          
          <div className="flex w-full items-center justify-center px-2 h-16 sm:h-20 gap-4">
             <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg border-b-2 border-gray-900 active:translate-y-0.5 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
             </button>
             
             <div className="flex items-center gap-4 overflow-hidden">
                <img src={animal.image} alt={animal.name} className="w-12 h-12 sm:w-16 sm:h-16 aspect-square object-cover rounded-lg shadow-lg border border-neutral-700" referrerPolicy="no-referrer" />
                <div className="text-lg sm:text-2xl text-white font-black tracking-widest truncate uppercase">
                    {animal.name}
                </div>
             </div>

             <button onClick={announceTask} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg border-b-2 border-blue-800 active:translate-y-0.5 transition-all flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
               </svg>
               <span className="font-bold hidden sm:inline">Слушать</span>
             </button>
          </div>

          <div className="flex-1 bg-neutral-800 p-1 flex flex-col justify-center relative">
            <div className="grid w-full mx-auto" style={gridStyle}>
              {Array.from({ length: TOTAL_CELLS }).map((_, index) => {
                const item = gridState[index];
                return (
                  <DroppableCell key={index} index={index}>
                    {item ? <DraggableItem id={item.id} char={item.char} origin="grid" index={index} disabled={isProcessingSuccess} onGridClick={handleGridItemClick} /> : null}
                  </DroppableCell>
                );
              })}
            </div>
          </div>

          <KeyboardArea>
            <div className="flex flex-col gap-[2px] items-center justify-center w-full">
              {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-[2px] justify-center w-full">
                  {row.map((char) => {
                    const dragId = `keyboard-${char}`;
                    return (
                      <div key={char} id={`key-${char}`} style={keyWidthStyle} className="aspect-square">
                        <DraggableItem 
                          id={dragId} 
                          char={char} 
                          origin="keyboard" 
                          disabled={isProcessingSuccess}
                          onKeyClick={handleKeyClick}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </KeyboardArea>

        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeDragData && dragSize ? (
          <div style={{ width: dragSize.width, height: dragSize.height }}>
            <Tile char={activeDragData.char} isOverlay={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
