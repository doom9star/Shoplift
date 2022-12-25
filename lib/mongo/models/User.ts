import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    avatar: { type: mongoose.SchemaTypes.ObjectId, ref: "images" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.users || mongoose.model("users", schema);
