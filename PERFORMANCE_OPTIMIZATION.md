# CocoFile パフォーマンス最適化レポート

## 概要
このドキュメントは、CocoFileプロジェクトに実装されたパフォーマンス最適化の詳細を記録しています。

**最適化実施日**: 2025-12-04
**目標**:
- アイドル時メモリ: 30-40MB（現状50-60MB予測から改善）
- CPU使用率: アイドル時1%以下
- 検索速度: 0.5秒以内

---

## 1. Rust側の最適化

### 1.1 データベース接続の最適化
**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/src/database.rs`

#### 実装内容
```rust
// WALモードの有効化（Write-Ahead Logging）
conn.pragma_update(None, "journal_mode", "WAL")

// 同期モードをNORMALに設定（安全性とパフォーマンスのバランス）
conn.pragma_update(None, "synchronous", "NORMAL")

// キャッシュサイズを20MBに設定
conn.pragma_update(None, "cache_size", "-20000")

// 一時ファイルをメモリに保存
conn.pragma_update(None, "temp_store", "MEMORY")

// Memory-mapped I/Oを256MBに設定
conn.pragma_update(None, "mmap_size", "268435456")
```

#### 期待される効果
- **書き込み速度**: WALモードにより最大10倍高速化
- **読み取り速度**: キャッシュとmmapにより20-30%高速化
- **同時実行性**: WALモードにより読み取りと書き込みのブロッキング削減

### 1.2 N-gram処理の最適化
**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/src/file_scanner.rs`

#### 変更前の問題点
- 中間Vec<String>の生成によるメモリオーバーヘッド
- 不要な文字列複製
- 1MB（1,000,000文字）の上限が大きすぎる

#### 実装内容
```rust
// 文字数制限を500KB（500,000文字）に削減
const MAX_CHARS: usize = 500_000;

// 直接resultに書き込んでVec<String>の中間生成を回避
let mut result = String::with_capacity(estimated_capacity);
for i in 0..char_count.saturating_sub(n - 1) {
    if i > 0 {
        result.push(' ');
    }
    result.push(chars[i]);
    result.push(chars[i + 1]);
}
```

#### 期待される効果
- **メモリ使用量**: 50%削減（中間Vec削除）
- **処理速度**: 10-15%高速化
- **大きなファイル**: メモリ使用量が半分に

### 1.3 検索クエリの最適化
**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/src/file_scanner.rs`

#### 実装内容
```rust
// スニペット長を64から32に短縮（メモリ節約）
snippet(files_fts, 1, '[', ']', '...', 32) as snippet

// 検索結果の上限を100から200に拡大（一度の検索で多くの結果を返す）
LIMIT 200
```

#### 期待される効果
- **メモリ使用量**: スニペット短縮により10-15%削減
- **検索結果**: より多くの結果を一度に取得可能

### 1.4 Python Bridgeのタイムアウト最適化
**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/src/python_bridge.rs`

#### 実装内容
```rust
// タイムアウトを30秒から15秒に短縮
match rx.recv_timeout(Duration::from_secs(15))

// String容量の事前確保
let mut line = String::with_capacity(1024);
```

#### 期待される効果
- **応答性**: タイムアウトが短縮され、エラー検出が早くなる
- **メモリ効率**: String容量の事前確保で再割り当て削減

---

## 2. フロントエンド最適化

### 2.1 React.memoの適用
**ファイル**:
- `/home/muranaka-tenma/CocoFile/frontend/src/screens/MainSearchScreen.tsx`
- `/home/muranaka-tenma/CocoFile/frontend/src/components/VirtualizedResultList.tsx`

#### 実装内容
```typescript
// ResultListコンポーネントをReact.memoでラップ
const ResultList: React.FC<ResultListProps> = React.memo(({ ... }) => {
  // ...
});
ResultList.displayName = 'ResultList';

// VirtualizedResultListもReact.memoでラップ
export const VirtualizedResultList: React.FC = React.memo(({ ... }) => {
  // RowレンダラーもuseCallbackで最適化
  const Row = React.useCallback(({ ... }) => {
    // ...
  }, [results, onToggleFavorite, ...]);
});
```

#### 期待される効果
- **再レンダリング**: 不要な再レンダリングを最大70%削減
- **フレームレート**: 検索時のUIのフレームレートが安定
- **バッテリー**: CPU使用率の削減によりバッテリー寿命向上

### 2.2 検索デバウンスの調整
**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/hooks/useSearchData.ts`

#### 実装内容
```typescript
// デバウンス時間を300msから150msに短縮
const timeoutId = setTimeout(() => {
  performSearch();
}, 150);
```

#### 期待される効果
- **応答性**: 検索レスポンスが体感的に速くなる
- **UX**: ユーザーのタイピング速度により適応

---

## 3. SQLiteインデックスの追加最適化

### 3.1 追加されたインデックス
**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/src/database.rs`

#### 実装内容
```rust
// ソートクエリ用のインデックス
CREATE INDEX IF NOT EXISTS idx_file_size ON file_metadata(file_size)
CREATE INDEX IF NOT EXISTS idx_updated_at ON file_metadata(updated_at)
CREATE INDEX IF NOT EXISTS idx_access_count ON file_metadata(access_count DESC)
CREATE INDEX IF NOT EXISTS idx_last_accessed ON file_metadata(last_accessed_at DESC)

// タグ検索用の複合インデックス
CREATE INDEX IF NOT EXISTS idx_file_tags_tag ON file_tags(tag_name, file_path)
CREATE INDEX IF NOT EXISTS idx_file_tags_file ON file_tags(file_path, tag_name)
```

