import { useEffect, useState } from "react";

export interface MockResource<T> {
  value: T | null;
  isLoading: boolean;
  hasError: boolean;
  simulateError: () => void;
  clearError: () => void;
}

export function useMockResource<T>(data: T, delayMs = 500): MockResource<T> {
  const [value, setValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setValue(data);
      setIsLoading(false);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [data, delayMs]);

  const simulateError = (): void => setHasError(true);
  const clearError = (): void => setHasError(false);

  return { value, isLoading, hasError, simulateError, clearError };
}
