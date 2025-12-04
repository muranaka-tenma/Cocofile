// CocoFile - Settings Screen (S-002)
// Based on mockups/SettingsScreen.html

import React, { useEffect, useState } from "react";
import { Trash2, Plus, X, Activity, Sparkles, RefreshCw } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { SCAN_TIMING_TYPES } from "@/types";
import type { ScanTimingType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { listen } from "@tauri-apps/api/event";
import { TauriService } from "@/services/TauriService";
import type { OllamaStatus } from "@/services/TauriService";
import { toast } from "@/store/toastStore";

interface FileWatcherStats {
  indexed: number;
  deleted: number;
  errors: number;
  timestamp: string;
}

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    loading,
    error,
    fileWatcherActive,
    loadSettings,
    updateScanTiming,
    updateAutoHide,
    updateOcrEnabled,
    updateAiEnabled,
    updateOllamaModel,
    addWatchedFolder,
    removeWatchedFolder,
    addExcludedFolder,
    removeExcludedFolder,
    addExcludedExtension,
    removeExcludedExtension,
    addDefaultTag,
    removeDefaultTag,
    startFileWatcher,
    stopFileWatcher,
    checkFileWatcherStatus,
  } = useSettingsStore();

  const [newExtensionInput, setNewExtensionInput] = useState("");
  const [newTagInput, setNewTagInput] = useState("");
  const [watcherStats, setWatcherStats] = useState<FileWatcherStats | null>(
    null,
  );
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [checkingOllama, setCheckingOllama] = useState(false);

  useEffect(() => {
    loadSettings();
    checkFileWatcherStatus();
    checkOllamaConnection();
  }, [loadSettings, checkFileWatcherStatus]);

  const checkOllamaConnection = async () => {
    setCheckingOllama(true);
    try {
      const status = await TauriService.checkOllamaStatus();
      setOllamaStatus(status);
    } catch (error) {
      console.error("Failed to check Ollama status:", error);
      setOllamaStatus({
        available: false,
        endpoint: "http://localhost:11434",
        error: "接続チェックに失敗しました",
      });
    } finally {
      setCheckingOllama(false);
    }
  };

  // ファイル監視統計情報をリッスン
  useEffect(() => {
    const unlisten = listen<FileWatcherStats>(
      "file-watcher-update",
      (event) => {
        setWatcherStats(event.payload);
        // 5秒後に統計を消去
        setTimeout(() => setWatcherStats(null), 5000);
      },
    );

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const handleSelectFolder = async () => {
    // @MOCK_TO_API: This will use Tauri's dialog API in production
    // For now, using a simple prompt for demonstration
    const folderPath = prompt("フォルダパスを入力してください:");
    if (folderPath) {
      await addWatchedFolder(folderPath);
      toast.success("フォルダ追加", "監視フォルダを追加しました");
    }
  };

  const handleSelectExcludedFolder = async () => {
    // @MOCK_TO_API: This will use Tauri's dialog API in production
    const folderPath = prompt("除外フォルダパスを入力してください:");
    if (folderPath) {
      await addExcludedFolder(folderPath);
      toast.success("フォルダ追加", "除外フォルダを追加しました");
    }
  };

  const handleAddExtension = async () => {
    if (newExtensionInput.trim()) {
      let extension = newExtensionInput.trim();
      if (!extension.startsWith(".")) {
        extension = "." + extension;
      }
      await addExcludedExtension(extension);
      setNewExtensionInput("");
      toast.success("拡張子追加", "除外拡張子を追加しました");
    }
  };

  const handleAddTag = async () => {
    if (newTagInput.trim()) {
      await addDefaultTag(newTagInput.trim());
      setNewTagInput("");
      toast.success("タグ追加", "デフォルトタグを追加しました");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-fade-in">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-destructive">エラー: {error}</p>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-primary mb-8">設定</h1>

      {/* 監視フォルダ設定 */}
      <Card>
        <CardHeader>
          <CardTitle>監視フォルダ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-md p-3 min-h-[100px] space-y-2">
            {settings.watchedFolders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                監視フォルダが設定されていません
              </p>
            ) : (
              settings.watchedFolders.map((folder, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-background rounded p-3"
                >
                  <span className="text-sm flex-1">{folder}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeWatchedFolder(folder)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    削除
                  </Button>
                </div>
              ))
            )}
          </div>
          <Button onClick={handleSelectFolder}>
            <Plus className="h-4 w-4 mr-2" />
            フォルダを追加
          </Button>
        </CardContent>
      </Card>

      {/* ファイル監視制御 */}
      <Card>
        <CardHeader>
          <CardTitle>ファイル監視</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">自動インデックス更新</p>
              <p className="text-sm text-muted-foreground">
                監視フォルダ内のファイル変更を検知し、自動的にインデックスを更新します
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={fileWatcherActive ? "default" : "secondary"}>
                {fileWatcherActive ? "監視中" : "停止中"}
              </Badge>
              {fileWatcherActive ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={stopFileWatcher}
                >
                  停止
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={startFileWatcher}
                  disabled={settings.watchedFolders.length === 0}
                >
                  開始
                </Button>
              )}
            </div>
          </div>
          {settings.watchedFolders.length === 0 && (
            <p className="text-sm text-muted-foreground bg-muted rounded p-3">
              ⚠️ ファイル監視を開始するには、監視フォルダを追加してください
            </p>
          )}

          {/* ファイル監視統計 */}
          {fileWatcherActive && watcherStats && (
            <div className="bg-muted rounded-md p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">最新の更新</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">インデックス化</p>
                  <p className="text-lg font-semibold text-green-600">
                    {watcherStats.indexed}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">削除</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {watcherStats.deleted}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">エラー</p>
                  <p className="text-lg font-semibold text-red-600">
                    {watcherStats.errors}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ファイル分析タイミング */}
      <Card>
        <CardHeader>
          <CardTitle>ファイル分析タイミング</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={settings.scanTiming}
            onValueChange={(value) => updateScanTiming(value as ScanTimingType)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={SCAN_TIMING_TYPES.REALTIME}
                id="realtime"
              />
              <Label htmlFor="realtime" className="cursor-pointer">
                リアルタイム (ファイル保存時に即座に分析)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={SCAN_TIMING_TYPES.IDLE} id="idle" />
              <Label htmlFor="idle" className="cursor-pointer">
                アイドル時 (PCが使用されていない時に分析)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={SCAN_TIMING_TYPES.MANUAL} id="manual" />
              <Label htmlFor="manual" className="cursor-pointer">
                手動 (手動でスキャンを実行した時のみ)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* OCR設定 */}
      <Card>
        <CardHeader>
          <CardTitle>OCR設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ocrEnabled"
              checked={settings.ocrEnabled}
              onCheckedChange={(checked) =>
                updateOcrEnabled(checked as boolean)
              }
            />
            <Label htmlFor="ocrEnabled" className="cursor-pointer">
              画像内テキスト抽出（OCR）を有効にする
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            PNG、JPG、GIF、BMP、TIFF形式の画像ファイルから自動的にテキストを抽出します。
            日本語と英語の両方に対応しています。
            {!settings.ocrEnabled && (
              <span className="block mt-2 text-orange-600">
                ⚠️ OCR無効時は画像ファイルの内容を検索できません
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      {/* AI設定 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI タグ提案設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Ollama接続状態 */}
          <div className="space-y-2">
            <Label>Ollama接続状態</Label>
            <div
              className={`rounded-md p-4 border ${
                ollamaStatus?.available
                  ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                  : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">
                    {checkingOllama
                      ? "接続確認中..."
                      : ollamaStatus?.available
                        ? "接続成功"
                        : "接続失敗"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    エンドポイント: {ollamaStatus?.endpoint || "未確認"}
                  </p>
                  {ollamaStatus?.error && (
                    <p className="text-sm text-destructive mt-1">
                      エラー: {ollamaStatus.error}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkOllamaConnection}
                  disabled={checkingOllama}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${checkingOllama ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
            {!ollamaStatus?.available && (
              <p className="text-sm text-muted-foreground bg-muted rounded p-3">
                ⚠️
                Ollamaが起動していません。AI提案を使用するには、Ollamaをインストールして起動してください。
                <br />
                インストール方法:{" "}
                <a
                  href="https://ollama.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  https://ollama.ai
                </a>
              </p>
            )}
          </div>

          {/* AI提案の有効/無効 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="aiEnabled"
                checked={settings.aiEnabled ?? true}
                onCheckedChange={(checked) =>
                  updateAiEnabled(checked as boolean)
                }
              />
              <Label htmlFor="aiEnabled" className="cursor-pointer">
                AI タグ提案を有効にする
              </Label>
            </div>
            <p className="text-sm text-muted-foreground ml-6">
              ファイル詳細画面でAIによるタグ提案を使用できます
            </p>
          </div>

          {/* 使用するモデル */}
          <div className="space-y-2">
            <Label htmlFor="ollamaModel">使用するモデル</Label>
            <Input
              id="ollamaModel"
              value={settings.ollamaModel || "llama3.2"}
              onChange={(e) => updateOllamaModel(e.target.value)}
              placeholder="llama3.2"
            />
            <p className="text-sm text-muted-foreground">
              推奨: llama3.2, llama2, mistral など
            </p>
          </div>
        </CardContent>
      </Card>

      {/* UI設定 */}
      <Card>
        <CardHeader>
          <CardTitle>UI設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>テーマ</Label>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                アプリケーションのカラーテーマを選択
              </p>
              <ThemeToggle variant="select" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotkey">
              ホットキー (ウィンドウを呼び出すショートカット)
            </Label>
            <Input
              id="hotkey"
              value={settings.hotkey}
              readOnly
              className="bg-muted"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoHide"
              checked={settings.autoHide}
              onCheckedChange={(checked) => updateAutoHide(checked as boolean)}
            />
            <Label htmlFor="autoHide" className="cursor-pointer">
              ウィンドウの自動収納を有効にする
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* デフォルトタグ */}
      <Card>
        <CardHeader>
          <CardTitle>デフォルトタグ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 min-h-[60px]">
            {settings.defaultTags.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                デフォルトタグが設定されていません
              </p>
            ) : (
              settings.defaultTags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tag}
                  <button
                    onClick={() => removeDefaultTag(tag)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="新しいタグ名を入力"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddTag();
                }
              }}
            />
            <Button onClick={handleAddTag}>
              <Plus className="h-4 w-4 mr-2" />
              タグを追加
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 除外設定 */}
      <Card>
        <CardHeader>
          <CardTitle>除外設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 除外フォルダ */}
          <div className="space-y-2">
            <Label>除外フォルダ</Label>
            <div className="bg-muted rounded-md p-3 min-h-[80px]">
              <div className="flex flex-wrap gap-2">
                {settings.excludedFolders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    除外フォルダが設定されていません
                  </p>
                ) : (
                  settings.excludedFolders.map((folder, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="px-3 py-1"
                    >
                      {folder}
                      <button
                        onClick={() => removeExcludedFolder(folder)}
                        className="ml-2 hover:opacity-80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <Button onClick={handleSelectExcludedFolder}>
              <Plus className="h-4 w-4 mr-2" />
              除外フォルダを追加
            </Button>
          </div>

          {/* 除外ファイル拡張子 */}
          <div className="space-y-2">
            <Label>除外ファイル拡張子</Label>
            <div className="bg-muted rounded-md p-3 min-h-[80px]">
              <div className="flex flex-wrap gap-2">
                {settings.excludedExtensions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    除外拡張子が設定されていません
                  </p>
                ) : (
                  settings.excludedExtensions.map((ext, index) => (
                    <Badge
                      key={index}
                      variant="destructive"
                      className="px-3 py-1"
                    >
                      {ext}
                      <button
                        onClick={() => removeExcludedExtension(ext)}
                        className="ml-2 hover:opacity-80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder=".tmp, .log など"
                value={newExtensionInput}
                onChange={(e) => setNewExtensionInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddExtension();
                  }
                }}
              />
              <Button onClick={handleAddExtension}>
                <Plus className="h-4 w-4 mr-2" />
                除外拡張子を追加
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsScreen;
