import React, { useEffect } from 'react';
import { FloatingTextItem } from '../types';

interface FloatingTextProps {
  item: FloatingTextItem;
  onComplete: (id: number) => void;
}

export const FloatingText: React.FC<FloatingTextProps> = ({ item, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete(item.id);
    }, 800);
    return () => clearTimeout(timer);
  }, [item.id, onComplete]);

  return (
    <div
      className="fixed pointer-events-none text-xl font-bold text-amber-800 animate-float-up z-50 whitespace-nowrap opacity-90"
      style={{
        left: item.x,
        top: item.y,
      }}
    >
      {item.text}
    </div>
  );
};