import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cAxios } from "../constants";
import { useGCtx } from "../context";
import { TProduct, TServerResponse } from "../types";
import Spinner from "./Spinner";
import useCart from "../hooks/useCart";

type Props = {};

const Navbar: FC<Props> = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<TProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user, cart, setUser, setCart } = useGCtx();
  const router = useRouter();

  const [cartLoading] = useCart();

  const logout = useCallback(() => {
    setShowMenu(false);
    cAxios.delete<TServerResponse>("/logout").then((res) => {
      if (res.data.status === 200) {
        setUser(null);
        setCart(null);
        router.replace("/");
      }
    });
  }, [router, setUser]);

  const avatar = useMemo(() => {
    return user?.avatar ? user.avatar.url : "/images/noAvatar.jpg";
  }, [user]);

  useEffect(() => {
    if (query.trim().length > 1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setLoading(true);
      timeoutRef.current = setTimeout(async () => {
        const { data } = await cAxios.post<TServerResponse>("/search", {
          query,
        });
        if (data.status === 200) setProducts(data.data);
        setLoading(false);
      }, 2000);
    } else {
      setProducts([]);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [query]);

  return (
    <div className="h-[10%] relative flex justify-between p-6">
      {cartLoading ? (
        <Spinner style="top-0" />
      ) : (
        <>
          <Link href={"/"}>
            <a className="text-gray-600 w-1/3 md:w-1/4 font-bold">
              <i className="fas fa-shopping-cart mr-2" aria-hidden />
              ShopLift
            </a>
          </Link>
          <div className="w-3/4 sm:w-1/2 flex items-center h-10 mx-4">
            <i className="fas fa-search text-gray-500 mr-2" aria-hidden></i>
            <div className="w-full h-10 relative">
              <input
                type="text"
                className="border outline-none w-full p-2"
                placeholder="Search..."
                value={query}
                onChange={({ target: { value } }) => setQuery(value)}
              />
              {query.trim().length > 1 && (
                <div className="bg-gray-100 absolute w-full p-2 min-h-[100px] max-h-[400px] flex flex-col items-center justify-center">
                  {loading ? (
                    <Spinner style="top-[25%] left-[45%]" />
                  ) : products.length > 0 ? (
                    products.map((p) => {
                      const thumbnail =
                        (p.images?.length || 0) > 0
                          ? p.images![0].url
                          : "/images/noBanner.png";
                      return (
                        <Link href={`/home/product/${p._id}`}>
                          <a className="flex self-start items-center p-2 w-full cursor-pointer hover:bg-gray-50">
                            <div className="p-1 border-2">
                              <img
                                src={thumbnail}
                                alt={thumbnail}
                                className="w-24 h-24"
                              />
                            </div>
                            <p className="text-gray-600 text-sm ml-4 font-bold">
                              {p.name}
                            </p>
                            <p className="px-2 ml-auto font-bold">
                              ₹ {p.price}
                            </p>
                          </a>
                        </Link>
                      );
                    })
                  ) : (
                    <span className="text-gray-600 font-bold">
                      <i className="fas fa-frown mr-2" />
                      Not Found "{query}"
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="w-1/4 relative items-center justify-end sm:flex">
            <Link href={`/home/cart`}>
              <a className="text-right relative mr-10 text-gray-600 cursor-pointer hover:opacity-60">
                <motion.span
                  animate={{ x: [0, -5, 0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-[0.8rem] right-0 text-xs px-1 rounded-full bg-red-600 text-white"
                >
                  {cart ? cart.items.length : 0}
                </motion.span>
                <motion.i
                  animate={{ rotate: [0, -20, 0, 20, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="fas fa-shopping-cart ml-1 text-xl text-blue-500"
                />
              </a>
            </Link>
            <div className="border p-1 rounded-full w-14 h-14">
              <img
                src={avatar}
                alt={avatar}
                className="rounded-full h-full w-full"
              />
            </div>
            <span className="text-gray-600 font-bold ml-2">@{user?.name}</span>
            <i
              className={`fas fa-chevron-${
                showMenu ? "up" : "down"
              } ml-2 mt-1 cursor-pointer text-sm text-gray-400`}
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ y: 20, opacity: 1 }}
                className="bg-gray-100 shadow-md absolute top-8 z-50 -right-2 w-[150px] py-4 text-sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <Link href={"/home"} passHref>
                  <p className="popupItem">
                    <i className="fas fa-home mr-2" /> Home
                  </p>
                </Link>
                <Link href={"/home/profile"} passHref>
                  <p className="popupItem">
                    <i className="fas fa-user mr-2" /> &nbsp;Profile
                  </p>
                </Link>
                <p className="popupItem" onClick={logout}>
                  <i className="fas fa-sign-out-alt mr-2" /> Logout
                </p>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
