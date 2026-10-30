import { useEffect } from 'react';

export function useTheme() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('africafuture-theme', 'light');
  }, []);

  return { theme: 'light' };
}
