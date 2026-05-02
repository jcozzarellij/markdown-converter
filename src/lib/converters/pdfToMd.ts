import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export async function pdfToMd(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  
  let markdown = '';
  const totalPages = pdf.numPages;
  
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const text = textContent.items
      .map((item: unknown) => (item as { str?: string }).str)
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (text.length > 0) {
      markdown += `## Page ${i}\n\n${text}\n\n`;
    }
  }
  
  return markdown.trim();
}