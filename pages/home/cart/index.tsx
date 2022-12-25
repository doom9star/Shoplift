import Link from "next/link";
import { useCallback, useMemo } from "react";
import Back from "../../../lib/components/Back";
import { PrivateRoute } from "../../../lib/components/Route";
import { cAxios } from "../../../lib/constants";
import { useGCtx } from "../../../lib/context";
import { TOrderItem, TServerResponse } from "../../../lib/types";
import produce from "immer";
import { getStripe } from "../../../lib/stripe";

function Cart() {
  const { cart, setCart } = useGCtx();

  const grandTotal = useMemo(() => {
    if (!cart) return 0;
    let total = 0;
    let totals = cart.items.map(
      (i: TOrderItem) => i.product.price * i.quantity
    );
    if (totals.length > 0)
      total = totals.reduce((p: number, c: number) => p + c);
    return total.toLocaleString("en-US");
  }, [cart]);

  const handleQuantity = useCallback((iid: string, value: 1 | -1) => {
    cAxios.put<TServerResponse>("/cart/item", { iid, value }).then(() => {
      setCart((prev) =>
        produce(prev!, (draft) => {
          const idx = draft.items.findIndex((i) => i._id === iid);
          if (draft.items[idx].quantity + value === 0)
            draft.items = draft.items.filter((i) => i._id !== iid);
          else draft.items[idx].quantity += value;
        })
      );
    });
  }, []);

  const handleCheckout = useCallback(() => {
    cAxios
      .post<TServerResponse>("/checkout", {
        items: cart?.items.map((i) => ({
          price_data: {
            currency: "inr",
            product_data: {
              name: i.product.name,
            },
            unit_amount: i.product.price * 100,
          },
          quantity: i.quantity,
        })),
        order_id: cart?._id,
      })
      .then(async ({ data }) => {
        const sessionId = data.data;
        const stripe = await getStripe();
        stripe?.redirectToCheckout({ sessionId });
      });
  }, [cart]);

  return (
    <PrivateRoute>
      <div className="flex flex-col items-center my-10">
        <div className="self-end flex">
          <Back style="mr-2" />
          <Link href={"/home/cart/history"}>
            <a className={"btn h-8 mr-4"}>
              <i className="fas fa-history pb-6" />
            </a>
          </Link>
        </div>
        <p className="text-gray-600 font-bold text-lg">
          <i className="fas fa-shopping-cart mr-2" />
          Cart
        </p>
        <table className="max-w-full min-w-[70%] my-10">
          <thead>
            <tr>
              <th className="thead">SIN</th>
              <th className="thead">Name</th>
              <th className="thead">₹ Price</th>
              <th className="thead">Quantity</th>
              <th className="thead">₹ Total</th>
            </tr>
          </thead>
          <tbody>
            {cart && cart.items.length > 0 && (
              <>
                {cart.items.map((i: TOrderItem, idx) => {
                  const image = i.product.images
                    ? i.product.images[0].url
                    : "/images/noBanner.png";
                  return (
                    <tr key={i._id}>
                      <td className="tdata">{idx + 1}</td>
                      <td className="tdata">
                        <Link href={`/home/product/${i.product._id}`}>
                          <a className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <img
                                className="w-full h-full"
                                src={image}
                                alt={image}
                              />
                            </div>
                            <div className="ml-5">
                              <p className="text-gray-900 whitespace-no-wrap">
                                {i.product.name}
                              </p>
                            </div>
                          </a>
                        </Link>
                      </td>
                      <td className="tdata">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {i.product.price.toLocaleString("en-US")}
                        </p>
                      </td>
                      <td className="flex flex-col tdata">
                        <p className="text-gray-900 whitespace-no-wrap mb-2">
                          x{i.quantity}
                        </p>
                        <span style={{ fontSize: "0.5rem" }}>
                          <i
                            className="fas fa-plus mr-2 text-green-500 bg-gray-200 rounded-full p-1 cursor-pointer hover:text-green-800"
                            onClick={() => handleQuantity(i._id, 1)}
                          />
                          <i
                            className="fas fa-minus text-red-500 bg-gray-200 rounded-full p-1 cursor-pointer hover:text-red-800"
                            onClick={() => handleQuantity(i._id, -1)}
                          />
                        </span>
                      </td>
                      <td className="tdata">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {(i.product.price * i.quantity).toLocaleString(
                            "en-US"
                          )}
                        </p>
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="font-bold py-4 text-center">
                    ₹ {grandTotal}{" "}
                  </td>
                </tr>

                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="flex flex-row justify-center">
                    <p
                      onClick={handleCheckout}
                      className={"btn h-8 rounded-full"}
                    >
                      <i className="fas fa-credit-card mr-2" />
                      <i className="fas fa-chevron-right pb-6" />
                    </p>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </PrivateRoute>
  );
}

export default Cart;
