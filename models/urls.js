import mongoose from "mongoose";
const urlSchema = new mongoose.Schema(
  {
    fullUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UrlRegister",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Url", urlSchema);
