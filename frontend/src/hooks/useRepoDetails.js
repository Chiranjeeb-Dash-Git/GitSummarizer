import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../lib/api.js';

export function useRepoDetails(repoFullName) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortRef = useRef(null);

  const fetchDetails = useCallback(async (isPolling = false) => {
    if (!repoFullName) return;
    if (!isPolling) setLoading(true);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await api.get(`/repos/details?input=${encodeURIComponent(repoFullName)}`, {
        signal: abortRef.current.signal,
      });
      if (res?.data) {
        setData(res.data);
        setError(null);
        setLastUpdated(new Date());
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);
      }
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [repoFullName]);

  useEffect(() => {
    fetchDetails();
    return () => abortRef.current?.abort();
  }, [fetchDetails]);

  // Background polling every 45 seconds for real-time updates
  useEffect(() => {
    if (!repoFullName) return;
    const interval = setInterval(() => {
      fetchDetails(true);
    }, 45_000);
    return () => clearInterval(interval);
  }, [repoFullName, fetchDetails]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refetch: () => fetchDetails(false),
  };
}
