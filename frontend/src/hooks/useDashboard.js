import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboard } from '@/services/api';

const POLL_INTERVAL_MS = 15_000; // 15-second auto-refresh










/**
 * Shared hook that fetches the unified `/api/dashboard` endpoint
 * and auto-polls every 15 s so both Desktop and Transporter dashboards
 * always show the same live data.
 */
export function useDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const execute = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await getDashboard();
      setData(result);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial fetch */
  useEffect(() => {
    execute();
  }, [execute]);

  /* Auto-poll: silent fetches that don't flash the loading state */
  useEffect(() => {
    intervalRef.current = setInterval(() => execute(true), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [execute]);

  return { data, loading, error, refetch: () => execute(), lastUpdated };
}