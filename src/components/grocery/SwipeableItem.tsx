import { useRef, useState, ReactNode } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableItemProps {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}

const SWIPE_THRESHOLD = 80;
const DELETE_THRESHOLD = 120;

// Haptic feedback
const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const durations = { light: 5, medium: 15, heavy: 25 };
    navigator.vibrate(durations[intensity]);
  }
};

// Delete sound effect
const playDeleteSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch (e) {
    // Audio not supported
  }
};

export const SwipeableItem = ({ children, onDelete, className }: SwipeableItemProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Only allow swiping left (positive diff)
    if (diff > 0) {
      // Add resistance after threshold
      const resistance = diff > SWIPE_THRESHOLD ? 0.3 : 1;
      const limitedDiff = diff > SWIPE_THRESHOLD 
        ? SWIPE_THRESHOLD + (diff - SWIPE_THRESHOLD) * resistance
        : diff;
      
      setTranslateX(-Math.min(limitedDiff, DELETE_THRESHOLD + 20));
      
      // Haptic feedback at threshold
      if (diff >= DELETE_THRESHOLD && translateX > -DELETE_THRESHOLD) {
        triggerHaptic('medium');
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const diff = startX.current - currentX.current;
    
    if (diff >= DELETE_THRESHOLD) {
      // Trigger delete
      setIsDeleting(true);
      triggerHaptic('heavy');
      playDeleteSound();
      
      // Animate out then delete
      setTranslateX(-400);
      setTimeout(() => {
        onDelete();
      }, 300);
    } else {
      // Snap back
      setTranslateX(0);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
    triggerHaptic('heavy');
    playDeleteSound();
    setTranslateX(-400);
    setTimeout(() => {
      onDelete();
    }, 300);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        isDeleting && "animate-fade-out",
        className
      )}
    >
      {/* Delete background */}
      <div 
        className={cn(
          "absolute inset-y-0 right-0 flex items-center justify-end px-6 bg-destructive transition-all",
          Math.abs(translateX) >= DELETE_THRESHOLD 
            ? "bg-destructive" 
            : "bg-destructive/80"
        )}
        style={{ width: Math.max(Math.abs(translateX), 80) }}
      >
        <button
          onClick={handleDeleteClick}
          className="flex flex-col items-center gap-1 text-destructive-foreground"
        >
          <Trash2 
            className={cn(
              "w-6 h-6 transition-transform",
              Math.abs(translateX) >= DELETE_THRESHOLD && "scale-125"
            )} 
          />
          <span className="text-xs font-medium">Delete</span>
        </button>
      </div>
      
      {/* Swipeable content */}
      <div
        className={cn(
          "relative bg-card",
          !isDragging && "transition-transform duration-300 ease-out"
        )}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
