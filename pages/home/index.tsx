import classNames from "classnames";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { PrivateRoute } from "../../lib/components/Route";
import connectDB from "../../lib/mongo";
import Image from "../../lib/mongo/models/Image";
import Product from "../../lib/mongo/models/Product";
import { ProductCategories, TProduct } from "../../lib/types";

type ProductCardProps = {
  product: TProduct;
};

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const link = `/home/product/${product._id}`;

  const thumbnail = useMemo(() => {
    return (product.images?.length || 0) > 0
      ? product.images![0].url
      : "/images/noBanner.png";
  }, []);

  return (
    <Link href={link}>
      <a className="w-full border-2 hover:scale-105 transition duration-500 cursor-pointer max-h-[350px] p-2">
        <div className="h-3/4 flex flex-col justify-center items-center">
          <div className="w-1/2 p-2 mx-auto">
            <img src={thumbnail} alt={thumbnail} />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 p-4">
            {product.name}
          </h3>
        </div>
        <div className="h-1/4 flex justify-end items-end p-2">
          <p className="text-lg font-bold">
            ₹ {product.price.toLocaleString("en-US")}
          </p>
        </div>
      </a>
    </Link>
  );
};

type HomeProps = {
  products: TProduct[];
};

const Home: NextPage<HomeProps> = ({ products }) => {
  const [productsClone, setProductsClone] = useState<TProduct[]>(products);
  const [currentPrice, setCurrentPrice] = useState(25000);

  const { query } = useRouter();

  const handlePriceFilter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const price = parseInt(e.target.value);
      setCurrentPrice(price);
    },
    []
  );

  useEffect(() => {
    setProductsClone(products.filter((p) => p.price <= currentPrice));
  }, [products, currentPrice]);

  return (
    <PrivateRoute>
      <div className="h-full">
        <div className="w-full h-full flex">
          <div className="w-[15%] flex flex-col items-center mt-8">
            <span className="my-5 font-semibold">
              <i className="fas fa-campground mr-2" />
              Categories
            </span>
            {ProductCategories.map((c) => (
              <Link
                href={`/home${c !== "All" ? `?category=${c}` : ""}`}
                key={c}
              >
                <a
                  className={
                    `text-gray-600 text-sm my-2` +
                    classNames({
                      " underline font-bold":
                        (!query.category && c === "All") ||
                        query.category === c,
                    })
                  }
                >
                  {c}
                </a>
              </Link>
            ))}
            <span className="mt-10 mb-5 font-semibold">
              <i className="fas fa-campground mr-2" />
              Filters
            </span>
            <div className="pt-1 flex flex-col">
              <span style={{ fontSize: "0.7rem" }}>₹ {currentPrice}</span>
              <input
                type="range"
                className="w-full h-6 bg-transparent focus:outline-none"
                value={currentPrice}
                min={0}
                max={100000}
                step={100}
                onChange={handlePriceFilter}
              />
            </div>
          </div>
          <div className="w-[85%] h-[90%] overflow-y-scroll no-scrollBar my-4 p-4 pb-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productsClone.map((product) => (
              <ProductCard product={product} key={product._id} />
            ))}
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  await connectDB();

  const products = await Product.find({
    ...(query.category && { category: query.category }),
  })
    .populate("images", "url", Image)
    .select("name images price")
    .exec();
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
};
