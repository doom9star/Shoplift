import { useEffect, useState } from "react";
import { cAxios } from "../constants";
import { useGCtx } from "../context";
import { TServerResponse } from "../types";

function useMe() {
  const { setUser, user } = useGCtx();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      cAxios.get<TServerResponse>(`/me`).then((res) => {
        if (res.data.status === 200) setUser(res.data.data);
        setLoading(false);
      });
    }
  }, [user]);

  return [loading];
}

export default useMe;
