"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Method = "1step" | "2step";

const MethodCtx = createContext<{ method: Method; setMethod: (m: Method) => void }>({
  method: "1step",
  setMethod: () => {},
});

export function MethodProvider({ children }: { children: React.ReactNode }) {
  const [method, setMethodState] = useState<Method>("1step");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("cloak.method") : null;
    if (saved === "1step" || saved === "2step") setMethodState(saved);
  }, []);

  const setMethod = (m: Method) => {
    setMethodState(m);
    try {
      window.localStorage.setItem("cloak.method", m);
    } catch {
      /* non-fatal */
    }
  };

  return <MethodCtx.Provider value={{ method, setMethod }}>{children}</MethodCtx.Provider>;
}

export const useMethod = () => useContext(MethodCtx);
