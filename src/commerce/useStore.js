import { useEffect, useState } from "react";
import { api } from "../api";
export function useStore() {
  const [store, setStore] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    const load = () =>
      api("/store")
        .then((s) => {
          if (live) {
            setStore(s);
            setError("");
          }
        })
        .catch((e) => {
          if (live) setError(e.message);
        });
    load();
    window.addEventListener("nenufares:updated", load);
    return () => {
      live = false;
      window.removeEventListener("nenufares:updated", load);
    };
  }, []);
  return { store, error };
}
