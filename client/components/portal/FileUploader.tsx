"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, ImageIcon, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectedFile {
  file: File;
  id: string;
}

interface FileUploaderProps {
  onFilesChange?: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return ImageIcon;
  if (type.includes("pdf") || type.includes("text")) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploader({
  onFilesChange,
  maxFiles = 5,
  maxSizeMB = 10,
  disabled = false,
}: FileUploaderProps) {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const maxBytes = maxSizeMB * 1024 * 1024;
      const toAdd: SelectedFile[] = [];

      Array.from(newFiles).forEach((file) => {
        if (files.length + toAdd.length >= maxFiles) return;
        if (file.size > maxBytes) return;
        toAdd.push({ file, id: `${file.name}-${Date.now()}-${Math.random()}` });
      });

      const updated = [...files, ...toAdd];
      setFiles(updated);
      onFilesChange?.(updated.map((f) => f.file));
    },
    [files, maxFiles, maxSizeMB, onFilesChange]
  );

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    onFilesChange?.(updated.map((f) => f.file));
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
          dragOver && "border-blue-400 bg-blue-50",
          !dragOver && "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          disabled && "opacity-50 pointer-events-none"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          <span className="text-blue-600 font-medium">Click to upload</span> or drag
          and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Up to {maxFiles} files, max {maxSizeMB}MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          disabled={disabled}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(({ file, id }) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={id}
                className="flex items-center gap-3 p-2.5 border rounded-lg bg-gray-50"
              >
                <Icon className="h-4 w-4 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-red-500 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(id);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
