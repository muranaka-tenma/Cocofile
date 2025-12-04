# 正規表現検索 - 使用例集

CocoFileの正規表現検索機能で使える便利なパターン集です。

---

## 基本パターン

### 1. 数字を含むファイル名

**パターン**: `\d+`

**マッチ例**:
- `report2024.pdf`
- `invoice123.xlsx`
- `file001.docx`

---

### 2. 特定の年を含むファイル

**パターン**: `2024`

**マッチ例**:
- `report_2024.pdf`
- `2024年度予算.xlsx`
- `2024-summary.docx`

---

### 3. 日付形式のファイル (YYYY-MM-DD)

**パターン**: `\d{4}-\d{2}-\d{2}`

**マッチ例**:
- `2024-12-04_report.pdf`
- `backup_2024-11-20.xlsx`
- `log-2024-10-15.txt`

---

### 4. 特定の拡張子

**パターン**: `\.pdf$`

**マッチ例**:
- `report.pdf`
- `invoice.pdf`
- `document.pdf`

**マッチしない例**:
- `report.docx`
- `invoice.xlsx`

---

## 応用パターン

### 5. 複数の拡張子

**パターン**: `\.(pdf|docx|xlsx)$`

**マッチ例**:
- `report.pdf`
- `document.docx`
- `spreadsheet.xlsx`

---

### 6. 大文字小文字を区別しない検索

**パターン**: `(?i)invoice`

**マッチ例**:
- `Invoice.pdf`
- `INVOICE.docx`
- `invoice.xlsx`
- `InVoIcE.txt`

---

### 7. 特定の会社名を含むファイル

**パターン**: `(?i)(ABC|XYZ)社`

**マッチ例**:
- `ABC社見積書.pdf`
- `xyz社契約書.docx`
- `報告書_ABC社.xlsx`

---

### 8. 年度を含むファイル

**パターン**: `\d{4}年度`

**マッチ例**:
- `2024年度予算.pdf`
- `報告書_2023年度.docx`
- `2025年度計画.xlsx`

---

### 9. ファイル名に特定の単語を含むが別の単語を含まない

**パターン**: `^(?!.*draft).*report.*$`

**マッチ例**:
- `report_final.pdf`
- `monthly_report.xlsx`

**マッチしない例**:
- `draft_report.pdf`
- `report_draft.docx`

---

### 10. 連番ファイル

**パターン**: `file_\d{3}`

**マッチ例**:
- `file_001.pdf`
- `file_042.docx`
- `file_999.xlsx`

---

## 実務でよく使うパターン

### 11. 請求書

**パターン**: `(?i)(請求書|invoice)`

**マッチ例**:
- `請求書_2024-12.pdf`
- `Invoice_Dec2024.xlsx`
- `12月請求書.docx`

---

### 12. 見積書

**パターン**: `(?i)(見積|estimate|quotation)`

**マッチ例**:
- `見積書_ABC社.pdf`
- `Estimate_20241204.xlsx`
- `Quotation_final.docx`

---

### 13. 契約書

**パターン**: `(?i)(契約書|contract|agreement)`

**マッチ例**:
- `契約書_秘密保持.pdf`
- `Contract_Employment.docx`
- `NDA_Agreement.pdf`

---

### 14. 議事録

**パターン**: `(?i)(議事録|minutes|meeting)`

**マッチ例**:
- `議事録_2024-12-04.docx`
- `Meeting_Minutes_Dec.pdf`
- `会議議事録.xlsx`

---

### 15. 報告書

**パターン**: `(?i)(報告書|report)`

**マッチ例**:
- `月次報告書_12月.pdf`
- `Annual_Report_2024.docx`
- `プロジェクト報告書.xlsx`

---

## トラブルシューティング

### エラー: "Invalid regex pattern"

**原因と対策**:

1. **閉じカッコがない**:
   - ❌ `(abc`
   - ✅ `(abc)`

2. **閉じブラケットがない**:
   - ❌ `[0-9`
   - ✅ `[0-9]`

3. **エスケープが必要**:
   - ❌ `file.pdf` (ドットは任意の1文字にマッチ)
   - ✅ `file\.pdf` (ドットをエスケープ)

4. **先行する文字がない量指定子**:
   - ❌ `*abc`
   - ✅ `.*abc`

---

## 正規表現チートシート

| パターン | 説明 | 例 |
|---------|------|-----|
| `.` | 任意の1文字 | `a.c` → `abc`, `a1c` |
| `*` | 0回以上の繰り返し | `ab*c` → `ac`, `abc`, `abbc` |
| `+` | 1回以上の繰り返し | `ab+c` → `abc`, `abbc` |
| `?` | 0回または1回 | `ab?c` → `ac`, `abc` |
| `{n}` | n回の繰り返し | `a{3}` → `aaa` |
| `{n,m}` | n回以上m回以下 | `a{2,4}` → `aa`, `aaa`, `aaaa` |
| `[abc]` | a, b, cのいずれか | `[abc]` → `a`, `b`, `c` |
| `[^abc]` | a, b, c以外 | `[^abc]` → `d`, `e`, `1` |
| `[a-z]` | aからzの範囲 | `[a-z]` → `a`, `b`, ..., `z` |
| `\d` | 数字 (0-9) | `\d` → `0`, `1`, ..., `9` |
| `\w` | 英数字とアンダースコア | `\w` → `a`, `A`, `0`, `_` |
| `\s` | 空白文字 | `\s` → スペース、タブ |
| `^` | 行の先頭 | `^abc` → 行頭の`abc` |
| `$` | 行の末尾 | `abc$` → 行末の`abc` |
| `\|` | OR条件 | `a\|b` → `a`または`b` |
| `()` | グループ化 | `(abc)+` → `abc`, `abcabc` |
| `(?i)` | 大文字小文字を区別しない | `(?i)abc` → `abc`, `ABC` |

---

## 参考資料

- [Rust regex crate documentation](https://docs.rs/regex/)
- [正規表現リファレンス](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Regular_Expressions)
- [RegExr - オンライン正規表現テスター](https://regexr.com/)

---

作成日: 2025-12-04
