const express = require("express"),
  cors = require("cors"),
  dotenv = require("dotenv");
require("express-group-routes");

const port = 3000;
dotenv.config();

const pools = require("./routes/pools");
const stat = require("./routes/stat");
const price = require("./routes/price");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    message: "Mimic Info API",
    version: "1.0.0",
  });
});

app.group("/api/v1", (route) => {
  route.use("/pools", pools);
  route.use("/stat", stat);
  route.use("/price", price);
});

app.listen(port, () => {
  console.log(`API listening at port:${port}`);
});
