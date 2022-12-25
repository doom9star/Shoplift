import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.SchemaTypes.ObjectId, ref: "users" },
    product: { type: mongoose.SchemaTypes.ObjectId, ref: "products" },
    body: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.comments || mongoose.model("comments", schema);
