const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.route");
const postRoutes = require("./routes/post.route");
const cloudinary = require("cloudinary").v2;

dotenv.config();
require("./db/connection");

const app = express();
const port = process.env.PORT;

// cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// middlewares
const corsOptions = {
  origin: "https://threads-lite.vercel.app",
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" })); // to parse json in req.body
app.use(express.urlencoded({ extended: true })); // to parse form data in req.body
app.use(cookieParser()); // to parse cookies in req.cookies

// routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Home page" });
});
app.use(userRoutes);
app.use(postRoutes);

// listening to port
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
