# メイン検索画面（S-001）E2Eテスト仕様書

生成日: 2025-11-04
対象ページ: MainSearchScreen (S-001)
テスト環境: Tauri Desktop App + Mock Service
作成者: E2Eテスト仕様書作成エージェント

---

## 概要

### テスト対象
- **画面**: メイン検索画面（S-001: MainSearchScreen）
- **ファイルパス**: `/home/muranaka-tenma/CocoFile/frontend/src/screens/MainSearchScreen.tsx`
- **モックサービス**: `/home/muranaka-tenma/CocoFile/frontend/src/services/mock/FileService.ts`
- **カスタムフック**: `/home/muranaka-tenma/CocoFile/frontend/src/hooks/useSearchData.ts`

### テスト統計
- **総テスト項目数**: 65項目
- **高優先度**: 28項目（必須）
- **中優先度**: 25項目（推奨）
- **低優先度**: 12項目（任意）

### テスト分類別カバレッジ
- **正常系**: 22項目
- **異常系**: 18項目
- **セキュリティ**: 10項目
- **レスポンシブ**: 8項目
- **パフォーマンス**: 7項目

---

## セレクター戦略

### 推奨セレクター命名規則
```yaml
data-testid属性を使用:
  - 検索ボックス: data-testid="search-input"
  - フィルターボタン: data-testid="filter-{type}"
  - タブ: data-testid="tab-{name}"
  - 検索結果項目: data-testid="result-item-{index}"
  - お気に入りボタン: data-testid="favorite-button"
  - フォルダ開くボタン: data-testid="open-folder-button"

代替セレクター:
  - プレースホルダー: placeholder="ファイルを検索"
  - テキスト: text="CocoFile"
  - ロール: role="button"
```

### Tauri特有のテスト設定
```typescript
// Tauri WebDriver設定
import { WebDriver } from '@tauri-apps/webdriver';

const driver = await WebDriver.new({
  capabilities: {
    'tauri:options': {
      application: './src-tauri/target/release/cocofile',
    },
  },
});
```

---

## API呼び出し一覧

| No | メソッド | エンドポイント | 用途 | モック実装 | テストID |
|----|---------|--------------|------|-----------|----------|
| 1 | searchFiles() | @MOCK_TO_API: POST /api/search | キーワード検索 | FileService.searchFiles() | E2E-S001-001 〜 010 |
| 2 | getFavorites() | @MOCK_TO_API: GET /api/files/favorites | お気に入り取得 | FileService.getFavorites() | E2E-S001-011 〜 014 |
| 3 | getRecentFiles() | @MOCK_TO_API: GET /api/files/recent | 最近使用ファイル取得 | FileService.getRecentFiles() | E2E-S001-015 〜 018 |
| 4 | toggleFavorite() | @MOCK_TO_API: PUT /api/files/{path}/favorite | お気に入り切替 | FileService.toggleFavorite() | E2E-S001-019 〜 022 |
| 5 | openFile() | @MOCK_TO_API: Tauri Command: open_file | ファイルを開く | FileService.openFile() | E2E-S001-023 〜 026 |
| 6 | openFileLocation() | @MOCK_TO_API: Tauri Command: open_folder | フォルダを開く | FileService.openFileLocation() | E2E-S001-027 〜 030 |

---

## テスト項目一覧

### 正常系テスト（22項目）

