import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.DB_URI as string);
  }
};
export default connectDB;
