import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL);
  console.log("Connected to MongoDB");
};

export default connectDB;