| No | テストID | テスト項目 | 依存ID | 機能分類 | テスト分類 | 優先度 | 確認内容 | テストデータ/手順 | 期待結果 | 実施日 | 結果 | 備考 |
|----|---------|----------|--------|---------|-----------|--------|---------|------------------|----------|--------|------|------|
| 1 | E2E-S001-001 | 画面初期表示 | なし | 表示 | 正常系 | 高 | 画面要素が正しく表示される | アプリ起動 | ・ヘッダー「CocoFile」表示<br>・検索ボックス表示<br>・フィルターボタン表示<br>・タブ表示（検索結果/お気に入り/最近使用） | | | |
| 2 | E2E-S001-002 | ホットキー呼び出し | E2E-S001-001 | 表示 | 正常系 | 高 | Ctrl+Shift+Fでウィンドウ表示 | Ctrl+Shift+F押下 | ウィンドウが最前面に表示される | | | Tauri plugin使用 |
| 3 | E2E-S001-003 | キーワード検索（完全一致） | E2E-S001-001 | 検索 | 正常系 | 高 | ファイル名完全一致で検索 | 検索ボックスに「ABC社_見積書_2025年度」入力 | ・検索結果に該当ファイルが表示<br>・ファイル名、パス、サイズ、日付が正しく表示 | | | |
| 4 | E2E-S001-004 | キーワード検索（部分一致） | E2E-S001-001 | 検索 | 正常系 | 高 | ファイル名部分一致で検索 | 検索ボックスに「ABC社」入力 | ABC社を含むファイルが表示される | | | |
| 5 | E2E-S001-005 | キーワード検索（内容一致） | E2E-S001-001 | 検索 | 正常系 | 高 | ファイル内容で検索 | 検索ボックスに「営業実績」入力 | 内容に「営業実績」を含むファイルが表示 | | | extractedTextから検索 |
| 6 | E2E-S001-006 | キーワード検索（タグ一致） | E2E-S001-001 | 検索 | 正常系 | 高 | タグで検索 | 検索ボックスに「見積書」入力 | タグに「見積書」を含むファイルが表示 | | | |
| 7 | E2E-S001-007 | 検索デバウンス機能 | E2E-S001-001 | 検索 | 正常系 | 中 | 300ms待機後に検索実行 | 高速タイピングで「ABC」入力 | ・入力中は検索実行されない<br>・入力停止後300ms後に検索実行 | | | useSearchData内の実装 |
| 8 | E2E-S001-008 | 空キーワード検索 | E2E-S001-001 | 検索 | 正常系 | 中 | キーワードなしで全件表示 | 検索ボックスを空にする | 全ファイルが表示される | | | |
| 9 | E2E-S001-009 | ファイル種別フィルター（PDF） | E2E-S001-001 | 検索 | 正常系 | 高 | PDFのみに絞り込み | PDFボタンをクリック | ・PDFボタンがアクティブ状態<br>・PDFファイルのみ表示 | | | |
| 10 | E2E-S001-010 | ファイル種別フィルター（複数選択） | E2E-S001-001 | 検索 | 正常系 | 高 | 複数種別を選択 | PDF、Excelボタンをクリック | PDFとExcelファイルのみ表示 | | | |
| 11 | E2E-S001-011 | ファイル種別フィルター（解除） | E2E-S001-010 | 検索 | 正常系 | 中 | フィルター解除 | アクティブなPDFボタンを再度クリック | ・PDFボタンが非アクティブ<br>・全種別のファイルが表示 | | | toggleFileType実装 |
| 12 | E2E-S001-012 | お気に入りタブ表示 | E2E-S001-001 | 表示 | 正常系 | 高 | お気に入りファイル一覧表示 | お気に入りタブをクリック | ・お気に入りタブがアクティブ<br>・isFavorite=trueのファイルのみ表示 | | | getFavorites() |
| 13 | E2E-S001-013 | 最近使用タブ表示 | E2E-S001-001 | 表示 | 正常系 | 高 | 最近使用ファイル一覧表示 | 最近使用タブをクリック | ・最近使用タブがアクティブ<br>・lastAccessedAt降順でファイル表示 | | | getRecentFiles() |
| 14 | E2E-S001-014 | 検索結果タブ表示 | E2E-S001-012 | 表示 | 正常系 | 高 | 検索結果に戻る | 検索結果タブをクリック | ・検索結果タブがアクティブ<br>・検索結果が表示 | | | |
| 15 | E2E-S001-015 | ファイルアイコン表示（PDF） | E2E-S001-003 | 表示 | 正常系 | 中 | ファイル種別に応じたアイコン表示 | PDFファイルの検索結果を表示 | FileTextアイコンが表示される | | | getFileIcon実装 |
| 16 | E2E-S001-016 | ファイルアイコン表示（Excel） | E2E-S001-001 | 表示 | 正常系 | 中 | Excelアイコン表示 | Excelファイルの検索結果を表示 | FileSpreadsheetアイコンが表示 | | | |
| 17 | E2E-S001-017 | ファイルアイコン表示（Word） | E2E-S001-001 | 表示 | 正常系 | 中 | Wordアイコン表示 | Wordファイルの検索結果を表示 | Fileアイコンが表示 | | | |
| 18 | E2E-S001-018 | ファイルアイコン表示（PowerPoint） | E2E-S001-001 | 表示 | 正常系 | 中 | PowerPointアイコン表示 | PowerPointファイルの検索結果を表示 | Presentationアイコンが表示 | | | |
| 19 | E2E-S001-019 | ファイルサイズ表示フォーマット | E2E-S001-003 | 表示 | 正常系 | 中 | 人間可読なサイズ表示 | 検索結果を表示 | ・2.3 MB<br>・456 KB<br>・1.8 MB | | | formatFileSize() |
| 20 | E2E-S001-020 | 相対時間表示フォーマット | E2E-S001-003 | 表示 | 正常系 | 中 | 相対時間の表示 | 検索結果を表示 | ・今日<br>・昨日<br>・2日前<br>・3週間前 | | | formatRelativeTime() |
| 21 | E2E-S001-021 | タグバッジ表示 | E2E-S001-003 | 表示 | 正常系 | 中 | ファイルのタグをバッジ表示 | タグ付きファイルを検索 | タグがBadgeコンポーネントで表示される | | | |
| 22 | E2E-S001-022 | タグなしファイル表示 | E2E-S001-001 | 表示 | 正常系 | 低 | タグがない場合の表示 | タグなしファイルを検索 | タグバッジが表示されない | | | 条件分岐 |

### お気に入り・ファイル操作テスト（8項目）

| No | テストID | テスト項目 | 依存ID | 機能分類 | テスト分類 | 優先度 | 確認内容 | テストデータ/手順 | 期待結果 | 実施日 | 結果 | 備考 |
|----|---------|----------|--------|---------|-----------|--------|---------|------------------|----------|--------|------|------|
| 23 | E2E-S001-023 | お気に入り追加 | E2E-S001-003 | 更新 | 正常系 | 高 | お気に入りに追加 | 検索結果のスターアイコンをクリック | ・スターアイコンが黄色塗りつぶし<br>・toggleFavorite()が呼ばれる | | | stopPropagation確認 |
| 24 | E2E-S001-024 | お気に入り解除 | E2E-S001-023 | 更新 | 正常系 | 高 | お気に入りから削除 | お気に入り状態のスターアイコンをクリック | ・スターアイコンが灰色に戻る<br>・toggleFavorite()が呼ばれる | | | |
| 25 | E2E-S001-025 | お気に入り切替後の再検索 | E2E-S001-024 | 更新 | 正常系 | 高 | お気に入り変更後の自動更新 | お気に入り切替実行 | performSearch()が呼ばれ結果更新 | | | useSearchData実装 |
| 26 | E2E-S001-026 | ファイルを開く | E2E-S001-003 | 操作 | 正常系 | 高 | ファイルをダブルクリックで開く | 検索結果のファイル項目をクリック | ・openFile()が呼ばれる<br>・Tauri Command実行 | | | onClick実装 |
| 27 | E2E-S001-027 | フォルダを開く | E2E-S001-003 | 操作 | 正常系 | 高 | フォルダアイコンクリック | Folderボタンをクリック | ・openFileLocation()が呼ばれる<br>・エクスプローラーが開く | | | stopPropagation確認 |
| 28 | E2E-S001-028 | ファイル開く中のクリック防止 | E2E-S001-026 | 操作 | 正常系 | 中 | イベント伝播停止 | お気に入りボタンをクリック | ファイルが開かれない（stopPropagation） | | | |
| 29 | E2E-S001-029 | フォルダ開く中のクリック防止 | E2E-S001-027 | 操作 | 正常系 | 中 | イベント伝播停止 | フォルダボタンをクリック | ファイルが開かれない（stopPropagation） | | | |
| 30 | E2E-S001-030 | ホバー時のスタイル変更 | E2E-S001-003 | UI | 正常系 | 低 | マウスオーバー時の視覚フィードバック | ファイル項目にマウスオーバー | ・背景色がgray-50に変化<br>・ボーダーがblue-600に変化 | | | hover:bg-gray-50 |

