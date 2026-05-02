import { useState, useEffect } from "react";
import type { HistoryItem } from "../../types";
import {
  FileText,
  FileType as FileTypeIcon,
  FileSpreadsheet,
  Trash2,
  Clock,
  File,
  PanelLeftClose,
  PanelLeft,
  Plus,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onOpenUpload: () => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const typeConfig = {
  pdf: {
    icon: FileText,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    label: "PDF",
  },
  docx: {
    icon: FileTypeIcon,
    color: "text-white",
    bg: "bg-white/10",
    label: "DOCX",
  },
  excel: {
    icon: FileSpreadsheet,
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    label: "XLSX",
  },
};

export function HistorySidebar({
  history,
  onSelect,
  onClear,
  onOpenUpload,
  isCollapsed,
  onToggle,
}: HistorySidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedId(null);
  }, [history]);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const truncateName = (name: string, maxLen: number = 26) => {
    if (name.length <= maxLen) return name;
    const ext = name.split(".").pop();
    const base = name.slice(0, maxLen - (ext?.length || 0) - 4);
    return `${base}...`;
  };

  const handleSelect = (item: HistoryItem) => {
    setSelectedId(item.id);
    onSelect(item);
  };

  if (isCollapsed) {
    return (
      <div className="h-full bg-[#0c0c0c] border-r border-[#262626] flex flex-col items-center py-3 gap-2 sidebar-transition w-12">
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-all duration-150 group"
          title="Show History"
        >
          <PanelLeft className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        {history.length > 0 && (
          <div className="flex flex-col gap-1 mt-2">
            {history.slice(0, 5).map((item) => {
              const config = typeConfig[item.fileType];
              const Icon = config.icon;
              const isSelected = selectedId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-2 rounded-lg transition-all duration-150 group ${
                    isSelected
                      ? "bg-white/10 text-white"
                      : "hover:bg-[#1a1a1a] text-gray-500 hover:text-white"
                  }`}
                  title={item.fileName}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}

        {history.length > 5 && (
          <span className="text-xs text-gray-600 font-medium">
            +{history.length - 5}
          </span>
        )}

        <button
          onClick={onOpenUpload}
          className="mt-auto p-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-all duration-150 group"
          title="Upload file"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0c0c0c] border-r border-[#262626] flex flex-col sidebar-transition w-[260px]">
      <div className="p-3 border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-medium text-gray-300">Recent</h2>
          {history.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-[#1a1a1a] rounded">
              {history.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <button
                  onClick={onClear}
                  className="p-1.5 rounded hover:bg-[#1a1a1a] text-gray-500 hover:text-red-400 transition-all duration-150 group"
                  title="Clear History"
                >
                  <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete all</p>
              </TooltipContent>
            </Tooltip>
          )}

          <button
            onClick={onToggle}
            className="p-1.5 rounded hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-all duration-150 group"
            title="Collapse"
          >
            <PanelLeftClose className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto overflow-x-hidden">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#141414] flex items-center justify-center mb-3 border border-[#262626]">
              <File className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No files yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Convert a file to get started
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {history.map((item, index) => {
              const config = typeConfig[item.fileType];
              const Icon = config.icon;
              const isHovered = hoveredId === item.id;
              const isSelected = selectedId === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`w-full p-2.5 rounded-lg text-left transition-all duration-200 group ${
                    isSelected
                      ? "bg-[#1a1a1a] border border-[#333]"
                      : isHovered
                        ? "bg-[#141414] translate-x-0.5"
                        : "hover:bg-[#141414]"
                  }`}
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center transition-transform group-hover:scale-105 ${isSelected ? "ring-1 ring-white/20" : ""}`}
                    >
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate transition-colors ${
                          isHovered || isSelected
                            ? "text-white"
                            : "text-gray-200"
                        }`}
                      >
                        {truncateName(item.fileName)}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.color}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[10px] text-gray-600">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-[#262626]">
        <button
          onClick={onOpenUpload}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] text-gray-500 hover:text-white transition-all duration-150 group"
        >
          <div className="w-7 h-7 rounded-md border border-dashed border-[#333] group-hover:border-[#555] flex items-center justify-center transition-colors">
            <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-sm font-medium">Upload file</span>
        </button>
      </div>
    </div>
  );
}
