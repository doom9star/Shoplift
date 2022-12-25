import { createContext, FC, useContext, useState } from "react";
import { TGCtx, TOrder, TUser } from "../types";

const GCtx = createContext({} as TGCtx);

const CtxProvider: FC = ({ children }) => {
  const [user, setUser] = useState<TUser | null>(null);
  const [cart, setCart] = useState<TOrder | null>(null);
  return (
    <GCtx.Provider value={{ user, setUser, cart, setCart }}>
      {children}
    </GCtx.Provider>
  );
};

export const useGCtx = () => useContext(GCtx);
export default CtxProvider;
