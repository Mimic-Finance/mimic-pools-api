const express = require("express"),
  cors = require("cors"),
  dotenv = require("dotenv");

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

app.use("/pools", pools);
app.use("/stat", stat);
app.use("/price", price);

app.listen(port, () => {
  console.log(`API listening at port:${port}`);
});
