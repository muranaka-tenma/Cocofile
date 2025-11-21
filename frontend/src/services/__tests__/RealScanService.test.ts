/**
 * Tests for RealScanService
 * Verifies that the async/await pattern correctly waits for scan completion
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RealScanService } from '../RealScanService';
import { TauriService } from '../TauriService';
import { SCAN_STATUS } from '@/types';

// Mock TauriService
vi.mock('../TauriService', () => ({
  TauriService: {
    scanDirectory: vi.fn(),
    getDatabaseStats: vi.fn(),
  },
}));

describe('RealScanService', () => {
  let scanService: RealScanService;

  beforeEach(() => {
    scanService = new RealScanService();
    vi.clearAllMocks();
  });

  it('should wait for scan completion before returning', async () => {
    // Mock scan result
    const mockResult = {
      total_files: 100,
      processed_files: 100,
      errors: [],
    };

    // Mock TauriService.scanDirectory to simulate async operation
    vi.mocked(TauriService.scanDirectory).mockImplementation(async () => {
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 100));
      return mockResult;
    });

    const startTime = Date.now();
    const session = await scanService.startScan('/tmp/test');
    const endTime = Date.now();

    // Verify that the function actually waited (took at least 100ms)
    expect(endTime - startTime).toBeGreaterThanOrEqual(100);

    // Verify that the session is marked as completed
    expect(session.status).toBe(SCAN_STATUS.COMPLETED);
    expect(session.processedFiles).toBe(100);
    expect(session.totalFiles).toBe(100);
    expect(session.progressPercent).toBe(100);
  });

  it('should not return with 0 files when scan is still in progress', async () => {
    const mockResult = {
      total_files: 50,
      processed_files: 50,
      errors: [],
    };

    vi.mocked(TauriService.scanDirectory).mockResolvedValue(mockResult);

    const session = await scanService.startScan('/tmp/test');

    // Session should have the actual file counts, not 0
    expect(session.processedFiles).toBe(50);
    expect(session.totalFiles).toBe(50);
    expect(session.progressPercent).toBe(100);
    expect(session.status).toBe(SCAN_STATUS.COMPLETED);
  });

  it('should handle scan errors properly', async () => {
    vi.mocked(TauriService.scanDirectory).mockRejectedValue(
      new Error('Scan failed')
    );

    await expect(scanService.startScan('/tmp/test')).rejects.toThrow(
      'Scan failed'
    );
  });

  it('should require targetFolder parameter', async () => {
    await expect(scanService.startScan(undefined as any)).rejects.toThrow(
      'Target folder is required'
    );
  });
});
