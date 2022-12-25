import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
    items: { type: [mongoose.SchemaTypes.ObjectId], ref: "order_items" },
    ordered: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.orders || mongoose.model("orders", schema);