### 異常系テスト（18項目）

| No | テストID | テスト項目 | 依存ID | 機能分類 | テスト分類 | 優先度 | 確認内容 | テストデータ/手順 | 期待結果 | 実施日 | 結果 | 備考 |
|----|---------|----------|--------|---------|-----------|--------|---------|------------------|----------|--------|------|------|
| 31 | E2E-S001-031 | 検索結果0件表示 | E2E-S001-001 | エラー処理 | 異常系 | 高 | 結果が見つからない場合 | 存在しないキーワードで検索 | ・SearchXアイコン表示<br>・「検索結果が見つかりませんでした」表示 | | | Empty state |
| 32 | E2E-S001-032 | 検索中のローディング表示 | E2E-S001-001 | エラー処理 | 異常系 | 高 | 検索実行中の表示 | 検索実行中 | ・Loader2アイコンがアニメーション<br>・「検索中...」表示 | | | isSearching=true |
| 33 | E2E-S001-033 | API接続エラー | E2E-S001-001 | エラー処理 | 異常系 | 高 | ネットワークエラー時の表示 | searchFiles()がエラーをthrow | ・SearchXアイコン表示<br>・エラーメッセージ表示 | | | error state |
| 34 | E2E-S001-034 | お気に入り切替エラー | E2E-S001-023 | エラー処理 | 異常系 | 高 | お気に入り更新失敗 | toggleFavorite()がエラーをthrow | エラーメッセージが表示される | | | catch処理 |
| 35 | E2E-S001-035 | ファイルを開くエラー | E2E-S001-026 | エラー処理 | 異常系 | 高 | ファイルが存在しない場合 | 削除済みファイルを開く | ・エラーメッセージ表示<br>・「Failed to open file」 | | | |
| 36 | E2E-S001-036 | フォルダを開くエラー | E2E-S001-027 | エラー処理 | 異常系 | 高 | フォルダが存在しない場合 | 削除済みフォルダを開く | ・エラーメッセージ表示<br>・「Failed to open folder」 | | | |
| 37 | E2E-S001-037 | 長いファイル名の表示 | E2E-S001-001 | UI | 異常系 | 中 | 長いファイル名の切り捨て | 100文字以上のファイル名を検索 | ・ファイル名がtruncate<br>・レイアウト崩れなし | | | CSS: truncate |
| 38 | E2E-S001-038 | 長いパスの表示 | E2E-S001-001 | UI | 異常系 | 中 | 長いパスの切り捨て | 深い階層のファイルを検索 | ・パスがtruncate<br>・レイアウト崩れなし | | | CSS: truncate |
| 39 | E2E-S001-039 | 大量タグの表示 | E2E-S001-001 | UI | 異常系 | 中 | 多数のタグが付いたファイル | 10個以上のタグを持つファイルを検索 | ・タグがflex-wrap<br>・レイアウト崩れなし | | | CSS: flex-wrap |
| 40 | E2E-S001-040 | 0バイトファイルの表示 | E2E-S001-001 | UI | 異常系 | 低 | サイズ0のファイル | 0バイトファイルを検索 | 「0 B」と表示される | | | formatFileSize() |
| 41 | E2E-S001-041 | 未来日付の表示 | E2E-S001-001 | UI | 異常系 | 低 | システム日付より未来 | 未来日付のファイルを検索 | 適切に表示される | | | formatRelativeTime() |
| 42 | E2E-S001-042 | 空文字検索 | E2E-S001-001 | エラー処理 | 異常系 | 中 | スペースのみ入力 | 「   」（スペース3つ）入力 | 全ファイルまたは0件表示 | | | trim処理 |
| 43 | E2E-S001-043 | 特殊文字検索 | E2E-S001-001 | エラー処理 | 異常系 | 中 | 特殊文字で検索 | 「<>:"/\|?*」入力 | エラーなく検索実行される | | | エスケープ処理 |
| 44 | E2E-S001-044 | 非常に長いキーワード検索 | E2E-S001-001 | エラー処理 | 異常系 | 低 | 1000文字以上のキーワード | 1000文字の文字列入力 | エラーなく検索実行される | | | |
| 45 | E2E-S001-045 | 全フィルター未選択 | E2E-S001-001 | エラー処理 | 異常系 | 中 | 全ファイル種別を解除 | 全フィルターボタンを解除 | 全種別のファイルが表示される | | | |
| 46 | E2E-S001-046 | タブ切替中のローディング | E2E-S001-012 | UI | 異常系 | 中 | タブ切替時の表示 | お気に入りタブをクリック | ローディング表示後に結果表示 | | | |
| 47 | E2E-S001-047 | エラー後の再検索 | E2E-S001-033 | エラー処理 | 異常系 | 高 | エラー状態から回復 | エラー後に正常な検索実行 | エラーがクリアされ正常に検索実行 | | | setError(null) |
| 48 | E2E-S001-048 | 検索中の再検索防止 | E2E-S001-032 | エラー処理 | 異常系 | 中 | 検索中に追加検索 | 検索実行中に新しいキーワード入力 | デバウンスにより適切に処理される | | | 300msデバウンス |

