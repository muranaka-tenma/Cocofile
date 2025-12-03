// CocoFile - Export Utilities
// Functions for exporting search results to CSV and JSON

import { SearchResult } from "@/types";

/**
 * Export search results to CSV format
 */
export const exportToCSV = (results: SearchResult[], filename?: string) => {
  if (results.length === 0) {
    alert("エクスポートするデータがありません");
    return;
  }

  // CSV header
  const headers = [
    "ファイル名",
    "ファイルパス",
    "ファイルタイプ",
    "ファイルサイズ",
    "作成日時",
    "更新日時",
    "最終アクセス",
    "アクセス回数",
    "お気に入り",
    "タグ",
    "メモ",
  ];

  // CSV rows
  const rows = results.map((result) => {
    const metadata = result.metadata;
    return [
      result.fileName,
      result.filePath,
      result.fileType,
      result.fileSize.toString(),
      metadata.createdAt.toISOString(),
      metadata.updatedAt.toISOString(),
      result.lastAccessedAt.toISOString(),
      result.accessCount.toString(),
      metadata.isFavorite ? "はい" : "いいえ",
      (metadata.tags || []).join("; "),
      metadata.memo || "",
    ];
  });

  // Escape CSV fields
  const escapeCSVField = (field: string): string => {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSVField).join(","),
    ...rows.map((row) => row.map(escapeCSVField).join(",")),
  ].join("\n");

  // Create and download file
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  }); // BOM for Excel compatibility
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `cocofile_export_${new Date().toISOString().slice(0, 10)}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export search results to JSON format
 */
export const exportToJSON = (results: SearchResult[], filename?: string) => {
  if (results.length === 0) {
    alert("エクスポートするデータがありません");
    return;
  }

  // Prepare data for JSON export
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalResults: results.length,
    results: results.map((result) => ({
      fileName: result.fileName,
      filePath: result.filePath,
      fileType: result.fileType,
      fileSize: result.fileSize,
      metadata: {
        createdAt: result.metadata.createdAt.toISOString(),
        updatedAt: result.metadata.updatedAt.toISOString(),
        lastAccessedAt: result.lastAccessedAt.toISOString(),
        accessCount: result.accessCount,
        isFavorite: result.metadata.isFavorite,
        tags: result.metadata.tags || [],
        memo: result.metadata.memo || "",
      },
      extractedText: result.extractedText
        ? result.extractedText.substring(0, 500)
        : "", // Truncate for file size
    })),
  };

  // Create and download file
  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `cocofile_export_${new Date().toISOString().slice(0, 10)}.json`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy search results to clipboard as TSV (Tab-Separated Values)
 * Useful for pasting into spreadsheet applications
 */
export const copyToClipboard = async (results: SearchResult[]) => {
  if (results.length === 0) {
    alert("コピーするデータがありません");
    return;
  }

  // TSV header
  const headers = [
    "ファイル名",
    "ファイルパス",
    "ファイルタイプ",
    "ファイルサイズ",
    "作成日時",
    "タグ",
  ];

  // TSV rows
  const rows = results.map((result) => [
    result.fileName,
    result.filePath,
    result.fileType,
    result.fileSize.toString(),
    result.metadata.createdAt.toISOString(),
    (result.metadata.tags || []).join(", "),
  ]);

  // Build TSV content
  const tsvContent = [
    headers.join("\t"),
    ...rows.map((row) => row.join("\t")),
  ].join("\n");

  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(tsvContent);
    alert(`${results.length}件のデータをクリップボードにコピーしました`);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    alert("クリップボードへのコピーに失敗しました");
  }
};
