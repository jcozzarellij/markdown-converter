import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { EditorView, Decoration } from '@codemirror/view';
import type { DecorationSet } from '@codemirror/view';
import { StateEffect, StateField, EditorSelection } from '@codemirror/state';
import { closeBrackets } from '@codemirror/autocomplete';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

// ── Search highlight extension ──────────────────────────────────────────────

const setHighlights = StateEffect.define<{ from: number; to: number; active: boolean }[]>();

const highlightField = StateField.define<DecorationSet>({
  create() { return Decoration.none; },
  update(decs, tr) {
    for (const e of tr.effects) {
      if (e.is(setHighlights)) {
        if (e.value.length === 0) return Decoration.none;
        const marks = e.value.map(({ from, to, active }) =>
          Decoration.mark({ class: active ? 'cm-find-active' : 'cm-find-match' }).range(from, to)
        );
        return Decoration.set(marks, true);
      }
    }
    return decs.map(tr.changes);
  },
  provide: f => EditorView.decorations.from(f),
});

const findTheme = EditorView.theme({
  '.cm-find-match': {
    backgroundColor: 'rgba(255, 200, 0, 0.2)',
    borderRadius: '2px',
  },
  '.cm-find-active': {
    backgroundColor: 'rgba(255, 160, 0, 0.55)',
    borderRadius: '2px',
    outline: '1px solid rgba(255, 160, 0, 0.8)',
  },
});

// ── Helpers ─────────────────────────────────────────────────────────────────

function findAll(text: string, query: string): { from: number; to: number }[] {
  if (!query) return [];
  const results: { from: number; to: number }[] = [];
  const lq = query.toLowerCase();
  const lt = text.toLowerCase();
  let i = 0;
  while (i < lt.length) {
    const idx = lt.indexOf(lq, i);
    if (idx === -1) break;
    results.push({ from: idx, to: idx + query.length });
    i = idx + 1;
  }
  return results;
}

