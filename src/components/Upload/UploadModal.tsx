import { useState, useCallback } from 'react';
import { Upload, X, FileText, FileType as FileWord, FileSpreadsheet, Check } from 'lucide-react';
import type { Category } from '../../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

const categories: { id: Category; label: string; icon: React.ReactNode; accept: string }[] = [
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-6 h-6" />, accept: '.pdf' },
  { id: 'word', label: 'Word', icon: <FileWord className="w-6 h-6" />, accept: '.docx,.doc' },
  { id: 'excel', label: 'Excel', icon: <FileSpreadsheet className="w-6 h-6" />, accept: '.xlsx,.xls' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function UploadModal({ isOpen, onClose, onFileSelect }: UploadModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleClose = useCallback(() => {
    setSelectedCategory(null);
    setSelectedFile(null);
    onClose();
  }, [onClose]);

  const handleCategorySelect = useCallback((category: Category) => {
    setSelectedCategory(category);
    setSelectedFile(null);
  }, []);

  const handleBrowse = useCallback(() => {
    if (!selectedCategory) return;
    const input = document.createElement('input');
    input.type = 'file';
    const cat = categories.find(c => c.id === selectedCategory);
    input.accept = cat?.accept || '';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) setSelectedFile(file);
    };
    input.click();
  }, [selectedCategory]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    const file = e.dataTransfer.files[0];
    if (file) {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      const cat = categories.find(c => c.id === selectedCategory);
      if (cat?.accept.includes(ext)) setSelectedFile(file);
    }
  }, [selectedCategory]);

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      onFileSelect(selectedFile);
      handleClose();
    }
  }, [selectedFile, onFileSelect, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0c0c0c] border border-[#262626] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Upload File</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-gray-400">Select file type:</p>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                    isSelected ? 'border-white bg-white/10' : 'border-[#262626] bg-[#141414] hover:border-gray-500'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white text-black' : 'bg-[#1a1a1a] text-gray-400'}`}>
                    {cat.icon}
                  </div>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedCategory && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Drop your file here:</p>
            <div
              onClick={handleBrowse}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                selectedFile
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-[#262626] hover:border-gray-500 hover:bg-[#141414]'
              }`}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-gray-500 text-xs">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="w-8 h-8" />
                  <p className="text-sm">Click to browse</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-lg border border-[#262626] text-gray-400 hover:text-white hover:border-gray-500 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
              selectedFile
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-[#262626] text-gray-500 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
