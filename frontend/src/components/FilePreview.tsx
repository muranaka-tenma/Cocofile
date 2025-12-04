// CocoFile - Universal File Preview Component
// Automatically selects the appropriate preview component based on file type

import React, { useState } from "react";
import { FileText } from "lucide-react";
import { PDFPreview } from "@/components/PDFPreview";
import { ImagePreview } from "@/components/ImagePreview";
import { ExcelPreview } from "@/components/ExcelPreview";
import { WordPreview } from "@/components/WordPreview";
import { PowerPointPreview } from "@/components/PowerPointPreview";
import { TextPreview } from "@/components/TextPreview";

interface FilePreviewProps {
  filePath: string;
  fileName: string;
  fileType: string;
  extractedText?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  filePath,
  fileName,
  fileType,
  extractedText,
}) => {
  const [error, setError] = useState<string | null>(null);

  // Render appropriate preview based on file type
  const renderPreview = () => {
    try {
      switch (fileType) {
        case "pdf":
          return <PDFPreview filePath={filePath} />;

        case "image":
          return <ImagePreview filePath={filePath} />;

        case "excel":
          return (
            <ExcelPreview
              extractedText={extractedText || ""}
              fileName={fileName}
            />
          );

        case "word":
          return (
            <WordPreview
              extractedText={extractedText || ""}
              fileName={fileName}
            />
          );

        case "powerpoint":
          return (
            <PowerPointPreview
              extractedText={extractedText || ""}
              fileName={fileName}
            />
          );

        case "text":
        case "code":
          return <TextPreview filePath={filePath} fileName={fileName} />;

        default:
          return (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-3 opacity-20" />
                <p>プレビュー未対応</p>
                <p className="text-xs mt-1">
                  このファイル形式のプレビューは準備中です
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  ファイルタイプ: {fileType}
                </p>
              </div>
            </div>
          );
      }
    } catch (err) {
      console.error("Preview rendering error:", err);
      setError(
        err instanceof Error ? err.message : "プレビューの表示に失敗しました",
      );
      return null;
    }
  };

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-500">
          <FileText className="h-16 w-16 mx-auto mb-3 opacity-20" />
          <p className="font-medium">{error}</p>
          <p className="text-xs text-gray-500 mt-2">{filePath}</p>
        </div>
      </div>
    );
  }

  return <div className="h-full">{renderPreview()}</div>;
};

export default FilePreview;
