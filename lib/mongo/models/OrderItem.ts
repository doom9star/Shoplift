import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    product: { type: mongoose.SchemaTypes.ObjectId, ref: "products" },
    quantity: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.order_items ||
  mongoose.model("order_items", schema);
