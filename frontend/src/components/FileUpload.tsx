import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Code, FileArchive } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  uploadProgress?: number;
  isUploading?: boolean;
}

const ALLOWED_EXTENSIONS = [
  'pdf', 'docx', 'doc', 'zip', 'txt',
  'py', 'java', 'js', 'ts', 'jsx', 'tsx', 'cpp', 'c', 'cs', 'go', 'rs', 'html', 'css'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  uploadProgress,
  isUploading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['py', 'java', 'js', 'ts', 'cpp', 'c', 'cs'].includes(ext || '')) {
      return <Code className="w-8 h-8 text-red-600" />;
    }
    if (ext === 'zip') {
      return <FileArchive className="w-8 h-8 text-amber-600" />;
    }
    return <FileText className="w-8 h-8 text-red-700" />;
  };

  const validateAndSelect = (file: File) => {
    setValidationError(null);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      setValidationError(`Unsupported file extension: .${extension}. Allowed: PDF, DOCX, ZIP, and code files (.py, .java, .js, .cpp, etc.)`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setValidationError(`File is too large (${formatFileSize(file.size)}). Maximum allowed size is 50 MB.`);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelect(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUploading) return;
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileInputChange}
        className="hidden"
        accept=".pdf,.docx,.doc,.zip,.txt,.py,.java,.js,.ts,.cpp,.c,.cs"
        disabled={isUploading}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
            isDragOver
              ? 'border-red-600 bg-red-50/50 scale-[1.01]'
              : 'border-zinc-300 bg-white hover:border-red-500 hover:bg-red-50/20 shadow-xs'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shadow-2xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-900">
              Drag & drop your submission here, or{' '}
              <span className="text-red-600 font-bold hover:underline">browse files</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Supports PDF, DOCX, ZIP, Python, Java, JS, C++, and plain text (up to 50MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 shrink-0">
              {getFileIcon(selectedFile.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {formatFileSize(selectedFile.size)} • Ready to upload
              </p>
            </div>
          </div>

          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-zinc-100 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Upload Progress Bar */}
      {isUploading && uploadProgress !== undefined && (
        <div className="p-4 rounded-xl bg-white border border-red-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-zinc-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              Uploading submission...
            </span>
            <span className="font-mono text-red-600 font-bold">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-800 transition-all duration-300 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {validationError && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
