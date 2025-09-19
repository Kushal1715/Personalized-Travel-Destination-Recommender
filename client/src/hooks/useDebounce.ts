import { useState, useEffect } from 'react';

/**
 * Custom hook that debounces a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook that debounces a callback function
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedCallback, setDebouncedCallback] = useState<T>(callback);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [callback, delay, ...deps]);

  return debouncedCallback;
}

/**
 * Custom hook for debounced search
 * @param searchTerm - The search term
 * @param delay - The delay in milliseconds
 * @param onSearch - Callback function to execute when search term changes
 */
export function useDebouncedSearch(
  searchTerm: string,
  delay: number,
  onSearch: (term: string) => void
) {
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (debouncedSearchTerm !== '') {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);
}

/**
 * Custom hook for debounced API calls
 * @param apiCall - The API call function
 * @param delay - The delay in milliseconds
 * @param deps - Dependencies array
 * @returns Object with debounced function and loading state
 */
export function useDebouncedApiCall<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  delay: number,
  deps: React.DependencyList = []
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedApiCall = useDebouncedCallback(
    async (...args: Parameters<T>) => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await apiCall(...args);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    delay,
    deps
  );

  return {
    debouncedApiCall,
    isLoading,
    error
  };
}