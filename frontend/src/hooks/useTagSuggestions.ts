// CocoFile - Tag Suggestions Hook
// Provides automatic tag suggestions based on file metadata

import { useMemo } from "react";
import { useTagManagementStore } from "@/store/tagManagementStore";
import type { FileMetadata } from "@/types";

export interface TagSuggestion {
  tag: string;
  reason: string;
  confidence: number; // 0-1
}

export const useTagSuggestions = (fileMetadata?: FileMetadata | null) => {
  const { tags } = useTagManagementStore();

  const suggestions = useMemo(() => {
    if (!fileMetadata) return [];

    const results: TagSuggestion[] = [];
    const fileName = fileMetadata.fileName.toLowerCase();
    const fileType = fileMetadata.fileType.toLowerCase();
    const existingTags = fileMetadata.tags.map((t) => t.toLowerCase());

    // 1. File type based suggestions
    const fileTypeSuggestions: Record<string, string[]> = {
      pdf: ["ドキュメント", "PDF", "資料"],
      excel: ["スプレッドシート", "Excel", "データ", "集計"],
      word: ["ドキュメント", "Word", "文書"],
      powerpoint: ["プレゼン", "PowerPoint", "スライド"],
    };

    const typeTags = fileTypeSuggestions[fileType] || [];
    typeTags.forEach((tag) => {
      if (!existingTags.includes(tag.toLowerCase())) {
        results.push({
          tag,
          reason: "ファイル形式に基づく提案",
          confidence: 0.8,
        });
      }
    });

    // 2. File name keyword based suggestions
    const keywordSuggestions: Record<string, string[]> = {
      見積: ["見積書", "営業", "契約"],
      請求: ["請求書", "経理", "支払い"],
      契約: ["契約書", "法務", "重要"],
      報告: ["報告書", "レポート"],
      議事録: ["会議", "ミーティング"],
      提案: ["提案書", "企画"],
      売上: ["売上", "営業", "業績"],
      予算: ["予算", "経理", "財務"],
      marketing: ["マーケティング", "広告"],
      sales: ["営業", "販売"],
      invoice: ["請求書", "経理"],
      report: ["レポート", "報告書"],
      meeting: ["会議", "ミーティング"],
    };

    Object.entries(keywordSuggestions).forEach(([keyword, suggestedTags]) => {
      if (fileName.includes(keyword.toLowerCase())) {
        suggestedTags.forEach((tag) => {
          if (
            !existingTags.includes(tag.toLowerCase()) &&
            !results.find((r) => r.tag === tag)
          ) {
            results.push({
              tag,
              reason: `ファイル名に「${keyword}」を含む`,
              confidence: 0.9,
            });
          }
        });
      }
    });

    // 3. Year/Month based suggestions
    const yearMatch = fileName.match(/20\d{2}/);
    if (yearMatch) {
      const year = yearMatch[0];
      if (!existingTags.includes(year)) {
        results.push({
          tag: year,
          reason: "ファイル名から年を検出",
          confidence: 0.7,
        });
      }
    }

    const monthMatch = fileName.match(/(\d{1,2})月/);
    if (monthMatch) {
      const month = `${monthMatch[1]}月`;
      if (!existingTags.includes(month.toLowerCase())) {
        results.push({
          tag: month,
          reason: "ファイル名から月を検出",
          confidence: 0.7,
        });
      }
    }

    // 4. Frequently used tags (top 5)
    const frequentTags = [...tags]
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 5)
      .map((t) => t.name);

    frequentTags.forEach((tag) => {
      if (
        !existingTags.includes(tag.toLowerCase()) &&
        !results.find((r) => r.tag === tag)
      ) {
        results.push({
          tag,
          reason: "よく使われるタグ",
          confidence: 0.5,
        });
      }
    });

    // Sort by confidence descending
    return results.sort((a, b) => b.confidence - a.confidence).slice(0, 10);
  }, [fileMetadata, tags]);

  return {
    suggestions,
  };
};

export default useTagSuggestions;