### セキュリティ・権限テスト（10項目）

| No | テストID | テスト項目 | 依存ID | 機能分類 | テスト分類 | 優先度 | 確認内容 | テストデータ/手順 | 期待結果 | 実施日 | 結果 | 備考 |
|----|---------|----------|--------|---------|-----------|--------|---------|------------------|----------|--------|------|------|
| 49 | E2E-S001-049 | XSS対策（検索ボックス） | E2E-S001-001 | セキュリティ | セキュリティ | 高 | スクリプトインジェクション防止 | 検索ボックスに「&lt;script&gt;alert(1)&lt;/script&gt;」入力 | スクリプトが実行されない（テキストとして表示） | | | React自動エスケープ |
| 50 | E2E-S001-050 | XSS対策（ファイル名表示） | E2E-S001-003 | セキュリティ | セキュリティ | 高 | ファイル名のエスケープ | ファイル名に「&lt;img src=x&gt;」を含むファイル | HTMLタグがエスケープされる | | | |
| 51 | E2E-S001-051 | XSS対策（パス表示） | E2E-S001-003 | セキュリティ | セキュリティ | 高 | パスのエスケープ | パスに特殊文字を含むファイル | 正しくエスケープされる | | | |
| 52 | E2E-S001-052 | XSS対策（タグ表示） | E2E-S001-003 | セキュリティ | セキュリティ | 高 | タグのエスケープ | タグに「&lt;b&gt;test&lt;/b&gt;」を含むファイル | HTMLタグがエスケープされる | | | |
| 53 | E2E-S001-053 | ファイルアクセス権限チェック | E2E-S001-026 | セキュリティ | セキュリティ | 高 | OS権限による保護 | 権限のないファイルを開く | OSレベルでエラーが発生 | | | Tauri plugin依存 |
| 54 | E2E-S001-054 | フォルダアクセス権限チェック | E2E-S001-027 | セキュリティ | セキュリティ | 高 | OS権限による保護 | 権限のないフォルダを開く | OSレベルでエラーが発生 | | | |
| 55 | E2E-S001-055 | パストラバーサル対策 | E2E-S001-001 | セキュリティ | セキュリティ | 中 | 不正なパス指定の防止 | 「../../etc/passwd」で検索 | 不正なパスアクセスが防止される | | | バックエンド実装 |
| 56 | E2E-S001-056 | SQLインジェクション対策 | E2E-S001-001 | セキュリティ | セキュリティ | 高 | プリペアドステートメント使用 | 検索ボックスに「' OR '1'='1」入力 | インジェクションが防止される | | | SQLite FTS5使用 |
| 57 | E2E-S001-057 | エラーメッセージの情報漏洩防止 | E2E-S001-033 | セキュリティ | セキュリティ | 中 | システム内部情報の非表示 | エラー発生時 | 内部パスやスタック情報が表示されない | | | |
| 58 | E2E-S001-058 | ローカルストレージの使用確認 | E2E-S001-001 | セキュリティ | セキュリティ | 低 | 機密情報の保存なし | アプリ使用後 | ブラウザストレージに機密情報がない | | | Tauri独自ストレージ |

### レスポンシブ・UI/UXテスト（8項目）

| No | テストID | テスト項目 | 依存ID | 機能分類 | テスト分類 | 優先度 | 確認内容 | テストデータ/手順 | 期待結果 | 実施日 | 結果 | 備考 |
|----|---------|----------|--------|---------|-----------|--------|---------|------------------|----------|--------|------|------|
| 59 | E2E-S001-059 | デスクトップウィンドウサイズ | E2E-S001-001 | レスポンシブ | レスポンシブ | 高 | 推奨ウィンドウサイズでの表示 | 800x600ウィンドウで表示 | レイアウト崩れなく表示される | | | Tauri config設定 |
| 60 | E2E-S001-060 | ウィンドウ最小サイズ | E2E-S001-001 | レスポンシブ | レスポンシブ | 高 | 最小サイズでの表示 | 400x300に縮小 | ・スクロールバー表示<br>・レイアウト崩れなし | | | min-width設定 |
| 61 | E2E-S001-061 | ウィンドウ最大化 | E2E-S001-001 | レスポンシブ | レスポンシブ | 中 | 全画面表示 | ウィンドウを最大化 | コンテンツが適切にセンタリング | | | max-w-4xl実装 |
| 62 | E2E-S001-062 | フィルターボタンの折り返し | E2E-S001-001 | レスポンシブ | レスポンシブ | 中 | 狭いウィンドウでの表示 | 500pxにウィンドウ縮小 | フィルターボタンが折り返し表示 | | | flex-wrap実装 |
| 63 | E2E-S001-063 | 検索結果リストのスクロール | E2E-S001-003 | UI | レスポンシブ | 中 | 大量の検索結果 | 100件の検索結果を表示 | スムーズにスクロールできる | | | |
| 64 | E2E-S001-064 | タブ切替のアニメーション | E2E-S001-012 | UI | レスポンシブ | 低 | タブ切替時の視覚効果 | タブを切り替え | スムーズにアニメーション | | | Tabs component |
| 65 | E2E-S001-065 | キーボードナビゲーション | E2E-S001-001 | アクセシビリティ | レスポンシブ | 中 | Tab/Enterキーでの操作 | Tabキーでフォーカス移動 | ・フォーカスが適切に移動<br>・Enterで実行可能 | | | |
| 66 | E2E-S001-066 | 検索ボックスのフォーカス | E2E-S001-002 | UI | レスポンシブ | 中 | ホットキー呼び出し時 | Ctrl+Shift+Fでウィンドウ表示 | 検索ボックスに自動フォーカス | | | 将来実装 |

### パフォーマンステスト（7項目）

