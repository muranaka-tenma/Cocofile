# CocoFile - Phase 11: クロスプラットフォームビルド計画

**作成日**: 2025年11月6日
**対象バージョン**: v0.1.0 → v0.1.1
**目標**: Windows/macOS対応 + Linux追加形式

---

## 🎯 Phase 11の目標

Phase 11では、Linux版のみの現状から、全主要プラットフォームに対応します。

### 達成目標

1. **Windows対応**
   - `.exe` 実行ファイル作成
   - MSIインストーラー作成
   - コード署名（オプション）

2. **macOS対応**
   - `.app` バンドル作成
   - DMGインストーラー作成
   - Gatekeeper対応（コード署名）

3. **Linux追加形式**
   - `.deb` パッケージ（Debian/Ubuntu）
   - `.AppImage` ポータブル版

4. **GitHub Actions CI/CD**
   - 自動ビルドパイプライン
   - 全プラットフォーム同時ビルド
   - リリース自動作成

---

## 📊 現状分析

### 実装済み

- ✅ Linux tar.gz（v0.1.0でリリース済み）
- ✅ Windows build guide（`docs/WINDOWS_BUILD_GUIDE.md`）
- ✅ PyInstaller spec（全プラットフォーム対応）
- ✅ Tauriアイコン（PNG、ICO、ICNS）
- ✅ クロスプラットフォーム設計（Tauri 2.0）

### 未実装

- ❌ Windows MSIインストーラー設定
- ❌ macOS DMG作成
- ❌ macOSコード署名
- ❌ Linux .deb パッケージ設定
- ❌ Linux .AppImage 設定
- ❌ GitHub Actions CI/CD
- ❌ プラットフォーム固有テスト

---

## 🗓️ Phase 11タスクリスト

### タスク1: Windows本番ビルド（優先度: 高）

**目標**: Windows版をリリース可能な状態にする

#### 1.1 Tauri設定更新
- [ ] `src-tauri/tauri.conf.json` にWindows固有設定追加
  - WiX（MSI）設定
  - アプリケーション名
  - 発行者情報
  - インストール先デフォルト

#### 1.2 Pythonバイナリ準備
- [ ] Windows版Python Analyzerビルド
  - PyInstaller on Windows実行
  - または、Linux上でクロスコンパイル（wine使用）
  - バイナリサイズ確認

#### 1.3 MSIインストーラー作成
- [ ] WiX設定ファイル作成
- [ ] スタートメニュー登録
- [ ] アンインストーラー設定
- [ ] ファイル関連付け（オプション）

#### 1.4 テスト
- [ ] Windows 10でテスト
- [ ] Windows 11でテスト
- [ ] インストール/アンインストール確認
- [ ] 全機能動作確認

**推定時間**: 2-3日

---

### タスク2: macOS本番ビルド（優先度: 高）

**目標**: macOS版をリリース可能な状態にする

#### 2.1 Tauri設定更新
- [ ] `src-tauri/tauri.conf.json` にmacOS固有設定追加
  - Bundle identifier
  - Category設定
  - 最小OSバージョン（macOS 10.15以上推奨）
  - 権限設定（ファイルアクセス）

#### 2.2 Pythonバイナリ準備
- [ ] macOS版Python Analyzerビルド
  - macOS実機でPyInstaller実行
  - または、Linux上でクロスコンパイル（難易度高）
  - x86_64とApple Siliconの両方対応（Universal Binary検討）

#### 2.3 DMGインストーラー作成
- [ ] `create-dmg` 設定
- [ ] DMGレイアウト設定
- [ ] アプリケーションフォルダへのシンボリックリンク
- [ ] 背景画像（オプション）

#### 2.4 コード署名
- [ ] Apple Developer登録（必須）
  - 年間$99（個人）または$299（組織）
- [ ] 開発者証明書取得
- [ ] `codesign` で署名
- [ ] Notarization（公証）実施

#### 2.5 テスト
- [ ] macOS 11 Big Sur でテスト
- [ ] macOS 12 Monterey でテスト
- [ ] macOS 13 Ventura でテスト
- [ ] macOS 14 Sonoma でテスト
- [ ] Gatekeeper通過確認
- [ ] 全機能動作確認

**推定時間**: 3-5日（コード署名込み）

**注意**: macOSビルドは実機macまたはmacOS仮想マシンが必須

---

### タスク3: Linux追加形式（優先度: 中）

**目標**: Linuxユーザーの利便性向上

#### 3.1 .deb パッケージ作成

- [ ] Tauri設定で`.deb`を有効化
  ```json
  "bundle": {
    "targets": ["deb"]
  }
  ```
- [ ] Debian制御ファイル設定
  - パッケージ名: `cocofile`
  - 依存関係: `libc6`, `libgtk-3-0`, etc.
  - メンテナー情報
  - 説明文
- [ ] デスクトップエントリ作成
  - `/usr/share/applications/cocofile.desktop`
  - アイコン登録
  - カテゴリ設定
