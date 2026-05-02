import { useCallback, useState } from 'react';
import { FileText, FileType as FileWord, FileSpreadsheet, Upload } from 'lucide-react';
import type { Category } from '../../types';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedCategory?: Category | null;
  onCategoryChange?: (category: Category) => void;
}

const categories: { id: Category; label: string; icon: React.ReactNode; accept: string; desc: string }[] = [
  { 
    id: 'pdf', 
    label: 'PDF', 
    icon: <FileText className="w-8 h-8" />,
    accept: '.pdf',
    desc: 'Convert PDF documents'
  },
  { 
    id: 'word', 
    label: 'Word', 
    icon: <FileWord className="w-8 h-8" />,
    accept: '.docx,.doc',
    desc: 'Convert Word documents'
  },
  { 
    id: 'excel', 
    label: 'Excel', 
    icon: <FileSpreadsheet className="w-8 h-8" />,
    accept: '.xlsx,.xls',
    desc: 'Convert spreadsheets'
  },
];

function getCategoryFromFile(file: File): Category | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (ext === '.pdf') return 'pdf';
  if (ext === '.docx' || ext === '.doc') return 'word';
  if (ext === '.xlsx' || ext === '.xls') return 'excel';
  return null;
}

export function DropZone({ onFileSelect, selectedCategory, onCategoryChange }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const category = getCategoryFromFile(file);
      if (category && onCategoryChange) {
        onCategoryChange(category);
      }
      onFileSelect(file);
    }
  }, [onFileSelect, onCategoryChange]);

  const handleCategoryClick = useCallback((category: Category) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
    const input = document.createElement('input');
    input.type = 'file';
    const cat = categories.find(c => c.id === category);
    input.accept = cat?.accept || '';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onFileSelect(file);
    };
    input.click();
  }, [onFileSelect, onCategoryChange]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full max-w-2xl transition-all duration-200 ${isDragging ? 'scale-[1.02]' : ''}`}
    >
      {isDragging && (
        <div className="mb-4 p-4 rounded-lg bg-white/10 border border-white/20 text-center">
          <p className="text-white font-medium">Drop file to convert</p>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Select file type</h2>
        <p className="text-gray-500">Choose a file type and upload your document</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const isHovered = hoveredCategory === cat.id;
          
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`
                group relative flex flex-col items-center gap-4 p-6 rounded-xl
                border-2 transition-all duration-200 cursor-pointer
                ${isSelected || isHovered 
                  ? 'border-white bg-white/5 scale-[1.02]' 
                  : 'border-[#262626] bg-[#0c0c0c] hover:border-gray-600 hover:bg-[#141414]'
                }
              `}
            >
              <div className={`
                p-4 rounded-xl transition-all duration-200
                ${isSelected || isHovered 
                  ? 'bg-white text-black' 
                  : 'bg-[#1a1a1a] text-gray-400 group-hover:text-white group-hover:bg-[#262626]'
                }
              `}>
                {cat.icon}
              </div>
              
              <div className="text-center">
                <p className={`font-semibold transition-colors ${
                  isSelected || isHovered ? 'text-white' : 'text-gray-300'
                }`}>
                  {cat.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
              </div>

              <div className={`
                absolute inset-0 rounded-xl transition-opacity duration-200
                ${isSelected ? 'opacity-100' : 'opacity-0'}
              `}>
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 rounded-full bg-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          or drag and drop a file anywhere
        </p>
      </div>
    </div>
  );
}