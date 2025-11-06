# 設定画面（S-002）API仕様書

生成日: 2025-11-04
収集元: frontend/src/services/mock/SettingsService.ts
@MOCK_TO_APIマーク数: 12

## エンドポイント一覧

### 1. 設定取得
- **エンドポイント**: `GET /api/settings`
- **Response**: `AppSettings`

### 2. 設定保存
- **エンドポイント**: `PUT /api/settings`
- **Request**: `AppSettings`
- **Response**: `SaveSettingsResponse`

### 3. 監視フォルダ追加
- **エンドポイント**: `POST /api/settings/watched-folders`
- **Request**: `{ folderPath: string }`
- **Response**: `AppSettings`

### 4. 監視フォルダ削除
- **エンドポイント**: `DELETE /api/settings/watched-folders`
- **Request**: `{ folderPath: string }`
- **Response**: `AppSettings`

### 5. 除外フォルダ追加
- **エンドポイント**: `POST /api/settings/excluded-folders`
- **Request**: `{ folderPath: string }`
- **Response**: `AppSettings`

### 6. 除外フォルダ削除
- **エンドポイント**: `DELETE /api/settings/excluded-folders`
- **Request**: `{ folderPath: string }`
- **Response**: `AppSettings`

### 7. 除外拡張子追加
- **エンドポイント**: `POST /api/settings/excluded-extensions`
- **Request**: `{ extension: string }`
- **Response**: `AppSettings`

### 8. 除外拡張子削除
- **エンドポイント**: `DELETE /api/settings/excluded-extensions`
- **Request**: `{ extension: string }`
- **Response**: `AppSettings`

### 9. デフォルトタグ追加
- **エンドポイント**: `POST /api/settings/default-tags`
- **Request**: `{ tag: string }`
- **Response**: `AppSettings`

### 10. デフォルトタグ削除
- **エンドポイント**: `DELETE /api/settings/default-tags`
- **Request**: `{ tag: string }`
- **Response**: `AppSettings`

### 11. スキャンタイミング更新
- **エンドポイント**: `PUT /api/settings/scan-timing`
- **Request**: `{ scanTiming: ScanTimingType }`
- **Response**: `AppSettings`

### 12. 自動収納設定更新
- **エンドポイント**: `PUT /api/settings/auto-hide`
- **Request**: `{ autoHide: boolean }`
- **Response**: `AppSettings`

## モックサービス参照
`frontend/src/services/mock/SettingsService.ts`
