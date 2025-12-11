import mongoose from "mongoose";
import express from "express";
import bcrypt from "bcryptjs";
import cors from "cors";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Url from "./models/urls.js";
import UrlRegister from "./models/urlRegister.js";
import { urlAuth } from "./middleware/urlAuth.js";
import { nanoid } from "nanoid";
const app = express();

dotenv.config();
app.use(express.json());
app.use(cors({ origin: 'https://shrinklly.netlify.app'}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to Database : Mongoose Connected");
  })
  .catch((err) => {
    console.error("Error connecting to Database : ", err);
  });

app.get("/url", urlAuth, async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.userId });

    return res.status(200).json({ success: true, urls });
  } catch (error) {
    return res.status(500).json({ error: " server error" });
  }
});

app.post("/url", urlAuth, async (req, res) => {
  try {
    const { fullUrl } = req.body;
    console.log(fullUrl);
    if (!fullUrl) return res.status(400).json({ message: "Url Required" });
    const shortUrl = nanoid(4);
    const qrCodeImage = await QRCode.toDataURL(
      `https://shrinklly.netlify.app/${shortUrl}`
    );
    const url = new Url({
      fullUrl,
      shortUrl,
      qrCode: qrCodeImage,
      userId: req.userId,
    });
    await url.save();
    return res
      .status(200)
      .json({ message: "URL generated", url: url, qrCodeImage });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/:shortUrl", async (req, res) => {
  try {
    const { shortUrl } = req.params;
    const url = await Url.findOne({ shortUrl });
    // console.log("url", url)

    if (url) {
      url.clicks++;
      await url.save();
      return res.redirect(url.fullUrl);
    } else {
      res.status(404).json({ error: "URL not found" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.post("/user/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.trim() || !password?.trim())
    return res
      .status(401)
      .json({ message: "Fields are empty!", success: false });
  const hashedPassword = await bcrypt.hash(password, 8);
  const existingUser = await UrlRegister.findOne({ email });
  if (existingUser)
    return res
      .status(400)
      .json({ message: "User already Exists, please login", success: false });

  const addNewUser = await UrlRegister.create({
    name,
    email,
    password: hashedPassword,
  });
  return res
    .status(201)
    .json({ success: true, message: " New User Is Created " });
});
app.post("/user/login", async (req, res) => {
  console.log("Body received:", req.body); //
  const { email, password } = req.body;
  if (!email?.trim() || !password?.trim())
    return res
      .status(401)
      .json({ message: "Fields are empty!", success: false });
  const existingUser = await UrlRegister.findOne({ email });
  if (!existingUser)
    return res.status(400).json({
      message: "User Doesn't Exist, Please SignUp First to LogIn",
      success: false,
    });
  const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordMatch)
    return res
      .status(400)
      .json({ message: "Password Doesn't Match", success: false });

  const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(200).json({
    message: "Logged In",
    success: true,
    token,
    user: {
      name: existingUser.name,
      email: existingUser.email,
      id: existingUser._id,
    },
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is live on ${PORT}`);
});