function wordCount(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

// ── Theme ────────────────────────────────────────────────────────────────────

const darkTheme = EditorView.theme({
  '&': { backgroundColor: '#0c0c0c', height: '100%', color: '#e5e5e5' },
  '.cm-content': { fontFamily: 'ui-monospace, Consolas, monospace', caretColor: '#ffffff', color: '#e5e5e5', whiteSpace: 'pre-wrap', wordWrap: 'break-word' },
  '.cm-line': { whiteSpace: 'pre-wrap' },
  '.cm-cursor': { borderLeftColor: '#ffffff' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.03)' },
  '.cm-gutters': { backgroundColor: '#0c0c0c', borderRight: '1px solid #262626', color: '#525252' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px', color: '#525252' },
  '.cm-scroller': { fontFamily: 'ui-monospace, Consolas, monospace', overflow: 'auto' },
}, { dark: true });

const markdownHighlight = EditorView.theme({
  '.cm-header': { color: '#fafafa', fontWeight: '600' },
  '.cm-header-1': { fontSize: '1.5em' },
  '.cm-header-2': { fontSize: '1.25em' },
  '.cm-header-3': { fontSize: '1.1em' },
  '.cm-strong': { fontWeight: '600', color: '#fafafa' },
  '.cm-emphasis': { fontStyle: 'italic', color: '#d4d4d4' },
  '.cm-link': { color: '#e5e5e5', textDecoration: 'underline' },
  '.cm-url': { color: '#737373' },
  '.cm-quote': { color: '#a3a3a3', fontStyle: 'italic' },
  '.cm-list': { color: '#d4d4d4' },
  '.cm-hr': { color: '#525252' },
  '.cm-image': { color: '#d4d4d4' },
}, { dark: true });

// ── Stable module-level constants (never recreated on render) ────────────────

const EXTENSIONS = [
  markdown({ base: markdownLanguage }),
  closeBrackets(),
  EditorView.lineWrapping,
  highlightField,
];

const THEME = [darkTheme, markdownHighlight, findTheme];

const BASIC_SETUP = {
  lineNumbers: true,
  highlightActiveLineGutter: true,
  highlightActiveLine: true,
  foldGutter: true,
  dropCursor: true,
  allowMultipleSelections: true,
  indentOnInput: true,
  bracketMatching: true,
  autocompletion: true,
  rectangularSelection: true,
  crosshairCursor: false,
  highlightSelectionMatches: true,
} as const;

// ── Public API ───────────────────────────────────────────────────────────────

export interface MarkdownEditorHandle {
  openFind: () => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
  function MarkdownEditor({ value, onChange, isLoading }, ref) {
    const editorViewRef = useRef<EditorView | null>(null);
    const findInputRef = useRef<HTMLInputElement>(null);
    const [findOpen, setFindOpen] = useState(false);
    const [findQuery, setFindQuery] = useState('');
    const [matches, setMatches] = useState<{ from: number; to: number }[]>([]);
    const [matchIdx, setMatchIdx] = useState(0);

    useImperativeHandle(ref, () => ({
      openFind: () => {
        setFindOpen(true);
        setTimeout(() => findInputRef.current?.focus(), 50);
      },
    }));

    // Clear highlights when find closes
    useEffect(() => {
      if (!findOpen) {
        editorViewRef.current?.dispatch({ effects: setHighlights.of([]) });
        setMatches([]);
        setMatchIdx(0);
      }
    }, [findOpen]);

    // Re-run search when query or content changes (only while find is open)
    useEffect(() => {
      if (!findOpen || !findQuery) return;
      const view = editorViewRef.current;
      if (!view) return;

      const found = findAll(view.state.doc.toString(), findQuery);
      setMatches(found);
      setMatchIdx(0);
      view.dispatch({ effects: setHighlights.of(found.map((m, i) => ({ ...m, active: i === 0 }))) });

      if (found.length > 0) {
        view.dispatch({
          selection: EditorSelection.range(found[0].from, found[0].to),
          effects: EditorView.scrollIntoView(found[0].from, { y: 'center' }),
        });
      }
    }, [value, findQuery, findOpen]);

    const navigate = useCallback((dir: 1 | -1) => {
      const view = editorViewRef.current;
      if (!view || matches.length === 0) return;
      const next = (matchIdx + dir + matches.length) % matches.length;
      setMatchIdx(next);
      view.dispatch({
        effects: setHighlights.of(matches.map((m, i) => ({ ...m, active: i === next }))),
      });
      view.dispatch({
        selection: EditorSelection.range(matches[next].from, matches[next].to),
        effects: EditorView.scrollIntoView(matches[next].from, { y: 'center' }),
      });
    }, [matches, matchIdx]);

    const closeFind = useCallback(() => {
      setFindOpen(false);
      setFindQuery('');
      setMatches([]);
      editorViewRef.current?.dispatch({ effects: setHighlights.of([]) });
    }, []);

    const openFind = useCallback(() => {
      setFindOpen(true);
      setTimeout(() => findInputRef.current?.focus(), 50);
    }, []);

    const words = wordCount(value);
    const chars = value.length;
    const lines = value.split('\n').length;

    return (
      <div className="relative h-full flex flex-col bg-[#0c0c0c]">
        {isLoading && (
          <div className="absolute inset-0 bg-[#0c0c0c]/80 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Processing...</span>
            </div>
          </div>
        )}

        {/* Find bar */}
        {findOpen ? (
          <div className="absolute top-2 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#333] shadow-xl">
            <Search className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <input
              ref={findInputRef}
              value={findQuery}
              onChange={e => setFindQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') navigate(e.shiftKey ? -1 : 1);
                if (e.key === 'Escape') closeFind();
              }}
              placeholder="Find in file..."
              className="w-40 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
            />
            {findQuery && (
              <span className="text-[11px] text-gray-500 whitespace-nowrap min-w-[40px] text-right">
                {matches.length > 0 ? `${matchIdx + 1}/${matches.length}` : 'No results'}
              </span>
            )}
            <div className="flex items-center gap-0.5 border-l border-[#333] pl-1.5 ml-0.5">
              <button
                onClick={() => navigate(-1)}
                disabled={matches.length === 0}
                className="p-0.5 rounded hover:bg-[#262626] text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                title="Previous (Shift+Enter)"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigate(1)}
                disabled={matches.length === 0}
                className="p-0.5 rounded hover:bg-[#262626] text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                title="Next (Enter)"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={closeFind}
                className="p-0.5 rounded hover:bg-[#262626] text-gray-400 hover:text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={openFind}
            className="absolute top-2 right-3 z-10 p-1.5 rounded-lg bg-[#1a1a1a]/60 border border-[#262626]/60 text-gray-600 hover:text-white hover:bg-[#262626] hover:border-[#333] transition-all duration-150 opacity-40 hover:opacity-100"
            title="Find in file (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <CodeMirror
            value={value}
            height="100%"
            theme={THEME}
            extensions={EXTENSIONS}
            onChange={onChange}
            onCreateEditor={(view) => { editorViewRef.current = view; }}
            className="h-full text-sm"
            basicSetup={BASIC_SETUP}
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center gap-4 px-3 border-t border-[#262626] bg-[#0a0a0a] h-6 text-[11px] text-gray-600 select-none flex-shrink-0">
          <span>{words} words</span>
          <span>{chars} chars</span>
          <span>Ln {lines}</span>
        </div>
      </div>
    );
  }
);
