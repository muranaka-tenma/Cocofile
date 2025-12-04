// CocoFile - Excel Preview Component
// Displays Excel files by showing extracted text content in a structured format

import React, { useMemo, useState } from "react";
import { FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExcelPreviewProps {
  extractedText: string;
  fileName?: string;
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  extractedText,
  fileName,
}) => {
  const [currentSheet, setCurrentSheet] = useState<number>(0);

  // Parse extracted text into sheets and structured data
  const parsedData = useMemo(() => {
    if (!extractedText) return null;

    // Try to detect sheet boundaries (look for patterns like "Sheet1:", "Sheet 1:", etc.)
    const sheetMarkerRegex = /^(Sheet|シート)\s*\d+/i;
    const lines = extractedText.split("\n");

    // Group lines into sheets
    const sheets: Array<{
      name: string;
      lines: string[];
    }> = [];

    let currentSheetName = "Sheet 1";
    let currentSheetLines: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Check if this line is a sheet marker
      if (sheetMarkerRegex.test(trimmed)) {
        // Save previous sheet if it has content
        if (currentSheetLines.length > 0) {
          sheets.push({
            name: currentSheetName,
            lines: currentSheetLines,
          });
          currentSheetLines = [];
        }
        currentSheetName = trimmed;
      } else if (trimmed) {
        currentSheetLines.push(trimmed);
      }
    });

    // Add last sheet
    if (currentSheetLines.length > 0) {
      sheets.push({
        name: currentSheetName,
        lines: currentSheetLines,
      });
    }

    // If no sheets were detected, treat entire content as one sheet
    if (sheets.length === 0) {
      const allLines = lines.filter((line) => line.trim());
      if (allLines.length > 0) {
        sheets.push({
          name: "Sheet 1",
          lines: allLines,
        });
      }
    }

    // Parse each sheet's lines into rows
    const parsedSheets = sheets.map((sheet) => {
      // Try to detect if it's tab-separated or comma-separated
      const firstLine = sheet.lines[0] || "";
      const separator = firstLine.includes("\t") ? "\t" : ",";

      // Parse into rows
      const rows = sheet.lines.map((line) =>
        line.split(separator).map((cell) => cell.trim()),
      );

      // Find max columns
      const maxCols = Math.max(...rows.map((row) => row.length));

      return {
        name: sheet.name,
        rows,
        maxCols,
        separator,
      };
    });

    return parsedSheets;
  }, [extractedText]);

  if (!extractedText) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
        <p className="font-medium">テキストが抽出されていません</p>
        <p className="text-sm mt-2">
          このExcelファイルからテキストを抽出できませんでした
        </p>
      </div>
    );
  }

  if (!parsedData || parsedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <FileSpreadsheet className="h-12 w-12 mb-4 text-gray-400" />
        <p className="font-medium">内容が空です</p>
      </div>
    );
  }

  // Get current sheet data
  const currentSheetData = parsedData[currentSheet];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with sheet tabs */}
      <div className="flex items-center justify-between p-2 bg-white border-b">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-gray-700">
            {fileName || "Excel Preview"}
          </span>
        </div>

        {/* Sheet info */}
        <span className="text-xs text-gray-500">
          {currentSheetData.rows.length} 行 × {currentSheetData.maxCols} 列
        </span>
      </div>

      {/* Sheet tabs */}
      {parsedData.length > 1 && (
        <div className="flex items-center gap-1 p-2 bg-gray-100 border-b overflow-x-auto">
          {parsedData.map((sheet, index) => (
            <Button
              key={index}
              variant={currentSheet === index ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentSheet(index)}
              className={
                currentSheet === index
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }
            >
              {sheet.name}
            </Button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {currentSheetData.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex === 0 ? "bg-gray-50 font-medium" : ""}
                >
                  {/* Row number */}
                  <td className="border border-gray-200 bg-gray-100 text-center text-xs text-gray-500 px-2 py-1 w-10">
                    {rowIndex + 1}
                  </td>
                  {/* Cells */}
                  {Array.from({ length: currentSheetData.maxCols }).map(
                    (_, colIndex) => (
                      <td
                        key={colIndex}
                        className="border border-gray-200 px-3 py-2 text-sm"
                      >
                        {row[colIndex] || ""}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <p className="font-medium">ℹ️ プレビュー情報</p>
          <p className="mt-1">
            このプレビューは抽出されたテキストデータから生成されています。
          </p>
          <p className="mt-1">
            元のExcelファイルの書式やグラフは表示されません。
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExcelPreview;
