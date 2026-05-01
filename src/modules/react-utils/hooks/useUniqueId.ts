import { useCallback, useId, useRef } from "react";

export function useUniqueId() {
  const id = useId();
  const counter = useRef(0);
  return useCallback(() => {
    return `${id}${(counter.current++).toString().padStart(4, "0")}_`;
  }, [id])
}