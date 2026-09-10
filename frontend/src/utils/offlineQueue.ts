import { submitFieldReport } from '../api/client';

export type OfflineSyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'CONFLICT_RESOLVED';

export interface QueuedFieldReport {
  id: string; // Local Queue ID e.g. QUEUED-1712345678
  idempotency_key: string; // Globally unique idempotency key e.g. IDEMP-uuid
  officer_name: string;
  department: string;
  district: string;
  location_name: string;
  latitude: number;
  longitude: number;
  incident_type: string;
  severity: string;
  description: string;
  photo_url?: string;
  sync_status: OfflineSyncStatus;
  retry_count: number;
  last_attempt_at?: string;
  next_retry_at?: string;
  queued_at: string;
  conflict_notes?: string;
}

const STORAGE_KEY = 'sih26002_offline_reports_queue';
const SYNCED_LOG_KEY = 'sih26002_synced_idempotency_keys';

export const offlineQueue = {
  getQueue: (): QueuedFieldReport[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getSyncedKeys: (): Set<string> => {
    try {
      const data = localStorage.getItem(SYNCED_LOG_KEY);
      return new Set(data ? JSON.parse(data) : []);
    } catch {
      return new Set();
    }
  },

  markKeySynced: (key: string) => {
    const keys = offlineQueue.getSyncedKeys();
    keys.add(key);
    localStorage.setItem(SYNCED_LOG_KEY, JSON.stringify(Array.from(keys)));
  },

  getQueueLength: (): number => {
    return offlineQueue.getQueue().filter((r) => r.sync_status !== 'SYNCED' && r.sync_status !== 'CONFLICT_RESOLVED').length;
  },

  enqueue: (report: Omit<QueuedFieldReport, 'id' | 'queued_at' | 'sync_status' | 'retry_count' | 'idempotency_key'>): QueuedFieldReport => {
    const queue = offlineQueue.getQueue();
    // Unique idempotency key (P1.7)
    const idKey = `IDEMP-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const localId = `QUEUED-${Date.now()}-${queue.length + 1}`;
    
    const queuedReport: QueuedFieldReport = {
      ...report,
      id: localId,
      idempotency_key: idKey,
      sync_status: 'PENDING',
      retry_count: 0,
      queued_at: new Date().toISOString(),
    };
    queue.push(queuedReport);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return queuedReport;
  },

  clearQueue: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  syncPendingReports: async (onSyncSuccess?: () => void): Promise<number> => {
    const queue = offlineQueue.getQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const syncedKeys = offlineQueue.getSyncedKeys();
    const updatedQueue: QueuedFieldReport[] = [];
    const now = Date.now();

    for (const report of queue) {
      // 1. Idempotency protection check against local synced cache
      if (syncedKeys.has(report.idempotency_key)) {
        report.sync_status = 'SYNCED';
        continue;
      }

      // 2. Exponential backoff verification
      if (report.next_retry_at && new Date(report.next_retry_at).getTime() > now) {
        // Still within backoff cooldown window, preserve in queue
        updatedQueue.push(report);
        continue;
      }

      report.sync_status = 'SYNCING';
      report.last_attempt_at = new Date().toISOString();

      try {
        // Send report with idempotency_key for server deduplication
        await submitFieldReport({
          officer_name: report.officer_name,
          department: report.department,
          district: report.district,
          location_name: report.location_name,
          latitude: report.latitude,
          longitude: report.longitude,
          incident_type: report.incident_type,
          severity: report.severity,
          description: report.description,
          photo_url: report.photo_url,
          sync_state: 'SYNCED',
          idempotency_key: report.idempotency_key,
        });

        report.sync_status = 'SYNCED';
        offlineQueue.markKeySynced(report.idempotency_key);
        syncedCount++;
      } catch (err: any) {
        report.retry_count += 1;

        // Exponential backoff formula: min(60s, 1s * 2^retry_count)
        const backoffMs = Math.min(60000, 1000 * Math.pow(2, report.retry_count));
        report.next_retry_at = new Date(Date.now() + backoffMs).toISOString();

        // Conflict handling: if duplicate key or 409 conflict detected, mark as conflict resolved
        if (err?.status === 409 || (err?.message && err.message.includes('duplicate'))) {
          report.sync_status = 'CONFLICT_RESOLVED';
          report.conflict_notes = 'Record already recorded on server; deduplicated.';
          offlineQueue.markKeySynced(report.idempotency_key);
          syncedCount++;
        } else if (report.retry_count >= 5) {
          report.sync_status = 'FAILED';
          updatedQueue.push(report);
        } else {
          report.sync_status = 'PENDING';
          updatedQueue.push(report);
        }
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQueue));
    if (syncedCount > 0 && onSyncSuccess) {
      onSyncSuccess();
    }
    return syncedCount;
  },
};
