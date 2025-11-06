// CocoFile - Type Definitions
// Single source of truth for all TypeScript types

// ============================================================================
// File Type Enums
// ============================================================================

export const FILE_TYPES = {
  PDF: 'pdf',
  EXCEL: 'excel',
  WORD: 'word',
  POWERPOINT: 'powerpoint',
} as const;

export type FileType = typeof FILE_TYPES[keyof typeof FILE_TYPES];

// ============================================================================
// Tab Types
// ============================================================================

export const TAB_TYPES = {
  SEARCH_RESULTS: 'search_results',
  FAVORITES: 'favorites',
  RECENT: 'recent',
} as const;

export type TabType = typeof TAB_TYPES[keyof typeof TAB_TYPES];

// ============================================================================
// Filter Types
// ============================================================================

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchFilters {
  tags: string[];
  dateRange: DateRangeFilter;
  fileTypes: FileType[];
}

// ============================================================================
// Tag
// ============================================================================

export interface Tag {
  name: string;
  color?: string;
  useCount: number;
  description?: string;
  createdAt: Date;
  lastUsedAt: Date;
}

// ============================================================================
// File Metadata
// ============================================================================

export interface FileMetadata {
  // Basic information
  fileName: string;
  filePath: string;
  fileType: FileType;
  fileSize: number;
  hashValue: string;

  // Extracted content
  extractedText: string;
  extractedKeywords: string[];

  // User-added information
  tags: string[];
  memo?: string;
  isFavorite: boolean;
  customName?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
  indexedAt: Date;
  lastIndexUpdatedAt: Date;

  // Thumbnail (optional)
  thumbnail?: string;
}

// ============================================================================
// Search Query
// ============================================================================

export interface SearchQuery {
  sessionId: string;
  keyword?: string;
  filters: SearchFilters;
  executedAt: Date;
  resultCount: number;
}

// ============================================================================
// Search Result
// ============================================================================

export interface SearchResult {
  filePath: string;
  fileName: string;
  fileType: FileType;
  fileSize: number;
  thumbnail?: string;
  relevanceScore: number;
  frequencyScore: number;
  lastAccessedAt: Date;
  metadata: FileMetadata;
}

// ============================================================================
// UI State Types
// ============================================================================

export interface SearchBoxState {
  keyword: string;
  isSearching: boolean;
}

export interface FilterState {
  selectedTags: string[];
  dateRange: DateRangeFilter;
  selectedFileTypes: FileType[];
}

export interface TabState {
  activeTab: TabType;
}

// ============================================================================
// Settings Types
// ============================================================================

export const SCAN_TIMING_TYPES = {
  REALTIME: 'realtime',
  IDLE: 'idle',
  MANUAL: 'manual',
} as const;

export type ScanTimingType = typeof SCAN_TIMING_TYPES[keyof typeof SCAN_TIMING_TYPES];

export interface AppSettings {
  // Monitoring settings
  watchedFolders: string[];
  excludedFolders: string[];
  excludedExtensions: string[];
  scanTiming: ScanTimingType;

  // UI settings
  hotkey: string;
  windowPosition: {
    x: number;
    y: number;
  };
  autoHide: boolean;
  theme: 'light' | 'dark';

  // Tag settings
  defaultTags: string[];
  tagColors: Record<string, string>;

  // Metadata
  lastUpdatedAt: Date;
}

// Settings Screen specific types (S-002)
export interface SettingsFormData {
  watchedFolders: string[];
  excludedFolders: string[];
  excludedExtensions: string[];
  scanTiming: ScanTimingType;
  hotkey: string;
  autoHide: boolean;
  defaultTags: string[];
}

// API Response types for Settings
export interface SettingsResponse {
  success: boolean;
  data?: AppSettings;
  error?: string;
}

export interface SaveSettingsRequest {
  settings: Partial<AppSettings>;
}

export interface SaveSettingsResponse {
  success: boolean;
  error?: string;
}

// ============================================================================
// Scan Progress
// ============================================================================

export interface ScanProgress {
  sessionId: string;
  targetFolder: string;
  processedFiles: number;
  totalFiles: number;
  progressPercent: number;
  currentFile: string;
  startedAt: Date;
  elapsedTime: number;
  estimatedTimeRemaining: number;
}

// ============================================================================
// Index Statistics
// ============================================================================

export interface FileTypeBreakdown {
  fileType: FileType;
  count: number;
  totalSize: number;
}

export interface IndexStatistics {
  totalFiles: number;
  totalSize: number;
  databaseSize: number;
  fileTypeBreakdown: FileTypeBreakdown[];
  lastUpdatedAt: Date;
  lastScannedAt: Date;
}

// ============================================================================
// Duplicate Group
// ============================================================================