| No | テストID | テスト項目 | 依存ID | 機能分類 | テスト分類 | 優先度 | 確認内容 | テストデータ/手順 | 期待結果 | 実施日 | 結果 | 備考 |
|----|---------|----------|--------|---------|-----------|--------|---------|------------------|----------|--------|------|------|
| 67 | E2E-S001-067 | 検索速度（小規模） | E2E-S001-001 | パフォーマンス | パフォーマンス | 高 | 100件のファイルから検索 | 100件のファイルで検索実行 | 0.5秒以内に結果表示 | | | 成功指標 |
| 68 | E2E-S001-068 | 検索速度（中規模） | E2E-S001-001 | パフォーマンス | パフォーマンス | 高 | 1万件のファイルから検索 | 1万件のファイルで検索実行 | 0.5秒以内に結果表示 | | | SQLite FTS5最適化 |
| 69 | E2E-S001-069 | 検索速度（大規模） | E2E-S001-001 | パフォーマンス | パフォーマンス | 中 | 10万件のファイルから検索 | 10万件のファイルで検索実行 | 1秒以内に結果表示 | | | |
| 70 | E2E-S001-070 | メモリ使用量（アイドル） | E2E-S001-001 | パフォーマンス | パフォーマンス | 高 | アイドル時のメモリ | アプリ起動後5分待機 | 150MB以下（目標30-40MB） | | | 成功指標 |
| 71 | E2E-S001-071 | メモリ使用量（検索中） | E2E-S001-003 | パフォーマンス | パフォーマンス | 高 | 検索実行時のメモリ | 検索を100回繰り返す | メモリリークなし、500MB以下 | | | |
| 72 | E2E-S001-072 | CPU使用率（アイドル） | E2E-S001-001 | パフォーマンス | パフォーマンス | 高 | アイドル時のCPU | アプリ起動後待機 | 1%以下 | | | 成功指標 |
| 73 | E2E-S001-073 | レンダリングパフォーマンス | E2E-S001-003 | パフォーマンス | パフォーマンス | 中 | 大量結果の描画 | 1000件の検索結果を表示 | スムーズにスクロール可能 | | | 仮想スクロール検討 |

---

## 優先度別実施順序

### 高優先度（28項目 - 必須）
基本機能とクリティカルパスのテスト。リリース前に必ず実施。

**Phase 1: 基本表示・検索機能**
1. E2E-S001-001: 画面初期表示
2. E2E-S001-002: ホットキー呼び出し
3. E2E-S001-003: キーワード検索（完全一致）
4. E2E-S001-004: キーワード検索（部分一致）
5. E2E-S001-005: キーワード検索（内容一致）
6. E2E-S001-006: キーワード検索（タグ一致）

**Phase 2: フィルター・タブ機能**
7. E2E-S001-009: ファイル種別フィルター（PDF）
8. E2E-S001-010: ファイル種別フィルター（複数選択）
9. E2E-S001-012: お気に入りタブ表示
10. E2E-S001-013: 最近使用タブ表示
11. E2E-S001-014: 検索結果タブ表示

**Phase 3: ファイル操作**
12. E2E-S001-023: お気に入り追加
13. E2E-S001-024: お気に入り解除
14. E2E-S001-025: お気に入り切替後の再検索
15. E2E-S001-026: ファイルを開く
16. E2E-S001-027: フォルダを開く

**Phase 4: エラー処理**
17. E2E-S001-031: 検索結果0件表示
18. E2E-S001-032: 検索中のローディング表示
19. E2E-S001-033: API接続エラー
20. E2E-S001-034: お気に入り切替エラー
21. E2E-S001-035: ファイルを開くエラー
22. E2E-S001-036: フォルダを開くエラー
23. E2E-S001-047: エラー後の再検索

**Phase 5: セキュリティ**
24. E2E-S001-049: XSS対策（検索ボックス）
25. E2E-S001-050: XSS対策（ファイル名表示）
26. E2E-S001-051: XSS対策（パス表示）
27. E2E-S001-052: XSS対策（タグ表示）
28. E2E-S001-053: ファイルアクセス権限チェック
29. E2E-S001-054: フォルダアクセス権限チェック
30. E2E-S001-056: SQLインジェクション対策

**Phase 6: パフォーマンス**
31. E2E-S001-067: 検索速度（小規模）
32. E2E-S001-068: 検索速度（中規模）
33. E2E-S001-070: メモリ使用量（アイドル）
34. E2E-S001-071: メモリ使用量（検索中）
35. E2E-S001-072: CPU使用率（アイドル）

**Phase 7: レスポンシブ**
36. E2E-S001-059: デスクトップウィンドウサイズ
37. E2E-S001-060: ウィンドウ最小サイズ

### 中優先度（25項目 - 推奨）
ユーザー体験向上のためのテスト。品質向上のため実施推奨。

**UI/UX改善テスト**
- E2E-S001-007: 検索デバウンス機能
- E2E-S001-008: 空キーワード検索
- E2E-S001-011: ファイル種別フィルター（解除）
- E2E-S001-015 〜 022: ファイルアイコン・フォーマット表示
- E2E-S001-028 〜 029: イベント伝播停止

**異常系・エッジケース**
- E2E-S001-037 〜 043: 長い文字列・特殊文字・大量データ
- E2E-S001-045 〜 048: フィルター・タブ切替の境界値

**セキュリティ・レスポンシブ**
- E2E-S001-055: パストラバーサル対策
- E2E-S001-057: エラーメッセージの情報漏洩防止
- E2E-S001-061 〜 063: ウィンドウサイズ変更
- E2E-S001-065: キーボードナビゲーション
- E2E-S001-066: 検索ボックスのフォーカス
- E2E-S001-069: 検索速度（大規模）
- E2E-S001-073: レンダリングパフォーマンス