- [ ] テスト
  - Ubuntu 22.04
  - Ubuntu 24.04
  - Debian 12

#### 3.2 .AppImage 作成

- [ ] Tauri設定で`.AppImage`を有効化
  ```json
  "bundle": {
    "targets": ["appimage"]
  }
  ```
- [ ] AppImage設定
  - 自己完結型バイナリ
  - FUSEマウント対応
  - 依存関係バンドル
- [ ] テスト
  - 複数Linuxディストリビューション
  - ポータブル性確認

**推定時間**: 1-2日

---

### タスク4: GitHub Actions CI/CD（優先度: 中）

**目標**: リリースプロセスの自動化

#### 4.1 CI/CDパイプライン作成

- [ ] `.github/workflows/build.yml` 作成
- [ ] トリガー設定
  - タグプッシュ（`v*`）
  - 手動実行（workflow_dispatch）
- [ ] 並列ビルドジョブ
  - `build-linux`: Ubuntu runner
  - `build-windows`: Windows runner
  - `build-macos`: macOS runner

#### 4.2 ビルドジョブ設定

**Linuxジョブ**:
```yaml
- name: Install dependencies
- name: Build Python Analyzer
- name: Build Tauri
- name: Create tar.gz, .deb, .AppImage
- name: Upload artifacts
```

**Windowsジョブ**:
```yaml
- name: Install dependencies (Rust, Node.js)
- name: Build Python Analyzer (Windows)
- name: Build Tauri
- name: Create MSI
- name: Upload artifacts
```

**macOSジョブ**:
```yaml
- name: Install dependencies
- name: Build Python Analyzer (macOS)
- name: Build Tauri
- name: Sign app (if certificate available)
- name: Create DMG
- name: Upload artifacts
```

#### 4.3 リリース作成

- [ ] GitHub Release自動作成
- [ ] 全アーティファクトアップロード
- [ ] リリースノート自動生成
- [ ] Pre-release設定

**推定時間**: 2-3日

---

### タスク5: ドキュメント整備（優先度: 高）

#### 5.1 プラットフォーム別インストールガイド

- [ ] `docs/INSTALL_WINDOWS.md`
- [ ] `docs/INSTALL_MACOS.md`
- [ ] `docs/INSTALL_LINUX.md`

#### 5.2 README更新

- [ ] ダウンロードセクション更新
  - Windows MSI
  - macOS DMG
  - Linux .deb / .AppImage / tar.gz
- [ ] インストール手順更新
- [ ] システム要件更新

#### 5.3 リリースノート v0.1.1

- [ ] `docs/RELEASE_NOTES_v0.1.1.md` 作成
- [ ] 新機能: クロスプラットフォーム対応
- [ ] 既知の問題更新

**推定時間**: 1日

---

### タスク6: テスト計画（優先度: 高）

#### 6.1 プラットフォーム別テスト

**Windows**:
- [ ] Windows 10（21H2以降）
- [ ] Windows 11
- [ ] インストーラーテスト
- [ ] 機能テスト（S-001〜S-006）
- [ ] パフォーマンステスト

**macOS**:
- [ ] macOS 11 Big Sur
- [ ] macOS 12 Monterey
- [ ] macOS 13 Ventura
- [ ] macOS 14 Sonoma
- [ ] Intel Mac
- [ ] Apple Silicon Mac（M1/M2/M3）
- [ ] 機能テスト
- [ ] パフォーマンステスト

**Linux**:
- [ ] Ubuntu 22.04（.deb）
- [ ] Ubuntu 24.04（.deb）
- [ ] Debian 12（.deb）
- [ ] Fedora 39（.AppImage）
- [ ] Arch Linux（.AppImage）
- [ ] 機能テスト
- [ ] パフォーマンステスト

#### 6.2 統合テスト

- [ ] 全プラットフォームで同じデータベース形式
- [ ] 設定ファイルの互換性
- [ ] ファイル分析結果の一致
- [ ] 検索結果の一致

**推定時間**: 3-5日

---

## 📅 推奨スケジュール

### Week 1（優先度: 最高）
- **Day 1-2**: タスク1（Windows本番ビルド）
- **Day 3**: タスク3.1（Linux .deb）
- **Day 4**: タスク3.2（Linux .AppImage）
- **Day 5**: タスク5（ドキュメント整備）
- **Day 6-7**: タスク6.1（Windows/Linuxテスト）

### Week 2（優先度: 高）
- **Day 8-12**: タスク2（macOS本番ビルド）
  - macOS実機またはレンタル必須
- **Day 13-14**: タスク6.1（macOSテスト）

### Week 3（優先度: 中）
- **Day 15-17**: タスク4（GitHub Actions CI/CD）
- **Day 18-19**: 全プラットフォーム統合テスト
- **Day 20**: v0.1.1リリース準備
- **Day 21**: v0.1.1リリース

**総推定時間**: 2-3週間

