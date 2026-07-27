import { memo } from 'react';
import { FileText, FileArchive, FileImage, FileSpreadsheet, File as FileIconBase, Presentation } from 'lucide-react';

interface FileIconProps {
  fileType?: string | null;
  fileName?: string;
  className?: string | undefined;
}

function detectType(fileType?: string | null, fileName?: string): string {
  const ext = (fileType ?? fileName ?? '').toLowerCase();
  if (ext.includes('pdf')) return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].some((e) => ext.includes(e))) return 'image';
  if (['zip', 'rar', '7z', 'tar', 'gz'].some((e) => ext.includes(e))) return 'archive';
  if (['xls', 'xlsx', 'csv', 'ods'].some((e) => ext.includes(e))) return 'spreadsheet';
  if (['ppt', 'pptx', 'odp'].some((e) => ext.includes(e))) return 'presentation';
  if (['doc', 'docx', 'odt', 'txt', 'rtf'].some((e) => ext.includes(e))) return 'document';
  return 'other';
}

const icons: Record<string, typeof FileText> = {
  pdf: FileText, image: FileImage, archive: FileArchive, spreadsheet: FileSpreadsheet,
  presentation: Presentation, document: FileText, other: FileIconBase,
};

const colors: Record<string, string> = {
  pdf: 'text-error-600 bg-error-50', image: 'text-accent-600 bg-accent-50',
  archive: 'text-warning-600 bg-warning-50', spreadsheet: 'text-success-600 bg-success-50',
  presentation: 'text-primary-600 bg-primary-50', document: 'text-primary-600 bg-primary-50',
  other: 'text-neutral-500 bg-neutral-100',
};

function FileIconComponent({ fileType, fileName, className }: FileIconProps) {
  const type = detectType(fileType, fileName);
  const Icon = icons[type] ?? FileIconBase;
  return <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colors[type]} ${className ?? ''}`}><Icon className="h-4 w-4" /></div>;
}

export const FileIcon = memo(FileIconComponent);
export { detectType as detectFileType };
