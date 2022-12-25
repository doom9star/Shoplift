import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    url: String,
    cid: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.images || mongoose.model("images", schema);
