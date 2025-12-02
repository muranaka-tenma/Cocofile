// CocoFile - PowerPoint Preview Component
// Displays PowerPoint presentations by showing extracted text content organized by slides

import React, { useMemo } from "react";
import { Presentation, AlertCircle, ChevronRight } from "lucide-react";

interface PowerPointPreviewProps {
  extractedText: string;
  fileName?: string;
}

interface Slide {
  number: number;
  content: string[];
}

export const PowerPointPreview: React.FC<PowerPointPreviewProps> = ({
  extractedText,
  fileName,
}) => {
  // Parse extracted text into slides
  const slides = useMemo(() => {
    if (!extractedText) return [];

    // Split by common slide markers or double line breaks
    const lines = extractedText.split("\n");
    const parsedSlides: Slide[] = [];
    let currentSlide: string[] = [];
    let slideNumber = 1;

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Detect slide markers (could be "Slide X:", "---", etc.)
      if (
        trimmed.match(/^(Slide|スライド)\s*\d+/i) ||
        trimmed === "---" ||
        trimmed === "==="
      ) {
        // Save previous slide if it has content
        if (currentSlide.length > 0) {
          parsedSlides.push({
            number: slideNumber++,
            content: currentSlide,
          });
          currentSlide = [];
        }
      } else if (trimmed) {
        currentSlide.push(trimmed);
      }
    });

    // Add last slide
    if (currentSlide.length > 0) {
      parsedSlides.push({
        number: slideNumber,
        content: currentSlide,
      });
    }

    // If no slides were detected, treat entire text as one slide
    if (parsedSlides.length === 0 && extractedText.trim()) {
      parsedSlides.push({
        number: 1,
        content: extractedText.split("\n").filter((l) => l.trim()),
      });
    }

    return parsedSlides;
  }, [extractedText]);

  if (!extractedText) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
        <p className="font-medium">テキストが抽出されていません</p>
        <p className="text-sm mt-2">
          このPowerPointファイルからテキストを抽出できませんでした
        </p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <Presentation className="h-12 w-12 mb-4 text-gray-400" />
        <p className="font-medium">内容が空です</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-white border-b">
        <Presentation className="h-5 w-5 text-orange-600" />
        <span className="text-sm font-medium text-gray-700">
          {fileName || "PowerPoint Preview"}
        </span>
        <span className="text-xs text-gray-500 ml-auto">
          {slides.length} スライド
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {slides.map((slide) => (
            <div
              key={slide.number}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Slide Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-white border-b border-gray-200">
                <ChevronRight className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Slide {slide.number}
                </span>
              </div>

              {/* Slide Content */}
              <div className="p-6">
                {slide.content.map((line, lineIdx) => (
                  <p
                    key={lineIdx}
                    className="mb-3 text-gray-800 leading-relaxed text-sm"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="max-w-5xl mx-auto mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <p className="font-medium">ℹ️ プレビュー情報</p>
          <p className="mt-1">
            このプレビューは抽出されたテキストデータから生成されています。
          </p>
          <p className="mt-1">
            元のPowerPointファイルのスライドデザイン、画像、グラフ、アニメーションは表示されません。
          </p>
        </div>
      </div>
    </div>
  );
};

export default PowerPointPreview;
