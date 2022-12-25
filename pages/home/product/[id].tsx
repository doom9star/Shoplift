import classNames from "classnames";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import React, { useCallback, useMemo, useState } from "react";
import Back from "../../../lib/components/Back";
import { PrivateRoute } from "../../../lib/components/Route";
import { cAxios } from "../../../lib/constants";
import { useGCtx } from "../../../lib/context";
import connectDB from "../../../lib/mongo";
import Comment from "../../../lib/mongo/models/Comment";
import Image from "../../../lib/mongo/models/Image";
import Product from "../../../lib/mongo/models/Product";
import User from "../../../lib/mongo/models/User";
import {
  TOrder,
  TOrderItem,
  TProduct,
  TServerResponse,
} from "../../../lib/types";
import produce from "immer";
import { motion, useAnimation } from "framer-motion";

type Props = {
  product: TProduct;
};

const ProductDetail: NextPage<Props> = ({ product }) => {
  const { cart, setCart } = useGCtx();
  const [loading, setLoading] = useState(false);
  const sliderCtrl = useAnimation();

  const getInteractionsAndRating = useCallback((p: TProduct) => {
    const interactions = p.ratings.reduce((p, c) => p + c);
    const rating =
      p.ratings.map((v, i) => v * (i + 1)).reduce((p, c) => p + c) /
      interactions;
    return { interactions, rating };
  }, []);

  const handleAddItem = useCallback(() => {
    setLoading(true);
    cAxios
      .post<TServerResponse>("/cart/item", { pid: product._id })
      .then(({ data }) => {
        const response: { cart?: TOrder; item?: TOrderItem } = data.data;
        if (response.cart)
          setCart(
            produce(response.cart!, (draft) => {
              draft.items[0].product = product;
            })
          );
        else {
          setCart((prev) =>
            produce(prev!, (draft) => {
              draft.items.push({ ...response.item!, product });
            })
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [product]);

  const handleRemoveItem = useCallback(() => {
    setLoading(true);
    cAxios
      .delete<TServerResponse>("/cart/item", { data: { pid: product._id } })
      .then(() => {
        setCart((prev) =>
          produce(prev!, (draft) => {
            draft.items = draft.items.filter(
              (i) => i.product._id !== product._id
            );
          })
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [product]);

  const Rating = React.memo(() => {
    let stars: JSX.Element[] = [];
    const { interactions, rating } = getInteractionsAndRating(product);
    stars = stars.concat(
      new Array(Math.trunc(rating))
        .fill(0)
        .map((_, i) => (
          <i className="fas fa-star text-yellow-500 mr-1 text-xs" />
        ))
    );
    const remaining = 5 - rating;
    if (remaining !== Math.floor(remaining)) {
      stars.push(
        <i className="fas fa-star-half text-yellow-500 mr-1 text-xs" />
      );
    }
    stars = stars.concat(
      new Array(Math.trunc(remaining))
        .fill(0)
        .map(() => <i className="fas fa-star text-gray-300 mr-1 text-xs" />)
    );
    return (
      <p>
        {stars.map((s) => s)}{" "}
        <span className="text-gray-600 font-bold text-xs">
          {interactions}
          <i className="fas fa-user ml-1" />
        </span>
      </p>
    );
  });

  const inCart = useMemo(() => {
    if (!cart) return false;
    for (const item of cart.items)
      if (item.product._id === product._id) return true;
    return false;
  }, [cart]);

  return (
    <PrivateRoute>
      <div className="flex h-[90%]">
        <div className="w-1/2 flex justify-center items-center p-10">
          <div className="flex w-full overflow-x-scroll no-scrollBar">
            {product.images ? (
              product.images?.map((i) => (
                <div
                  className="flex justify-center items-center min-w-full"
                  key={i._id}
                >
                  <motion.img
                    animate={sliderCtrl}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    onHoverEnd={() => sliderCtrl.start({ scale: 1 })}
                    src={i.url}
                    alt={i.url}
                    className="max-w-[50%] max-h-[80%]"
                  />
                </div>
              ))
            ) : (
              <div className="flex justify-center items-center min-w-full">
                <img
                  src={"/images/noBanner.png"}
                  alt={"/images/noBanner.jpg"}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
        <div className="w-1/2 pt-10 overflow-y-scroll no-scrollBar">
          <Back style="w-10 ml-auto mr-8" />
          <p className="font-bold text-gray-600 text-lg">{product.name}</p>
          <Rating />
          <p
            className="whitespace-pre-wrap px-4 py-8 text-sm spacing-x-2"
            style={{ wordSpacing: "0.8rem" }}
          >
            {product.description
              .trim()
              .split("\n")
              .map((l) => (
                <li key={l}>
                  {l}
                  <br />
                  <br />
                </li>
              ))}
          </p>
          <p className="font-bold text-gray-600 text-xl mb-5">
            ₹ {product.price.toLocaleString("en-US")}
          </p>
          {!inCart ? (
            <button
              style={{ wordSpacing: "0.2rem" }}
              className={
                `text-white relative bg-blue-500 font-bold text-xs px-4 py-2 rounded-full cursor-pointer` +
                classNames({
                  " bg-blue-300": loading,
                })
              }
              onClick={handleAddItem}
              type="button"
              disabled={loading}
            >
              Add to cart
              {loading && (
                <div
                  className={`w-5 border-blue-800 h-5 border-2 rounded-full border-b-0 animate-spin absolute left-[40%] top-1/4`}
                />
              )}
            </button>
          ) : (
            <button
              style={{ wordSpacing: "0.2rem" }}
              className={
                `text-white relative bg-red-600 font-bold text-xs px-4 py-2 rounded-full cursor-pointer` +
                classNames({
                  " bg-red-300": loading,
                })
              }
              type="button"
              onClick={handleRemoveItem}
              disabled={loading}
            >
              {loading && (
                <div
                  className={`w-5 border-red-800 h-5 border-2 rounded-full border-b-0 animate-spin absolute left-[40%] top-1/4`}
                />
              )}
              Remove from cart
            </button>
          )}
          <p className="text-xs text-right p-8">
            <i className="fas fa-campground mr-2" />
            {product.category}
          </p>
          <div>
            <p className="text-sm py-2">Comments - {product.comments.length}</p>
            <div className="p-2 my-4">
              {product.comments.map((c) => {
                const avatar = c.user.avatar
                  ? c.user.avatar.url
                  : "/images/noAvatar.jpg";
                return (
                  <div key={c._id} className="flex px-2">
                    <div className="flex">
                      <div className="border-2 p-1 rounded-full w-14 h-14 mr-2">
                        <img
                          src={avatar}
                          alt={avatar}
                          className="rounded-full h-full w-full"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="font-semibold">{c.user.name}</p>
                      <p
                        className="mt-4 whitespace-pre-wrap text-sm"
                        style={{ wordSpacing: "0.3rem" }}
                      >
                        {c.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default ProductDetail;

export const getStaticProps: GetStaticProps = async ({ params }) => {
  await connectDB();
  const product = await Product.findById(params!.id)
    .populate({
      path: "images",
      select: "url",
      model: Image,
    })
    .populate({
      path: "comments",
      select: "body user",
      model: Comment,
      populate: {
        path: "user",
        select: "name avatar",
        model: User,
        populate: {
          path: "avatar",
          model: Image,
          select: "url",
        },
      },
    })
    .exec();
  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  await connectDB();
  const products = await Product.find({}).exec();
  const paths = products.map((p) => ({
    params: { id: p.id },
  }));
  return {
    paths,
    fallback: false,
  };
};
