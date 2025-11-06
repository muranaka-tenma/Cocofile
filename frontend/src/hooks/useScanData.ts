// CocoFile - Scan Data Custom Hook
// Phase 1: Integrated with real Tauri backend API

import { useState, useEffect, useCallback } from 'react';
import { RealScanService } from '@/services/RealScanService';
import type {
  ScanSession,
  IndexStatistics,
  DuplicateFileGroup,
  DatabaseOperationResult,
} from '@/types';

const scanService = new RealScanService();

export const useScanData = () => {
  const [scanSession, setScanSession] = useState<ScanSession | null>(null);
  const [statistics, setStatistics] = useState<IndexStatistics | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateFileGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, duplicatesData, scanStatus] = await Promise.all([
        scanService.getStatistics(),
        scanService.getDuplicates(),
        scanService.getScanStatus(),
      ]);

      setStatistics(statsData);
      setDuplicates(duplicatesData);
      setScanSession(scanStatus);
      setIsScanning(scanStatus?.status === 'scanning');
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll scan status while scanning
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isScanning) {
      intervalId = setInterval(async () => {
        try {
          const status = await scanService.getScanStatus();
          setScanSession(status);

          if (status?.status !== 'scanning') {
            setIsScanning(false);
            // Refresh statistics after scan completes
            const statsData = await scanService.getStatistics();
            setStatistics(statsData);
          }
        } catch (err) {
          console.error('Failed to poll scan status:', err);
        }
      }, 1000); // Poll every second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isScanning]);

  // Initialize data on mount
  useEffect(() => {
    fetchData();

    // Cleanup on unmount
    return () => {
      scanService.destroy();
    };
  }, [fetchData]);

  // Start manual scan
  const startScan = useCallback(async (targetFolder?: string) => {
    try {
      const session = await scanService.startScan(targetFolder);
      setScanSession(session);
      setIsScanning(true);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Stop scan
  const stopScan = useCallback(async () => {
    try {
      await scanService.stopScan();
      setIsScanning(false);
      const status = await scanService.getScanStatus();
      setScanSession(status);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Cleanup database
  const cleanupDatabase = useCallback(async (): Promise<DatabaseOperationResult> => {
    try {
      const result = await scanService.cleanup();
      // Refresh statistics after cleanup
      const statsData = await scanService.getStatistics();
      setStatistics(statsData);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Rebuild database
  const rebuildDatabase = useCallback(async (): Promise<DatabaseOperationResult> => {
    try {
      const result = await scanService.rebuild();
      setIsScanning(true);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    scanSession,
    statistics,
    duplicates,
    loading,
    error,
    isScanning,
    startScan,
    stopScan,
    cleanupDatabase,
    rebuildDatabase,
    refetch: fetchData,
  };
};