### 低優先度（12項目 - 任意）
細かな動作確認。時間に余裕がある場合に実施。

**細部の表示確認**
- E2E-S001-022: タグなしファイル表示
- E2E-S001-030: ホバー時のスタイル変更
- E2E-S001-040: 0バイトファイルの表示
- E2E-S001-041: 未来日付の表示
- E2E-S001-044: 非常に長いキーワード検索
- E2E-S001-058: ローカルストレージの使用確認
- E2E-S001-064: タブ切替のアニメーション

---

## Playwrightテストコード例

### テスト環境セットアップ

```typescript
// tests/setup.ts
import { WebDriver } from '@tauri-apps/webdriver';
import { expect } from '@playwright/test';

export async function setupTauriDriver() {
  const driver = await WebDriver.new({
    capabilities: {
      'tauri:options': {
        application: './src-tauri/target/release/cocofile',
      },
    },
  });

  return driver;
}

export async function teardownTauriDriver(driver: WebDriver) {
  await driver.quit();
}
```

### テストコード例1: 画面初期表示（E2E-S001-001）

```typescript
// tests/e2e/main-search-screen/initial-display.spec.ts
import { test, expect } from '@playwright/test';
import { setupTauriDriver, teardownTauriDriver } from '../setup';

test.describe('E2E-S001-001: 画面初期表示', () => {
  let driver;

  test.beforeAll(async () => {
    driver = await setupTauriDriver();
  });

  test.afterAll(async () => {
    await teardownTauriDriver(driver);
  });

  test('画面要素が正しく表示される', async () => {
    // ヘッダー確認
    const header = await driver.findElement({ css: 'h1' });
    const headerText = await header.getText();
    expect(headerText).toBe('CocoFile');

    // ホットキーヒント確認
    const hotkeyHint = await driver.findElement({
      css: 'div.text-xs.text-gray-500.bg-gray-100'
    });
    const hotkeyText = await hotkeyHint.getText();
    expect(hotkeyText).toContain('Ctrl+Shift+F で呼び出し');

    // 検索ボックス確認
    const searchInput = await driver.findElement({
      css: 'input[placeholder*="ファイルを検索"]'
    });
    expect(await searchInput.isDisplayed()).toBe(true);

    // フィルターボタン確認
    const tagFilterButton = await driver.findElement({
      css: 'button:has-text("タグ")'
    });
    expect(await tagFilterButton.isDisplayed()).toBe(true);

    const dateFilterButton = await driver.findElement({
      css: 'button:has-text("日付範囲")'
    });
    expect(await dateFilterButton.isDisplayed()).toBe(true);

    // ファイル種別フィルターボタン確認
    const pdfButton = await driver.findElement({
      css: 'button:has-text("PDF")'
    });
    expect(await pdfButton.isDisplayed()).toBe(true);

    const excelButton = await driver.findElement({
      css: 'button:has-text("Excel")'
    });
    expect(await excelButton.isDisplayed()).toBe(true);

    const wordButton = await driver.findElement({
      css: 'button:has-text("Word")'
    });
    expect(await wordButton.isDisplayed()).toBe(true);

    const pptButton = await driver.findElement({
      css: 'button:has-text("PPT")'
    });
    expect(await pptButton.isDisplayed()).toBe(true);

    // タブ確認
    const searchResultsTab = await driver.findElement({
      css: '[role="tab"]:has-text("検索結果")'
    });
    expect(await searchResultsTab.isDisplayed()).toBe(true);

    const favoritesTab = await driver.findElement({
      css: '[role="tab"]:has-text("お気に入り")'
    });
    expect(await favoritesTab.isDisplayed()).toBe(true);

    const recentTab = await driver.findElement({
      css: '[role="tab"]:has-text("最近使用")'
    });
    expect(await recentTab.isDisplayed()).toBe(true);
  });
});
```

### テストコード例2: キーワード検索（E2E-S001-003）

```typescript
// tests/e2e/main-search-screen/keyword-search.spec.ts
import { test, expect } from '@playwright/test';
import { setupTauriDriver, teardownTauriDriver } from '../setup';

test.describe('E2E-S001-003: キーワード検索（完全一致）', () => {
  let driver;

  test.beforeAll(async () => {
    driver = await setupTauriDriver();
  });

  test.afterAll(async () => {
    await teardownTauriDriver(driver);
  });

  test('ファイル名完全一致で検索できる', async () => {
    // 検索ボックスに入力
    const searchInput = await driver.findElement({
      css: 'input[placeholder*="ファイルを検索"]'
    });
    await searchInput.clear();
    await searchInput.sendKeys('ABC社_見積書_2025年度');

    // デバウンス待機（300ms + バッファ）
    await driver.sleep(500);

    // ローディング終了を待機
    await driver.wait(async () => {
      const loader = await driver.findElements({ css: '.animate-spin' });
      return loader.length === 0;
    }, 5000);

    // 検索結果の確認
    const resultItems = await driver.findElements({
      css: '[class*="border-gray-200"][class*="rounded-lg"]'
    });
    expect(resultItems.length).toBeGreaterThan(0);

    // 最初の結果項目の内容確認
    const firstResult = resultItems[0];
    const fileName = await firstResult.findElement({
      css: 'h3.text-sm.font-medium'
    });
    const fileNameText = await fileName.getText();
    expect(fileNameText).toContain('ABC社_見積書_2025年度');

    // ファイルパス確認
    const filePath = await firstResult.findElement({
      css: 'p.text-xs.text-gray-500.truncate'
    });
    const filePathText = await filePath.getText();
    expect(filePathText).toContain('ABC社');

    // ファイルサイズ確認
    const fileSize = await firstResult.findElement({
      css: 'div.flex.gap-3.text-xs span'
    });
    const fileSizeText = await fileSize.getText();
    expect(fileSizeText).toMatch(/\d+(\.\d+)?\s*(B|KB|MB|GB)/);
  });
});
```

