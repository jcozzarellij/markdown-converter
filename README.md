# MDConvert

Browser-based tool that converts PDF, DOCX, and Excel files to Markdown — no backend, no uploads, everything runs client-side.

## Features

- **PDF → Markdown** via `pdfjs-dist` (worker loaded from CDN)
- **DOCX / DOC → Markdown** via `mammoth`
- **Excel / XLS → Markdown table** via `xlsx` (first sheet)
- **Clipboard paste** — converts rich HTML to Markdown automatically
- Split / editor-only / preview-only view modes
- Conversion history (up to 20 items, persisted in `localStorage`)
- Download result as `.md` file

## Tech stack

- React 19 + TypeScript, bundled with Vite
- CodeMirror 6 (editor), react-markdown + rehype-highlight (preview)
- Tailwind CSS v4 (PostCSS plugin)
- sonner (toasts), lucide-react (icons)

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # ESLint
npm run preview  # serve dist/ locally
```

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Open upload modal |
| `Ctrl+S` | Download as `.md` |
| `Ctrl+Shift+C` | Copy to clipboard |
| `Ctrl+F` | Find in editor |
