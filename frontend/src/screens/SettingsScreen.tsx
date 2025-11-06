// CocoFile - Settings Screen (S-002)
// Based on mockups/SettingsScreen.html

import React, { useEffect, useState } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { useSettingsStore } from '@/store/settingsStore';
import { SCAN_TIMING_TYPES } from '@/types';
import type { ScanTimingType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    loading,
    error,
    loadSettings,
    updateScanTiming,
    updateAutoHide,
    addWatchedFolder,
    removeWatchedFolder,
    addExcludedFolder,
    removeExcludedFolder,
    addExcludedExtension,
    removeExcludedExtension,
    addDefaultTag,
    removeDefaultTag,
  } = useSettingsStore();

  const [newExtensionInput, setNewExtensionInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSelectFolder = async () => {
    // @MOCK_TO_API: This will use Tauri's dialog API in production
    // For now, using a simple prompt for demonstration
    const folderPath = prompt('フォルダパスを入力してください:');
    if (folderPath) {
      await addWatchedFolder(folderPath);
    }
  };

  const handleSelectExcludedFolder = async () => {
    // @MOCK_TO_API: This will use Tauri's dialog API in production
    const folderPath = prompt('除外フォルダパスを入力してください:');
    if (folderPath) {
      await addExcludedFolder(folderPath);
    }
  };

  const handleAddExtension = async () => {
    if (newExtensionInput.trim()) {
      let extension = newExtensionInput.trim();
      if (!extension.startsWith('.')) {
        extension = '.' + extension;
      }
      await addExcludedExtension(extension);
      setNewExtensionInput('');
    }
  };

  const handleAddTag = async () => {
    if (newTagInput.trim()) {
      await addDefaultTag(newTagInput.trim());
      setNewTagInput('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">読み込み中...</p>
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
              <RadioGroupItem value={SCAN_TIMING_TYPES.REALTIME} id="realtime" />
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

      {/* UI設定 */}
      <Card>
        <CardHeader>
          <CardTitle>UI設定</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hotkey">ホットキー (ウィンドウを呼び出すショートカット)</Label>
            <Input id="hotkey" value={settings.hotkey} readOnly className="bg-muted" />
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
              <p className="text-sm text-muted-foreground">デフォルトタグが設定されていません</p>
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
                if (e.key === 'Enter') {
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
                  <p className="text-sm text-muted-foreground">除外フォルダが設定されていません</p>
                ) : (
                  settings.excludedFolders.map((folder, index) => (
                    <Badge key={index} variant="destructive" className="px-3 py-1">
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
                  <p className="text-sm text-muted-foreground">除外拡張子が設定されていません</p>
                ) : (
                  settings.excludedExtensions.map((ext, index) => (
                    <Badge key={index} variant="destructive" className="px-3 py-1">
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
                  if (e.key === 'Enter') {
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
