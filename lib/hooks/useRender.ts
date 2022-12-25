import { useCallback, useState } from "react";

export const useRender = () => {
  const [_, _set] = useState(0);

  const render = useCallback(() => {
    _set((prev) => prev + 1);
  }, []);

  return [render];
};
