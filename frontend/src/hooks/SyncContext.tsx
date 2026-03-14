import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    getDashboard, getDrivers, getPaymentPermits, getTags, getDocuments,
    type DashboardData, type Driver, type PaymentPermit, type DriverDocument,
    type PermitFull, type Permit, type ActiveLoad, type Truck, type Flag, type Mine, type Tag,
} from '@/services/api';

const POLL_MS = 12_000; // 12-second auto-refresh for both UIs

/* ═══════════════════════════════════════════════════
   Shared sync context — single source of truth for
   both Desktop and Transporter UIs.

   Fetches: /api/dashboard, /api/drivers, /api/payments, /api/tags, /api/documents
   Derives: permits-with-details, active-permits, approved-trucks
   ═══════════════════════════════════════════════════ */

interface SyncContextValue {
    /* ── Loading & meta ─────────────────────── */
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;

    /* ── Entity lists (always fresh) ────────── */
    loads: ActiveLoad[];
    permits: PermitFull[];
    trucks: Truck[];
    flags: Flag[];
    mines: Mine[];
    tags: Tag[];
    drivers: Driver[];
    documents: DriverDocument[];
    paymentPermits: PaymentPermit[];

    /* ── Derived / filtered ─────────────────── */
    activePermits: Permit[];
    approvedTrucks: Truck[];
    stats: DashboardData['stats'] | null;

    /* ── Transporter operational groupings ──── */
    loadingTrucks: Record<string, { id: string; truckNumber: string }[]>;
    tagsByPermit: Record<string, { id: string; truckNumber: string; status: string }[]>;

    /* ── Actions ────────────────────────────── */
    refreshAll: () => Promise<void>;

    /* ── Helpers ────────────────────────────── */
    getPermitFull: (permitNumber: string) => PermitFull | null;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [paymentPermits, setPaymentPermits] = useState<PaymentPermit[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [allDocuments, setAllDocuments] = useState<DriverDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchAll = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const [dashResult, driversResult, paymentResult, tagsResult, docsResult] = await Promise.all([
                getDashboard(),
                getDrivers(),
                getPaymentPermits(),
                getTags(),
                getDocuments(),
            ]);
            setDashboard(dashResult);
            setDrivers(driversResult);
            setPaymentPermits(paymentResult);
            setAllTags(tagsResult);
            setAllDocuments(docsResult);
            setLastUpdated(new Date().toISOString());
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Sync error');
        } finally {
            setLoading(false);
        }
    }, []);

    /* Initial fetch */
    useEffect(() => { fetchAll(); }, [fetchAll]);

    /* Auto-poll: silent fetches that don't flash the loading state */
    useEffect(() => {
        intervalRef.current = setInterval(() => fetchAll(true), POLL_MS);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [fetchAll]);

    /* ── Derived data ─────────────── */
    const allLoads = useMemo(() => dashboard?.loads ?? [], [dashboard]);
    const rawPermits = useMemo(() => dashboard?.permits ?? [], [dashboard]);
    const allTrucks = useMemo(() => dashboard?.trucks ?? [], [dashboard]);
    const allFlags = useMemo(() => dashboard?.flags ?? [], [dashboard]);
    const mines = useMemo(() => dashboard?.mines ?? [], [dashboard]);
    const stats = dashboard?.stats ?? null;
    const loadingTrucks = dashboard?.loadingTrucks ?? {};
    const tagsByPermit = dashboard?.tags ?? {};

    /* Join permits with their loads & flags → PermitFull[] */
    const permits: PermitFull[] = useMemo(() =>
        rawPermits.map((p: any) => ({
            ...p,
            activeLoads: allLoads.filter(l => l.permitNumber === p.permitNumber),
            flags: allFlags.filter(f => f.permitNumber === p.permitNumber),
        })),
        [rawPermits, allLoads, allFlags]
    );

    const activePermits: Permit[] = useMemo(() =>
        rawPermits.filter((p: any) => p.status === 'Active'),
        [rawPermits]
    );

    const approvedTrucks = useMemo(() =>
        allTrucks.filter(t => t.status === 'Available'),
        [allTrucks]
    );

    const getPermitFull = useCallback((pn: string): PermitFull | null => {
        const permit = rawPermits.find((p: any) => p.permitNumber === pn);
        if (!permit) return null;
        return {
            ...(permit as any),
            activeLoads: allLoads.filter(l => l.permitNumber === pn),
            flags: allFlags.filter(f => f.permitNumber === pn),
        };
    }, [rawPermits, allLoads, allFlags]);

    const value: SyncContextValue = {
        loading,
        error,
        lastUpdated,
        loads: allLoads,
        permits,
        trucks: allTrucks,
        flags: allFlags,
        mines,
        tags: allTags,
        drivers,
        documents: allDocuments,
        paymentPermits,
        activePermits,
        approvedTrucks,
        stats,
        loadingTrucks,
        tagsByPermit,
        refreshAll: () => fetchAll(true),
        getPermitFull,
    };

    return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
    const ctx = useContext(SyncContext);
    if (!ctx) throw new Error('useSync must be used within <SyncProvider>');
    return ctx;
}
