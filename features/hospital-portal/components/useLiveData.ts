"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** Single-flight polling; pause in hidden tabs and keep last good data on failure. */
export function useLiveData<T>(initial: T, load: () => Promise<T | null>) {
  const [data, setData] = useState(initial);
  const [stale, setStale] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setRefreshing(true);
    try {
      const fresh = await load();
      if (!mounted.current) return;
      if (fresh) { setData(fresh); setUpdatedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })); }
      setStale(!fresh);
    } catch { if (mounted.current) setStale(true); }
    finally { busy.current = false; if (mounted.current) setRefreshing(false); }
  }, [load]);
  useEffect(() => {
    mounted.current = true;
    const visible = () => { if (document.visibilityState === "visible") void refresh(); };
    const timer = setInterval(visible, 15000);
    document.addEventListener("visibilitychange", visible);
    return () => { mounted.current = false; clearInterval(timer); document.removeEventListener("visibilitychange", visible); };
  }, [refresh]);
  return { data, stale, refreshing, updatedAt, refresh };
}
