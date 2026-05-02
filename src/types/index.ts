export type FileType = 'pdf' | 'docx' | 'excel';

export interface HistoryItem {
  id: string;
  fileName: string;
  fileType: FileType;
  content: string;
  createdAt: string;
}

export type Category = 'pdf' | 'word' | 'excel';

export const FILE_TYPE_MAP: Record<Category, string[]> = {
  pdf: ['application/pdf'],
  word: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'],
  excel: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'],
};

export const FILE_EXTENSIONS: Record<Category, string[]> = {
  pdf: ['.pdf'],
  word: ['.docx', '.doc'],
  excel: ['.xlsx', '.xls'],
};