import { useState, useCallback } from "react";
import api from "../services/api";

/**
 * Custom hook untuk API call dengan state management.
 *
 * const { data, loading, error, fetch: fetchSiswa } = useApi();
 * await fetchSiswa('/siswa', { params: { per_page: 15 } });
 */
export const useApi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (url, config = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url, config);
      const result = response.data;
      setData(result);
      return result;
    } catch (err) {
      const message =
        err.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const post = useCallback(async (url, payload = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(url, payload);
      const result = response.data;
      setData(result);
      return result;
    } catch (err) {
      const message =
        err.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const put = useCallback(async (url, payload = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(url, payload);
      const result = response.data;
      setData(result);
      return result;
    } catch (err) {
      const message =
        err.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const destroy = useCallback(async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, fetch, post, put, destroy, reset };
};

export default useApi;
