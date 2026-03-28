import { useEffect, useRef, useState } from 'react';

/**
 * usePolling — runs an async fetch function on a fixed interval.
 *
 * Key safety guarantees:
 *  1. No overlapping calls — skips a tick if the previous one is still running
 *  2. Tab-visibility aware — pauses polling when the browser tab is hidden
 *  3. Memory-leak free — clears the interval on unmount via useEffect cleanup
 *  4. Stable reference — stores fetchFn in a ref so changing it never resets the timer
 *
 * @param {() => Promise<void>} fetchFn  Async function to call on each tick
 * @param {number}              interval  Polling interval in milliseconds (default 500)
 * @param {boolean}             enabled   Set to false to pause polling (e.g. before location is ready)
 *
 * @returns {{ isRefreshing: boolean }} isRefreshing is true while a fetch is in-flight
 */
const usePolling = (fetchFn, interval = 500, enabled = true) => {
  // Set to true while a poll tick is running → drives the live indicator in the UI
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ref flag prevents two overlapping requests if one tick takes longer than `interval`
  const isFetchingRef = useRef(false);

  // Always keep fetchFnRef pointing at the latest fetchFn so we never need it in deps
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  });

  useEffect(() => {
    // Don't start polling until explicitly enabled (e.g. geolocation obtained)
    if (!enabled) return;

    const poll = async () => {
      // Guard 1: skip if previous request hasn't finished yet
      if (isFetchingRef.current) return;

      // Guard 2: pause when the browser tab is not visible — saves bandwidth
      if (document.hidden) return;

      isFetchingRef.current = true;
      setIsRefreshing(true);

      try {
        await fetchFnRef.current();
      } catch (err) {
        // Silently swallow errors during background polling.
        // The initial mount fetch already surfaces errors to the user.
        if (err?.code !== 'ERR_CANCELED') {
          console.error('[usePolling] background fetch error:', err?.message);
        }
      } finally {
        isFetchingRef.current = false;
        setIsRefreshing(false);
      }
    };

    // Start the interval — first tick fires after `interval` ms (not immediately),
    // because the component's own useEffect already runs the initial fetch on mount.
    const timerId = setInterval(poll, interval);

    // Cleanup: cancel the interval when the component unmounts or deps change
    return () => clearInterval(timerId);
  }, [interval, enabled]); // fetchFn intentionally excluded — handled via ref above

  return { isRefreshing };
};

export default usePolling;
