// CocoFile - Image Preview Component
// Displays image files with zoom and pan functionality

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Loader2 } from "lucide-react";
import { convertFileSrc } from "@tauri-apps/api/core";

interface ImagePreviewProps {
  filePath: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ filePath }) => {
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Convert file path to proper URL format for Tauri
  const imageUrl = convertFileSrc(filePath);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError("画像の読み込みに失敗しました");
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 5.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.25));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetView = () => {
    setScale(1.0);
    setRotation(0);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <div className="text-center">
          <p className="font-medium">{error}</p>
          <p className="text-sm text-gray-500 mt-2">{filePath}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        {/* Info */}
        <div className="text-sm text-gray-700">
          {isLoading ? "読込中..." : `${Math.round(scale * 100)}%`}
        </div>

        {/* Zoom and rotate controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.25 || isLoading}
            title="縮小"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 5.0 || isLoading}
            title="拡大"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={rotate}
            disabled={isLoading}
            title="回転"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
            disabled={isLoading}
            title="リセット"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Image viewer */}
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
        {isLoading && (
          <div className="absolute flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">画像を読み込んでいます...</p>
          </div>
        )}
        <img
          src={imageUrl}
          alt={filePath}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: "transform 0.2s ease-in-out",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
          className={isLoading ? "opacity-0" : "opacity-100"}
        />
      </div>
    </div>
  );
};

export default ImagePreview;
