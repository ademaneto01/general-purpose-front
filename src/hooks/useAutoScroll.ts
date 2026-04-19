import { useEffect, useRef } from 'react';

/**
 * Faz scroll automatico para o final quando `dep` muda.
 * Respeita o usuario: se ele rolou para cima, pausa o auto-scroll.
 */
export function useAutoScroll<T>(dep: T) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const threshold = 80;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      pinnedRef.current = distanceFromBottom < threshold;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (pinnedRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [dep]);

  return containerRef;
}
