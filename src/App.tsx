import { useState, useCallback, useRef, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import type { Category, FileType } from './types';
import { useEditorState } from './hooks/useEditorState';
import { useHistory } from './hooks/useHistory';
import { Toolbar } from './components/Layout/Toolbar';
import { HistorySidebar } from './components/Sidebar/HistorySidebar';
import { MarkdownEditor } from './components/Editor/MarkdownEditor';
import type { MarkdownEditorHandle } from './components/Editor/MarkdownEditor';
import { MarkdownPreview } from './components/Preview/MarkdownPreview';
import { ActionBar } from './components/Preview/ActionBar';
import { DropZone } from './components/Upload/DropZone';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { UploadModal } from './components/Upload/UploadModal';
import { ResizablePanel } from './components/Layout/ResizablePanel';
import { Footer } from './components/Layout/Footer';
import { pdfToMd, docxToMd, excelToMd } from './lib/converters';
import { htmlToMarkdown } from './lib/htmlToMarkdown';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FileText, FileType as FileTypeIcon, FileSpreadsheet, Code2, Columns2, Eye, ClipboardPaste } from 'lucide-react';

type ViewMode = 'editor' | 'split' | 'preview';

const fileTypeIcons: Record<FileType, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4" />,
  docx: <FileTypeIcon className="w-4 h-4" />,
  excel: <FileSpreadsheet className="w-4 h-4" />,
};

const fileTypeLabels: Record<FileType, string> = {
  pdf: 'PDF',
  docx: 'Word',
  excel: 'Excel',
};

const viewModeOptions: { mode: ViewMode; icon: React.ReactNode; title: string }[] = [
  { mode: 'editor', icon: <Code2 className="w-3.5 h-3.5" />, title: 'Editor only' },
  { mode: 'split', icon: <Columns2 className="w-3.5 h-3.5" />, title: 'Split view' },
  { mode: 'preview', icon: <Eye className="w-3.5 h-3.5" />, title: 'Preview only' },
];

