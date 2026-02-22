import { createContext, useContext, useState, useCallback } from 'react';

/**
 * NavCountsContext
 *
 * Lightweight context for sidebar badge counts.
 * - Initial counts are set when each page loads its data.
 * - Counts are updated directly after create / delete mutations.
 * - Zero API calls from the Sidebar — it just reads from context.
 */

const NavCountsContext = createContext(null);

export const NavCountsProvider = ({ children }) => {
  const [counts, setCounts] = useState({
    orders:     0,
    pending:    0,
    items:      0,
    categories: 0,
  });

  /**
   * Merge a partial update into counts.
   * Pages call this with only the keys they own:
   *
   *   setNavCount({ items: 12 })
   *   setNavCount({ orders: 5, pending: 2 })
   */
  const setNavCount = useCallback((patch) => {
    setCounts(prev => ({ ...prev, ...patch }));
  }, []);

  return (
    <NavCountsContext.Provider value={{ counts, setNavCount }}>
      {children}
    </NavCountsContext.Provider>
  );
};

export const useNavCounts = () => {
  const ctx = useContext(NavCountsContext);
  if (!ctx) throw new Error('useNavCounts must be used inside NavCountsProvider');
  return ctx;
};