import { useState, useRef, useCallback, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface ResizablePanelProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function ResizablePanel({
  left,
  right,
  defaultLeftWidth = 50,
  minWidth = 20,
  maxWidth = 80,
}: ResizablePanelProps) {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    setLeftWidth(Math.min(Math.max(newLeftWidth, minWidth), maxWidth));
  }, [isDragging, minWidth, maxWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full w-full relative">
      <div 
        className="h-full overflow-hidden"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      <div
        className={`relative group flex-shrink-0 w-1 cursor-col-resize hover:bg-white/20 transition-colors ${
          isDragging ? 'bg-white/40' : ''
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Handle visual */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex flex-col gap-1 py-3 px-0.5 bg-[#262626] rounded-md">
            <GripVertical className="w-3 h-3 text-gray-500" />
            <GripVertical className="w-3 h-3 text-gray-500" />
            <GripVertical className="w-3 h-3 text-gray-500" />
          </div>
        </div>
      </div>

      <div 
        className="h-full overflow-hidden"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
}