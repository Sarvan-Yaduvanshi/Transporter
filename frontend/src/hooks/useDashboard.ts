import { useState, useEffect, useCallback, useRef } from 'react';
import { getDashboard, type DashboardData } from '@/services/api';

const POLL_INTERVAL_MS = 15_000; // 15-second auto-refresh

interface UseDashboardState {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    /** ISO timestamp of last successful fetch */
    lastUpdated: string | null;
}

/**
 * Shared hook that fetches the unified `/api/dashboard` endpoint
 * and auto-polls every 15 s so both Desktop and Transporter dashboards
 * always show the same live data.
 */
export function useDashboard(): UseDashboardState {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const execute = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const result = await getDashboard();
            setData(result);
            setLastUpdated(new Date().toISOString());
        } catch (err: unknown) {
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
