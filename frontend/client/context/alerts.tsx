import { createContext, useContext, useMemo, useState } from "react";

const AlertsContext = createContext(null);

export function AlertsProvider({ children }) {
  const [alerts, setAlerts] = useState([
    {
      id: "a1",
      time: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      type: "No Helmet",
      severity: "High",
      link: "/video-detection",
      acknowledged: false,
    },
  ]);
  const [risk, setRisk] = useState("Green"); // Green | Yellow | Red

  const addAlert = (alert) => {
    setAlerts((prev) =>
      [{ id: Math.random().toString(36).slice(2), ...alert }, ...prev].slice(
        0,
        50,
      ),
    );
    if (alert.severity === "High") setRisk("Red");
    else if (alert.severity === "Medium")
      setRisk((r) => (r === "Green" ? "Yellow" : r));
  };

  const acknowledge = (id) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    );

  const value = useMemo(
    () => ({ alerts, addAlert, acknowledge, risk, setRisk }),
    [alerts, risk],
  );
  return (
    <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
  return ctx;
}
