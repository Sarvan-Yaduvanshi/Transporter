import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  getDashboard, getDrivers, getPaymentPermits, getTags, getDocuments } from


'@/services/api';

const POLL_MS = 12_000; // 12-second auto-refresh for both UIs

/* ═══════════════════════════════════════════════════
   Shared sync context — single source of truth for
   both Desktop and Transporter UIs.

   Fetches: /api/dashboard, /api/drivers, /api/payments, /api/tags, /api/documents
   Derives: permits-with-details, active-permits, approved-trucks
   ═══════════════════════════════════════════════════ */


































const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const [dashboard, setDashboard] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [paymentPermits, setPaymentPermits] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [dashResult, driversResult, paymentResult, tagsResult, docsResult] = await Promise.all([
      getDashboard(),
      getDrivers(),
      getPaymentPermits(),
      getTags(),
      getDocuments()]
      );
      setDashboard(dashResult);
      setDrivers(driversResult);
      setPaymentPermits(paymentResult);
      setAllTags(tagsResult);
      setAllDocuments(docsResult);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync error');
    } finally {
      setLoading(false);
    }
  }, []);

  /* Initial fetch */
  useEffect(() => {fetchAll();}, [fetchAll]);

  /* Auto-poll: silent fetches that don't flash the loading state */
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchAll(true), POLL_MS);
    return () => {if (intervalRef.current) clearInterval(intervalRef.current);};
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
  const permits = useMemo(() =>
  rawPermits.map((p) => ({
    ...p,
    activeLoads: allLoads.filter((l) => l.permitNumber === p.permitNumber),
    flags: allFlags.filter((f) => f.permitNumber === p.permitNumber)
  })),
  [rawPermits, allLoads, allFlags]
  );

  const activePermits = useMemo(() =>
  rawPermits.filter((p) => p.status === 'Active'),
  [rawPermits]
  );

  const approvedTrucks = useMemo(() =>
  allTrucks.filter((t) => t.status === 'Available'),
  [allTrucks]
  );

  const getPermitFull = useCallback((pn) => {
    const permit = rawPermits.find((p) => p.permitNumber === pn);
    if (!permit) return null;
    return {
      ...permit,
      activeLoads: allLoads.filter((l) => l.permitNumber === pn),
      flags: allFlags.filter((f) => f.permitNumber === pn)
    };
  }, [rawPermits, allLoads, allFlags]);

  const value = {
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
    getPermitFull
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within <SyncProvider>');
  return ctx;
}