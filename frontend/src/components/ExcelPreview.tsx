// CocoFile - Excel Preview Component
// Displays Excel files by showing extracted text content in a structured format

import React, { useMemo } from "react";
import { FileSpreadsheet, AlertCircle } from "lucide-react";

interface ExcelPreviewProps {
  extractedText: string;
  fileName?: string;
}

export const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  extractedText,
  fileName,
}) => {
  // Parse extracted text into structured data
  const parsedData = useMemo(() => {
    if (!extractedText) return null;

    // Split by lines
    const lines = extractedText.split("\n").filter((line) => line.trim());

    if (lines.length === 0) return null;

    // Try to detect if it's tab-separated or comma-separated
    const firstLine = lines[0];
    const separator = firstLine.includes("\t") ? "\t" : ",";

    // Parse into rows
    const rows = lines.map((line) =>
      line.split(separator).map((cell) => cell.trim()),
    );

    // Find max columns
    const maxCols = Math.max(...rows.map((row) => row.length));

    return {
      rows,
      maxCols,
      separator,
    };
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

  if (!parsedData || parsedData.rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-500">
        <FileSpreadsheet className="h-12 w-12 mb-4 text-gray-400" />
        <p className="font-medium">内容が空です</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-white border-b">
        <FileSpreadsheet className="h-5 w-5 text-green-600" />
        <span className="text-sm font-medium text-gray-700">
          {fileName || "Excel Preview"}
        </span>
        <span className="text-xs text-gray-500 ml-auto">
          {parsedData.rows.length} 行 × {parsedData.maxCols} 列
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {parsedData.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex === 0 ? "bg-gray-50 font-medium" : ""}
                >
                  {/* Row number */}
                  <td className="border border-gray-200 bg-gray-100 text-center text-xs text-gray-500 px-2 py-1 w-10">
                    {rowIndex + 1}
                  </td>
                  {/* Cells */}
                  {Array.from({ length: parsedData.maxCols }).map(
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
