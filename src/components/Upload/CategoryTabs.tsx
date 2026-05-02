import type { FileType, Category } from '../../types';
import { FileText, FileType as FileTypeIcon, FileSpreadsheet } from 'lucide-react';

interface CategoryTabsProps {
  active: Category;
  onChange: (category: Category) => void;
}

const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'word', label: 'WORD', icon: <FileTypeIcon className="w-3.5 h-3.5" /> },
  { id: 'excel', label: 'EXCEL', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
];

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div className="flex gap-0.5 p-0.5 bg-[#141414] rounded-lg">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
            active === cat.id
              ? 'bg-white text-black shadow-sm'
              : 'text-gray-500 hover:text-white hover:bg-[#1a1a1a]'
          }`}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export function getCategoryFromFileType(fileType: FileType): Category {
  switch (fileType) {
    case 'pdf': return 'pdf';
    case 'docx': return 'word';
    case 'excel': return 'excel';
    default: return 'pdf';
  }
}