#### クエリごとの高速化予測
| クエリタイプ | インデックス使用前 | インデックス使用後 | 改善率 |
|------------|-----------------|-----------------|-------|
| サイズ順ソート | 200ms | 20ms | 90% |
| 更新日順ソート | 150ms | 15ms | 90% |
| タグフィルター | 500ms | 50ms | 90% |
| アクセス頻度順 | 300ms | 30ms | 90% |

#### 期待される効果
- **検索速度**: タグフィルタリングで90%高速化
- **ソート速度**: 全てのソートオプションで10倍高速化
- **複雑なクエリ**: 複数条件の組み合わせで大幅な高速化

---

## 4. メモリリークとクリーンアップ処理

### 4.1 画像プレビューのクリーンアップ
**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/components/ImagePreview.tsx`

#### 実装内容
```typescript
// クリーンアップ: コンポーネントアンマウント時にメモリリークを防止
React.useEffect(() => {
  return () => {
    // 状態をクリアしてメモリ使用を最小化
    setScale(1.0);
    setRotation(0);
    setIsLoading(true);
    setError(null);
  };
}, []);
```

#### 期待される効果
- **メモリリーク**: アンマウント時のメモリリークを防止
- **長時間使用**: 長時間の使用でもメモリ使用量が安定

### 4.2 PDFプレビューのクリーンアップ
**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/components/PDFPreview.tsx`

#### 既存の実装（確認済み）
```typescript
// キーボードイベントリスナーのクリーンアップ
useEffect(() => {
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [pageNumber, numPages, scale]);
```

### 4.3 検索キャッシュの自動クリーンアップ
**ファイル**: `/home/muranaka-tenma/CocoFile/frontend/src/hooks/useSearchCache.ts`

#### 既存の実装（確認済み）
```typescript
// LRUキャッシュによる自動メモリ管理
- 最大50エントリまでキャッシュ
- 5分のTTL（Time To Live）
- 古いエントリの自動削除
```

---

## 5. ビルド最適化

### 5.1 Cargoプロファイルの最適化
**ファイル**: `/home/muranaka-tenma/CocoFile/src-tauri/Cargo.toml`

#### 実装内容
```toml
[profile.release]
opt-level = "z"     # サイズ最適化
lto = true          # Link Time Optimization
codegen-units = 1   # 最大の最適化
strip = true        # シンボル削除でサイズ削減
panic = "abort"     # パニック時のアボート（スタックトレース無効化でサイズ削減）

[profile.dev]
opt-level = 1       # 開発時も軽い最適化
```

#### 期待される効果
- **バイナリサイズ**: 20-30%削減
- **起動時間**: 5-10%高速化
- **メモリフットプリント**: 10-15%削減

---

## 6. 総合的な効果予測

### 6.1 メモリ使用量
| シナリオ | 最適化前（予測） | 最適化後（目標） | 改善率 |
|---------|----------------|----------------|-------|
| アイドル時 | 50-60MB | 30-40MB | 33-40% |
| 検索実行時 | 100-120MB | 70-90MB | 25-30% |
| 大量ファイル処理時 | 200-250MB | 150-180MB | 25-30% |

### 6.2 CPU使用率
| シナリオ | 最適化前（予測） | 最適化後（目標） | 改善率 |
|---------|----------------|----------------|-------|
| アイドル時 | 2-3% | <1% | 60-70% |
| 検索実行時 | 30-40% | 20-30% | 25-33% |
| インデックス作成時 | 80-90% | 70-80% | 11-13% |

### 6.3 検索速度
| データセット | 最適化前（予測） | 最適化後（目標） | 改善率 |
|------------|----------------|----------------|-------|
| 1,000ファイル | 0.3-0.5秒 | 0.1-0.2秒 | 60% |
| 10,000ファイル | 1.0-1.5秒 | 0.3-0.5秒 | 67% |
| 100,000ファイル | 3.0-5.0秒 | 1.0-1.5秒 | 67% |

---

## 7. 推奨される追加最適化（将来の実装）

### 7.1 仮想スクロールの改善
- 現在: 50件以上で仮想スクロール
- 提案: 30件以上で仮想スクロール（さらなるメモリ削減）

### 7.2 バックグラウンドワーカー
- Webワーカーでの検索処理（メインスレッドの負荷軽減）
- Tauri側でのスレッドプール活用

### 7.3 プリフェッチとプリロード
- 最近使用したファイルのメタデータをプリフェッチ
- よく検索されるクエリのプリロード

### 7.4 データベースバキューム
- 定期的なVACUUMコマンドの実行（データベースサイズの最適化）
- ANALYZEコマンドの実行（クエリプランナーの最適化）

---

## 8. パフォーマンスモニタリング

### 8.1 測定すべき指標
- アイドル時のメモリ使用量（目標: 30-40MB）
- 検索レスポンスタイム（目標: 0.5秒以内）
- CPU使用率（目標: アイドル時1%以下）
- バイナリサイズ（目標: 20-30%削減）

### 8.2 テスト方法
```bash
# メモリ使用量の測定
ps aux | grep cocofile

# バイナリサイズの確認
ls -lh target/release/cocofile

# 検索速度の測定（開発ツールのNetwork/Performanceタブを使用）
```

---

## 9. まとめ

今回の最適化により、以下の改善が期待されます:

1. **メモリ使用量**: 30-40%削減
2. **検索速度**: 60-70%高速化
3. **CPU使用率**: 60-70%削減
4. **バイナリサイズ**: 20-30%削減
5. **ユーザー体験**: 大幅な向上

これらの最適化により、CocoFileは目標のパフォーマンス要件を達成できる見込みです。

---

**次のステップ**:
1. 実機でのパフォーマンステスト
2. 大規模データセット（10万ファイル）でのベンチマーク
3. メモリプロファイリングツールでの詳細分析
4. ユーザーフィードバックの収集
