// CocoFile - Text Preview Component
// Displays text files with syntax highlighting and line numbers

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Copy, Check } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";

// Import language support
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";
import "prismjs/components/prism-scss";

interface TextPreviewProps {
  filePath: string;
  fileName?: string;
}

// Detect language from file extension
const detectLanguage = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cc: "cpp",
    cxx: "cpp",
    cs: "csharp",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    css: "css",
    scss: "scss",
    html: "markup",
    xml: "markup",
    txt: "plain",
  };

  return languageMap[ext] || "plain";
};

export const TextPreview: React.FC<TextPreviewProps> = ({
  filePath,
  fileName,
}) => {
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const language = useMemo(
    () => (fileName ? detectLanguage(fileName) : "plain"),
    [fileName],
  );

  // Load file content
  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use Tauri's convertFileSrc to convert file path to URL
        const { convertFileSrc } = await import("@tauri-apps/api/core");
        const fileUrl = convertFileSrc(filePath);

        // Fetch the file content
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error("Failed to load text file:", err);
        setError("テキストファイルの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [filePath]);

  // Highlight code
  const highlightedCode = useMemo(() => {
    if (!content) return "";

    if (language === "plain") {
      return content;
    }

    try {
      return Prism.highlight(
        content,
        Prism.languages[language] || Prism.languages.plain,
        language,
      );
    } catch (err) {
      console.error("Syntax highlighting error:", err);
      return content;
    }
  }, [content, language]);

  // Split into lines for line numbers
  const lines = useMemo(() => {
    return content.split("\n");
  }, [content]);

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">テキストを読み込んでいます...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-300">
            {fileName || "Text File"}
          </span>
          {language !== "plain" && (
            <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {lines.length} 行 · {content.length} 文字
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                コピー済み
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                コピー
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code viewer */}
      <div className="flex-1 overflow-auto">
        <div className="flex">
          {/* Line numbers */}
          <div className="bg-gray-850 px-4 py-3 text-right border-r border-gray-700 select-none">
            {lines.map((_, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-500 leading-6 font-mono"
              >
                {idx + 1}
              </div>
            ))}
          </div>

          {/* Code content */}
          <div className="flex-1 px-4 py-3 overflow-x-auto">
            {language === "plain" ? (
              <pre className="text-sm text-gray-300 font-mono leading-6 whitespace-pre">
                {content}
              </pre>
            ) : (
              <pre className="text-sm font-mono leading-6">
                <code
                  className={`language-${language}`}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextPreview;
