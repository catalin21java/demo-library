import { useContext } from "react";

import { PendingAdminsContext } from "../context/pendingAdmins";

export default function usePendingAdmins() {
  const context = useContext(PendingAdminsContext);
  if (!context) {
    throw new Error("usePendingAdmins must be used within PendingAdminsProvider.");
  }
  return context;
}
