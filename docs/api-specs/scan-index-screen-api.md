# スキャン・インデックス管理画面（S-003）API仕様書

生成日: 2025-11-04
収集元: frontend/src/services/mock/ScanService.ts
@MOCK_TO_APIマーク数: 7

## エンドポイント一覧

### 1. スキャン開始
- **エンドポイント**: `POST /api/scan/start`
- **APIパス**: `API_PATHS.SCAN.START`
- **Request**: `{ targetFolder?: string }`
- **Response**: `ScanSession`

### 2. スキャンステータス取得
- **エンドポイント**: `GET /api/scan/status`
- **APIパス**: `API_PATHS.SCAN.STATUS`
- **Response**: `ScanSession | null`

### 3. スキャン停止
- **エンドポイント**: `POST /api/scan/stop`
- **APIパス**: `API_PATHS.SCAN.STOP`
- **Response**: `void`

### 4. インデックス統計取得
- **エンドポイント**: `GET /api/index/statistics`
- **APIパス**: `API_PATHS.INDEX.STATISTICS`
- **Response**: `IndexStatistics`

### 5. 重複ファイル取得
- **エンドポイント**: `GET /api/index/duplicates`
- **APIパス**: `API_PATHS.INDEX.DUPLICATES`
- **Response**: `DuplicateFileGroup[]`

### 6. データベースクリーンアップ
- **エンドポイント**: `POST /api/index/cleanup`
- **APIパス**: `API_PATHS.INDEX.CLEANUP`
- **Response**: `DatabaseOperationResult`

### 7. インデックス再構築
- **エンドポイント**: `POST /api/index/rebuild`
- **APIパス**: `API_PATHS.INDEX.REBUILD`
- **Response**: `DatabaseOperationResult`

## モックサービス参照
`frontend/src/services/mock/ScanService.ts`
