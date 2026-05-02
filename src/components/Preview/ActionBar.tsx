import { Copy, Download, Trash2, FilePlus, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  shortcut?: string;
  danger?: boolean;
  children: React.ReactNode;
}

function ActionButton({ onClick, disabled, label, shortcut, danger, children }: ActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <button
          onClick={onClick}
          disabled={disabled}
          className={`p-1 rounded transition-all duration-150 disabled:opacity-50 ${
            danger
              ? 'text-gray-500 hover:text-red-400 hover:bg-[#262626]'
              : 'text-gray-500 hover:text-white hover:bg-[#262626]'
          }`}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span>{label}</span>
        {shortcut && (
          <kbd className="ml-1.5 px-1 py-0.5 rounded text-[10px] font-mono bg-[#262626] text-gray-500 border border-[#404040]">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

interface ActionBarProps {
  onCopy: () => void;
  onDownload: () => void;
  onClear: () => void;
  onNewFile: () => void;
  isProcessing?: boolean;
}

export function ActionBar({ onCopy, onDownload, onClear, onNewFile, isProcessing }: ActionBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-0.5">
      <ActionButton onClick={handleCopy} disabled={isProcessing} shortcut="Ctrl+Shift+C" label="Copy">
        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      </ActionButton>

      <ActionButton onClick={onDownload} disabled={isProcessing} shortcut="Ctrl+S" label="Download .md">
        <Download className="w-3.5 h-3.5" />
      </ActionButton>

      <div className="w-px h-4 bg-[#333] mx-0.5" />

      <ActionButton onClick={onClear} disabled={isProcessing} label="Delete file" danger>
        <Trash2 className="w-3.5 h-3.5" />
      </ActionButton>

      <ActionButton onClick={onNewFile} disabled={isProcessing} label="New file">
        <FilePlus className="w-3.5 h-3.5" />
      </ActionButton>

      {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500 ml-1" />}
    </div>
  );
}
