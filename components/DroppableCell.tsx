import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableCellProps {
  index: number;
  children?: React.ReactNode;
}

export const DroppableCell: React.FC<DroppableCellProps> = ({ index, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `cell-${index}`,
    data: { index, type: 'cell' },
  });

  // Mobile: aspect-[0.66] (taller)
  // Desktop: aspect-square (original)
  return (
    <div
      ref={setNodeRef}
      className={`relative border border-gray-700 rounded-sm transition-colors duration-200 
        aspect-[0.66] md:aspect-square
        ${isOver ? 'bg-gray-500/50' : 'bg-gray-800/30'}
      `}
    >
      {children}
    </div>
  );
};