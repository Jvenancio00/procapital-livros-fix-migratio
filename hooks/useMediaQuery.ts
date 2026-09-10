"use client";

import { useCallback, useSyncExternalStore } from "react";

function subscribe(query: string, onStoreChange: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

/**
 * `matchMedia` via `useSyncExternalStore`: sem setState dentro de um effect
 * (nada de renders em cascata), com snapshot de servidor explícito — por isso
 * não há hidratação divergente — e a reagir a mudanças em direto (rodar o
 * monitor, alternar o modo "reduzir movimento" do SO).
 */
export function useMediaQuery(query: string, ssrValue = false): boolean {
  const subscribeToQuery = useCallback(
    (onStoreChange: () => void) => subscribe(query, onStoreChange),
    [query]
  );

  return useSyncExternalStore(
    subscribeToQuery,
    () => window.matchMedia(query).matches,
    () => ssrValue
  );
}

/** true quando o utilizador pediu menos animação no sistema operativo. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
