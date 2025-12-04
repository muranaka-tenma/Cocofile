// CocoFile - PowerPoint Preview Component
// Displays PowerPoint presentations by showing extracted text content organized by slides

import React, { useMemo, useState, useEffect } from "react";
import {
  Presentation,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [currentSlide, setCurrentSlide] = useState<number>(1);
  const [slideInput, setSlideInput] = useState<string>("1");

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

  // Sync slide input with current slide
  useEffect(() => {
    setSlideInput(currentSlide.toString());
  }, [currentSlide]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && currentSlide > 1) {
        goToPrevSlide();
      } else if (e.key === "ArrowRight" && currentSlide < slides.length) {
        goToNextSlide();
      } else if (e.key === "Home") {
        goToFirstSlide();
      } else if (e.key === "End") {
        goToLastSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, slides.length]);

  const goToFirstSlide = () => {
    setCurrentSlide(1);
  };

  const goToLastSlide = () => {
    setCurrentSlide(slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length));
  };

  const handleSlideInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlideInput(e.target.value);
  };

  const handleSlideInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slide = parseInt(slideInput, 10);
    if (!isNaN(slide) && slide >= 1 && slide <= slides.length) {
      setCurrentSlide(slide);
    } else {
      setSlideInput(currentSlide.toString());
    }
  };

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

  // Get current slide data
  const currentSlideData = slides[currentSlide - 1];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-2 bg-white border-b">
        <div className="flex items-center gap-2">
          <Presentation className="h-5 w-5 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">
            {fileName || "PowerPoint Preview"}
          </span>
        </div>

        {/* Slide navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstSlide}
            disabled={currentSlide <= 1}
            title="最初のスライド (Home)"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevSlide}
            disabled={currentSlide <= 1}
            title="前のスライド (←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Slide input */}
          <div className="flex items-center gap-1">
            <form
              onSubmit={handleSlideInputSubmit}
              className="flex items-center"
            >
              <Input
                type="text"
                value={slideInput}
                onChange={handleSlideInputChange}
                className="w-12 h-8 text-center text-sm"
              />
            </form>
            <span className="text-sm text-gray-700">/ {slides.length}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextSlide}
            disabled={currentSlide >= slides.length}
            title="次のスライド (→)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastSlide}
            disabled={currentSlide >= slides.length}
            title="最後のスライド (End)"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content - Single slide view */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {currentSlideData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Slide Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-white border-b border-gray-200">
                <ChevronRight className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Slide {currentSlideData.number}
                </span>
              </div>

              {/* Slide Content */}
              <div className="p-8 min-h-[400px]">
                {currentSlideData.content.map((line, lineIdx) => (
                  <p
                    key={lineIdx}
                    className="mb-4 text-gray-800 leading-relaxed text-base"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}
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
