// CocoFile - Word Preview Component
// Displays Word documents by showing extracted text content with formatting

import React from "react";
import { FileText, AlertCircle } from "lucide-react";

interface WordPreviewProps {
  extractedText: string;
  fileName?: string;
}

export const WordPreview: React.FC<WordPreviewProps> = ({
  extractedText,
  fileName,
}) => {
  if (!extractedText) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
        <p className="font-medium">テキストが抽出されていません</p>
        <p className="text-sm mt-2">
          このWordファイルからテキストを抽出できませんでした
        </p>
      </div>
    );
  }

  // Split text into paragraphs
  const paragraphs = extractedText
    .split("\n")
    .filter((p) => p.trim())
    .map((p, i) => ({ id: i, text: p.trim() }));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-white border-b">
        <FileText className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-700">
          {fileName || "Word Preview"}
        </span>
        <span className="text-xs text-gray-500 ml-auto">
          {paragraphs.length} 段落 · {extractedText.length} 文字
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Document Paper */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose max-w-none">
            {paragraphs.map((para) => (
              <p
                key={para.id}
                className="mb-4 text-gray-800 leading-relaxed text-sm"
              >
                {para.text}
              </p>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="max-w-4xl mx-auto mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <p className="font-medium">ℹ️ プレビュー情報</p>
          <p className="mt-1">
            このプレビューは抽出されたテキストデータから生成されています。
          </p>
          <p className="mt-1">
            元のWordファイルの書式、画像、表は表示されません。
          </p>
        </div>
      </div>
    </div>
  );
};

export default WordPreview;
