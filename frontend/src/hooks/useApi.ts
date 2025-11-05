import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<T>(endpoint);
      setData(response);
    } catch (err) {
      const error = err as AxiosError;
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
}
