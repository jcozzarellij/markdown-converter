# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check then bundle (tsc -b && vite build)
npm run lint      # ESLint across all files
npm run preview   # Serve the dist/ build locally
```

There is no test suite configured.

## Architecture

MDConvert is a React 19 + TypeScript SPA (Vite) that converts PDF, DOCX, and Excel files to Markdown entirely in the browser — no backend.

### Data flow

1. User selects a file type category (`Category`: `'pdf' | 'word' | 'excel'`) via `Toolbar` or `CategoryTabs`.
2. `DropZone` or the toolbar file input triggers `handleFileSelect` in `App.tsx`, which calls the appropriate converter.
3. Converters (`src/lib/converters/`) process the file client-side using third-party libs:
   - **PDF** → `pdfjs-dist` (worker loaded from cdnjs CDN)
   - **DOCX** → `mammoth`
   - **Excel** → `xlsx` (first sheet only)
4. Result is stored in two places simultaneously via `src/lib/storage.ts` (localStorage):
   - `mdconvert_current` — the active editor content (survives page refresh)
   - `mdconvert_history` — up to 20 conversion records (`HistoryItem[]`)
5. State is managed by two hooks: `useEditorState` (current content + loading flag) and `useHistory` (history list).

### Layout

```
App
├── Toolbar          — category tabs + file input button (Ctrl+U opens UploadModal)
├── HistorySidebar   — collapsible left panel, loads history items into editor
├── UploadModal      — modal file picker (drag-and-drop + category selector)
└── main
    ├── DropZone     — shown when no file is loaded (drag-and-drop)
    └── ResizablePanel  (split view only)
        ├── left: MarkdownEditor   (CodeMirror 6 with markdown lang)
        └── right: MarkdownPreview (react-markdown + rehype-highlight) + ActionBar
```

`ResizablePanel` (`src/components/Layout/ResizablePanel.tsx`) manages a draggable splitter with configurable min/max widths as percentages.

`AppShell.tsx` exists as a layout wrapper component but is **not used** in `App.tsx` — layout is inlined there.

### View modes

`ViewMode` (`'editor' | 'split' | 'preview'`) controls whether the editor, preview, or both panels are visible. Toggle buttons live in both panel headers; `ResizablePanel` is only rendered in `'split'` mode.

### Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Open upload modal |
| `Ctrl+S` | Download as `.md` |
| `Ctrl+Shift+C` | Copy to clipboard |
| `Ctrl+F` | Open find in editor (CodeMirror) |

Shortcuts for `Ctrl+S`, `Ctrl+Shift+C`, `Ctrl+F` are only active when a file is loaded (`showEditor = true`).

### Clipboard paste

The clipboard paste button (and `handlePasteFromClipboard`) reads `text/html` first via `navigator.clipboard.read()`, converts it with `src/lib/htmlToMarkdown.ts`, then falls back to `text/plain`. Appends to existing content if the editor is not empty.

### Key conventions

- `Category` (`'pdf' | 'word' | 'excel'`) is the UI-facing label; `FileType` (`'pdf' | 'docx' | 'excel'`) is the storage label. Mapping lives in `src/types/index.ts`.
- Supported extensions: `.pdf`, `.docx`/`.doc`, `.xlsx`/`.xls`.
- All destructive actions (clear, download, clear history) go through the `ConfirmModal` before executing.
- Toast notifications use `sonner` (`toast.loading` → `toast.success/error` with a shared `id: 'convert'` for replace-in-place).
- Styling is Tailwind CSS v4 (PostCSS plugin, no `tailwind.config.js`).
- Dev server runs on `http://localhost:5173` (Vite default).
