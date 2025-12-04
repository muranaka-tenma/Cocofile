// CocoFile - PDF Preview Component
// Displays PDF files using react-pdf library

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFPreviewProps {
  filePath: string;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ filePath }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [scale, setScale] = useState<number>(1.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError("PDFファイルの読み込みに失敗しました");
    setIsLoading(false);
  };

  // Sync page input with page number
  useEffect(() => {
    setPageInput(pageNumber.toString());
  }, [pageNumber]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Arrow keys for navigation
      if (e.key === "ArrowLeft" && pageNumber > 1) {
        goToPrevPage();
      } else if (e.key === "ArrowRight" && pageNumber < numPages) {
        goToNextPage();
      }
      // +/- for zoom
      else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        zoomOut();
      }
      // Home/End for first/last page
      else if (e.key === "Home") {
        goToFirstPage();
      } else if (e.key === "End") {
        goToLastPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, numPages, scale]);

  const goToFirstPage = () => {
    setPageNumber(1);
  };

  const goToLastPage = () => {
    setPageNumber(numPages);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= numPages) {
      setPageNumber(page);
    } else {
      setPageInput(pageNumber.toString());
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
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
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToFirstPage}
            disabled={pageNumber <= 1 || isLoading}
            title="最初のページ (Home)"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1 || isLoading}
            title="前のページ (←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Page input */}
          <div className="flex items-center gap-1">
            <form
              onSubmit={handlePageInputSubmit}
              className="flex items-center"
            >
              <Input
                type="text"
                value={pageInput}
                onChange={handlePageInputChange}
                disabled={isLoading}
                className="w-12 h-8 text-center text-sm"
              />
            </form>
            <span className="text-sm text-gray-700">/ {numPages || "-"}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages || isLoading}
            title="次のページ (→)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToLastPage}
            disabled={pageNumber >= numPages || isLoading}
            title="最後のページ (End)"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5 || isLoading}
            title="縮小 (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            onClick={resetZoom}
            className="text-sm text-gray-700 min-w-[60px] text-center hover:text-blue-600 cursor-pointer"
            disabled={isLoading}
            title="リセット"
          >
            {Math.round(scale * 100)}%
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3.0 || isLoading}
            title="拡大 (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4">
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">PDFを読み込んでいます...</p>
          </div>
        )}
        <Document
          file={`file://${filePath}`}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFPreview;
