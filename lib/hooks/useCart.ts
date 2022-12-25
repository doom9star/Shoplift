import { useEffect, useState } from "react";
import { cAxios } from "../constants";
import { useGCtx } from "../context";
import { TServerResponse } from "../types";

const useCart = () => {
  const { setCart, cart } = useGCtx();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cart) {
      setLoading(true);
      cAxios.get<TServerResponse>(`/cart`).then(({ data }) => {
        if (data.status === 200) setCart(data.data);
        setLoading(false);
      });
    }
  }, [cart]);

  return [loading];
};

export default useCart;
