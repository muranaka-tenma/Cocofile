# ダークモード実装ドキュメント

## 概要

CocoFileプロジェクトにダークモード機能を実装しました。ライトモード、ダークモード、システム設定の3つのテーマモードをサポートしています。

## 実装日

2025-12-04

## 技術スタック

- **Tailwind CSS**: `darkMode: 'class'` 設定を使用
- **CSS変数**: HSL形式でカラーテーマを定義
- **localStorage**: テーマ設定を永続化
- **React Hooks**: カスタムフックでテーマ管理

## ファイル構成

### 新規作成ファイル

1. **`/frontend/src/hooks/useTheme.ts`**
   - テーマ管理用カスタムフック
   - localStorage への保存/読み込み
   - システムテーマ検出
   - HTML要素への`dark`クラス適用

2. **`/frontend/src/components/ThemeToggle.tsx`**
   - テーマ切り替えUIコンポーネント
   - 2つのバリアント: `button` (サイクル型) と `select` (ドロップダウン型)
   - アイコン付き表示 (Sun/Moon/Monitor)

### 更新ファイル

1. **`/frontend/tailwind.config.js`**
   - `darkMode: 'class'` を追加
   - CSS変数ベースのカラーシステムを定義

2. **`/frontend/src/index.css`**
   - ライトモード用CSS変数 (`:root`)
   - ダークモード用CSS変数 (`.dark`)
   - WCAG AA準拠のコントラスト比を考慮

3. **`/frontend/src/App.tsx`**
   - `useTheme()` フックを追加してテーマ初期化
   - スキャン進捗表示をダークモード対応

4. **`/frontend/src/screens/SettingsScreen.tsx`**
   - テーマ設定UIを追加
   - `ThemeToggle` コンポーネント (select型) を統合

5. **`/frontend/src/screens/MainSearchScreen.tsx`**
   - 主要なUI要素をCSS変数ベースに更新
   - `bg-background`, `text-foreground` などを使用

6. **`/frontend/src/screens/ScanIndexScreen.tsx`**
   - ローディング/エラー表示をダークモード対応

7. **`/frontend/src/components/DevNavigation.tsx`**
   - 開発ナビゲーションにテーマ切り替えボタンを追加
   - ダークモード対応のスタイリング

## CSS変数一覧

### ライトモード (`:root`)

```css
--background: 0 0% 100%;          /* 白 */
--foreground: 222.2 84% 4.9%;     /* ほぼ黒 */
--primary: 221.2 83.2% 53.3%;     /* 青 */
--secondary: 210 40% 96.1%;       /* ライトグレー */
--muted: 210 40% 96.1%;           /* ミュート背景 */
--border: 214.3 31.8% 91.4%;      /* ボーダー */
--destructive: 0 84.2% 60.2%;     /* 赤 */
```

### ダークモード (`.dark`)

```css
--background: 222.2 84% 4.9%;     /* ダークブルー */
--foreground: 210 40% 98%;        /* ほぼ白 */
--primary: 217.2 91.2% 59.8%;     /* 明るい青 */
--secondary: 217.2 32.6% 17.5%;   /* ダークグレー */
--muted: 217.2 32.6% 17.5%;       /* ミュート背景 */
--border: 217.2 32.6% 17.5%;      /* ボーダー */
--destructive: 0 62.8% 30.6%;     /* ダーク赤 */
```

## 使用方法

### テーマの取得と設定

```typescript
import { useTheme } from '@/hooks/useTheme';

function MyComponent() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  return (
    <div>
      <p>現在のテーマ: {theme}</p>
      <p>実効テーマ: {effectiveTheme}</p>
      <button onClick={() => setTheme('dark')}>ダークモード</button>
      <button onClick={() => setTheme('light')}>ライトモード</button>
      <button onClick={() => setTheme('system')}>システム設定</button>
    </div>
  );
}
```

### UIコンポーネントでのテーマ切り替え

```typescript
import { ThemeToggle } from '@/components/ThemeToggle';

// ボタン型 (サイクル切り替え)
<ThemeToggle variant="button" />

// セレクト型 (ドロップダウン)
<ThemeToggle variant="select" />
```

### Tailwindクラスでのダークモード対応

```tsx
// CSS変数ベース (推奨)
<div className="bg-background text-foreground border border-border">
  <h1 className="text-primary">タイトル</h1>
  <p className="text-muted-foreground">説明文</p>
</div>

// 直接指定 (必要な場合のみ)
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  コンテンツ
</div>
```

## テーマモード

### 1. ライトモード (`light`)
- 明るい背景色
- 高コントラストの文字色
- デフォルトの配色

### 2. ダークモード (`dark`)
- 暗い背景色
- 目に優しい明るめの文字色
- 省電力効果 (OLED画面)

### 3. システム設定 (`system`)
- OSのダークモード設定に自動追従
- `prefers-color-scheme` メディアクエリを使用
- リアルタイムで変更を検知

## アクセシビリティ

### コントラスト比

- WCAG AA準拠 (4.5:1 以上)
- 主要な文字要素で十分なコントラストを確保
- `text-muted-foreground` でも最低限の可読性を維持

### キーボード操作

- テーマ切り替えボタンはフォーカス可能
- キーボードのみで操作可能

## パフォーマンス

### 最適化ポイント

1. **localStorage使用**: テーマ設定を永続化し、リロード時も保持
2. **CSS変数**: JavaScriptでのスタイル計算を最小化
3. **クラスベース切り替え**: Tailwindの`dark:`プレフィックスで効率的な切り替え
4. **メディアクエリリスナー**: システム設定変更を検知して自動更新

## 今後の改善案

### Phase 2

- [ ] スムーズなトランジション効果の追加
- [ ] カスタムカラーテーマのサポート
- [ ] テーマプリセット機能 (ハイコントラスト、セピアなど)
- [ ] 全画面のダークモード対応完了
  - TagManagementScreen
  - FileOrganizationScreen
  - モーダル/ダイアログコンポーネント
  - プレビューコンポーネント

### Phase 3

- [ ] システムトレイアイコンでのテーマ切り替え
- [ ] 時刻ベースの自動切り替え (日の出/日の入り)
- [ ] カスタムCSS変数のエクスポート/インポート

## トラブルシューティング

### テーマが適用されない

1. `tailwind.config.js` に `darkMode: 'class'` が設定されているか確認
2. `index.css` にCSS変数が定義されているか確認
3. ブラウザのlocalStorageをクリアして再試行

### システム設定が反映されない

1. OSのダークモード設定を確認
2. ブラウザが `prefers-color-scheme` をサポートしているか確認
3. `useTheme` フックが正しくマウントされているか確認

### スタイルが崩れる

1. 既存のハードコードされた色指定 (`bg-white`, `text-gray-900` など) を確認
2. CSS変数ベースのクラス (`bg-background`, `text-foreground` など) に置き換え
3. カスタムCSSで `!important` を使用していないか確認

## 参考リンク

- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [WCAG 2.1 Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [MDN: prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

## 更新履歴

- **2025-12-04**: 初回実装完了
  - 基本的なダークモード機能
  - 3つのテーマモード (light/dark/system)
  - 設定画面へのUI統合
  - 主要画面のダークモード対応

---

**実装者**: Claude (Anthropic)
**レビュー**: 未実施
**バージョン**: v1.0.0
