import mammoth from 'mammoth';
import { htmlToMarkdown } from '../htmlToMarkdown';

export async function docxToMd(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return htmlToMarkdown(result.value);
}
