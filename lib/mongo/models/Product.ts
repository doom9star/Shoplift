import mongoose from "mongoose";
import { ProductCategories } from "../../types";

const schema = new mongoose.Schema(
  {
    name: String,
    description: { type: String, default: "" },
    price: Number,
    images: [{ type: mongoose.SchemaTypes.ObjectId, ref: "images" }],
    category: {
      type: String,
      enum: ProductCategories,
    },
    ratings: [Number],
    comments: { type: [mongoose.SchemaTypes.ObjectId], ref: "comments" },
    stripe_price_id: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.products || mongoose.model("products", schema);