---

## 🛠️ 技術的な検討事項

### 1. Pythonバイナリのクロスコンパイル

**問題**: Linux上でWindows/macOSバイナリをビルドできるか？

**選択肢**:
1. **各プラットフォームで個別ビルド**（推奨）
   - Windows実機でWindowsバイナリ作成
   - macOS実機でmacOSバイナリ作成
   - Linux実機でLinuxバイナリ作成

2. **Wine/Crossoverでクロスコンパイル**
   - WindowsバイナリはLinux上でWine経由でビルド可能
   - macOSバイナリはクロスコンパイル不可（実機必須）

3. **GitHub Actions利用**（最適）
   - 各プラットフォームのランナーでビルド
   - macOS実機不要（GitHub提供）

**推奨**: GitHub Actions利用（タスク4優先）

---

### 2. macOSコード署名

**問題**: Apple Developer登録が必須（年間$99）

**選択肢**:
1. **正式に署名**
   - Apple Developer登録
   - 証明書取得
   - Notarization実施
   - Gatekeeper通過

2. **未署名で配布**
   - 「開発元が未確認」警告
   - ユーザーが「開く」で起動可能
   - セキュリティ警告が出る

**推奨**:
- **Phase 11**: 未署名で配布（Alpha版のため）
- **Phase 12以降**: 正式署名（Beta版で実施）

---

### 3. バイナリサイズ最適化

**現状**:
- Linux tar.gz: 41MB
- Windows予測: 45-50MB
- macOS予測: 50-60MB（Universal Binaryの場合70-80MB）

**最適化手法**:
- [ ] UPX圧縮（Pythonバイナリ）
- [ ] 不要依存関係削除
- [ ] Rust `strip` 有効化
- [ ] macOS: x86_64のみ配布（Apple Siliconは後で対応）

---

### 4. Linux依存関係

**問題**: `.deb`/.AppImageでシステム依存関係が必要

**必須依存関係**:
- `libc6` (>= 2.31)
- `libgtk-3-0` (>= 3.24)
- `libwebkit2gtk-4.0-37` (>= 2.32)
- `libsqlite3-0` (>= 3.35)

**対策**:
- `.deb`: Debian制御ファイルで依存関係明記
- `.AppImage`: 可能な限りバンドル

---

## 🚫 Phase 11で実施しないこと

以下は、Phase 12以降で対応:

1. **自動更新機能** - v0.2.0で実装
2. **macOS Apple Silicon Universal Binary** - v0.2.0で実装
3. **Windows ARM64対応** - v0.3.0で検討
4. **Snap/Flatpakパッケージ** - v0.2.0で検討
5. **クラウド同期機能** - v0.3.0以降

---

## 📊 成功基準

Phase 11は以下を満たしたら完了:

### 必須
- [x] Windows MSIインストーラー作成 + テスト合格
- [x] macOS DMG作成 + テスト合格
- [x] Linux .deb/.AppImage作成 + テスト合格
- [x] 全プラットフォームで機能テスト合格
- [x] ドキュメント整備完了
- [x] v0.1.1リリース

### 推奨（オプション）
- [ ] GitHub Actions CI/CD完成
- [ ] macOSコード署名
- [ ] パフォーマンス実測（全プラットフォーム）

---

## 🔗 関連ドキュメント

### 既存ドキュメント
- [WINDOWS_BUILD_GUIDE.md](WINDOWS_BUILD_GUIDE.md) - Windowsビルド手順
- [PHASE9_TEST_REPORT.md](PHASE9_TEST_REPORT.md) - Linuxテスト結果
- [RELEASE_NOTES_v0.1.0.md](RELEASE_NOTES_v0.1.0.md) - v0.1.0リリースノート

### 作成予定ドキュメント
- `INSTALL_WINDOWS.md` - Windowsインストールガイド
- `INSTALL_MACOS.md` - macOSインストールガイド
- `INSTALL_LINUX.md` - Linuxインストールガイド
- `PHASE11_COMPLETION_SUMMARY.md` - Phase 11完了サマリー
- `RELEASE_NOTES_v0.1.1.md` - v0.1.1リリースノート

---

## 💡 次のステップ

Phase 11計画が承認されたら、以下の順序で進めます:

1. **タスク1: Windows本番ビルド**（2-3日）
2. **タスク3: Linux追加形式**（1-2日）
3. **タスク5: ドキュメント整備**（1日）
4. **タスク6: Windowsテスト**（1日）
5. **タスク2: macOS本番ビルド**（3-5日）
6. **タスク4: GitHub Actions**（2-3日）
7. **v0.1.1リリース**

---

**作成日**: 2025年11月6日
**Phase**: Phase 11（クロスプラットフォームビルド）
**推定期間**: 2-3週間
**プロジェクト**: CocoFile（ココファイル）
**愛称**: ココ

---

**Git管理オーケストレーターより**: ✅ Phase 11計画完成、次はWindows本番ビルドへ
