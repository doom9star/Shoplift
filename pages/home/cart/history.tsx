import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Back from "../../../lib/components/Back";
import { PrivateRoute } from "../../../lib/components/Route";
import Spinner from "../../../lib/components/Spinner";
import { cAxios } from "../../../lib/constants";
import { TOrder, TServerResponse } from "../../../lib/types";

function History() {
  const [history, setHistory] = useState<TOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const getTotal = useCallback((o: TOrder) => {
    let total = 0;
    let totals = o.items.map((i) => i.product.price * i.quantity);
    if (totals.length > 0)
      total = totals.reduce((p: number, c: number) => p + c);
    return total.toLocaleString("en-US");
  }, []);

  useEffect(() => {
    cAxios.get<TServerResponse>("/cart/history").then(({ data }) => {
      if (data.status === 200) setHistory(data.data);
      setLoading(false);
    });
  }, []);

  return (
    <PrivateRoute>
      <div className="w-[100%] h-[90%] flex flex-col items-center my-10">
        <div className="self-end flex">
          <Back style="mr-8" />
        </div>
        <p className="text-gray-600 font-bold text-lg">
          <i className="fas fa-history mr-2" />
          Order History
        </p>
        <table className="max-w-full min-w-[70%] my-10">
          <thead>
            <tr>
              <th className="thead">Order ID</th>
              <th className="thead">Items</th>
              <th className="thead">₹ Total</th>
              <th className="thead">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <Spinner style="top-[50%]" />
              </tr>
            ) : (
              history.map((o) => (
                <tr key={o._id}>
                  <td className="tdata">{o._id}</td>
                  <td className="tdata">
                    {o.items.map((i) => {
                      const image = i.product.images
                        ? i.product.images[0].url
                        : "/images/noBanner.png";
                      return (
                        <Link
                          href={`/home/product/${i.product._id}`}
                          key={i._id}
                        >
                          <a className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10">
                              <img
                                className="w-full h-full"
                                src={image}
                                alt={image}
                              />
                            </div>
                            <p className="mx-4">
                              {i.product.name.slice(0, 30)}
                              {i.product.name.length > 30 && "..."}
                            </p>
                            <p className="ml-auto">x{i.quantity}</p>
                          </a>
                        </Link>
                      );
                    })}
                  </td>
                  <td className="tdata">{getTotal(o)}</td>
                  <td className="tdata">
                    {Math.random() > 0.5 ? (
                      <span className="bg-green-500 text-white px-4 py-2 rounded-full text-[0.6rem] font-bold">
                        Delivered
                      </span>
                    ) : (
                      <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-[0.6rem] font-bold">
                        Shipping
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PrivateRoute>
  );
}

export default History;
