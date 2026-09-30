import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/mongo_practice";

  try {
    await mongoose.connect(uri, {
      autoIndex: true, // Disable in production and create indexes manually
    });
    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};
