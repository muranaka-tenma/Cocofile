# CocoFile UI/UX改善ドキュメント

このドキュメントは、CocoFileプロジェクトのUI/UX改善について記述しています。

## 実装された改善

### 1. トースト通知システム

**場所**: `/src/components/ui/toast.tsx`, `/src/store/toastStore.ts`

**機能**:
- 4種類の通知タイプ（success, error, warning, info）
- 自動消去とスタック表示
- アクション付き通知のサポート
- アクセシビリティ対応（aria-live, aria-label）

**使用例**:
```typescript
import { toast } from "@/store/toastStore";

// 成功通知
toast.success("保存完了", "設定を保存しました");

// エラー通知
toast.error("保存失敗", "設定の保存に失敗しました");

// 警告通知
toast.warning("注意", "この操作は取り消せません");

// 情報通知
toast.info("お知らせ", "新しいバージョンが利用可能です");

// カスタム通知（アクション付き）
useToastStore.getState().addToast(
  "info",
  "更新が必要です",
  "新しいバージョンをインストールしますか？",
  {
    action: {
      label: "インストール",
      onClick: () => console.log("Installing..."),
    },
    duration: 10000, // 10秒
  }
);
```

### 2. アニメーション

**場所**: `/frontend/tailwind.config.js`

**実装されたアニメーション**:
- `animate-slide-in-right`: 右からスライドイン
- `animate-slide-out-right`: 右へスライドアウト
- `animate-fade-in`: フェードイン
- `animate-fade-out`: フェードアウト
- `animate-scale-in`: スケールインアニメーション
- `animate-scale-out`: スケールアウトアニメーション
- `animate-shimmer`: シマーエフェクト（ローディング用）

**使用例**:
```tsx
<div className="animate-fade-in">
  フェードインするコンテンツ
</div>

<button className="hover:scale-105 active:scale-95 transition-all">
  ボタン
</button>
```

### 3. ファイルタイプ別アイコン

**場所**: `/src/utils/fileIcons.tsx`

**機能**:
- 拡張子ベースのファイルタイプ判定
- カラフルなアイコン表示
- 背景付きアイコンコンポーネント

**対応ファイルタイプ**:
- ドキュメント: PDF, Excel, Word, PowerPoint
- 画像: JPG, PNG, GIF, SVG, WebP
- ビデオ: MP4, AVI, MKV, MOV
- オーディオ: MP3, WAV, FLAC, AAC
- アーカイブ: ZIP, RAR, 7Z, TAR
- コード: JS, TS, Python, Java, C++など
- その他: JSON, テキストファイル

**使用例**:
```tsx
import { FileIcon, FileIconWithBg, getFileType } from "@/utils/fileIcons";

// アイコンのみ
<FileIcon filename="document.pdf" className="h-6 w-6" />

// 背景付きアイコン
<FileIconWithBg filename="spreadsheet.xlsx" className="h-12 w-12" />

// ファイルタイプの取得
const fileType = getFileType("image.png"); // "image"
```

### 4. スケルトンローディング

**場所**: `/src/components/ui/skeleton.tsx`

**機能**:
- シマーエフェクト付きローディング表示
- カスタマイズ可能なスケルトンコンポーネント
- ファイルリスト用プリセット

**使用例**:
```tsx
import { Skeleton, SkeletonFileList, SkeletonCard } from "@/components/ui/skeleton";

// 基本的なスケルトン
<Skeleton className="h-4 w-full" />

// ファイルリスト用スケルトン（5件表示）
<SkeletonFileList count={5} />

// カード用スケルトン
<SkeletonCard />
```

### 5. レスポンシブサイドバー

**場所**: `/src/components/ResponsiveSidebar.tsx`

**機能**:
- モバイル対応（ハンバーガーメニュー）
- デスクトップでの折りたたみ機能
- キーボードナビゲーション（ESCキーで閉じる）
- アクセシビリティ対応

**使用例**:
```tsx
import { ResponsiveSidebar } from "@/components/ResponsiveSidebar";

function Layout() {
  return (
    <div className="flex">
      <ResponsiveSidebar />
      <main className="flex-1">
        {/* メインコンテンツ */}
      </main>
    </div>
  );
}
```

### 6. ボタンのホバーエフェクト

**場所**: `/src/components/ui/button.tsx`

**改善点**:
- スムーズなトランジション（200ms）
- ホバー時の影の表示
- アクティブ時のスケール変更（95%）
- フォーカス状態の視覚的フィードバック

**バリアント**:
- `default`: プライマリーカラー（影付き）
- `outline`: アウトラインスタイル
- `ghost`: 背景なし
- `destructive`: 危険なアクション用
- `secondary`: セカンダリーカラー

**使用例**:
```tsx
<Button variant="default">保存</Button>
<Button variant="outline">キャンセル</Button>
<Button variant="destructive">削除</Button>
<Button variant="ghost">閉じる</Button>
```

## アクセシビリティの改善

### キーボードナビゲーション
- すべてのインタラクティブ要素に`tabIndex`を設定
- `Enter`と`Space`キーでボタンをアクティブ化
- `ESC`キーでモーダル・ダイアログを閉じる

### スクリーンリーダー対応
- 適切な`aria-label`と`aria-describedby`の使用
- `role`属性の適切な設定
- `aria-live`を使用した動的コンテンツの通知

### フォーカス管理
- すべてのインタラクティブ要素に視覚的なフォーカスインジケーター
- フォーカスリングの表示（`focus:ring-2`）
- ロジカルなタブオーダー

## パフォーマンス最適化

### アニメーション
- CSS transitionsとanimationsを使用（JavaScriptアニメーションなし）
- GPU加速の活用（transform、opacity）
- 適切なアニメーション時間（200-300ms）

### コンポーネントのメモ化
- `React.memo`を使用した不要な再レンダリングの防止
- `useCallback`でのイベントハンドラーのメモ化

### 仮想化
- 50件以上の検索結果には`react-window`を使用
- スムーズなスクロールパフォーマンス

## カスタマイズ方法

### テーマカラーの変更
`/frontend/tailwind.config.js`のカラー定義を変更してください。

### アニメーション速度の調整
`/frontend/tailwind.config.js`の`keyframes`と`animation`を変更してください。

### トースト表示時間の変更
デフォルトは5秒ですが、個別に設定できます：
```typescript
useToastStore.getState().addToast(
  "success",
  "タイトル",
  "説明",
  { duration: 10000 } // 10秒
);
```

## 今後の改善予定

- [ ] ダークモードの完全対応
- [ ] より多くのアニメーションパターン
- [ ] カスタムテーマの作成機能
- [ ] アクセシビリティの継続的改善
- [ ] パフォーマンス監視ツールの導入

## トラブルシューティング

### トースト通知が表示されない
- `App.tsx`に`<ToastContainer>`が追加されているか確認
- `useToastStore`が正しくインポートされているか確認

### アニメーションが動作しない
- `tailwind.config.js`に設定が追加されているか確認
- CSSがビルドされているか確認（`npm run dev`を再起動）

### アイコンが表示されない
- `lucide-react`がインストールされているか確認: `npm install lucide-react`
- インポートパスが正しいか確認

## 参考リソース

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [React Window Documentation](https://react-window.vercel.app/)
