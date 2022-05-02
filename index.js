const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors()); //middleware
app.use(express.json()); //middleware for undefined
app.get("/", (req, res) => {
  res.send("connected");
});
app.listen(port, () => {
  console.log("listening to port", port);
});
