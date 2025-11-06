# タグ管理画面（S-004）API仕様書

生成日: 2025-11-04
収集元: frontend/src/services/mock/TagService.ts
@MOCK_TO_APIマーク数: 7

## エンドポイント一覧

### 1. タグ一覧取得
- **エンドポイント**: `GET /api/tags/list`
- **APIパス**: `API_PATHS.TAGS.LIST`
- **Response**: `ApiResponse<TagManagementItem[]>`

### 2. タグ統計取得
- **エンドポイント**: `GET /api/tags/statistics`
- **APIパス**: `API_PATHS.TAGS.STATISTICS`
- **Response**: `ApiResponse<TagStatistics>`

### 3. タグ作成
- **エンドポイント**: `POST /api/tags/create`
- **APIパス**: `API_PATHS.TAGS.CREATE`
- **Request**: `{ name: string; color?: string }`
- **Response**: `ApiResponse<TagManagementItem>`

### 4. タグ更新
- **エンドポイント**: `PUT /api/tags/:id`
- **APIパス**: `API_PATHS.TAGS.UPDATE(id)`
- **Request**: `TagUpdateRequest`
- **Response**: `ApiResponse<TagManagementItem>`

### 5. タグ削除
- **エンドポイント**: `DELETE /api/tags/:id`
- **APIパス**: `API_PATHS.TAGS.DELETE(id)`
- **Request**: `TagDeleteRequest`
- **Response**: `ApiResponse<void>`

### 6. タグ統合
- **エンドポイント**: `POST /api/tags/merge`
- **APIパス**: `API_PATHS.TAGS.MERGE`
- **Request**: `TagMergeRequest`
- **Response**: `ApiResponse<TagManagementItem>`

### 7. 未使用タグ削除
- **エンドポイント**: `DELETE /api/tags/unused`
- **APIパス**: `API_PATHS.TAGS.DELETE_UNUSED`
- **Response**: `ApiResponse<{ deletedCount: number }>`

## モックサービス参照
`frontend/src/services/mock/TagService.ts`
