import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { approvePendingAdminRequest, fetchPendingAdmins } from "../api/adminApi";
import useAuth from "../hooks/useAuth";
import { PendingAdminsContext } from "./pendingAdmins";

export function PendingAdminsProvider({ children }) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");

  const hasLoadedRef = useRef(false);
  const isLoadingRef = useRef(false);
  const sessionUserIdRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      hasLoadedRef.current = false;
      isLoadingRef.current = false;
      sessionUserIdRef.current = null;
      return;
    }

    if (sessionUserIdRef.current !== user?.id) {
      hasLoadedRef.current = false;
      sessionUserIdRef.current = user?.id ?? null;
    }

    if (hasLoadedRef.current || isLoadingRef.current) {
      return;
    }

    let cancelled = false;
    isLoadingRef.current = true;

    async function loadPendingAdmins() {
      if (!cancelled) {
        setHasLoaded(false);
        setError("");
      }
      try {
        const data = await fetchPendingAdmins();
        if (!cancelled) {
          setPendingAdmins(data);
          hasLoadedRef.current = true;
          setHasLoaded(true);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Failed to load pending admins.");
        }
      } finally {
        if (!cancelled) {
          isLoadingRef.current = false;
        }
      }
    }

    void loadPendingAdmins();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAdmin, user?.id]);

  const approveAdmin = useCallback(async (userId) => {
    await approvePendingAdminRequest(userId);
    setPendingAdmins((current) => current.filter((admin) => admin.id !== userId));
  }, []);

  const value = useMemo(
    () => ({
      pendingAdmins: isAdmin ? pendingAdmins : [],
      hasLoaded: isAdmin ? hasLoaded : true,
      isLoading: isAdmin && !hasLoaded && !error,
      error: isAdmin ? error : "",
      approveAdmin,
    }),
    [pendingAdmins, hasLoaded, error, approveAdmin, isAdmin],
  );

  return (
    <PendingAdminsContext.Provider value={value}>{children}</PendingAdminsContext.Provider>
  );
}
