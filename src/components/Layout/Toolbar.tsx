import { Upload, AArrowUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolbarProps {
  onOpenUpload: () => void;
}

export function Toolbar({ onOpenUpload }: ToolbarProps) {
  return (
    <div className="h-14 px-5 flex items-center justify-between border-b border-[#262626] bg-[#0c0c0c]">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
          <AArrowUp className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-white tracking-tight">
          Md fast
        </h1>
      </div>

      <Tooltip>
        <TooltipTrigger>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/5"
          >
            <Upload className="w-4 h-4" />
            <span>Upload File</span>
            <kbd className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/10 text-black/50 border border-black/10">
              Ctrl+U
            </kbd>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload new file</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