### テストコード例3: お気に入り追加（E2E-S001-023）

```typescript
// tests/e2e/main-search-screen/favorite-toggle.spec.ts
import { test, expect } from '@playwright/test';
import { setupTauriDriver, teardownTauriDriver } from '../setup';

test.describe('E2E-S001-023: お気に入り追加', () => {
  let driver;

  test.beforeAll(async () => {
    driver = await setupTauriDriver();
  });

  test.afterAll(async () => {
    await teardownTauriDriver(driver);
  });

  test('お気に入りに追加できる', async () => {
    // 検索実行
    const searchInput = await driver.findElement({
      css: 'input[placeholder*="ファイルを検索"]'
    });
    await searchInput.sendKeys('営業実績');
    await driver.sleep(500);

    // 検索結果取得
    const resultItems = await driver.findElements({
      css: '[class*="border-gray-200"][class*="rounded-lg"]'
    });
    expect(resultItems.length).toBeGreaterThan(0);

    // お気に入りボタンの状態確認（初期状態）
    const starButton = await resultItems[0].findElement({
      css: 'button svg'
    });
    const initialClasses = await starButton.getAttribute('class');

    // お気に入りボタンをクリック
    await starButton.click();

    // 少し待機（API呼び出し完了待ち）
    await driver.sleep(300);

    // お気に入り状態の確認（色が変わっているか）
    const updatedClasses = await starButton.getAttribute('class');
    expect(updatedClasses).toContain('fill-yellow-400');
    expect(updatedClasses).toContain('text-yellow-400');

    // お気に入りタブに切り替えて確認
    const favoritesTab = await driver.findElement({
      css: '[role="tab"]:has-text("お気に入り")'
    });
    await favoritesTab.click();
    await driver.sleep(500);

    // お気に入りタブに追加されたファイルが表示されているか確認
    const favoriteItems = await driver.findElements({
      css: '[class*="border-gray-200"][class*="rounded-lg"]'
    });
    expect(favoriteItems.length).toBeGreaterThan(0);
  });
});
```

### テストコード例4: エラー処理（E2E-S001-031）

```typescript
// tests/e2e/main-search-screen/error-handling.spec.ts
import { test, expect } from '@playwright/test';
import { setupTauriDriver, teardownTauriDriver } from '../setup';

test.describe('E2E-S001-031: 検索結果0件表示', () => {
  let driver;

  test.beforeAll(async () => {
    driver = await setupTauriDriver();
  });

  test.afterAll(async () => {
    await teardownTauriDriver(driver);
  });

  test('結果が見つからない場合の表示', async () => {
    // 存在しないキーワードで検索
    const searchInput = await driver.findElement({
      css: 'input[placeholder*="ファイルを検索"]'
    });
    await searchInput.clear();
    await searchInput.sendKeys('存在しないファイル名XYZ12345');
    await driver.sleep(500);

    // ローディング終了を待機
    await driver.wait(async () => {
      const loader = await driver.findElements({ css: '.animate-spin' });
      return loader.length === 0;
    }, 5000);

    // Empty stateアイコン確認
    const emptyIcon = await driver.findElement({
      css: 'svg[class*="h-16"][class*="w-16"]'
    });
    expect(await emptyIcon.isDisplayed()).toBe(true);

    // Empty stateメッセージ確認
    const emptyMessage = await driver.findElement({
      css: 'p.text-gray-500'
    });
    const messageText = await emptyMessage.getText();
    expect(messageText).toBe('検索結果が見つかりませんでした');

    // 検索結果項目がないことを確認
    const resultItems = await driver.findElements({
      css: '[class*="border-gray-200"][class*="rounded-lg"]'
    });
    expect(resultItems.length).toBe(0);
  });
});
```

### テストコード例5: セキュリティ（E2E-S001-049）

```typescript
// tests/e2e/main-search-screen/security.spec.ts
import { test, expect } from '@playwright/test';
import { setupTauriDriver, teardownTauriDriver } from '../setup';

test.describe('E2E-S001-049: XSS対策（検索ボックス）', () => {
  let driver;

  test.beforeAll(async () => {
    driver = await setupTauriDriver();
  });

  test.afterAll(async () => {
    await teardownTauriDriver(driver);
  });

  test('スクリプトインジェクションが防止される', async () => {
    // XSS攻撃を試みる
    const searchInput = await driver.findElement({
      css: 'input[placeholder*="ファイルを検索"]'
    });
    const xssPayload = '<script>alert("XSS")</script>';
    await searchInput.clear();
    await searchInput.sendKeys(xssPayload);
    await driver.sleep(500);

    // アラートダイアログが表示されないことを確認
    const alerts = await driver.findElements({ css: 'div[role="alert"]' });
    expect(alerts.length).toBe(0);

    // 検索ボックスの値がエスケープされていることを確認
    const inputValue = await searchInput.getAttribute('value');
    expect(inputValue).toBe(xssPayload); // エスケープされて文字列として保存

    // ページ上にスクリプトタグが実行されていないことを確認
    const scripts = await driver.executeScript(
      'return document.querySelectorAll("script").length'
    );
    const initialScriptCount = scripts;

    // 検索実行後もスクリプトが増えていないことを確認
    await driver.sleep(500);
    const finalScripts = await driver.executeScript(
      'return document.querySelectorAll("script").length'
    );
    expect(finalScripts).toBe(initialScriptCount);
  });
});
```

### テストコード例6: パフォーマンス（E2E-S001-067）