export interface DuplicateGroup {
  groupId: string;
  hashValue: string;
  fileCount: number;
  files: FileMetadata[];
}

// ============================================================================
// Scan History
// ============================================================================

export interface ScanHistory {
  sessionId: string;
  scannedAt: Date;
  targetFolder: string;
  processedFiles: number;
  duration: number;
}

// ============================================================================
// File Detail Modal (S-005)
// ============================================================================

export interface FileDetailModalState {
  isOpen: boolean;
  fileMetadata: FileMetadata | null;
}

export interface FileDetailFormData {
  tags: string[];
  memo: string;
  isFavorite: boolean;
}

// ============================================================================
// Tag Management Types (S-004)
// ============================================================================

export const TAG_SORT_ORDER = {
  USAGE: 'usage',
  NAME: 'name',
  CREATED: 'created',
} as const;

export type TagSortOrder = typeof TAG_SORT_ORDER[keyof typeof TAG_SORT_ORDER];

export interface TagStatistics {
  totalTags: number;
  usedTags: number;
  unusedTags: number;
}

export interface TagManagementItem {
  id: string;
  name: string;
  color: string;
  useCount: number;
  createdAt: Date;
  lastUsedAt: Date | null;
  selected?: boolean;
}

export interface TagMergeRequest {
  sourceTagIds: string[];
  targetTagName: string;
  targetTagColor?: string;
}

export interface TagUpdateRequest {
  id: string;
  name?: string;
  color?: string;
}

export interface TagDeleteRequest {
  id: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// API Paths
// ============================================================================

export const API_PATHS = {
  TAGS: {
    LIST: '/api/tags',
    DETAIL: (id: string) => `/api/tags/${id}`,
    CREATE: '/api/tags',
    UPDATE: (id: string) => `/api/tags/${id}`,
    DELETE: (id: string) => `/api/tags/${id}`,
    MERGE: '/api/tags/merge',
    DELETE_UNUSED: '/api/tags/unused',
    STATISTICS: '/api/tags/statistics',
  },
  SCAN: {
    START: '/api/scan/start',
    STATUS: '/api/scan/status',
    STOP: '/api/scan/stop',
  },
  INDEX: {
    STATISTICS: '/api/index/statistics',
    DUPLICATES: '/api/index/duplicates',
    CLEANUP: '/api/index/cleanup',
    REBUILD: '/api/index/rebuild',
  },
} as const;

// ============================================================================
// Scan Status Types (S-003)
// ============================================================================

export const SCAN_STATUS = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

export type ScanStatus = typeof SCAN_STATUS[keyof typeof SCAN_STATUS];

// ============================================================================
// Duplicate File Types (S-003)
// ============================================================================

export interface DuplicateFile {
  filePath: string;
  fileSize: number;
  fileName: string;
}

export interface DuplicateFileGroup {
  groupId: string;
  fileName: string;
  fileSize: number;
  hashValue: string;
  files: DuplicateFile[];
}

// ============================================================================
// Scan Session (S-003)
// ============================================================================

export interface ScanSession {
  sessionId: string;
  status: ScanStatus;
  targetFolder: string;
  currentFile: string;
  processedFiles: number;
  totalFiles: number;
  progressPercent: number;
  startedAt: Date;
  estimatedTimeRemaining: number; // in seconds
  elapsedTime: number; // in seconds
  errorMessage?: string;
}

// ============================================================================
// Database Operation Result (S-003)
// ============================================================================

export interface DatabaseOperationResult {
  success: boolean;
  message: string;
  deletedCount?: number;
  error?: string;
}

// ============================================================================
// File Organization Types (S-006) - Phase 7
// ============================================================================

export interface OrganizationSuggestion {
  filePath: string;
  fileName: string;
  currentLocation: string;
  suggestedDestination: string;
  reason: string;
  confidence: number; // 0.0 - 1.0
  ruleId?: string;
}

export interface FileMove {
  source: string;
  destination: string;
}

export interface BatchMoveResult {
  successCount: number;
  failedCount: number;
  errors: string[];
}

export interface OrganizationRule {
  id: string;
  name: string;
  conditions: string; // JSON string
  destination: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MoveHistoryEntry {
  id: number;
  originalPath: string;
  destinationPath: string;
  movedAt: string;
  ruleId?: string;
  userConfirmed: boolean;
}

export type CloudProvider = 'OneDrive' | 'GoogleDrive' | 'Dropbox';
export type SyncStatus = 'Synced' | 'Syncing' | 'OnlineOnly' | 'Unknown';

export interface CloudFileStatus {
  isCloudFile: boolean;
  provider?: CloudProvider;
  syncStatus: SyncStatus;
  localPath: string;
  cloudPath?: string;
}

export interface OrganizationSummary {
  needsOrganization: number;
  suggested: number;
  completed: number;
}