function ViewModeToggle({ viewMode, onChange }: { viewMode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-[#141414] border border-[#262626]">
      {viewModeOptions.map(({ mode, icon, title }) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          title={title}
          className={`p-1 rounded transition-all duration-150 ${
            viewMode === mode
              ? 'bg-white text-black'
              : 'text-gray-500 hover:text-white hover:bg-[#262626]'
          }`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [category, setCategory] = useState<Category>('pdf');
  const [currentFileType, setCurrentFileType] = useState<FileType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'clear' | 'download' | 'clearHistory';
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, type: 'clear', title: '', message: '', onConfirm: () => {} });

  const { content, setContent, clear, isLoading, setIsLoading } = useEditorState();
  const { history, addItem, removeItem, clearHistory } = useHistory();
  const [currentFileName, setCurrentFileName] = useState('');
  const currentItemId = useRef<string>('');
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsLoading(true);
    setCurrentFileName(file.name);
    toast.loading('Converting file...', { id: 'convert' });

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const isPdf = ext === 'pdf';
      const isDocx = ext === 'docx' || ext === 'doc';

      const result = isPdf ? await pdfToMd(file)
        : isDocx ? await docxToMd(file)
        : await excelToMd(file);

      const fileType: FileType = isPdf ? 'pdf' : isDocx ? 'docx' : 'excel';

      setContent(result);
      const newItem = addItem(file.name, fileType, result);
      currentItemId.current = newItem.id;
      setCurrentFileType(fileType);
      toast.success('File converted successfully!', { id: 'convert' });
    } catch (error) {
      toast.error('Failed to convert file. Please try again.', { id: 'convert' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [setContent, addItem, setIsLoading]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  }, [content]);

  const handleDownload = useCallback(() => {
    setConfirmModal({
      open: true,
      type: 'download',
      title: 'Download file?',
      message: `Download "${currentFileName || 'document'}.md" to your device?`,
      onConfirm: () => {
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFileName
          ? currentFileName.replace(/\.[^.]+$/, '.md')
          : 'document.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Download started!');
      }
    });
  }, [content]);

  const handleClear = useCallback(() => {
    setConfirmModal({
      open: true,
      type: 'clear',
      title: 'Delete file?',
      message: `Delete "${currentFileName || 'this file'}" from your history?`,
      onConfirm: () => {
        if (currentItemId.current) removeItem(currentItemId.current);
        clear();
        setCurrentFileName('');
        currentItemId.current = '';
        setCurrentFileType(null);
        toast.success('File deleted');
      }
    });
  }, [clear, removeItem]);

  const handleClearHistory = useCallback(() => {
    setConfirmModal({
      open: true,
      type: 'clearHistory',
      title: 'Clear all history?',
      message: 'This will permanently delete all your conversion history.',
      onConfirm: () => {
        clearHistory();
        clear();
        setCurrentFileName('');
        setCurrentFileType(null);
        toast.success('History cleared');
      }
    });
  }, [clearHistory, clear]);

  const handleNewFile = useCallback(() => {
    clear();
    setCurrentFileName('');
    currentItemId.current = '';
    setCurrentFileType(null);
  }, [clear]);

  const handleHistorySelect = useCallback((item: any) => {
    setContent(item.content);
    setCurrentFileName(item.fileName);
    currentItemId.current = item.id;
    setCurrentFileType(item.fileType);
  }, [setContent]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes('text/html')) {
          const blob = await item.getType('text/html');
          const html = await blob.text();
          const md = htmlToMarkdown(html);
          if (md) {
            setContent(content ? `${content}\n\n${md}` : md);
            toast.success('Pasted and converted from clipboard');
            return;
          }
        }
        if (item.types.includes('text/plain')) {
          const blob = await item.getType('text/plain');
          const text = await blob.text();
          if (text) {
            setContent(content ? `${content}\n\n${text}` : text);
            toast.success('Pasted from clipboard');
            return;
          }
        }
      }
    } catch {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          setContent(content ? `${content}\n\n${text}` : text);
          toast.success('Pasted from clipboard');
        }
      } catch {
        toast.error('Could not access clipboard');
      }
    }
  }, [content, setContent]);

  const showEditor = !!content && history.length > 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inTextInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (e.ctrlKey && !e.shiftKey && e.key === 'u' && !inTextInput) {
        e.preventDefault();
        setShowUploadModal(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!showEditor) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inTextInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if (e.ctrlKey && !e.shiftKey && e.key === 's') {
        e.preventDefault();
        handleDownload();
      } else if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        handleCopy();
      } else if (e.ctrlKey && !e.shiftKey && e.key === 'f' && !inTextInput) {
        e.preventDefault();
        editorRef.current?.openFind();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showEditor, handleDownload, handleCopy]);

  const previewContent = content;

  const showViewModeToggle = viewMode === 'editor' || viewMode === 'preview';
  const viewModeToggleElement = showViewModeToggle ? <ViewModeToggle viewMode={viewMode} onChange={setViewMode} /> : null;

  // ── Panel JSX ─────────────────────────────────────────────────────────────
  const editorPanel = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#262626] bg-[#0c0c0c] flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {currentFileType && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#1a1a1a] text-gray-400 text-xs font-medium border border-[#262626] flex-shrink-0">
              {fileTypeIcons[currentFileType]}
              <span>{fileTypeLabels[currentFileType]}</span>
            </div>
          )}
          <span className="text-gray-500 text-sm truncate">{currentFileName}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handlePasteFromClipboard}
            title="Paste from clipboard — converts HTML/rich text to Markdown"
            className="p-1 rounded text-gray-600 hover:text-white hover:bg-[#262626] transition-all duration-150"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
          </button>
          {viewModeToggleElement}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <MarkdownEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          isLoading={isLoading}
        />
      </div>
    </div>
  );

  const previewPanel = (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#262626] bg-[#0c0c0c] flex-shrink-0">
        <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Preview</span>
        <div className="flex items-center gap-2">
          {!!content && (
            <ActionBar
              onCopy={handleCopy}
              onDownload={handleDownload}
              onClear={handleClear}
              onNewFile={handleNewFile}
              isProcessing={isLoading}
            />
          )}
          {viewModeToggleElement}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <MarkdownPreview content={previewContent} />
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-[#0a0a0a]">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#0a0a0a',
              border: '1px solid #e5e5e5',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            className: 'font-medium',
            duration: 2000,
          }}
        />

        <Toolbar onOpenUpload={() => setShowUploadModal(true)} />

      <div className="flex-1 flex overflow-hidden">
        <HistorySidebar
          history={history}
          onSelect={handleHistorySelect}
          onClear={handleClearHistory}
          onOpenUpload={() => setShowUploadModal(true)}
          isCollapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
        />

        <main className="flex-1 flex overflow-hidden">
          {!showEditor ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <DropZone
                onFileSelect={handleFileSelect}
                selectedCategory={category}
                onCategoryChange={setCategory}
              />
            </div>
          ) : viewMode === 'split' ? (
            <ResizablePanel
              defaultLeftWidth={50}
              minWidth={25}
              maxWidth={75}
              left={editorPanel}
              right={previewPanel}
            />
          ) : viewMode === 'editor' ? (
            <div className="flex-1 overflow-hidden">{editorPanel}</div>
          ) : (
            <div className="flex-1 overflow-hidden">{previewPanel}</div>
          )}
        </main>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileSelect={handleFileSelect}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.type === 'clearHistory' ? 'Clear All' : confirmModal.type === 'clear' ? 'Delete' : 'Download'}
        cancelText="Cancel"
        type={confirmModal.type === 'download' ? 'info' : 'danger'}
      />

      <Footer />
    </div>
    </TooltipProvider>
  );
}

export default App;