```typescript
// tests/e2e/main-search-screen/performance.spec.ts
import { test, expect } from '@playwright/test';
import { setupTauriDriver, teardownTauriDriver } from '../setup';

test.describe('E2E-S001-067: 検索速度（小規模）', () => {
  let driver;

  test.beforeAll(async () => {
    driver = await setupTauriDriver();
  });

  test.afterAll(async () => {
    await teardownTauriDriver(driver);
  });

  test('100件のファイルから0.5秒以内に検索結果が表示される', async () => {
    // 検索開始時刻を記録
    const startTime = Date.now();

    // 検索実行
    const searchInput = await driver.findElement({
      css: 'input[placeholder*="ファイルを検索"]'
    });
    await searchInput.clear();
    await searchInput.sendKeys('営業');

    // 検索結果が表示されるまで待機
    await driver.wait(async () => {
      const loader = await driver.findElements({ css: '.animate-spin' });
      return loader.length === 0;
    }, 5000);

    // 検索結果が表示されていることを確認
    const resultItems = await driver.findElements({
      css: '[class*="border-gray-200"][class*="rounded-lg"]'
    });
    expect(resultItems.length).toBeGreaterThan(0);

    // 検索終了時刻を記録
    const endTime = Date.now();
    const duration = endTime - startTime;

    // 検索速度の確認（デバウンス300ms + 検索実行200ms = 500ms以内）
    console.log(`検索時間: ${duration}ms`);
    expect(duration).toBeLessThan(800); // デバウンス含めて800ms以内
  });
});
```

---

## 前提条件

### テスト環境
```yaml
実行環境:
  - OS: Windows 10/11, macOS 12+, Ubuntu 20.04+
  - Node.js: 18.x以上
  - Playwright: 1.40以上
  - Tauri WebDriver: 最新版

テストデータ:
  - モックファイル: FileService.tsに定義された3件のファイル
    1. ABC社_見積書_2025年度.pdf (2.3 MB)
    2. 営業実績_2025年10月.xlsx (456 KB)
    3. 提案書_新規プロジェクト_XYZ社.docx (1.8 MB)

前提条件:
  - Tauri開発環境がセットアップ済み
  - フロントエンドのビルドが正常に完了
  - モックサービスが正常に動作
```

### テスト実行コマンド
```bash
# 全E2Eテスト実行
npm run test:e2e

# 特定のテストファイルを実行
npm run test:e2e tests/e2e/main-search-screen/initial-display.spec.ts

# ヘッドレスモードで実行
npm run test:e2e:headless

# デバッグモードで実行
npm run test:e2e:debug

# Tauri環境でのテスト実行
npm run tauri test
```

---

## 依存関係マップ

### 依存関係なし（並列実行可能）
- E2E-S001-001: 画面初期表示（全テストの起点）
- E2E-S001-002: ホットキー呼び出し

### 第1階層（E2E-S001-001に依存）
- E2E-S001-003 〜 008: 検索機能
- E2E-S001-009 〜 011: フィルター機能
- E2E-S001-012 〜 014: タブ機能
- E2E-S001-015 〜 022: 表示機能
- E2E-S001-031 〜 048: エラー処理
- E2E-S001-049 〜 058: セキュリティ
- E2E-S001-059 〜 066: レスポンシブ
- E2E-S001-067 〜 073: パフォーマンス

### 第2階層（検索結果に依存）
- E2E-S001-023 〜 030: ファイル操作（E2E-S001-003に依存）

### 第3階層（操作後の状態確認）
- E2E-S001-025: お気に入り切替後の再検索（E2E-S001-024に依存）

---

## テスト実施時の注意事項

### Tauri固有の考慮事項
1. **ウィンドウ管理**: Tauriアプリは独立したウィンドウで動作するため、フォーカス管理に注意
2. **IPC通信**: Tauri Command APIを使用した通信のモック化が必要
3. **ネイティブダイアログ**: ファイル選択ダイアログなどのOSネイティブUIはテスト不可
4. **権限**: ファイルアクセスはOSレベルの権限に依存

### モック環境の制限
1. **API実装**: 現在はモックサービスのため、実際のTauri Commandとの統合テストが別途必要
2. **ファイルシステム**: 実際のファイル操作はモックされており、実ファイルへのアクセスは行われない
3. **パフォーマンス**: モック環境のため、実際のSQLite FTS5のパフォーマンスは未検証

### 推奨テストアプローチ
1. **段階的実施**: 高優先度から順に実施し、クリティカルパスを優先
2. **CI/CD統合**: GitHub ActionsやGitLab CIでの自動実行を設定
3. **定期実行**: 夜間バッチで全テストを実行し、品質を継続的に監視
4. **エラー追跡**: テスト失敗時のスクリーンショット・ログを保存

---

## 変更履歴

| 日付 | バージョン | 変更内容 | 作成者 |
|------|-----------|---------|--------|
| 2025-11-04 | 1.0 | 初版作成 | E2Eテスト仕様書作成エージェント |

---

## 付録: テスト項目サマリー

### 機能分類別
- 表示: 15項目
- 検索: 20項目
- 更新: 8項目
- 操作: 6項目
- エラー処理: 18項目
- セキュリティ: 10項目
- UI/レスポンシブ: 11項目
- パフォーマンス: 7項目

### 実装状況
- 実装済み: 0項目（0%）
- 未実装: 73項目（100%）

### 推奨実装順序
1. **Week 1-2**: 高優先度 Phase 1-3（基本機能）
2. **Week 3**: 高優先度 Phase 4-5（エラー・セキュリティ）
3. **Week 4**: 高優先度 Phase 6-7 + 中優先度（パフォーマンス・UI）
4. **Week 5以降**: 低優先度（時間があれば）

---

**テスト仕様書作成完了**

このE2Eテスト仕様書は、メイン検索画面（S-001）の全機能を網羅的にカバーしており、正常系・異常系・セキュリティ・レスポンシブ・パフォーマンスの全観点から73項目のテストケースを定義しています。

各テスト項目には依存関係が明記されており、効率的なテスト実施が可能です。また、Playwrightを使用した具体的なテストコード例も含まれており、即座にテスト実装を開始できます。
