import { useState, useCallback } from 'react';
import { getCurrentContent, setCurrentContent } from '../lib/storage';

const DEFAULT_CONTENT = `# Welcome to MDConvert

Upload a file to get started.
`;

export function useEditorState() {
  const [content, setContentState] = useState<string>(() => {
    const saved = getCurrentContent();
    return saved || DEFAULT_CONTENT;
  });
  const [isLoading, setIsLoading] = useState(false);

  const setContent = useCallback((newContent: string) => {
    setContentState(newContent);
    setCurrentContent(newContent);
  }, []);

  const clear = useCallback(() => {
    setContentState(DEFAULT_CONTENT);
    setCurrentContent('');
  }, []);

  return { content, setContent, clear, isLoading, setIsLoading };
}