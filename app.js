const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const users = require("./routes/usersRoute.js");
const courses = require("./routes/coursesRoute.js");
const contents = require("./routes/contentsRoute.js");
const modules = require("./routes/modulesRoute.js");
const groups = require("./routes/groupsRoute.js");
const certificates = require("./routes/certificatesRoute.js");

const config = require("./config.js");

const MONGODB_URI =
  config.mongodburi || "mongodb://localhost:27017/member-area";
const PORT = process.env.PORT || 5000;

mongoose.connect("mongodb://localhost:27017/member-area", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});
mongoose.connection.on("error", (error) => {
  console.log(error);
});

let app = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "client/build")));

app.get("/*", (req, res) => {
  res.sendFile(path.JOSN(_dirname, "build", "index.html"));
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use("/api/users", users);
app.use("/api/courses", courses);
app.use("/api/contents", contents);
app.use("/api/modules", modules);
app.use("/api/groups", groups);
app.use("/api/certificates", certificates);

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '/client/build/index.html'));
// });

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
