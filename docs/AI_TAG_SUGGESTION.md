# AIタグ提案機能（Ollama統合）

## 概要

CocoFileにローカルLLM（Ollama）を使用したAIタグ提案機能を実装しました。ファイルの内容を分析して、適切なタグを自動的に提案します。

## 機能仕様

### 主な機能

1. **AIタグ提案**
   - ファイル名、種別、内容を基にタグを提案
   - 会社名、プロジェクト名、文書種別などを自動抽出
   - 日本語で5〜10個のタグを提案

2. **Ollama接続状態確認**
   - リアルタイムで接続状態を確認
   - エラー時の詳細メッセージ表示
   - 再接続ボタン

3. **設定管理**
   - AI提案の有効/無効切り替え
   - 使用するモデル名の設定（デフォルト: llama3.2）
   - 接続エンドポイント表示

## 技術仕様

### Rust側（バックエンド）

#### 新規ファイル

**`src-tauri/src/ai_suggester.rs`**
- Ollama REST APIへの接続
- タグ提案プロンプト生成
- レスポンスパース処理
- タイムアウト設定（30秒）

主な関数：
```rust
// Ollamaの接続状態を確認
pub async fn check_ollama_status() -> OllamaStatus

// AIを使ってタグを提案
pub async fn suggest_tags_ai(
    file_name: String,
    file_type: String,
    content_preview: String,
    model_name: Option<String>,
) -> Result<AiSuggestionResult, String>
```

#### 変更ファイル

**`src-tauri/Cargo.toml`**
- `reqwest` クレート追加（HTTP通信用）

**`src-tauri/src/lib.rs`**
- `ai_suggester` モジュール追加
- Tauriコマンド登録：
  - `check_ollama_status`
  - `suggest_tags_ai`

**`src-tauri/src/settings_manager.rs`**
- AI設定フィールド追加：
  - `ai_enabled: bool`
  - `ollama_model: String`

### TypeScript側（フロントエンド）

#### 変更ファイル

**`frontend/src/services/TauriService.ts`**
- 型定義追加：
  - `OllamaStatus`
  - `AiSuggestionResult`
  - `TauriAppSettings` (ai_enabled, ollama_model追加)
- API関数追加：
  - `checkOllamaStatus()`
  - `suggestTagsAi()`

**`frontend/src/types/index.ts`**
- `AppSettings` インターフェースにAI設定追加

**`frontend/src/store/settingsStore.ts`**
- AI設定更新関数追加：
  - `updateAiEnabled()`
  - `updateOllamaModel()`
- 型変換関数にAI設定追加

**`frontend/src/components/FileDetailModal.tsx`**
- AIタグ提案ボタン追加
- AI提案結果の表示
- エラーハンドリング
- ローディング状態表示

**`frontend/src/screens/SettingsScreen.tsx`**
- AI設定セクション追加：
  - Ollama接続状態表示
  - AI提案有効/無効トグル
  - モデル名設定入力欄

## 使用方法

### 1. Ollamaのインストール

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# https://ollama.ai からインストーラーをダウンロード
```

### 2. モデルのダウンロード

```bash
ollama pull llama3.2
```

### 3. Ollamaの起動

```bash
ollama serve
```

デフォルトで `http://localhost:11434` で起動します。

### 4. CocoFileでの使用

1. **設定画面で確認**
   - 設定画面を開く
   - 「AI タグ提案設定」セクションで接続状態を確認
   - 必要に応じてモデル名を変更

2. **ファイル詳細画面で使用**
   - ファイルを選択して詳細モーダルを開く
   - タグ入力欄の横にある「AI提案」ボタンをクリック
   - 提案されたタグが表示される
   - クリックして選択的に追加

## プロンプト設計

AIに送信されるプロンプトは以下の形式：

```
あなたはファイル管理アシスタントです。以下のファイルに適切なタグを日本語で5〜10個提案してください。

【ファイル情報】
- ファイル名: {file_name}
- ファイル種別: {file_type}
- 内容のプレビュー:
{content_preview}

【タグ提案の指針】
1. 会社名、プロジェクト名、部署名などの組織情報
2. 文書種別（報告書、請求書、見積書、契約書、プレゼン資料など）
3. 技術分野やトピック（プログラミング、マーケティング、財務など）
4. 時期や年度（2024年度、Q1、上半期など）
5. 重要度や状態（重要、下書き、完成、承認済みなど）

【回答フォーマット】
- 各タグを改行区切りで出力してください
- 余計な説明文は不要です
- タグのみを出力してください
```

## エラーハンドリング

### Ollama未起動時

```
Cannot connect to Ollama. Please ensure Ollama is running on localhost:11434
```

設定画面とファイル詳細画面の両方でエラーメッセージを表示します。

### タイムアウト時

```
Ollama API request timed out (30 seconds)
```

30秒以内にレスポンスがない場合、タイムアウトエラーを表示します。

### フォールバック

AI提案が失敗した場合も、既存のルールベースタグ提案は引き続き動作します。

## パフォーマンス

- **リクエストタイムアウト**: 30秒
- **コンテンツプレビュー**: 最大1000文字
- **提案タグ数**: 最大10個
- **ローカル処理**: 全てローカルで動作、外部通信なし

## セキュリティ

- 完全ローカル動作（Ollamaもローカルで起動）
- ファイル内容は外部に送信されない
- localhost:11434への接続のみ

## 今後の拡張予定

1. **モデル選択UIの改善**
   - インストール済みモデルの一覧表示
   - モデルの自動ダウンロード機能

2. **プロンプトカスタマイズ**
   - ユーザー定義のプロンプトテンプレート
   - 業界別プリセット

3. **学習機能**
   - ユーザーのタグ付け履歴から学習
   - 提案精度の向上

4. **バッチ処理**
   - 複数ファイルの一括タグ付け
   - バックグラウンド処理

## テスト

### 単体テスト

Rust側のパース処理のテストを含みます：

```bash
cd src-tauri
cargo test
```

### 手動テスト

1. Ollamaが起動していない状態で接続確認
2. Ollamaを起動して接続確認
3. 各種ファイル（PDF、Excel、Wordなど）でタグ提案
4. モデル名変更のテスト
5. AI提案有効/無効の切り替え

## トラブルシューティング

### Ollamaが接続できない

1. Ollamaが起動しているか確認：`ps aux | grep ollama`
2. ポート11434が使用可能か確認：`lsof -i :11434`
3. ファイアウォール設定を確認

### タグが提案されない

1. モデルがダウンロードされているか確認：`ollama list`
2. ファイル内容が抽出されているか確認（ファイル詳細画面）
3. Ollamaのログを確認：`journalctl -u ollama -f`

### 提案が遅い

1. より軽量なモデルを試す（llama2-7b など）
2. タイムアウト時間を延長（コード修正が必要）
3. GPUアクセラレーションが有効か確認

## 関連ドキュメント

- [Ollama公式ドキュメント](https://github.com/ollama/ollama)
- [Llama 3.2モデル情報](https://ollama.ai/library/llama3.2)
- [CocoFile設定管理](./SETTINGS_MANAGEMENT.md)

## 変更履歴

- 2024-12-04: 初回実装完了
  - Ollama統合
  - AIタグ提案機能
  - 設定画面UI
