import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { dataSyncService } from '@/services/dataSyncService';
import { logger } from '@/lib/logger';

interface AutoSyncOptions {
  enabled?: boolean;
  syncIntervalMs?: number;  // How often to sync StarStore data (default: 5 minutes)
  emailSyncIntervalMs?: number;  // How often to sync ambassador emails (default: 30 minutes)
}

export const useAutoSync = (options: AutoSyncOptions = {}) => {
  const {
    enabled = true,
    syncIntervalMs = 5 * 60 * 1000,  // 5 minutes
    emailSyncIntervalMs = 30 * 60 * 1000,  // 30 minutes
  } = options;

  const queryClient = useQueryClient();
  const dataSyncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const emailSyncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastDataSyncRef = useRef<Date | null>(null);
  const lastEmailSyncRef = useRef<Date | null>(null);

  // Sync StarStore data
  const syncStarStoreData = useCallback(async () => {
    try {
      logger.info('Auto-sync: Starting StarStore data sync');
      const result = await dataSyncService.syncAllData();
      lastDataSyncRef.current = new Date();
      
      if (result.success) {
        logger.info('Auto-sync: StarStore data synced successfully', { 
          synced: result.synced 
        });
        
        // Invalidate relevant queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['starstore-users'] });
        queryClient.invalidateQueries({ queryKey: ['starstore-referrals'] });
        queryClient.invalidateQueries({ queryKey: ['starstore-transactions'] });
        queryClient.invalidateQueries({ queryKey: ['starstore-analytics'] });
      } else {
        logger.warn('Auto-sync: StarStore sync completed with errors', { 
          errors: result.errors 
        });
      }
      
      return result;
    } catch (error) {
      logger.error('Auto-sync: StarStore data sync failed', {}, error as Error);
      return null;
    }
  }, [queryClient]);

  // Sync ambassador emails from StarStore
  const syncAmbassadorEmails = useCallback(async () => {
    try {
      logger.info('Auto-sync: Starting ambassador email sync');
      
      const { data, error } = await supabase.functions.invoke('sync-ambassador-emails', {
        method: 'POST',
      });
      
      lastEmailSyncRef.current = new Date();
      
      if (error) {
        logger.error('Auto-sync: Ambassador email sync failed', { error: error.message });
        return null;
      }
      
      logger.info('Auto-sync: Ambassador emails synced successfully', { 
        syncedCount: data?.syncedCount,
        errorCount: data?.errorCount 
      });
      
      // Invalidate email queries
      queryClient.invalidateQueries({ queryKey: ['ambassador-emails'] });
      
      return data;
    } catch (error) {
      logger.error('Auto-sync: Ambassador email sync failed', {}, error as Error);
      return null;
    }
  }, [queryClient]);

  // Start auto-sync timers
  const startAutoSync = useCallback(() => {
    if (!enabled) return;

    // Clear existing timers
    if (dataSyncTimerRef.current) {
      clearInterval(dataSyncTimerRef.current);
    }
    if (emailSyncTimerRef.current) {
      clearInterval(emailSyncTimerRef.current);
    }

    // Run initial sync
    syncStarStoreData();
    syncAmbassadorEmails();

    // Set up recurring syncs
    dataSyncTimerRef.current = setInterval(syncStarStoreData, syncIntervalMs);
    emailSyncTimerRef.current = setInterval(syncAmbassadorEmails, emailSyncIntervalMs);

    logger.info('Auto-sync: Started', {
      dataSyncInterval: `${syncIntervalMs / 1000}s`,
      emailSyncInterval: `${emailSyncIntervalMs / 1000}s`
    });
  }, [enabled, syncIntervalMs, emailSyncIntervalMs, syncStarStoreData, syncAmbassadorEmails]);

  // Stop auto-sync timers
  const stopAutoSync = useCallback(() => {
    if (dataSyncTimerRef.current) {
      clearInterval(dataSyncTimerRef.current);
      dataSyncTimerRef.current = null;
    }
    if (emailSyncTimerRef.current) {
      clearInterval(emailSyncTimerRef.current);
      emailSyncTimerRef.current = null;
    }
    logger.info('Auto-sync: Stopped');
  }, []);

  // Start auto-sync on mount, stop on unmount
  useEffect(() => {
    if (enabled) {
      startAutoSync();
    }
    
    return () => {
      stopAutoSync();
    };
  }, [enabled, startAutoSync, stopAutoSync]);

  return {
    syncStarStoreData,
    syncAmbassadorEmails,
    startAutoSync,
    stopAutoSync,
    lastDataSync: lastDataSyncRef.current,
    lastEmailSync: lastEmailSyncRef.current,
  };
};
