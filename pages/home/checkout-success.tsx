import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Stripe from "stripe";
import { PrivateRoute } from "../../lib/components/Route";
import Spinner from "../../lib/components/Spinner";
import { cAxios } from "../../lib/constants";
import { TServerResponse } from "../../lib/types";

function CheckoutSuccess() {
  const [session, setSession] =
    useState<Stripe.Response<Stripe.Checkout.Session> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session_id = router.query.session_id;
    if (session_id) {
      cAxios
        .get<TServerResponse>(`/checkout?session_id=${session_id}`)
        .then(({ data }) => {
          if (data.status === 200) {
            setSession(data.data);
            setLoading(false);
          } else router.replace("/home");
        });
    }
  }, [router]);

  if (loading) return <Spinner />;

  return (
    <PrivateRoute>
      <div className="w-[100%] h-[90%] flex justify-center items-center">
        <div className="border-2 flex flex-col items-center p-8">
          <Link href={"/"}>
            <a className="text-gray-600 font-bold">
              <i className="fas fa-shopping-cart mr-2" aria-hidden />
              ShopLift
            </a>
          </Link>
          <span className="text-green-500 text-8xl my-4">
            <i className="fas fa-check" />
          </span>
          <p
            className="text-gray-600 text-sm"
            style={{ wordSpacing: "0.2rem" }}
          >
            Your payment of{" "}
            <span className="font-bold text-lg">
              ₹{((session?.amount_total || 100) / 100).toLocaleString("en-US")}
            </span>{" "}
            has been successful!
          </p>
          <p
            className="text-gray-600 text-sm"
            style={{ wordSpacing: "0.2rem" }}
          >
            Order has been placed!
          </p>
          <Link href={"/home/cart/history"}>
            <a
              className={
                "bg-gray-700 mt-6 hover:bg-gray-500 text-white text-xs font-bold py-2 px-4 rounded relative"
              }
            >
              Orders
            </a>
          </Link>
        </div>
      </div>
    </PrivateRoute>
  );
}

export default CheckoutSuccess;
